#!/usr/bin/env python
import httplib
import socket
import time
import os

import fcntl
import sys

import random
import re
import httplib, urllib
import subprocess

sleepMaxTime=0

def init():
    global  sleepMaxTime
    total = len(sys.argv)
    if total <= 1 :
            sleepMaxTime = 0
    else:
        sleepMaxTime = int(sys.argv[1])

    pid_file = '/tmp/botwarden.pid'
    fp = open(pid_file, 'w')
    try:
        fcntl.lockf(fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        # another instance is running
        print "another instance is running"
        sys.exit(1)

socket.setdefaulttimeout(20)
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
        
def getProxy():
    try:
        conn = httplib.HTTPConnection("www.dailiaaa.com")
        #conn = httplib.HTTPConnection("twitter.com")
        conn.request("GET", "/?ddh=551848656725298&dq=&sl=1&issj=0&xl=2&tj=fff&api=14&cf=4&yl=1") 
        response = conn.getresponse()
        if response.status==200:
            data = response.read()
            print "proxy="+data
            return data
        else :
            print response.status
            return ""
    except (httplib.HTTPException, socket.error) as ex:
        print "Error: %s" % ex
        return ""

def isProxyValid(http_proxy):
    try:
        urllib.urlopen(
            "http://www.baidu.com",
            proxies={'http':http_proxy}
        )
    except IOError as ex:
        print "Error: %s" % ex
        print "Connection error! (Check proxy:"+http_proxy+")"
        # always return true
        return True
    else:
        print http_proxy+" was fine"
        return True


def getValidProxy():
    newProxy = getProxy()
    newProxyStr=re.sub(r"^([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*).*",r"http://\1/",newProxy) 
    if newProxyStr == "" or newProxyStr == newProxy :
        print "something wrong here , can't get Proxy , check later"
        time.sleep(60)
        return getValidProxy()
    else :
        if isProxyValid(newProxyStr):
            return newProxyStr
        else:
            return getValidProxy()

def openProxyFirefox(http_proxy):
    global  sleepMaxTime
    
    os.system("pkill firefox")
    
    if http_proxy == "":
        cmd_line="export DISPLAY=localhost:1.0 ; firefox -private &"
    else:
        cmd_line="export DISPLAY=localhost:1.0 ; export http_proxy='"+http_proxy+"' ; firefox -private &"
    os.system(cmd_line)
    time.sleep(10)
    # for nmimi
    #os.system("export DISPLAY=localhost:1.0 ;firefox -new-tab '' ")
    sleep_time=int(sleepMaxTime*random.random())
    print "sleep "+str(sleep_time)+"s"
    time.sleep(sleep_time)
    os.system("export DISPLAY=localhost:1.0 ; firefox -new-tab 'http://www.yuuboo.com/member/login.php'")

def isFirefoxRunning():
    ps = subprocess.Popen("ps -eaf | grep firefox | grep -v grep ", shell=True, stdout=subprocess.PIPE)
    output = ps.stdout.read()
    ps.stdout.close()
    ps.wait()
    if re.search('firefox', output) is None:
        return False
    else:
        return True

def checkHttpProxy(http_proxy):
    if http_proxy== "" :
        ip=""
    else :
        ip = re.sub(r"^http://([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*):[0-9]*/$",r"\1",http_proxy)
        if ip == http_proxy :
            print "wrong http_proxy"
            return True
    try:
        conn = httplib.HTTPConnection("www.fakeflowdb.com:9080")
        conn.request("GET", "/checkhttpproxy?ip="+ip) 
        response = conn.getresponse()
        if response.status==200:
            data = response.read()
            print "data="+data
            if data == "valid" :
                return True
            else :
                # return False
                return True
        else :
            print response.status
            return True
    except (httplib.HTTPException, socket.error) as ex:
        print "Error: %s" % ex
        return True
    
def needNewProxy(http_proxy):
    count = 0
    while isFirefoxRunning():
        count =(count + 1)%24
        if count == 0 and not checkHttpProxy(http_proxy):
            return True
        time.sleep(5)
    return True
    
def main():
    while isWorkerThere() == False :
        time.sleep(30)
        print "check now"
    print "bot now"
    
    http_proxy=""
    openProxyFirefox(http_proxy)
    while needNewProxy(http_proxy):
        http_proxy = getValidProxy()
        openProxyFirefox(http_proxy)
        print "check needNewProxy()"
 
init()
main()
