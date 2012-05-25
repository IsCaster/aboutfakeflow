# Create your views here.
# coding: gbk
from django.http import HttpResponse
from django.template import Context, loader
from fakeflowapp.models import MissionInfo, VerificationCode
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.db.models import Q

from urllib import unquote ,quote
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt   

from fakeflowapp.missionqueue import MissionQueue,MissionItem,GetMissionQueue
#import fakeflowapp.missionqueue
from fakeflowapp.verificationcode import decodeVerificaton
import re

from django.contrib.auth.decorators import login_required


from time import time
import logging
logger = logging.getLogger(__name__)

def missionQueueTrace(fn):
    def wrapped(*arg):
        logger.debug("enter "+fn.__name__)
        logger.debug(GetMissionQueue().toString()) 
        rlt=fn(*arg)
        logger.debug("leave "+fn.__name__)
        logger.debug(GetMissionQueue().toString()) 
        return rlt
    return wrapped

@login_required()
def home(request):
    if request.user.is_authenticated():
        log_in_out_url='accounts/logout/'
    else:
        log_in_out_url='accounts/login/'
    template_values=Context({
        'user':request.user,
        'log_in_out_url':log_in_out_url,
        'unhandledMissionCount':len(GetMissionQueue().unhandledBuffer),
        'undergoMissionCount':len(GetMissionQueue().undergoBuffer),
    })
    logger.debug("i'm here .home page")
    return render_to_response('home.html',template_values,context_instance=RequestContext(request))

@login_required()
def missionInfo(request):
    raw_keyword = request.POST['content']
    mid_keyword = raw_keyword.encode('ascii','ignore')
    mid2_keyword = unquote(mid_keyword)
    keyword = mid2_keyword.decode('utf8')

    query=MissionInfo.objects.filter(
            Q(shopkeeper__contains=keyword)|Q(message__contains=keyword)|Q(url__contains=keyword)
        ).order_by("-updateTime")[:20]#retrieve max :20;

    template_values={
        'missionInfos'  : query,
        'keyword'   : keyword,  
    };
    return render_to_response('missioninfo.html', template_values);
        
            
    # response_data['status']  
    # value       meaning
    # 10001       find url in urlCache
    # 10002       find url in database
    # 10003       find url in MissionQueue.doneBuffer
    # 10004       got url by mission customer, fetch result
    # 10005       changed detector to fetch result(useless now)
    # 10006       url not find, try urls with same shopkeeper
    
    # 20001       timeout when wait for mission customer submit urls ,quit mission


    
    # 30001       no url producted ,still need 2 wait ,maybe check again 
    # 30002       there are urls to custom, blocked by other customers
    
    # 40001       invalid mission ,should quit the mission
    
    # 50001       unkowned error
@csrf_exempt
@missionQueueTrace 
def queryUrl(request):
        # if request.method == "OPTIONS": 
            # response = HttpResponse("")
            # response['Access-Control-Allow-Origin'] = '*'
            # response['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
            # response['Access-Control-Max-Age'] = 1000
            # response['Access-Control-Allow-Headers'] = '*'

            # return response 
    raw_shopkeeper=""
    raw_site=""
    raw_message=""
    if request.method == "POST":    
        raw_shopkeeper = request.POST["shopkeeper"]
        raw_site = request.POST["site"]
        raw_message = request.POST["message"]
    elif request.method == "GET":
        raw_shopkeeper = request.GET["shopkeeper"]
        raw_site = request.GET["site"]
        raw_message = request.GET["message"]    
        
    # shopkeeper=unquote(raw_shopkeeper.encode('ascii','ignore')).decode('utf8')
    # site=unquote(raw_site.encode('ascii','ignore')).decode('utf8')
    # message=unquote(raw_message.encode('ascii','ignore')).decode('utf8')
    shopkeeper=raw_shopkeeper
    site=raw_site
    message=raw_message
    
    entries=MissionInfo.objects.filter(message=message,site=site).order_by("-updateTime")[:20]#retrieve max :20

    count = entries.count()
    response_data={}
    
    #check if it's invalid mission
    for entry in entries :
        if entry.valid == False :
            response_data['status']=40001
            response_data['urls']=[]
            return HttpResponse(simplejson.dumps(response_data))

    urls=[]
    if  entries.count() >= 1 : 
        for entry in entries:
            if entry.url not in urls:
                urls.append(entry.url)
        response_data['status']=10002
        response_data['urls']=urls
        return HttpResponse(simplejson.dumps(response_data))
    # elif shopkeeper != "" :
        # entries=MissionInfo.objects.filter(message__startswith=shopkeeper,site=site).order_by("-updateTime")[:20]
        # if  entries.count() >= 1 : 
            # for entry in entries:
                # if entry.url not in urls:
                    # urls.append(entry.url)
                    # if len(urls) >= 5: #max 5 tries
                        # break
            # response_data['status']=10006
            # response_data['urls']=urls
            # response_data['fetchResultTime']=int(time())
            # return HttpResponse(simplejson.dumps(response_data))
    
    # urls not in the database
    newMission=MissionItem(message,site,shopkeeper);

    #whether GetMissionQueue().push return success or fail ,if mission is not finished
    #thread still need to acquire lock to be the only detector of the mission
    #push function is a push_or_get function
    
    with GetMissionQueue().bufferLock:
        location,theMission=GetMissionQueue().push(newMission)
    
    logger.debug("push new Mission Item")

    if location == "doneBuffer" :
        if theMission.url != "":
            response_data['status']=10003
            response_data['urls']=[theMission.url]
        else:
            response_data['status']=40001
            response_data['urls']=[]
        return HttpResponse(simplejson.dumps(response_data))
    else : 
        if not theMission.urls_sema.acquire(60): # wait for url customer to product urls
            response_data['status']=30001
            response_data['itemId']=str(theMission.itemId)
            return HttpResponse(simplejson.dumps(response_data),mimetype="application/json")
        else:
            theMission.urls_sema.release()
            response_data['urls']=[]
            with theMission.itemLock:
                newFetchResultTime = time() 
                for index,url in enumerate(theMission.urls):
                    if not theMission.bTried[index] :
                        if newFetchResultTime > theMission.fetchResultTimes[index]+theMission.fetchResultTimeouts[index]:#timeout or unfetched url
                            theMission.fetchResultTimes[index]=newFetchResultTime
                            if theMission.urls[index] not in response_data['urls']:
                                response_data['urls'].append(theMission.urls[index])
                                if theMission.split!=0 and len(response_data['urls']) >= theMission.split:
                                    break;
                if len(response_data['urls']) == 0:
                    response_data['status']=30002
                    response_data['itemId']=str(theMission.itemId)
                    return HttpResponse(simplejson.dumps(response_data),mimetype="application/json")
                else:
                    response_data['status']=10004
                    response_data['fetchResultTime']=newFetchResultTime
                    response_data['itemId']=str(theMission.itemId)
                    return HttpResponse(simplejson.dumps(response_data),mimetype="application/json")


    #won't run to here comment it
    response_data={}
    return HttpResponse(simplejson.dumps(response_data));
        
@login_required()
def getMissionList(request):
    with GetMissionQueue().bufferLock:
        theMissionList = GetMissionQueue().getCustomerMission(request.user)
    theMissionListJson=[]
    for theMission in theMissionList:
        theMissionListJson.append(theMission.toJson())
    response_data={
            "status":"undergo",
            "theMissionList":theMissionListJson,
        } 
    #to do  
    return HttpResponse(simplejson.dumps(response_data));
        
@login_required()
def getMission(request):
    itemId = request.POST["itemId"]
    if itemId != "" :
        with GetMissionQueue().bufferLock:
            theMission = GetMissionQueue().getUndergoMission(int(itemId))
            if theMission != None :
                response_data={
                        "status":"undergo",
                        "theMission":theMission.toJson(),
                    } 
                return HttpResponse(simplejson.dumps(response_data));
            else:
                response_data={
                        "status":"missionNotExist",
                    } 
                return HttpResponse(simplejson.dumps(response_data));

    theMission = GetMissionQueue().pop()
    if theMission != None:
        theMission.customer=request.user
        response_data={
            "status":"waitForUrls",
            "theMission":theMission.toJson(),
        }
        return HttpResponse(simplejson.dumps(response_data));
    else:
        response_data={
            "status":"waitForMissions",
        }
        return HttpResponse(simplejson.dumps(response_data))
        
def submitUrl(request):
    itemId = request.POST["itemId"]
    urls =[]
    if request.POST.has_key("urls"):
        raw_urls=request.POST['urls']
        logger.debug("raw_urls=%s"%raw_urls)
        urls=simplejson.loads(raw_urls)
   
    theMission = None
    with GetMissionQueue().bufferLock :
        theMission = GetMissionQueue().getUndergoMission(int(itemId))
    logger.debug("len(urls)=%d"%(len(urls)))        
    if len(urls) >=1 :
        logger.debug("urls[0]=%s"%(urls[0]))    
    if theMission != None:
        if str(theMission.customer) != str(request.user) :
            logger.debug("theMission.customer=%s,request.user=%s"%(theMission.customer,request.user))
            response_data={
                "status":"missionCustomerChanged",
            }
            # to do
            return HttpResponse(simplejson.dumps(response_data));
        else:
            if len(urls) >=1 :
                logger.debug("urls[0]=%s"%(urls[0]))
                with theMission.itemLock :
                    for new_url in urls:
                        bAdd=True
                        for index,url in enumerate(theMission.urls):
                            if new_url== url and not theMission.bTried[index] and theMission.fetchResultTimes[index]==0 :
                                bAdd = False
                                break
                        if bAdd :
                            logger.debug("add new url:%s"%(new_url))
                            theMission.urls.append(new_url)
                            theMission.bTried.append(False)
                            theMission.fetchResultTimes.append(0)
                            theMission.fetchResultTimeouts.append(60)
                            theMission.urls_sema.release()
            if not theMission.wait_success_sema.acquire(10):
                #return the mission process
                response_data={
                    "status":"missionUndergo",
                    "theMission":theMission.toJson(),
                }
                return HttpResponse(simplejson.dumps(response_data))
            else :
                response_data={
                    "status":"missionComplete",
                    "theMission":theMission.toJson(),
                }
                return HttpResponse(simplejson.dumps(response_data));
            
    else:
        response_data={
                "status":"missionNotExist",
            }
        #to do
        return HttpResponse(simplejson.dumps(response_data));

@csrf_exempt
@missionQueueTrace
def submitResultSuccess(request):
    raw_message = request.POST["message"]
    
    raw_itemId = request.POST["itemId"]
    raw_url = request.POST["url"]
    site = request.POST["site"]

    # message=unquote(raw_message.encode('ascii','ignore')).decode('utf8')
    # itemId=unquote(raw_itemId.encode('ascii','ignore')).decode('utf8')
    # code=unquote(raw_code.encode('ascii','ignore')).decode('utf8')
    # codeImg=unquote(raw_codeImg.encode('ascii','ignore')).decode('utf8')
    # url=unquote(raw_url.encode('ascii','ignore')).decode('utf8')
    
    message=raw_message
    itemId=raw_itemId
    url=raw_url
    
    url=re.sub("&$","",url)
    
    
    shopkeeper=""
    if request.POST.has_key("shopkeeper"):
        shopkeeper=request.POST["shopkeeper"]
    
    #temp code for nmimi
    # if site == "nmimi" :
        # entries=MissionInfo.objects.filter(message=message,site=site)
        # if entries.count() >= 1 :
            # entry=entries.get()
            # entry.url=url
            # entry.valid=True
            # entry.save()
            # if entries.count() >=2:
                # for entry in entries[1:]:
                    # entry.delete()
            # return HttpResponse("insert result success temp code for nmimi ");            

    # insert url to db
    if itemId == "" :
        #not in the missionqueue ,maybe one mission with more than one url
        entries=MissionInfo.objects.filter(message=message,url=url,site=site)
        if entries.count() == 0:
            newMissionInfo=MissionInfo()
            newMissionInfo.message=message
            newMissionInfo.url=url
            newMissionInfo.site=site
            newMissionInfo.shopkeeper=shopkeeper
            newMissionInfo.save()
            return HttpResponse("mission info saved "); 
        else:
            return HttpResponse("mission info already exist "); 
    else:
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission == None :
                theMission=GetMissionQueue().pop(int(itemId))
            if theMission != None :
                if theMission.message == message :
                    newMissionInfo=MissionInfo()
                    newMissionInfo.message=message
                    newMissionInfo.url=url
                    newMissionInfo.shopkeeper=theMission.shopkeeper
                    newMissionInfo.site=theMission.site
                    newMissionInfo.save()
                    # move theMission to doneBuffer ,after pop theMission can only in the undergoBuffer
                    with theMission.itemLock:
                        theMission.url=url
                        theMission.wait_success_sema.release()
                    del GetMissionQueue().undergoBuffer[theMission.itemId]
                    GetMissionQueue().doneBuffer[theMission.itemId]=theMission
                    return HttpResponse("insert result success .");    
                else:
                    # shouldn't be here,wrong itemId
                    return HttpResponse("abandon result theMission.message=%s,message=%s"%(theMission.message,message));          
            else:
                entries=MissionInfo.objects.filter(message=message,url=url,site=site)
                if entries.count() == 0:
                    newMissionInfo=MissionInfo()
                    newMissionInfo.message=message
                    newMissionInfo.url=url
                    newMissionInfo.site=site
                    newMissionInfo.shopkeeper=shopkeeper
                    newMissionInfo.save()
                logger.debug("mission don't exist ,should abandon result ,but save first ")    
                return HttpResponse("mission don't exist ,should abandon result ,but save first ");  

@csrf_exempt            
def submitCode(request):
    code = request.POST["code"]
    codeImg = request.POST["codeImg"]
    
    # insert verification code to db
    newVeriCode=VerificationCode()
    newVeriCode.code=code
    newVeriCode.codeImg=codeImg
    newVeriCode.save()
    
    return HttpResponse("insert code success")

@csrf_exempt 
def invalidMission(request):
    message = request.POST["message"]
    itemId = request.POST["itemId"]
    site = request.POST["site"]
    if len(itemId) != 0 :
        # move theMission to doneBuffer with .urls empty , it means it's a invalid mission
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission == None :
                theMission=GetMissionQueue().pop(int(itemId))
            if theMission != None :
                del GetMissionQueue().undergoBuffer[theMission.itemId]
                GetMissionQueue().doneBuffer[theMission.itemId]=theMission
                theMission.urls=[]
                message=theMission.message
    if message != "" :
        entries = MissionInfo.objects.filter(message=message,site=site)
        if entries.count() >= 1:
            for entry in entries:
                entry.valid=False
                entry.save()
        else :
            newMissionInfo = MissionInfo()
            newMissionInfo.message=message
            newMissionInfo.site=site
            newMissionInfo.valid=False
            newMissionInfo.save()
        return HttpResponse(" invalidMission: success ")
    else:
        return HttpResponse(" invalidMission: wrong mission info ")
        
def invalidMissionC(request):
    itemId = request.POST["itemId"]
    message=""
    site=""
    if len(itemId) != 0 :
        # move theMission to doneBuffer with .urls empty , it means it's a invalid mission
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission != None :
                del GetMissionQueue().undergoBuffer[theMission.itemId]
                GetMissionQueue().doneBuffer[theMission.itemId]=theMission
                theMission.urls=[]
                theMission.urls_sema.release()
                message=theMission.message
                site=theMission.site
    if message != "" :
        entries = MissionInfo.objects.filter(message=message,site=site)
        if entries.count() >= 1:
            for entry in entries:
                entry.valid=False
                entry.save()
        else :
            newMissionInfo = MissionInfo()
            newMissionInfo.message=message
            newMissionInfo.site=site
            newMissionInfo.valid=False
            newMissionInfo.save()
        return HttpResponse(" invalidMission: success ")            
    else:
        return HttpResponse(" invalidMission: wrong mission info ")        


@csrf_exempt 
def submitResultFail(request):
    message = request.POST["message"]
    itemId = request.POST["itemId"]
    site = request.POST["site"]
    fail_url = request.POST["url"]
    fetchResultTime = request.POST["fetchResultTime"]
    
    if len(itemId) != 0 :
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission != None :
                for i,url in enumerate(theMission.urls):
                    if fail_url==url and str(fetchResultTime)==str(theMission.fetchResultTimes[i]) :
                        theMission.bTried[i]=True
                return HttpResponse(" submitResultFail :success ")
    return HttpResponse(" submitResultFail :fail ")

def close(request):
    return HttpResponse("<script> window.close(); </script>")
    
def deleteMissionInfo(request):
    raw_key_id = request.POST["key_id"]
    key_id=unquote(raw_key_id.encode('ascii','ignore')).decode('utf8')
    
    query_entries=MissionInfo.objects.filter(id=int(key_id))
    if query_entries.count()!=1 :
        return HttpResponse("delete fail,wrong key_id!")
    else:
        entry=query_entries.get()
        entry.delete()
        return HttpResponse("delete success!")

@login_required()
def showCode(request):
    entries=VerificationCode.objects.filter(checked=False)  
    
    sum=VerificationCode.objects.count()
    output=[]
    for entry in entries:
        decoded_code=decodeVerificaton(entry.codeImg)
        if decoded_code != entry.code:
            entry.decoded_code=decoded_code
            output.append(entry)
        else:
            entry.checked==True
            entry.save()
    template_values = {"codes"  :   output,
                       "sum"    :   sum,
                       "wrong"  :   len(output)}
    return render_to_response('showcode.html',template_values)

@csrf_exempt 
def queryCode(request):
    code_img = request.POST["codeImg"]
    decoded_code=decodeVerificaton(code_img)
    response_data={"code":decoded_code}
    return HttpResponse(simplejson.dumps(response_data));
    
# def fuckmudooo(request):
    # return HttpResponse("ok");

@csrf_exempt
def fakeVisit(request):
    url=request.POST["url"]
    keyword=request.POST["keyword"]
    #return HttpResponse("<html><head><title>fake visit item on taobao</title></head><body><p id='url'>"+url+"</p><p id='keyword'>"+keyword+"</p></body></html>");
    url=re.sub("&$","",url)
    template_values=Context({
        'url':url,
        'keyword':quote(keyword.encode("gbk"), safe='~()*!.\''),
    })
    return render_to_response('fakevisit.html',template_values)
    
@csrf_exempt
def submitShopkeeper(request):
    url=request.POST["url"]
    raw_shopkeeper=request.POST["shopkeeper"]
    shopkeeper=unquote(raw_shopkeeper.encode('ascii','ignore')).decode('utf8')
    
    url=re.sub("&$","",url)
    
    entries=MissionInfo.objects.filter(url__contains=url)
    for entry in entries:
        entry.shopkeeper=shopkeeper
        entry.save()
    if entries.count() >=1 :    
        return HttpResponse("<script> window.close(); </script>")
    else:    
        return HttpResponse("something wrong there ,url no exist")

@login_required()        
def clearDoneBuffer(request):        
    with GetMissionQueue().bufferLock:
        GetMissionQueue().doneBuffer={}
    return HttpResponse("success")