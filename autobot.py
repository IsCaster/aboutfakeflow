#!/usr/bin/env python
import httplib
import socket
import time
import os

socket.setdefaulttimeout(5)
def isWorkerThere():
    try:
        conn = httplib.HTTPConnection("caster.webfactional.com")
        #conn = httplib.HTTPConnection("twitter.com")
        conn.request("GET", "/off_there_time") 
        response = conn.getresponse()
        if response.status==200:
            data = response.read()
            timeoff=float(data)
            print "timeoff="+data
            if timeoff < 60 :
                return True
            else :
                return False
        else :
            print response.status
            return False
    except (httplib.HTTPException, socket.error) as ex:
        print "Error: %s" % ex
        return False
    
while isWorkerThere() == False :
    time.sleep(30)
    print "check now"
print "bot now"

os.system("export DISPLAY=localhost:1.0 ; firefox -private &")
time.sleep(10)
os.system("firefox -new-tab www.hiwinwin.com")
#os.system("firefox -new-tab http://www.nmimi.com/Action/UserAction.aspx?act=login&n=acryan&p=2020_yxsj")
    
