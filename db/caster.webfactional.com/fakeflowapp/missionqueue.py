from threading import Semaphore,Lock,Condition,RLock
from time import time
import re

class MissionQueue:
    # some MissionQueue function must occupy bufferLock before been provoked
    def __init__(self):
        self.missionQueueSema=TimeOutWrapper(Semaphore(0))
        self.unhandledBuffer={}
        self.undergoBuffer={}
        self.doneBuffer={}
        self.bufferLock=RLock()
    def pop(self,itemId=None):
        if itemId != None:
            if self.missionQueueSema.acquire(0): #no need to wait just check 
                with self.bufferLock:
                    if self.unhandledBuffer.has_key(itemId):
                        item=self.unhandledBuffer.pop(itemId)
                        self.undergoBuffer[item.itemId]=item
                        return item
                    else:
                        return None
            else:
                return None
        # no itemId
        if self.missionQueueSema.acquire(0):# Temporary set timeout 1 minute to wait for mission (and then reconnect )
            with self.bufferLock:
                key,item=self.unhandledBuffer.popitem()                
                # move item  to undergoBuffer        
                self.undergoBuffer[item.itemId]=item
                return item
        return None 

    def getUndergoMission(self,itemId):
        if self.undergoBuffer.has_key(itemId):
            return self.undergoBuffer[itemId]
        else:
            return None
            
    def getCustomerMission(self,customer):
        itemList=[]
        for id,item in self.undergoBuffer.items():
            if item.customer == customer:
                itemList.append(item)
        return itemList 
    
    def push(self,item):        
        sumBuffer={}
        sumBuffer.update(self.unhandledBuffer)
        sumBuffer.update(self.undergoBuffer)
        sumBuffer.update(self.doneBuffer)
        while sumBuffer.has_key(item.itemId) :
            if sumBuffer[item.itemId].message == item.message and sumBuffer[item.itemId].site == item.site:
                if self.unhandledBuffer.has_key(item.itemId):
                    return "unhandled",self.unhandledBuffer[item.itemId]
                elif self.undergoBuffer.has_key(item.itemId):
                    return "undergo",self.undergoBuffer[item.itemId]
                else:
                    # item in doneBuffer
                    return "done",self.doneBuffer[item.itemId]
                    
            else:
                item.itemId=item.itemId+1    
        # item not exist in MissionQueue,add one    
        # item.wait_c_sema.release()
        self.unhandledBuffer[item.itemId]=item
        self.missionQueueSema.release()
        return "unhandled",item
    
    def query(self,item):        
        sumBuffer={}
        sumBuffer.update(self.unhandledBuffer)
        sumBuffer.update(self.undergoBuffer)
        sumBuffer.update(self.doneBuffer)
        while sumBuffer.has_key(item.itemId) :
            if sumBuffer[item.itemId].message == item.message and sumBuffer[item.itemId].site == item.site:
                if self.unhandledBuffer.has_key(item.itemId):
                    return "unhandled",self.unhandledBuffer[item.itemId]
                elif self.undergoBuffer.has_key(item.itemId):
                    return "undergo",self.undergoBuffer[item.itemId]
                else:
                    # item in doneBuffer
                    return "done",self.doneBuffer[item.itemId]
                    
            else:
                item.itemId=item.itemId+1    
        # item not exist in MissionQueue
        return "none",item
    
    def toString(self):
        trace="unhandledBuffer:\n"
        for id,item in GetMissionQueue().unhandledBuffer.items():
            trace=trace+str(id)+":"+item.message+"\n"
        trace=trace+"undergoBuffer:\n"
        for id,item in GetMissionQueue().undergoBuffer.items():
            trace=trace+str(id)+":"+item.message+"\n"
        trace=trace+"doneBuffer:"
        for id,item in GetMissionQueue().doneBuffer.items():
            trace=trace+"\n"+str(id)+":"+item.message
        return trace        
  
class MissionItem:
    def __init__(self, message, site ,shopkeeper=""):
        self.raw_message=message
        self.message=re.sub(r"\s*","",message)
        self.site=site
        self.shopkeeper=shopkeeper
        self.itemId=hash(self.message+site)
        self.wait_success_sema=TimeOutWrapper(Semaphore(0))#used when wait for mission complete
        self.urls_sema=TimeOutWrapper(Semaphore(0))#mark urls buffer to tried
        self.urls=[] # if urls is umpty when the MissionItem is in the doneBuffer ,it means the mission is invalid
        self.fetchResultTimes=[] #time to fetch url and wait for result
        self.customer="" # url custmoer's user ID
        self.bTried=[] # tried urls , return result fail
        self.fetchResultTimeouts=[] #timeout to wait for result
        self.itemLock=Lock() #used to assure atom operator to item data
        self.url="" # the checked correct url
        self.split=2 # one mission productor(all the same url customer) can check how many urls one time, 0 represent all the urls
        self.createTime=time()
        self.lastVisitTime=self.createTime
        self.clients=[]
        self.keyword="" #keyword of taobao home page search
        self.firstVisitUrl="" # to do
        self.inshopUrl="" # to do
        self.searchTips="" # to do
        self.idInSite="" # mission id in the specific site
    def toJson(self):
        jsonData={}
        jsonData["message"]=self.raw_message
        jsonData["itemId"]=str(self.itemId)
        jsonData["url"]=self.url
        jsonData["site"]=self.site
        jsonData["shopkeeper"]=self.shopkeeper
        jsonData["createTime"]=str(self.createTime) # new
        jsonData["lastVisitTime"]=str(self.lastVisitTime) # new
        jsonData["customer"]=self.customer # new
        jsonData["urls"]=self.urls
        jsonData["fetchResultTimes"]=self.fetchResultTimes
        jsonData["bTried"]=self.bTried
        jsonData["clients"]=self.clients # new
        jsonData["keyword"]=self.keyword
        jsonData["firstVisitUrl"]=self.firstVisitUrl
        jsonData["inshopUrl"]=self.inshopUrl
        jsonData["searchTips"]=self.searchTips
        
        bNeed = True
        if self.url!="" :
            bNeed = True
        else:
            for fetchResultTime in self.fetchResultTimes :
                if fetchResultTime == 0 :
                    bNeed= False
                    break    
        jsonData["bNeed"]=bNeed # new
        return jsonData
        
    def init(self):
        self.wait_success_sema=TimeOutWrapper(Semaphore(0))#used when wait for mission complete
        self.urls_sema=TimeOutWrapper(Semaphore(0))#mark urls buffer to tried
        self.urls=[] # if urls is umpty when the MissionItem is in the doneBuffer ,it means the mission is invalid
        self.fetchResultTimes=[] #time to fetch url and wait for result
        self.customer="" # url custmoer's user ID
        self.bTried=[] # tried urls , return result fail
        self.fetchResultTimeouts=[] #timeout to wait for result
        self.itemLock=Lock() #used to assure atom operator to item data
        self.url="" # the checked correct url
        self.split=2 # one mission productor(all the same url customer) can check how many urls one time, 0 represent all the urls
        self.createTime=time()
        self.lastVisitTime=self.createTime
        self.clients=[] 

class TimeOutWrapper:
    def __init__(self,obj):
        self.obj=obj #obj is a Lock or a Semaphores or maybe something else
        self.cond = Condition(Lock())

    def acquire(self,timeout):
        with self.cond:
            current_time = start_time = time()
            while current_time <= start_time + timeout:
                if self.obj.acquire(False):
                    return True
                else:
                    self.cond.wait(timeout - current_time + start_time)
                    current_time = time()   
        return False

    def release(self):
        with self.cond:
            self.obj.release()
            self.cond.notify() 
       
     
g_MissionQueue=MissionQueue()
        
def GetMissionQueue():
    global g_MissionQueue
    return g_MissionQueue;      

