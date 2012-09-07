# Create your views here.
# coding: gbk
from django.http import HttpResponse
from django.template import Context, loader
from fakeflowapp.models import MissionInfo, VerificationCode, ShopkeeperWhiteList, MissionCompleteList
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
from datetime import datetime
from datetime import timedelta

from django.db.models import Sum

import logging
logger = logging.getLogger(__name__)

clientStatusBuffer=[]

def missionQueueTrace(fn):
    def wrapped(*arg):
        logger.debug("enter "+fn.__name__)
        #logger.debug(GetMissionQueue().toString()) 
        rlt=fn(*arg)
        logger.debug("leave "+fn.__name__)
        #logger.debug(GetMissionQueue().toString()) 
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


def handleInBufferMission(location,theMission):
    response_data={}
    if location == "done" :
        if theMission.url != "":
            response_data['status']=10003
            response_data['urls']=theMission.urls
            response_data['fetchResultTime']="0"
        else:
            response_data['status']=40001
            response_data['urls']=[]
        return HttpResponse(simplejson.dumps(response_data))
    else : 
        if not theMission.urls_sema.acquire(0): # wait for url customer to product urls
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
                    response_data['fetchResultTime']=str(newFetchResultTime)
                    response_data['itemId']=str(theMission.itemId)
                    return HttpResponse(simplejson.dumps(response_data),mimetype="application/json")
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
        
    if request.POST.has_key("local"):
        local=request.POST["local"]
    else:
        local="90002"
        
    if request.POST.has_key("client"):    
        client=request.POST["client"]
    else:
        client=""
        
    # shopkeeper=unquote(raw_shopkeeper.encode('ascii','ignore')).decode('utf8')
    # site=unquote(raw_site.encode('ascii','ignore')).decode('utf8')
    # message=unquote(raw_message.encode('ascii','ignore')).decode('utf8')
    shopkeeper=re.sub(r";$","",raw_shopkeeper)
    site=raw_site
    message=re.sub(r"\s*","",raw_message)
    
    # query cache first 
    newMission=MissionItem(raw_message,site,shopkeeper);
    with GetMissionQueue().bufferLock:
        location,theMission=GetMissionQueue().query(newMission)
    if location != "none":
        # update the last visit time 
        theMission.lastVisitTime=time()
        # fill the mission client
        if client != "" and client not in theMission.clients :
            theMission.clients.append(client)
        return handleInBufferMission(location,theMission)
    
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
        response_data['fetchResultTime']="0"
        response_data['urls']=urls
        return HttpResponse(simplejson.dumps(response_data))
    elif shopkeeper != "" :
        shopkeeperList=ShopkeeperWhiteList.objects.filter(shopkeeper=shopkeeper)
        #logger.debug("shopkeeperList.count()=%d,shopkeeper=%s"%(shopkeeperList.count(),quote(shopkeeper)))        
        if shopkeeperList.count() >=1 :
            entries=MissionInfo.objects.filter(message__startswith=shopkeeper,site=site,valid=True).order_by("-updateTime")[:30]
            if  entries.count() >= 1 : 
                for entry in entries:
                    if entry.url not in urls:
                        urls.append(entry.url)
                        if len(urls) >= 10: #max 10 tries
                            break

                with GetMissionQueue().bufferLock:
                    location,theMission=GetMissionQueue().push(newMission)
                # fill the mission client
                if client != "" and client not in theMission.clients :
                    theMission.clients.append(client)

                # assume no one quicker than this thread        
                if location == "undergo" or location == "done" :
                    return handleInBufferMission(location,theMission)
                else :
                    theUndergoMission = GetMissionQueue().pop(theMission.itemId)
                    if theUndergoMission != None:
                        theUndergoMission.customer="public"
                        fetchResultTime = time() 
                        for new_url in urls:
                            theUndergoMission.urls.append(new_url)
                            theUndergoMission.bTried.append(False)
                            theUndergoMission.fetchResultTimes.append(fetchResultTime)
                            theUndergoMission.fetchResultTimeouts.append(60)
                            theUndergoMission.urls_sema.release()
                        response_data['status']=10006
                        response_data['urls']=urls
                        response_data['fetchResultTime']=fetchResultTime
                        response_data['itemId']=str(theMission.itemId)
                        return HttpResponse(simplejson.dumps(response_data))
                    else:
                        #error ,maybe someone got the mission quicker than this thread ,return to try again
                        response_data['status']=10003
                        response_data['urls']=[]
                        response_data['fetchResultTime']="0"
                        return HttpResponse(simplejson.dumps(response_data))
    
    if local == "90001" :
        #no need to continue
        response_data['status']=20001
        return HttpResponse(simplejson.dumps(response_data))
    
    # urls not in the database
    #newMission=MissionItem(message,site,shopkeeper);

    #whether GetMissionQueue().push return success or fail ,if mission is not finished
    #thread still need to acquire lock to be the only detector of the mission
    #push function is a push_or_get function
    
    with GetMissionQueue().bufferLock:
        location,theMission=GetMissionQueue().push(newMission)
    # fill the mission client
    if client != "" and client not in theMission.clients :
        theMission.clients.append(client)
    logger.debug("push new Mission Item")
    return handleInBufferMission(location,theMission)

def getMissionListImplement(userName,itemId=""):
    if itemId == "":
        bContain = True
    else:
        bContain = False
    
    with GetMissionQueue().bufferLock:
        theMissionList = GetMissionQueue().getCustomerMission(userName)
        thePublicMissionList = GetMissionQueue().getCustomerMission("public")
    theMissionListJson=[]
    thePublicMissionListJson=[]
    for theMission in theMissionList:
        if str(theMission.itemId) == itemId :
            bContain = True 
        theMissionListJson.append(theMission.toJson())        
    for thePublicMission in thePublicMissionList:
        if str(thePublicMission.itemId) == itemId :
            bContain = True 
        thePublicMissionListJson.append(thePublicMission.toJson())
    if not bContain :
        if GetMissionQueue().doneBuffer.has_key(int(itemId)):
            thePublicMissionListJson.append(GetMissionQueue().doneBuffer[int(itemId)].toJson())
    
    response_data={
            "theMissionList":theMissionListJson,
            "thePublicMissionList":thePublicMissionListJson,
        } 
    return response_data
    
@login_required()
def getMissionList(request):
    # bFilter = request.POST["filter"]
    response_data = getMissionListImplement(str(request.user))
    response_data["status"]="gotMissionList"
    return HttpResponse(simplejson.dumps(response_data));
        
@login_required()
def getMission(request):
    itemId = request.POST["itemId"]
    bFocus = "0"
    if request.POST.has_key("bFocus") :
        bFocus = request.POST["bFocus"]
    if itemId != "" :
        response_data = getMissionListImplement(str(request.user),itemId)
        response_data["status"]="withItemId"
        response_data["clientStatusBuffer"]=clientStatusBuffer
        return HttpResponse(simplejson.dumps(response_data));
    bAlert = True 
    if bFocus == "1" :
        bAlert = False
        with GetMissionQueue().bufferLock:
            if len(GetMissionQueue().unhandledBuffer) >= 5 : # alert when unhandled missions count more than 5
                bAlert = True
            else :
                for id,theUnhandleMission in GetMissionQueue().unhandledBuffer.items():
                    if theUnhandleMission.site == "hiwinwin" :
                        bAlert = True 
                        break
                    elif time()-theUnhandleMission.createTime > 600 : # wait 10 minutes to alert
                        bAlert = True 
                        break
    if bAlert :                    
        theMission = GetMissionQueue().pop()
        if theMission != None:
            theMission.customer=str(request.user)
            response_data = getMissionListImplement(str(request.user))
            response_data["status"]="waitForUrls"
            response_data["clientStatusBuffer"]=clientStatusBuffer
            return HttpResponse(simplejson.dumps(response_data));

    with GetMissionQueue().bufferLock:
        theMissionList = GetMissionQueue().getCustomerMission(str(request.user))
        thePublicMissionList = GetMissionQueue().getCustomerMission("public")
    for theMission in theMissionList + thePublicMissionList :
        bWarn=True
        for theTried in theMission.bTried :
            if theTried == False:
                bWarn=False
        if len(theMission.bTried) == 0:
            bWarn =False
        if bWarn :
            response_data = getMissionListImplement(str(request.user))
            response_data["status"]="warnMissionNeed2Handle"
            response_data["clientStatusBuffer"]=clientStatusBuffer
            return HttpResponse(simplejson.dumps(response_data))
    response_data = getMissionListImplement(str(request.user))
    response_data["status"]="waitForMissions"
    response_data["clientStatusBuffer"]=clientStatusBuffer
    return HttpResponse(simplejson.dumps(response_data))
        
def submitUrl(request):
    itemId = request.POST["itemId"]
    keyword =request.POST["keyword"]
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
        # add keyword
        theMission.keyword=keyword
        if str(theMission.customer) != str(request.user) and theMission.customer != "public":
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
                            new_url_trim=re.sub(r"&$","",new_url)
                            url_trim=re.sub(r"&$","",url)
                            if new_url_trim== url_trim and not theMission.bTried[index] and theMission.fetchResultTimes[index]==0 :
                                bAdd = False
                                break
                        if bAdd :
                            logger.debug("add new url:%s"%(new_url))
                            theMission.urls.append(new_url)
                            theMission.bTried.append(False)
                            theMission.fetchResultTimes.append(0)
                            theMission.fetchResultTimeouts.append(60)
                            theMission.urls_sema.release()
            if not theMission.wait_success_sema.acquire(0):
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
    client=request.POST["client"]
    
    if site=="nmimi" :
        if request.POST.has_key("price") and request.POST["price"]!="" :
            price=float(request.POST["price"])
        else:
            price=0.2
    else:
        price = 1
    
    updateClientStatus(site,client)
    recordMissionComplete(site,client,price)
    # message=unquote(raw_message.encode('ascii','ignore')).decode('utf8')
    # itemId=unquote(raw_itemId.encode('ascii','ignore')).decode('utf8')
    # code=unquote(raw_code.encode('ascii','ignore')).decode('utf8')
    # codeImg=unquote(raw_codeImg.encode('ascii','ignore')).decode('utf8')
    # url=unquote(raw_url.encode('ascii','ignore')).decode('utf8')
    
    message=re.sub(r"\s*","",raw_message)
    itemId=raw_itemId
    url=raw_url
    
    url=re.sub("&$","",url)
    
    
    shopkeeper=""
    if request.POST.has_key("shopkeeper"):
        shopkeeper=re.sub(r";$","",request.POST["shopkeeper"])
    
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
                    newMissionInfo.keyword=theMission.keyword
                    newMissionInfo.save()
                    # move theMission to doneBuffer ,after pop theMission can only in the undergoBuffer
                    entries=MissionInfo.objects.filter(message=message,site=theMission.site).order_by("-updateTime")[:20]#retrieve max :20

                    count = entries.count()

                    urls=[url]
                    if  entries.count() >= 1 : 
                        for entry in entries:
                            if entry.valid ==True and entry.url not in urls:
                                urls.append(entry.url)
                    with theMission.itemLock:
                        theMission.url=url
                        theMission.urls=urls
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
    raw_message = request.POST["message"]
    itemId = request.POST["itemId"]
    site = request.POST["site"]
    
    message=re.sub(r"\s*","",raw_message)
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
        return HttpResponse(" invalidMissionC: success ")            
    else:
        return HttpResponse(" invalidMissionC: wrong mission info ")        

def deleteMissionC(request):
    itemId = request.POST["itemId"]
    message=""
    site=""
    if len(itemId) != 0 :
        # move theMission to doneBuffer with .urls empty , it means it's a invalid mission
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission != None :
                del GetMissionQueue().undergoBuffer[theMission.itemId]
                theMission.urls_sema.release()
                return HttpResponse(" deleteMissionC: success ")
    return HttpResponse(" deleteMissionC: fail ")   
        

@csrf_exempt 
def submitResultFail(request):
    raw_message = request.POST["message"]
    itemId = request.POST["itemId"]
    site = request.POST["site"]
    fail_url = request.POST["url"]
    fetchResultTime = request.POST["fetchResultTime"]
    
    message=re.sub(r"\s*","",raw_message)
    
    if len(itemId) != 0 :
        with GetMissionQueue().bufferLock:
            theMission=GetMissionQueue().getUndergoMission(int(itemId))
            if theMission != None :
                # update the last visit time 
                theMission.lastVisitTime=time()
                for i,url in enumerate(theMission.urls):
                    if fail_url==url and str(fetchResultTime)==str(theMission.fetchResultTimes[i]) :
                        theMission.bTried[i]=True
                    if  str(fetchResultTime)==str(theMission.fetchResultTimes[i]):
                        theMission.fetchResultTimeouts[i]=time()-theMission.fetchResultTimes[i]+60
                return HttpResponse(" submitResultFail :success ")
            else:
                return HttpResponse(" submitResultFail :fail ")
    else:
        #error url in db or doneBuffer 
        newMission=MissionItem(raw_message,site);
        with GetMissionQueue().bufferLock:
            location,theMission=GetMissionQueue().push(newMission)
            if location == "done" :
                theMission.init()
                del GetMissionQueue().doneBuffer[theMission.itemId]
                GetMissionQueue().unhandledBuffer[theMission.itemId]=theMission
                GetMissionQueue().missionQueueSema.release()
                return HttpResponse(" submitResultFail :success ,move the mission from doneBuffer to unhandleBuffer")
            else:
                return HttpResponse(" submitResultFail :success ,new one mission ")
    

def close(request):
    return HttpResponse("<script> window.close(); </script>")

@login_required()    
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
    keyword=""
    firstVisitUrl=""
    inshopUrl=""
    searchTips=""
    if request.POST.has_key("keyword") :
        keyword=request.POST["keyword"]
    
    if request.POST.has_key("site") :
        site=request.POST["site"]
    else:
        site="hiwinwin"
    if request.POST.has_key("message") :
        message=request.POST["message"]
        logger.debug("fakeVisit message="+message)
        newMission=MissionItem(message,site);
        with GetMissionQueue().bufferLock:
            location,theMission=GetMissionQueue().query(newMission)
        logger.debug("fakeVisit location="+location)
        if location != "none" :
            if theMission.keyword != "":
                keyword = theMission.keyword
                #to do
        else:#no in the missionqueue maybe in the database
            entries=MissionInfo.objects.filter(message=message,site=site).order_by("-updateTime")[:20]#retrieve max :20
            for entry in entries:
                if entry.keyword != "" or entry.firstVisitUrl != "":
                    keyword=entry.keyword
                    firstVisitUrl=entry.firstVisitUrl
                    #to do
    
    #url=re.sub(r"&$","",url)
    #remove spm
    #url=re.sub(r"\?spm=[a-z0-9\.]*&","",url)
    #transform to standard item url pattern
    url=re.sub(r"^http://detail.tmall.com/item.htm.*[\?&](id=[0-9]*).*$",r"http://detail.tmall.com/item.htm?\1",url)
    url=re.sub(r"^http://item.taobao.com/item.htm.*[\?&](id=[0-9]*).*$",r"http://item.taobao.com/item.htm?\1",url)
    url=re.sub(r"^http://item.tmall.com/item.htm.*[\?&](id=[0-9]*).*$",r"http://item.tmall.com/item.htm?\1",url)
    template_values=Context({
        'url':url,
        'keyword':quote(keyword.encode("gbk"), safe='~()*!.\''),
        'firstVisitUrl':firstVisitUrl,
        'inshopUrl':inshopUrl,
        'searchTips':searchTips,
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
        return HttpResponse("<script> setTimeout(function(){window.close()},2000); </script>")
    else:    
        return HttpResponse("something wrong there ,url no exist")

@login_required()        
def clearDoneBuffer(request):        
    with GetMissionQueue().bufferLock:
        GetMissionQueue().doneBuffer={}
    return HttpResponse("success")
    
@login_required()
def addWhiteList(request):
    #shopkeeper=request.POST["shopkeeper"]
    raw_shopkeeper = request.POST['shopkeeper']
    mid_shopkeeper = raw_shopkeeper.encode('ascii','ignore')
    mid2_shopkeeper = unquote(mid_shopkeeper)
    shopkeeper = mid2_shopkeeper.decode('utf8')
    
    entries=ShopkeeperWhiteList.objects.filter(shopkeeper=shopkeeper)
    if entries.count() <=0 :
        newShopkeeper=ShopkeeperWhiteList()
        newShopkeeper.shopkeeper=shopkeeper
        newShopkeeper.save()
        return HttpResponse("adding success")
    else:
        return HttpResponse("shopkeeper already exist")
        
@login_required()
def deleteWhiteList(request):
    #shopkeeper=request.POST["shopkeeper"]
    raw_shopkeeper = request.POST['shopkeeper']
    mid_shopkeeper = raw_shopkeeper.encode('ascii','ignore')
    mid2_shopkeeper = unquote(mid_shopkeeper)
    shopkeeper = mid2_shopkeeper.decode('utf8')
    
    entries=ShopkeeperWhiteList.objects.filter(shopkeeper=shopkeeper)
    for entry in entries:
        entry.delete()
        
    return HttpResponse("success")

def updateClientStatus(site,client):
    bNewone = True
    for clientStatus in clientStatusBuffer:
        if clientStatus["site"]==site and clientStatus["client"]== client :
            bNewone=False
            clientStatus["lastVisitTime"]=str(time())
            break;
    if bNewone:
        newClientStatus={}
        newClientStatus["site"]=site
        newClientStatus["client"]=client
        newClientStatus["lastVisitTime"]=str(time())
        clientStatusBuffer.append(newClientStatus)
    return

def recordMissionComplete(site,client,price):
    if site=="nmimi" :
        tmp1=round(price*100)
        if tmp1*0.85 == round(tmp1*0.85)*1.0 :
            price = tmp1*0.85
        else:
            tmp2=round(tmp1*0.85/2)*2
            price=tmp2
    newMissionCompleteItem=MissionCompleteList()
    newMissionCompleteItem.site=site
    newMissionCompleteItem.client=client
    newMissionCompleteItem.price=price
    newMissionCompleteItem.save()
    return
    
@login_required()
def removeClient(request):
    site=unquote(request.POST["site"].encode('ascii','ignore')).decode('utf8')
    client=unquote(request.POST["client"].encode('ascii','ignore')).decode('utf8')
    
    for index,clientStatus in enumerate(clientStatusBuffer):
        if clientStatus["site"]==site and clientStatus["client"]== client :
            del clientStatusBuffer[index]
    return HttpResponse("success")
    
@csrf_exempt
def heartBeat(request):
    site=request.POST["site"]
    client=request.POST["client"]
    
    if site=="nmimi" :
        if request.POST.has_key("price") and request.POST["price"]!="" :
            price=float(request.POST["price"])
        else:
            price=0.2
    else:
        price = 1
    
    updateClientStatus(site,client)
    recordMissionComplete(site,client,price)
    return HttpResponse("success")

@login_required()
def resetClientVisitTime(request):
    site=unquote(request.POST["site"].encode('ascii','ignore')).decode('utf8')
    client=unquote(request.POST["client"].encode('ascii','ignore')).decode('utf8')
    
    updateClientStatus(site,client)
    return HttpResponse("success")    
    
def utf8ToGbk(request):
    q=unquote(request.POST["q"].encode('ascii','ignore')).decode('utf8')
    q_gbk=quote(q.encode("gbk"), safe='~()*!.\'')
    
    response_data={"r":q_gbk}
    return HttpResponse(simplejson.dumps(response_data))

class DailyData:
    pass
class DailyClientData:
    pass

@login_required()    
def missionDailyStatistics(request):
    dt_now=datetime.now()
    dt_line=datetime(dt_now.year,dt_now.month,dt_now.day,3,0)
    if dt_now >dt_line:
        date_latest=datetime(dt_now.year,dt_now.month,dt_now.day,3,0)
    else:
        date_latest=datetime(dt_now.year,dt_now.month,dt_now.day,3,0)-timedelta(days=1)
    
    clients=MissionCompleteList.objects.filter(updateTime__lte=date_latest+timedelta(days=1),updateTime__gt=date_latest-timedelta(days=30)).distinct('site','client') 
    
    monthlyStatisticsData=[]
    for i in range(0,31):
        dailydata=DailyData()
        dt_start=date_latest-timedelta(days=i)
        dt_end=date_latest-timedelta(days=(i-1))
        dailydata.label=dt_start.strftime("%Y %m %d")
        dailydata.clientsData=[]
        dailydata.hi_sum=0
        dailydata.nmi_sum=0
        for item in clients:
            gold_contain=MissionCompleteList.objects.filter(updateTime__lte=dt_end,updateTime__gt=dt_start,site=item.site,client=item.client).aggregate(Sum('price'))
            gold=gold_contain["price__sum"]
            if gold==None :
                gold=0
            if item.site=="nmimi" :
                gold=gold/100.0
                dailydata.nmi_sum=dailydata.nmi_sum+gold
            if item.site=="hiwinwin" :
                dailydata.hi_sum=dailydata.hi_sum+gold
            dailyClientData=DailyClientData()
            dailyClientData.site=item.site
            dailyClientData.gold=gold
            dailydata.clientsData.append(dailyClientData)
        dailydata.hi_money=dailydata.hi_sum*0.248*0.4
        dailydata.nmi_money=dailydata.nmi_sum*0.4
        dailydata.money=dailydata.hi_money+dailydata.nmi_money
        monthlyStatisticsData.append(dailydata)
        
    template_values={   "statisticsData":monthlyStatisticsData,
                        "headline":clients,
                    }
    return render_to_response('statisticsdata.html', template_values);