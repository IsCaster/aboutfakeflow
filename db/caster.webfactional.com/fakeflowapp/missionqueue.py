from threading import Semaphore,Lock,Condition,RLock
import time


class MissionQueue:
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
        if self.missionQueueSema.acquire(60):# Temporary set timeout 1 minute to wait for mission (and then reconnect )
            with self.bufferLock:
                key,item=self.unhandledBuffer.popitem()                
                # move item  to undergoBuffer        
                self.undergoBuffer[item.itemId]=item
                return item
        return None 

    def getUndergoMission(self,itemId):
        with self.bufferLock:
            if self.undergoBuffer.has_key(itemId):
                return self.undergoBuffer[itemId]
            else:
                return None
    def getCustomerMission(self,customer):
        with self.bufferLock:
            for id,item in self.undergoBuffer:
                if item.customer == custmoer :
                    return item
            return None        
    
    def push(self,item):        
        with self.bufferLock:
            sumBuffer={}
            sumBuffer.update(self.unhandledBuffer)
            sumBuffer.update(self.undergoBuffer)
            sumBuffer.update(self.doneBuffer)            
            while sumBuffer.has_key(item.itemId) :
                if sumBuffer[item.itemId].message == item.message and sumBuffer[item.itemId].site == item.site:
                    
                    if self.unhandledBuffer.has_key(item.itemId):
                        return "unhandled",self.unhandledBuffer[item.itemId]
                    elif self.undergoBuffer.has_key(item.itemId):
                        return "undergoBuffer",self.undergoBuffer[item.itemId]
                    else:
                        # item in doneBuffer
                        return "doneBuffer",self.doneBuffer[item.itemId]
                        
                else:
                    item.itemId=item.itemId+1    
            # item not exist in MissionQueue,add one    
            self.unhandledBuffer[item.itemId]=item
        
        self.missionQueueSema.release()  
        return "unhandled",item
    
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
        self.message=message
        self.site=site
        self.shopkeeper=shopkeeper
        self.itemId=hash(message+site)
        self.wait_p_sema=TimeOutWrapper(Semaphore(0))#used when wait for mission productor
        self.wait_c_sema=TimeOutWrapper(Semaphore(0))#used when wait for mission customer
        self.detector_lock=Lock()#used when multi mission productors submit a same mission 
        self.finish_cond=Condition(Lock())
        self.urls=[] # if urls is umpty when the MissionItem is in the doneBuffer ,it means the mission is invalid
        self.ignoreDb=False # used when the same mission have different url
        self.fetchResultTime=0 #time to submit url and wait for result
        self.need2Wait=True
        self.customer="" # url custmoer's user ID
        self.triedUrls=[] # tried urls

class TimeOutWrapper:
    def __init__(self,obj):
        self.obj=obj #obj is a Lock or a Semaphores or maybe something else
        self.cond = Condition(Lock())

    def acquire(self,timeout):
        with self.cond:
            current_time = start_time = time.time()
            while current_time <= start_time + timeout:
                if self.obj.acquire(False):
                    return True
                else:
                    self.cond.wait(timeout - current_time + start_time)
                    current_time = time.time()   
        return False

    def release(self):
        with self.cond:
            self.obj.release()
            self.cond.notify() 
       
     
g_MissionQueue=MissionQueue()
        
def GetMissionQueue():
    global g_MissionQueue
    return g_MissionQueue;      

