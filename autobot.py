#!/usr/bin/env python
import httplib
import socket
import time
import os

import fcntl
import sys

import random

total = len(sys.argv)
if total <= 1 :
        sleepMaxTime = 0
else:
    sleepMaxTime = int(sys.argv[1])


pid_file = '/tmp/autobot.pid'
fp = open(pid_file, 'w')
try:
    fcntl.lockf(fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
except IOError:
    # another instance is running
    print "another instance is running"
    sys.exit(1)

socket.setdefaulttimeout(10)
def isWorkerThere():
    try:
        conn = httplib.HTTPConnection("www.fakeflowdb.com:9080")
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

os.system("pkill firefox")
os.system("export DISPLAY=localhost:1.0 ; firefox -private &")
time.sleep(10)
# for nmimi
#os.system("export DISPLAY=localhost:1.0 ;firefox -new-tab '' ")
sleep_time=int(sleepMaxTime*random.random())
print "sleep "+str(sleep_time)+"s"
time.sleep(sleep_time)
os.system("export DISPLAY=localhost:1.0 ; firefox -new-tab www.hiwinwin.com")
