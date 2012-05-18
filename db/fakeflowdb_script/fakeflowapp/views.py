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

def observerWait(theMission):
    with theMission.finish_cond:
        if not theMission.need2Wait :
            response_data['status']=20003
            return HttpResponse(simplejson.dumps(response_data))
        theMission.finish_cond.wait(30)#wait for the final result until the detector notifyAll and release the lock or timeout
        
        if not theMission.need2Wait :
            response_data['status']=20004
            return HttpResponse(simplejson.dumps(response_data))
        else:
            response_data['status']=30002
            return HttpResponse(simplejson.dumps(response_data))

def detectorWait(theMission):
    if theMission.wait_c_sema.acquire(30):#wait for mission customer to submit urls
        theMission.fetchResultTime = time()
        response_data['status']=10004
        response_data['urls']=theMission.urls
        response_data['fetchResultTime']=theMission.fetchResultTime
        theMission.detector_lock.release()
        return HttpResponse(simplejson.dumps(response_data))
    else:
        response_data['status']=30001
        response_data['itemId']=str(theMission.itemId)
        with theMission.finish_cond:
            #theMission.need2Wait=False
            theMission.finish_cond.notifyAll()#wake up other mission productors,no need wait for result now
        theMission.detector_lock.release()
        return HttpResponse(simplejson.dumps(response_data),mimetype="application/json")   
            
    # response_data['status']  
    # value       meaning
    # 10001       find url in urlCache
    # 10002       find url in database
    # 10003       find url in MissionQueue.doneBuffer
    # 10004       got url by mission customer, fetch result
    # 10005       changed detector to fetch result(useless now)
    # 10006       url not find, try urls with same shopkeeper
    
    # 20001       timeout when wait for mission custmoer submit urls ,quit mission
    # 20002       no need to wait ,once timeout when wait for mission custmoer submit urls 
    # 20003       same as 20002 ,just for debug to make it different
    # 20004       same as 20002 ,just for debug to make it different
    
    # 30001       detector return ,still need 2 wait ,maybe check again to be a detector or observer
    # 30002       observer return ,still need 2 wait ,maybe check again to be a detector or observer
    
    # 40001       invalid mission ,should quit the mission

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
            response_data['urls']=""
            return HttpResponse(simplejson.dumps(response_data))

    urls=[]
    if  entries.count() >= 1 : 
        for entry in entries:
            if entry.url not in urls:
                urls.append(entry.url)
        response_data['status']=10002
        response_data['urls']=urls
        return HttpResponse(simplejson.dumps(response_data))
    elif shopkeeper != "" :
        entries=MissionInfo.objects.filter(message__startswith=shopkeeper,site=site).order_by("-updateTime")[:20]
        if  entries.count() >= 1 : 
            for entry in entries:
                if entry.url not in urls:
                    urls.append(entry.url)
                    if len(urls) >= 5: #max 5 tries
                        break
            response_data['status']=10006
            response_data['urls']=urls
            response_data['fetchResultTime']=int(time())
            return HttpResponse(simplejson.dumps(response_data))
    
    # urls not in the database
    newMission=MissionItem(message,site,shopkeeper);

    #whether GetMissionQueue().push return success or fail ,if mission is not finished
    #thread still need to acquire lock to be the only detector of the mission
    #push function is a push_or_get function

    location,theMission=GetMissionQueue().push(newMission)

    if location == "doneBuffer" :
        response_data['status']=10003
        response_data['urls']=theMission.urls
        return HttpResponse(simplejson.dumps(response_data))
        
    else : 

        if theMission.detector_lock.acquire(False):
            # be the only detector               
            if not theMission.need2Wait :
                response_data['status']=20002
                response_data['itemId']=str(theMission.itemId)
                theMission.detector_lock.release()
                return HttpResponse( simplejson.dumps(response_data),mimetype="application/json")
               
            if theMission.fetchResultTime == 0 : 
                return detectorWait(theMission)
            else:
                #i only need one detector (others are observers)
                #see if the only detector is timeout of submit result       
                if time() > theMission.fetchResultTime+2*60 :#wait for 2 [why 2 ? to do] minutes for the detector submit result #or the mission custmor
                    return detectorWait(theMission)
                else:
                    theMission.detector_lock.release()
                    return observerWait(theMission)                          
        else:
            # wait for a result
            return observerWait(theMission)


    #won't run to here comment it
    response_data={}
    return HttpResponse(simplejson.dumps(response_data));

@login_required()
def getMission(request):
    logger.debug("i'm here .getMission page")
    response_data={"missonInfo":"abc"}
    return HttpResponse(simplejson.dumps(response_data));
    
def submitUrl(request):
    raw_itemId = request.POST["itemId"]

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

    trace="itemId="+itemId+";hash(message+site)="+str(hash(message+site))+"\n"
    trace=trace+"message="+message+"  site="+site+";before insert url\n"
    trace=trace+GetMissionQueue().toString()
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
                    del GetMissionQueue().undergoBuffer[theMission.itemId]
                    GetMissionQueue().doneBuffer[theMission.itemId]=theMission
                    trace=trace+"after insert url\n"+GetMissionQueue().toString()
                    return HttpResponse("insert result success .\n"+trace);    
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
                trace=trace+"after insert url\n"+GetMissionQueue().toString() 
                logger.debug("mission don't exist ,should abandon result ,but save first ")    
                return HttpResponse("mission don't exist ,should abandon result ,but save first \n"+trace);  

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


@csrf_exempt 
def submitResultFail(request):
    return

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
