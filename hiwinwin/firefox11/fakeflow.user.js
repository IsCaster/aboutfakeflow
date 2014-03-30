// ==UserScript==
// @name          Better to get fake flow mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com 
// @include       http://www.hiwinwin.com/task/count/index.aspx
// @include       http://www.hiwinwin.com/task/count/
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx*
// @include       http://www.hiwinwin.com/Error.aspx
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// @version 1.0
// @updateURL http://www.fakeflowdb.com:9080/static/fakeflow.user.js
// ==/UserScript==

//disable log
//GM_log=function(){}

db_server1="http://caster.webfactional.com"
db_server2="http://www.fakeflowdb.com:9080"

//db_server_flag=GM_getValue("db_server_flag","undefined")
db_server_flag=2
if(db_server_flag=="undefined")
{
    GM_setValue("db_server_flag",1)
    db_server=db_server1
}
else if(db_server_flag==1)
{
    db_server=db_server1
}
else if(db_server_flag==2)
{
    db_server=db_server2
}

unsafeWindow.gaussianGenerate = function (mean, stdev)
{
    function rnd_snd() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }
    return rnd_snd()*stdev+mean
}


//set run mode
//1: local 2: remote
if(GM_getValue("bLocal","undefined")=="undefined")
{
    GM_setValue("bLocal",90002)
}

if(location.href=="http://www.hiwinwin.com/task/count/" 
	|| location.href=="http://www.hiwinwin.com/task/count/index.aspx" )
{
	if( document.referrer.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx?id=")!=-1)
	{
        handleAutoJumpTaskCountPage(unsafeWindow.opener.opener.top,"annouceLoaded")
	}
    else if (document.referrer.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx")!=-1)
    {
        handleAutoJumpTaskCountPage(unsafeWindow.opener.opener.top,"annouceComplete")
    }
    else if(document.referrer=="http://www.hiwinwin.com/finance/Exchange.aspx?referrer=http%3a%2f%2fwww.hiwinwin.com%2fmember%2f"
        || document.referrer=="http://www.hiwinwin.com/member/"
        || document.referrer=="")
    {
        handleGetMissionStaffPage()
    }
    else if(document.referrer=="http://www.hiwinwin.com/task/count/" )
    {
        GM_log("$('.error_panel')[0].innerHTML="+$(".error_panel")[0].innerHTML)
        GM_log("...黑名单...at "+$(".error_panel")[0].innerHTML.indexOf("对不起，您在该发布者的黑名单中，不能接手该发布者的任务；请选择其他任务接手吧"))
        if( $(".error_panel").length>=1 
            && $(".error_panel")[0].innerHTML.indexOf("对不起，您在该发布者的黑名单中，不能接手该发布者的任务；请选择其他任务接手吧")>=0)
        {
            //对不起,您在该发布者的黑名单中,不能接手该发布者的任务;请选择其他任务接手吧
            //对不起，您在该发布者的黑名单中，不能接手该发布者的任务；请选择其他任务接手吧
            handleAutoJumpTaskCountPage(unsafeWindow.opener.top,"annouceLoaded")
        }
        else
        {
            handleTooSlowPage()
        }
    }
	else 
	{
		handleTooSlowPage()
	}
}	
else if(location.href.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx")!=-1)
{
	if(location.href=="http://www.hiwinwin.com/task/count/Taskin.aspx")
	{
		annouceGetMission()
		handleMission()
        if(document.referrer=="http://www.hiwinwin.com/task/count/")
        {   
            unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
        }
	}
	else if(location.href.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx?id=")!=-1)
	{
		var showMsg=document.createElement("p");
		showMsg.innerHTML=document.scripts[0].innerHTML;    
		document.body.insertBefore(showMsg,null);
        
        if(showMsg.innerHTML.indexOf("超过")!=-1)
        {
            missionId=location.href.replace(/.*id=(\d*)&.*/g,"$1")
            invalidMissionIdList=GM_getValue("invalidMissionId","")
            if(invalidMissionIdList.indexOf(missionId+";")==-1)
            {
                invalidMissionIdList=invalidMissionIdList+missionId+";"
                GM_setValue("invalidMissionId",invalidMissionIdList)
            }
        }

        var openContainP=document.createElement("p");
        openContainP.onclick=function()
        {
            unsafeWindow.open("http://www.hiwinwin.com/task/count/")
        }
        document.body.insertBefore(openContainP,null);
        
        if(showMsg.innerHTML.indexOf("window.location.href=\"http://www.hiwinwin.com/task/count/\"")!=-1)
        {
            openContainP.click()
        }
        else if(showMsg.innerHTML.indexOf("window.location.href=\"http://www.hiwinwin.com/member/Password.aspx")!=-1)
        {
            openContainP.click()
        }
	}
}
else if(location.href.indexOf("http://www.hiwinwin.com/Error.aspx")!=-1)
{
    handleAlreadyGotPage()
}
	

function handleAutoJumpTaskCountPage(motherWindow,annoucePart)
{
    unsafeWindow.checkNow=function()
    {
        //check gopage()return
        GM_log("$('#taskLst')[0].innerHTML="+$('#taskLst')[0].innerHTML)
        if($('#taskLst')[0].innerHTML=="" || $('#taskLst')[0].innerHTML=='<div class="submiting">任务加载中.....<p></p></div>')
        {
            setTimeout(function(){unsafeWindow.checkNow()},1000)
            return
        }
        //<center><span class="f_blue f_14 f_b">对不起,您接手到任务后10秒内将无法刷新
        else if ($('#taskLst')[0].innerHTML.indexOf('您接手到任务后10秒内将无法刷新')>=0)
        {   
            GM_log("error 对不起,您接手到任务后10秒内将无法刷新")

            setTimeout(function()
                { 
                    $('.cursor')[0].onclick()
                    unsafeWindow.checkNow()
                }, 3543+Math.random()*3000)
            return
        }
        //check if gopage() changed
        goPageToString=GM_getValue( "goPageToString","")
        if(goPageToString!=unsafeWindow.goPage.toString())
        {
            setTimeout(function(){motherWindow.document.getElementById("annouceGoPageChange").onclick()
                },0)
            GM_setValue( "newGoPageToString",unsafeWindow.goPage.toString())
        }
        else if($("a[href='javascript:goPage(6);']").length<=0)
        {
            GM_log($("a[href='javascript:goPage(6);']").length)
            setTimeout(function(){motherWindow.document.getElementById("annouceGoPageChange").onclick()
                },0)
            GM_setValue( "newGoPageToString","no gopage(6)")
        }
        else
        {    
            if(motherWindow==unsafeWindow.opener.top)
            {
                setTimeout(function(){motherWindow.document.getElementById(annoucePart).onclick()}, 2543+Math.random()*3000)
            }
            else
            {
                setTimeout(function(){motherWindow.document.getElementById(annoucePart).onclick();location.href="javascript:window.close()"}, 2543+Math.random()*3000)
            }
        }
    }
    unsafeWindow.checkNow()
    return
}

function handleGetMissionStaffPage()
{
    //unsafeWindow.newAlert= function(str)
    //{
    //    unsafeWindow.getObj('taskLst').innerHTML = "<font color = 'red'> "+str+"</font>"
    //}
    //reset invalidMissionIdList oldMissionIdList
    GM_setValue("invalidMissionId","")
    GM_setValue("oldMissionId","")
    
    var thisReflashImages,allReflashImages;

    allReflashImages = document.evaluate(
        "//img[@class='cursor']",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);



    if(allReflashImages.snapshotLength != 1 )
    {
            confirm("程序出错，可能是hiwinwin改版了");
            GM_log("fake flow#common 程序出错，可能是hiwinwin改版了");
    }	

    thisReflashImages = allReflashImages.snapshotItem(0);

    $(".cursor ")[0].waitForLoadTime=0
	$(".cursor ")[0].unique_flag=0
    $(".cursor ")[0].goPageTimeOutIds=new Array()
    $(".cursor ")[0].resetMissionIdListTimeoutId=0
/*    
    unsafeWindow.goPage = function (n) {
        //need to wait for get mission page loaded
        if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceLoaded")[0].need2wait) != "undefined" && $("#annouceLoaded")[0].need2wait == 1 && $(".cursor ")[0].waitForLoadTime < 60)
        {
            $(".cursor ")[0].waitForLoadTime=$(".cursor ")[0].waitForLoadTime+1
            timeoutId=setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
            $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
            GM_log("setTimeout ,wait For Load  ");
            $(".cursor ")[0].unique_flag=0
            return 
        }
        $(".cursor ")[0].waitForLoadTime=0
        
        //need to wait for mission page ?
        if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceSuccess")[0].need2wait) != "undefined" && $("#annouceSuccess")[0].need2wait == 1)
        {
            timeoutId=setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
            $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
            GM_log("setTimeout ,wait For Success  ");
            $(".cursor ")[0].unique_flag=0
            return 
        }
    
        var qs = 'page=' + n + '&cnc=1&nows=' + (new Date()).getTime();
        unsafeWindow.getObj('taskLst').innerHTML = '<div class=\'submiting\'>任务加载中.....</p>';
        var xml = unsafeWindow.makeXmlReq();
        var url = '../../ajax/GetCount.aspx?' + qs;
        xml.onreadystatechange = function() {
            if (xml.readyState == 4) {
            if (xml.status == 200 || xml.status == 304) {
                
                if(typeof($(".cursor ")[0].reloadTimeoutId)!="undefined")
                {
                    clearTimeout($(".cursor ")[0].reloadTimeoutId)
                }
                
                var txt = xml.responseText;
                unsafeWindow.getObj('taskLst').innerHTML = txt;
                //GM_log("txt="+txt);
                
                GM_log('$(".tbl a").length='+$(".tbl a").length)
                
                if( $(".tbl a").length > 0 )
                {
                    randomId=Math.round(Math.random()*$(".tbl a").length,10)%$(".tbl a").length
                    GM_log("randomId="+randomId+",allAnchors.length="+$(".tbl a").length)
                    var thisLink=	$(".tbl a")[randomId].toString();
                    GM_log("fetch mission ");
                    //alert(thisLink+typeof(thisLink));
                    //document.getElementById("playAudioGot").play();

                    //fetch mission directly
                    //location.href=thisLink;
                    
                    $("#annouceLoaded")[0].need2wait=1
                    if(typeof(unsafeWindow.handleMissionPage)=="undefined")
                    {
                        var requestResultWindow=document.getElementById("requestResult").contentWindow;
                        unsafeWindow.handleMissionPage = requestResultWindow.open(thisLink)
                        //requestResultWindow.open(thisLink," ","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px; ");
                    }
                    else
                    {
                        unsafeWindow.handleMissionPage.location.href=thisLink
                    }            
                }
                else
                {
                    //GM_log("not get mission ");
                    
                    if($(".p_l_20").length<=0)
                    {
                        //been added to the blacklist?
                        //stop fresh
                        GM_setValue( "keepReflash",0 )
                        GM_log("taskLst.innerHTML="+txt)
                        alert("出错错误，需要重新点刷新")
                    }

                }
                
                
                
                if( GM_getValue( "keepReflash",0 ) == 1 )
                {
                    //setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
                    //GM_log("setTimeout ,reflash ");
                    var refreshTimeout=0
                    GM_log("goPage(pageIndex); calculate refreshTimeout")
                    if($(".tbl a").length>=2)
                    {   
                        refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(5000,4000))
                        if(refreshTimeout<0)
                        {
                            refreshTimeout=0
                        }
                    }
                    else
                    {
                        refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(10000,8000))
                        if(refreshTimeout<0)
                        {
                            refreshTimeout=0
                        }
                    }
                    GM_log("goPage(pageIndex); refreshTimeout="+refreshTimeout)
                    timeoutId=setTimeout("goPage(pageIndex);",refreshTimeout);
                    $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
                }
                
            }
            }
            };
        xml.open('get', url, true);
        xml.setRequestHeader('If-Modified-Since', '0');
        xml.send('');
    }
    */
	magicWord="luc"
    var goPageToString="function goPage(n) {\n    var qs = 'page=' + n + '&luc=1&nows=' + (new Date()).getTime();\n    getObj('taskLst').innerHTML = '<div class=\\'submiting\\'>任务加载中.....</p>';\n    var xml = makeXmlReq();\n    var url = '../../ajax/GetCount.aspx?' + qs;\n    xml.onreadystatechange = function () {\n      if (xml.readyState == 4) {\n        if (xml.status == 200 || xml.status == 304) {\n          var txt = xml.responseText;\n          getObj('taskLst').innerHTML = txt;\n        }\n      }\n    };\n    xml.open('get', url, true);\n    xml.setRequestHeader('If-Modified-Since', '0');\n    xml.send('');\n  }"
	if(unsafeWindow.goPage.toString()!=goPageToString)
	{
		GM_setValue( "keepReflash",0 )
		confirm("外挂需要更新，请联系管理员")
		return
	}
    GM_setValue( "goPageToString",goPageToString)
    
    unsafeWindow.pageIndex=0
    unsafeWindow.goPage = function (n) {
        //check 1
        if( GM_getValue( "keepReflash",0 ) == 0 )
        {
            return;
        }
    
        //to be the unique one
        if($(".cursor ")[0].unique_flag==0)
        {
            $(".cursor ")[0].unique_flag=1
            for (var i=0;i<$(".cursor ")[0].goPageTimeOutIds.length;++i)
            {
                clearTimeout($(".cursor ")[0].goPageTimeOutIds[i])
            }
            $(".cursor ")[0].goPageTimeOutIds=new Array()
        }
        else
        {
            return;
        }
        
        //check if it's 24:00:00 reset invalidMissionIdList oldMissionIdList
        var d = new Date();
        
        if(d.getHours()==23 && d.getMinutes()>30 && d.getMinutes()<55 && $(".cursor ")[0].resetMissionIdListTimeoutId==0 )
        {
            $(".cursor ")[0].resetMissionIdListTimeoutId=setTimeout(function()
                    {
                        GM_setValue("invalidMissionId","")
                        GM_setValue("oldMissionId","")
                    },(59-d.getMinutes())*60000
                )
        }
        //need to wait for get mission page loaded
        if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceLoaded")[0].need2wait) != "undefined" && $("#annouceLoaded")[0].need2wait == 1 && $(".cursor ")[0].waitForLoadTime < 60)
        {
            $(".cursor ")[0].waitForLoadTime=$(".cursor ")[0].waitForLoadTime+1
            timeoutId=setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
            $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
            GM_log("setTimeout ,wait For Load  ");
            $(".cursor ")[0].unique_flag=0
            return 
        }
        $(".cursor ")[0].waitForLoadTime=0
        
        
        
        //need to wait for mission page ?
        if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceSuccess")[0].need2wait) != "undefined" && $("#annouceSuccess")[0].need2wait == 1)
        {
            timeoutId=setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
            $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
            GM_log("setTimeout ,wait For Success  ");
            $(".cursor ")[0].unique_flag=0
            return 
        }

        //check 2
        if( GM_getValue( "keepReflash",0 ) == 0 )
        {
            return;
        }

        var qs = 'page=' + n + '&'+magicWord+'=1&nows=' + (new Date()).getTime();
        unsafeWindow.getObj('taskLst').innerHTML = '<div class=\'submiting\'>任务加载中.....</p>';
        var xml = unsafeWindow.makeXmlReq();
        var url = '../../ajax/GetCount.aspx?' + qs;
        unsafeWindow.pageIndex=n
        xml.onreadystatechange = function() {
        if (xml.readyState == 4) {
        if (xml.status == 200 || xml.status == 304) {
            
            if(typeof($(".cursor ")[0].reloadTimeoutId)!="undefined")
            {
                clearTimeout($(".cursor ")[0].reloadTimeoutId)
            }
            
            var txt = xml.responseText;
            if(txt.indexOf("<script")!=-1)
            {
                GM_log("txt="+txt);
                unsafeWindow.getObj('taskLst').innerHTML = txt;
                GM_setValue( "keepReflash",0 )
                confirm("外挂出错，请联系管理员")
                return;
            }
            unsafeWindow.getObj('taskLst').innerHTML = txt;
            
            
            //GM_log("txt="+txt);
            
            GM_log('$(".tbl a").length='+$(".tbl a").length)

            if( $(".tbl a").length > 0 )
            {
                var randomId=-1
                
                //check \进行中\ first
                //for(var i=0;i<$(".tbl a").length;++i)
                // {   
                    // if($(".tbl a")[i].parentNode.parentNode.innerHTML.indexOf("进行中")!="")
                    // {
                        // randomId=i
                        // break;
                    // }
                // }
                
                //check oldMissionIdList second
                var oldMissionIdList=GM_getValue("oldMissionId","")
                
                if(randomId==-1)
                {
                    for(var i=0;i<$(".tbl a").length;++i)
                    {   
                        missionId=$(".tbl a")[i].toString().replace(/.*id=(\d*)&.*/g,"$1")
                        
                        if(oldMissionIdList.indexOf(missionId+";")==-1)
                        {
                            randomId=i;
                            break;
                        }
                    }
                }
                
                if(randomId==-1)
                {
                    //check invalidMissionIdList
                    var invalidMissionIdList=GM_getValue("invalidMissionId","")
                    for(var i=0;i<$(".tbl a").length;++i)
                    {   
                        missionId=$(".tbl a")[i].toString().replace(/.*id=(\d*)&.*/g,"$1")
                        
                        if(invalidMissionIdList.indexOf(missionId+";")==-1)
                        {
                            randomId=i;
                            break;
                        }
                    }
                }
                
                if(randomId==-1)
                {
                    randomId=Math.round(Math.random()*$(".tbl a").length,10)%$(".tbl a").length
                }   
                
                
                var thisLink=	$(".tbl a")[randomId].toString();
                missionId=thisLink.replace(/.*id=(\d*)&.*/g,"$1")
                oldMissionIdList=oldMissionIdList+missionId+";"
                GM_log("randomId="+randomId+",allAnchors.length="+$(".tbl a").length+",missionId="+missionId)
                GM_setValue("oldMissionId",oldMissionIdList)
                GM_log("fetch mission ");
                //alert(thisLink+typeof(thisLink));
                //document.getElementById("playAudioGot").play();

                //fetch mission directly
                //location.href=thisLink;
                
                $("#annouceLoaded")[0].need2wait=1
                if(typeof(unsafeWindow.handleMissionPage)=="undefined")
                {
                    var requestResultWindow=document.getElementById("requestResult").contentWindow;
                    unsafeWindow.handleMissionPage = requestResultWindow.open(thisLink)
                    //requestResultWindow.open(thisLink," ","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px; ");
                }
                else
                {
                    unsafeWindow.handleMissionPage.location.href=thisLink
                }  
                
            }
            else
            {
                //GM_log("not get mission ");
                
                if($(".p_l_20").length<=0)
                {
                    //been added to the blacklist?
                    //stop fresh
                    GM_setValue( "keepReflash",0 )
                    GM_log("taskLst.innerHTML="+txt)
                    confirm("外挂出错，请联系管理呗")
                }
            }
            if($(".p_l_20").length>0)
            {
                if($(".p_l_20").length>$(".tbl a").length || unsafeWindow.pageIndex > 6 )
                //backward
                {
                    unsafeWindow.pageIndex = Math.round(Math.random()*(unsafeWindow.pageIndex-1))
                    if(unsafeWindow.pageIndex > 6)
                    {
                        unsafeWindow.pageIndex=6
                    }
                    else if (unsafeWindow.pageIndex <= 1)
                    {
                        unsafeWindow.pageIndex = 0
                    }
                }
                else
                //forward
                {    
                    if(unsafeWindow.pageIndex==0||unsafeWindow.pageIndex==1)
                    {
                        unsafeWindow.pageIndex=2
                    }
                    else
                    {
                        unsafeWindow.pageIndex = unsafeWindow.pageIndex+1
                    }
                }
                
                if( unsafeWindow.pageIndex >=2 && $("a[href='javascript:goPage("+unsafeWindow.pageIndex+");']").length<=0 )
                {
                    confirm("外挂出错，没有goPage("+unsafeWindow.pageIndex+")")
                }
                else if(unsafeWindow.pageIndex ==1)
                {
                    confirm("外挂出错，禁止出现goPage("+unsafeWindow.pageIndex+")")
                }
            }
            if( GM_getValue( "keepReflash",0 ) == 1 )
            {
                //setTimeout("goPage(pageIndex);",2000+Math.random()*1000);
                //GM_log("setTimeout ,reflash ");
                var refreshTimeout=0
                GM_log("goPage(pageIndex); calculate refreshTimeout")
                if($(".tbl a").length>=2)
                {   
                    refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(5000,2000))
                    if(refreshTimeout<2124)
                    {
                        refreshTimeout=2124
                    }
                }
                else
                {
                    refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(7000,5000))
                    if(refreshTimeout<2124)
                    {
                        refreshTimeout=2124
                    }
                }
                GM_log("goPage(pageIndex); refreshTimeout="+refreshTimeout)
                timeoutId=setTimeout("goPage(pageIndex);",refreshTimeout);
                $(".cursor ")[0].goPageTimeOutIds.push(timeoutId)
            }

        }
        }
        };        
        
        //check 3
        if( GM_getValue( "keepReflash",0 ) == 0 )
        {
            return;
        }

        //set reload timeout before send ajax
        $(".cursor ")[0].reloadTimeoutId=setTimeout(function(){
                                                        //confirm('annouceSuccess='+$('annouceSuccess')[0].need2wait,"1","2")
                                                        //GM_log('annouceSuccess='+document.getElementById('annouceSuccess').outerHTML)
                                                        if(typeof(document.getElementById('annouceSuccess').need2wait)=="undefined" || document.getElementById('annouceSuccess').need2wait!=1)
                                                        {
                                                            if(typeof(document.getElementById('annouceLoaded').need2wait)!="undefined" && document.getElementById('annouceLoaded').need2wait==1) 
                                                            {
                                                                document.getElementById('annouceLoaded').need2wait=0
                                                            }
                                                            else
                                                            {
                                                                unsafeWindow.goPage(pageIndex);
                                                            }
                                                        }
                                                    },60000)
        
        xml.open('get', url, true);
        xml.setRequestHeader('If-Modified-Since', '0');
        xml.send('');

        $(".cursor ")[0].unique_flag=0
    } 
    
    thisReflashImages.onclick= function() 
    {
        if(GM_getValue("keepReflash",0)==0)
        {
            GM_setValue("keepReflash",1);//valid keepReflash
            unsafeWindow.goPage(pageIndex);
        }
    }



    //add a iframe to see the result of trying to get a mission.
    var requestResultIframe=document.createElement("iframe");
    requestResultIframe.id='requestResult';
    requestResultIframe.style="display:none";

    document.body.insertBefore(requestResultIframe,null);

    //response to key press

    document.body.onkeydown =  function (event)
    {
        event = event||window.event;
        //GM_log("press key ="+event.keyCode);
        if(event.keyCode==119 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F7	
        {
            GM_setValue("keepReflash",0);//invalid keepReflash
            GM_log("invalid keepReflash");
        }
    }



    //add a p tag  to annouce success getting a mission.
    var annouceSuccessP=document.createElement("p");
    annouceSuccessP.id='annouceSuccess';
    annouceSuccessP.onclick=function()
    {
        GM_log("<p>.onclick annouceSuccess")
        annouceSuccessP.need2wait=1
    }
    document.body.insertBefore(annouceSuccessP,null);

    var annouceCompleteP=document.createElement("p");
    annouceCompleteP.id='annouceComplete';
    annouceCompleteP.onclick=function()
    {
        GM_log("<p>.onclick annouce mission complete")
        annouceSuccessP.need2wait=0
    }
    document.body.insertBefore(annouceCompleteP,null);

    var annouceLoadedP=document.createElement("p");
    annouceLoadedP.id='annouceLoaded';
    annouceLoadedP.onclick=function()
    {
        GM_log("<p>.onclick annouce load finished")
        annouceLoadedP.need2wait=0
    }
    document.body.insertBefore(annouceLoadedP,null);

    var annouceAlreadyGotP=document.createElement("p");
    annouceAlreadyGotP.id='annouceAlreadyGot';
    annouceAlreadyGotP.onclick=function()
    {
        GM_log("<p>.onclick annouce already got")
        thisLink="http://www.hiwinwin.com/task/count/Taskin.aspx"
        if(typeof(unsafeWindow.handleMissionPage)=="undefined")
        {
            var requestResultWindow=document.getElementById("requestResult").contentWindow;
            unsafeWindow.handleMissionPage = requestResultWindow.open(thisLink)
            //requestResultWindow.open(thisLink," ","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px; ");
        }
        else
        {
            unsafeWindow.handleMissionPage.location.href=thisLink
        }
        
        $("#annouceLoaded")[0].need2wait=1
    }
    document.body.insertBefore(annouceAlreadyGotP,null);
    
    var annouceGoPageChangeP=document.createElement("p");
    annouceGoPageChangeP.id='annouceGoPageChange';
    annouceGoPageChangeP.onclick=function()
    {
        GM_log("<p>.onclick annouce annouce goPage() Change")
        GM_setValue( "keepReflash",0 )
        confirm("goPage()出错变化 外挂需要更新，请联系管理员")
    }
    document.body.insertBefore(annouceGoPageChangeP,null);
    
	//switch run mode
	//1: manual 2: auto
	var switchModeBtn=document.createElement("input");
	switchModeBtn.value=GM_getValue("runMode",1);
	switchModeBtn.type="button"
	switchModeBtn.onclick=function()
	{
		setTimeout(function(){
				if(GM_getValue("runMode",1)==1)
				{
					GM_setValue("runMode",2)
					switchModeBtn.value=2
				}
				else if(GM_getValue("runMode",1)==2)
				{
					GM_setValue("runMode",1)
					switchModeBtn.value=1
				}
			},0)
	}
	$(".cursor ")[0].parentElement.insertBefore(switchModeBtn,$(".cursor ")[0])
	
    
    var openContainP=document.createElement("p");

    document.body.insertBefore(openContainP,null);

    //function reflashMission()
    openContainP.onclick=function()
    {
        /*
        thisLink="Taskin.aspx"
        if(typeof(unsafeWindow.handleMissionPage)=="undefined")
        {
            var requestResultWindow=document.getElementById("requestResult").contentWindow;
            unsafeWindow.handleMissionPage = requestResultWindow.open(thisLink)
            //requestResultWindow.open(thisLink," ","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px; ");
        }
        else
        {
            unsafeWindow.handleMissionPage.location.href=thisLink
        }
        
        $("#annouceLoaded")[0].need2wait=1
        */
        if( GM_getValue( "keepReflash" ) == 1 )
        {
            //setTimeout("alert('test setTimeout')",1000)
            setTimeout("goPage(pageIndex);",4325+Math.random()*4000);
        }
    }
    //reflashMission()
    openContainP.click()
} 

function handleTooSlowPage()
{
    confirm("外挂未知领域，请联系管理员")
    //just to stop botter
    unsafeWindow.opener.top.document.getElementById("annouceSuccess").onclick() 
    unsafeWindow.opener.opener.top.document.getElementById("annouceSuccess").onclick() 
    //unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
    return
}


function annouceGetMission()
{
    
    var playSoundDiv=document.createElement("div");
    playSoundDiv.id='playSoundOutter';

    document.body.insertBefore(playSoundDiv,null);

    // playSoundDiv.innerHTML = " \
        // <audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        // ";
    
    // $("#playAudioGot")[0].volume=0.3;
    
    //GM_log(".msg_panel div count = "+$(".msg_panel div").length)
    //if($(".msg_panel div").length!=0 &&$(".msg_panel div")[0].innerHTML.indexOf("任务接手成功，请尽快完成任务。"!=-1))
    if($(".link_t ").length==2)
    {
        // openerWindow = (function() { 
                                        // var el = unsafeWindow.opener.top.document.createElement('p');
                                        // el.setAttribute('onclick', 'return window;');
                                        // return el.onclick();
                                    // }())

        openerWindow=unsafeWindow.opener.top
        //missionWindow=unsafeWindow.opener.top.opener
        //GM_log("openerWindow  requestResult.onclick="+openerWindow.document.getElementById("requestResult").onclick)
        openerWindow.document.getElementById("annouceSuccess").onclick()
    } 
    
}


function handleMission()
{
    GM_log("handleMission")
    unsafeWindow.getBase64Image=function (img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");

        //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        return dataURL
    }


    if($(".link_t ").length==2)
    {
        $(".link_t ")[0].onclick();
        $("iframe")[0].loadtime=0
		$("iframe")[0].urls=new Array()
        $("iframe")[0].hi_mission_id=$(".link_t ")[0].parentNode.parentNode.firstChild.nextSibling.innerHTML
        GM_log("hi_mission_id="+$("iframe")[0].hi_mission_id)
        $("iframe")[0].onload = function()
        {		
			this.loadtime=this.loadtime+1
            GM_log("$(\"iframe\")[0].onload time count :"+this.loadtime)
			
			//quit mission button
			quitMissionBtn=this.contentDocument.createElement("input")
			quitMissionBtn.value="退出任务"
			quitMissionBtn.type="button"
			quitMissionBtn.id="quitMissionBtn"
			quitMissionBtn.onclick=function()
			{
				unsafeWindow.doCut()
				unsafeWindow.isQuitTsk=function(){return true}
				$(".link_t ")[1].click()
			}
			$("iframe").contents().find("#goon")[0].parentElement.insertBefore(quitMissionBtn,null)
            
            //url group  to check
            //br=this.contentDocument.createElement("br")
            //this.contentDocument.body.insertBefore(br,null);
            
            var urlsInput=this.contentDocument.createElement("textarea")
            urlsInput.type="text"
            urlsInput.id="urlsInput"
            urlsInput.style.width="300px"
            urlsInput.style.height="80px"
            $("iframe").contents().find("#goon")[0].parentElement.insertBefore(urlsInput,null)
            
            var checkUrlGroupBtn=this.contentDocument.createElement("input")
            checkUrlGroupBtn.type="button"
            checkUrlGroupBtn.value="验证该组url"
            checkUrlGroupBtn.id="checkUrlGroupBtn"

            checkUrlGroupBtn.onclick=function()
            {
                $("iframe")[0].loadtime=1
                $("iframe")[0].urls=$("iframe").contents().find("#urlsInput")[0].value.split(";")
                $("iframe")[0].fetchResultTime="-1"
                GM_log("checkUrlGroupBtn set fetchResultTime="+$("iframe")[0].fetchResultTime)
                
                if($("iframe").contents().find("#code")[0].value!="")
                {
                    while($("iframe")[0].loadtime<=$("iframe")[0].urls.length)
                    {
                        if($("iframe")[0].urls[$("iframe")[0].loadtime-1].indexOf('http://')==0)
                        {
                            GM_log("url No."+$("iframe")[0].loadtime+" ,try it now ,url="+$("iframe")[0].urls[$("iframe")[0].loadtime-1])
                            $("iframe").contents().find("#itemurl")[0].value=$("iframe")[0].urls[$("iframe")[0].loadtime-1];

                            $("iframe").contents().find("#imgCode + input")[0].click()
                            break;
                        }
                        else
                        {
                            $("iframe")[0].loadtime=$("iframe")[0].loadtime+1
                        }
                    }
                }
            }
            $("iframe").contents().find("#goon")[0].parentElement.insertBefore(checkUrlGroupBtn,null);
            
                
            var doFakeVisit=function(url)
            {
                //fake visit item on taobao.com
                //url=GM_getValue("url")
                message=GM_getValue("message")
                keyword=message.split(";")[1]
                keyword=keyword.replace(/淘宝/g,"").replace(/关键词/g,"").replace(/搜索/g,"").replace(/搜/g,"").replace(/首页/g,"").replace(/所在地/g,"").replace(/地区/g,"")
                fakeVisitDiv=document.createElement("div")
                fakeVisitDiv.innerHTML="<form class='fakevisit' action='"+db_server+"/fakevisit' method='post' target='_blank' >\
                                            <input name='url' type='hidden' value='"+url+"'/>\
                                            <input name='keyword' type='hidden' value='"+encodeURIComponent(keyword)+"'/>\
                                            <input name='message' type='hidden' value='"+encodeURIComponent(message)+"'/>\
                                            <input name='site' type='hidden' value='hiwinwin'/>\
                                        </form>"
                document.body.insertBefore(fakeVisitDiv,null)                        
                fakeVisitDiv.submit()
            }
                
                
            //check if it's a success dialog
            if($("iframe").contents().find(".tip_less").length==1)
            {
                if($("iframe").contents().find(".tip_less")[0].innerHTML.indexOf("商品网址验证成功，成功完成来路访问")>=0)
                {
                    // success
                    GM_log("mission completed ,fetchResultTime="+this.fetchResultTime)
                    
                    client=$(".top_right .f_b_org")[0].innerHTML // username

                    if(this.fetchResultTime!="0")//need 2 submit result
                    {
                        message=GM_getValue("message")
                        shopkeeper=GM_getValue("shopkeeper","")
                        itemId=""
                        if(typeof(GM_getValue("itemId"))!="undefined")
                        {
                            itemId=GM_getValue("itemId")
                        }
                        code=GM_getValue("code")
                        codeImg=GM_getValue("codeImg")
                        url=GM_getValue("url")
                        site="hiwinwin"
                        
                        //submit success url
                        input = "message="+encodeURIComponent(message)+";shopkeeper="+encodeURIComponent(shopkeeper)+
                            ";itemId="+itemId+";url="+encodeURIComponent(url)+
                            ";site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)+
                            ";idInSite="+$("iframe")[0].hi_mission_id
                        
                        GM_log("input="+input)
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: db_server+"/submitresultsuccess",
                            data: input,
                            headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/x-www-form-urlencoded",
                            },
                            onload: function(xhr) {
                                GM_log('submit url return: response='+xhr.responseText)
                            }
                        })

                        //submit success code
                        // input = "codeImg="+encodeURIComponent(codeImg)+";code="+encodeURIComponent(code)
                        // GM_log("input="+input)
                        // GM_xmlhttpRequest({
                            // method: "POST",
                            // url: db_server+"/submitcode",
                            // data: input,
                            // headers: {
                            // "Accept": "application/json",
                            // "Content-Type": "application/x-www-form-urlencoded",
                            // },
                            // onload: function(xhr) {
                                // GM_log('submit code return: response='+xhr.responseText)
                            // }
                        // })
                    }
                    else
                    {
                        //send heart beat packet
                        site="hiwinwin"                        
                        input = "site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)
                        
                        GM_log("input="+input)
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: db_server+"/heartbeat",
                            data: input,
                            headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/x-www-form-urlencoded",
                            },
                            onload: function(xhr) {
                                GM_log('send heart beat packet return : response='+xhr.responseText)
                            }
                        })
                    }
                    // to do for test
                    //else
                    
                    if(this.fetchResultTime!="0")//&& this.fetchResultTime != "-1" ,need 2 fakevisit 
                    {
                        //fake visit item on taobao.com
                        doFakeVisit(GM_getValue("url"))
                    }
                    unsafeWindow.doCut();
                    
                    unsafeWindow.open("http://www.hiwinwin.com/task/count/")
                    //location.href='./'
                    //location.href="about:blank"
                    return
                }
                else
                {
                    GM_log("something wrong, can't arrive here")
                }
            }
            else
            {
                if(this.loadtime>=2)
                {
                    //GM_log("previous url link")
                    //show previous url link
                    preUrlLink=this.contentDocument.createElement("a")
                    preUrlLink.innerHTML="之前尝试的url"
                    preUrlLink.href=GM_getValue("url","")
                    $("iframe").contents().find(".bar_dl")[0].insertBefore(preUrlLink,null)
                    
                    //fail before
                    //send fail message
                    if($("iframe").contents().find(".error_panel").length>=1&&$("iframe").contents().find(".error_panel")[0].innerHTML.indexOf("验证码不正确")==-1)
                    {
                        // not code error
                        if(this.fetchResultTime!="-1" &&( this.fetchResultTime!="0" || this.loadtime>this.urls.length))
                        {
                            //if fetchResultTime == "0" && this.loadtime<=this.urls.length don't send fail message
                            message=GM_getValue("message")
                            shopkeeper=GM_getValue("shopkeeper","")
                            itemId=""
                            url=preUrlLink.href
                            if(typeof(GM_getValue("itemId"))!="undefined")
                            {
                                itemId=GM_getValue("itemId")
                            }
                            site="hiwinwin"
                            
                            fetchResultTime=this.fetchResultTime
                            //submit success url
                            input = "message="+encodeURIComponent(message)+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site+";fetchResultTime="+fetchResultTime
                                    +";idInSite="+$("iframe")[0].hi_mission_id
                            GM_log("submitresultfail:"+input)
                            GM_xmlhttpRequest({
                                    method: "POST",
                                    url: db_server+"/submitresultfail",
                                    data: input,
                                    headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    onload: function(xhr) {
                                        GM_log('submit fail return: response='+xhr.responseText)
                                        //GM_log('validResultWindow : '+validResultWindow)
                                    }
                                })
                        }
                    }
                }    
            }
            
            //not a success dialog	
            
            
            //hook submit process
            //GM_log("hook submit process")        
            
            $("iframe").contents().find('#myForm')[0].onsubmit = function ()
            {
                GM_setValue("url",$("iframe").contents().find("#itemurl")[0].value)
                GM_setValue("code",$("iframe").contents().find("#code")[0].value)

                iframeCheckForm = (function() { 
                                        var el = $('iframe')[0].contentDocument.createElement('p');
                                        el.setAttribute('onclick', 'return window.checkForm;');
                                        return el.onclick();
                                    }())
                
                return iframeCheckForm();
            }
            
            // one click to select all
            $("iframe").contents().find(".main_dl strong")[0].onclick = function () {
                var userSelection;
                
                //GM_log("unsafeWindow.getSelection is a "+typeof(unsafeWindow.getSelection))
                //GM_log("this.firstChild is a "+typeof(this.firstChild))
                
                if ($("iframe")[0].contentWindow.getSelection) {  // W3C default
                    userSelection = $("iframe")[0].contentWindow.getSelection();
                }  // an extra branch would be necessary if you want to support IE
            
                var textNode = this.firstChild;
                var theRange = $("iframe")[0].contentDocument.createRange();
                //GM_log("theRange is a "+typeof(theRange))
                // select 10th–15th character (counting starts at 0)
                theRange.setStart(textNode, 0);
                theRange.setEnd(textNode, this.firstChild.length);
                //GM_log("this.firstChild.length = "+this.firstChild.length)
                //GM_log("userSelection.addRange is a "+typeof(userSelection.addRange))
                // set user selection    
                userSelection.addRange(theRange);

            };
            
			if($("iframe").contents().find(".f_b_green + td")[1].innerHTML.indexOf("根据搜索提示打开搜索结果列表中掌柜名为：")==-1)
			{
				$("iframe").contents().find(".main_dl strong")[1].onclick=$("iframe").contents().find(".main_dl strong")[0].onclick
            }
                        
            //send VerificationPic to fakeflowdb
            var dataURL=unsafeWindow.getBase64Image($("iframe").contents().find("#imgCode")[0])
            GM_setValue("dataURL",dataURL)
            //GM_log("dataURL="+dataURL)
            
            //GM_log("get code")
            input = "codeImg="+encodeURIComponent(dataURL)
            GM_log(input)
            GM_xmlhttpRequest({
                method: "POST",
                url: db_server+"/querynewcode",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.code="+data.code)
                        $("iframe").contents().find("#code")[0].value=data.code;
                        
                        var bCodeErr=false
                        if($("iframe").contents().find(".error_panel").length>=1&&$("iframe").contents().find(".error_panel")[0].innerHTML.indexOf("验证码不正确")!=-1)
                        {
                            //try again
                            $("iframe")[0].loadtime=$("iframe")[0].loadtime-1
                            bCodeErr=true
                        }
                        
                        while($("iframe")[0].loadtime<=$("iframe")[0].urls.length)
                        {
                            if($("iframe")[0].urls[$("iframe")[0].loadtime-1].indexOf('http://')==0)
                            {
                                GM_log("url No."+$("iframe")[0].loadtime+" ,try it now ,url="+$("iframe")[0].urls[$("iframe")[0].loadtime-1])
                                $("iframe").contents().find("#itemurl")[0].value=$("iframe")[0].urls[$("iframe")[0].loadtime-1];

                                
                                var checkUrlTimeout=0
                                if($("iframe")[0].loadtime<=1&&bCodeErr==false)
                                {
                                    // to do assume code will return soon.
                                    // checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(25000,10000))
                                    // if(checkUrlTimeout<13876)
                                    // {
                                        // checkUrlTimeout=13876
                                    // }
                                    checkUrlTimeout=10176
                                }
                                else
                                {
                                    checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(10000,2000))
                                    if(checkUrlTimeout<5169)
                                    {
                                        checkUrlTimeout=5169
                                    }
                                    GM_log("route 1 : click,checkUrlTimeout="+checkUrlTimeout)
                                    
                                    setTimeout(function(){$("iframe").contents().find("#imgCode + input")[0].click();},checkUrlTimeout)
                                    
                                    if($("iframe")[0].fetchResultTime=="0") //need 2 fakevisit 
                                    {
                                        //fake visit item on taobao.com
                                        doFakeVisit($("iframe").contents().find("#itemurl")[0].value)
                                    }
                                }
                                break;
                            }
                            else
                            {
                                $("iframe")[0].loadtime=$("iframe")[0].loadtime+1
                            }
                        }
                        if($("iframe")[0].loadtime>$("iframe")[0].urls.length)
                        {
                            //no more urls
                            unsafeWindow.getUrls()
                        }
                    }
                })
            
            

            
            
            unsafeWindow.getUrls=function()
            {
                //get messages
                var message="";
                var site="hiwinwin";
                var shopkeeper="";
                client=$(".top_right .f_b_org")[0].innerHTML // username
                if($("iframe").contents().find(".f_b_green + td")[1].innerHTML.indexOf("根据搜索提示打开搜索结果列表中掌柜名为：")>=0)
                {
					message+=$("iframe").contents().find(".main_dl strong")[1].innerHTML+";"//put the shopkeeper in front
                    message+=$("iframe").contents().find(".main_dl strong")[0].innerHTML+";"
                    shopkeeper=$("iframe").contents().find(".main_dl strong")[1].innerHTML+";"
                    message+=$("iframe").contents().find(".f_b_green + td")[3].innerHTML+";"
                }
                else
                {
                    for(var i=0;i<$("iframe").contents().find(".main_dl strong").length ;++i)
                    {
                        message+=$("iframe").contents().find(".main_dl strong")[i].innerHTML+";"
                    }
                    message+=$("iframe").contents().find(".f_b_green + td")[3].innerHTML+";"//提示信息
                    
                    shopkeeper=$("iframe").contents().find(".main_dl strong")[0].innerHTML+";"
                }
                GM_setValue("message",message)
                GM_setValue("shopkeeper",shopkeeper.replace(/\s*/g,""))
                
                //GM_log("post message")
                input=	'message='+encodeURIComponent(message)+
                        ';shopkeeper='+encodeURIComponent(shopkeeper)+
                        ';site='+site+
                        ';local='+GM_getValue("bLocal","90002")+
                        ";client="+encodeURIComponent(client)+
                        ";idInSite="+$("iframe")[0].hi_mission_id
                
				// request=$.get(db_server+"/queryurl",input,function(data){
                // GM_log("query return");
                // },"json")
                
                //var jsonString=JSON.stringify(input).replace(/:/g,'=').replace(/^{/,'').replace(/}$/,'')
                GM_log(input)
                GM_xmlhttpRequest({
                    method: "POST",
                    url: db_server+"/queryurl",
                    data: input,
                    headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(xhr) {
                        /*
                        response_data['status']  
                                
                        value       meaning
                        10001       find url in urlCache
                        10002       find url in database
                        10003       find url in MissionQueue.doneBuffer
                        10004       got url by mission customer, fetch result
                        10005       changed detector to fetch result
                        
                        20001       timeout when wait for mission custmoer submit urls ,quit mission
                        20002       no need to wait ,once timeout when wait for mission custmoer submit urls 
                        20003       same as 20002 ,just for debug to make it different
                        20004       same as 20002 ,just for debug to make it different
                        */
                        GM_log("queryurl xhr.responseText = \n"+xhr.responseText);
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.status = "+data.status)
                        if(typeof(data.itemId)!="undefined")
                        {
                            GM_log("data.itemId = "+data.itemId)
                            //$("iframe")[0].itemId=data.itemId
                            GM_setValue("itemId",data.itemId)
                            GM_log("GM_getValue('itemId')="+GM_getValue('itemId'))
                        }    
                        else
                        {
                            GM_setValue("itemId","")
                            //$("iframe")[0].itemId=""
                        }
                        
                        
                        if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
                        {
                            //GM_log("data.urls.length="+data.urls.length)
                            $("iframe")[0].urls=data.urls
                            $("iframe")[0].loadtime=1
                            GM_log("$('iframe')[0].urls.length="+$('iframe')[0].urls.length)
                            $("iframe").contents().find("#itemurl")[0].value=data.urls[0];
                            GM_log('$("iframe").contents().find("#code")[0].value='+$("iframe").contents().find("#code")[0].value)
                            if(typeof(data.fetchResultTime)!="undefined")
                            {

                                $("iframe")[0].fetchResultTime=data.fetchResultTime
                            }
                            else
                            {
                                $("iframe")[0].fetchResultTime="0"
                            }
                            /*
                            if(typeof(data.code)!="undefined")
                            {
                                $("iframe").contents().find("#code")[0].value=data.code;
                                
                                $("iframe").contents().find("input[name='btnSubmit']").click();
                            }*/
                            
                            // to do  assume code will return soon
                            //if($("iframe").contents().find("#code")[0].value!="")
                            checkUrlTimeout=7876
                            if(data.status==10004)
                            {
                                checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(15000,2000))
                                if(checkUrlTimeout<5169)
                                {
                                    checkUrlTimeout=5169
                                }
                            }
                            else
                            {
                                checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(25000,8000))
                                if(checkUrlTimeout<9876)
                                {
                                    checkUrlTimeout=9876
                                }
                            }    
                            GM_log("route 2 : check url checkUrlTimeout="+checkUrlTimeout)
                            //$("iframe").contents().find("#imgCode + input")[0].click()
                            
                            setTimeout(function(){$("iframe").contents().find("#imgCode + input")[0].click()},checkUrlTimeout)
                            
                            
                        }
                        else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                        {
                            //unsafeWindow.doCut();
                            //location.herf=$(".link_t ")[1].href;
                            $("iframe")[0].fetchResultTime="-1"
                            //playmusic	
                            //$("#playAudioGot")[0].play()
                            if(GM_getValue("runMode",1)==2)
                            {
                                //$("iframe").contents().find("#quitMissionBtn")[0].click()
                            }
                            
                            if(typeof(data.trace)!="undefined")
                            {
                                GM_log(data.trace)
                            }
                            
                        }
                        else if (data.status>=30001&&data.status<40000)
                        {
                            setTimeout(function(){unsafeWindow.getUrls()},3000)
                            $("iframe")[0].fetchResultTime="-1"
                            //$("#playAudioGot")[0].play()
                        }
                        else if (data.status==40001)
                        {
                            setTimeout(function(){$("iframe").contents().find("#quitMissionBtn")[0].click()},10124)
                        }
                        else
                        {
                            $("iframe")[0].fetchResultTime="-1"
                            //playmusic	
                            //$("#playAudioGot")[0].play()
                            if(GM_getValue("runMode",1)==2)
                            {
                                //$("iframe").contents().find("#quitMissionBtn")[0].click()
                            }
                        }
                        GM_log("$('iframe')[0].fetchResultTime="+$("iframe")[0].fetchResultTime)
                        if($("iframe")[0].fetchResultTime=="0")//need 2 fakevisit
                        {
                            //fake visit item on taobao.com
                            doFakeVisit(data.urls[0])
                        }
                        
                    }
                });
                
                //GM_log("after post message")
            }
            if(this.loadtime<=1)
            {
                //unsafeWindow.getUrls()
            }
            else if(this.loadtime<=this.urls.length)//loadtime >= 2 && loadtime <= urls.length
			{
				// GM_log("url No."+this.loadtime+" ,try it now ,url="+this.urls[this.loadtime-1])
				// $("iframe").contents().find("#itemurl")[0].value=this.urls[this.loadtime-1];
				// if($("iframe").contents().find("#code")[0].value!="")
				// {
					// GM_log("click")
					// $("iframe").contents().find("#imgCode + input")[0].click()
				// }

			}
			else
            {
                $("iframe")[0].fetchResultTime="-1"
                //$("iframe").contents().find("#itemurl")[0].value=GM_getValue("url","")
                
                //playmusic	
                //$("#playAudioGot")[0].play()
				
				if(GM_getValue("runMode",1)==2)
				{
					GM_log("auto quit")
					//$("iframe").contents().find("#quitMissionBtn")[0].click()
				}
            }

        }

    }
    else if($(".link_t ").length==0)
    {
        //check if it's a quit mission success page
		if($(".msg_panel div").length!=0&&$(".msg_panel div")[0].innerHTML.indexOf("退出任务成功")!=-1)
		{
			GM_log("quit mission success, go on to refresh to get mission")
			//unsafeWindow.opener.top.document.getElementById("annouceComplete").onclick()
            var openContainP=document.createElement("p");
            openContainP.onclick=function()
            {
                unsafeWindow.open("http://www.hiwinwin.com/task/count/")
            }
            document.body.insertBefore(openContainP,null);
            openContainP.click()
		}
    }

}

function handleAlreadyGotPage()
{
    GM_log=function(){}
    GM_log("alreadyGot");


    // about audio

    var playSoundDiv=document.createElement("div");
    playSoundDiv.id='playSoundOutter';



    //playSoundEmbed.src='file:///E:/MyDocuments/来路流量相关/tada.wav';
    //playSoundEmbed.src='file:///F:/kugou/吴雨霏 - 句句我爱你.mp3';
    //playSoundEmbed.width=100;
    //playSoundEmbed.height=100;
    //playSoundEmbed.loop=false;
    //playSoundEmbed.autostart=true;
    //var divTaskLst = unsafeWindow.getObj('taskLst');

    document.body.insertBefore(playSoundDiv,null);

    //playSoundDiv=unsafeWindow.getObj('playSoundOutter');

    // playSoundDiv.innerHTML = " \
        // <audio id=\"playAudioAlreadyGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        // <audio id=\"playAudioChangeIP\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21111?filename%3dchangeip.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        // ";
        
    // var playAudio1=document.getElementById("playAudioAlreadyGot");
    // playAudio1.volume=0.3;
    // var playAudio2=document.getElementById("playAudioChangeIP");
    // playAudio2.volume=0.3;

    var thisErrorPanel,allErrorPanel;

    allErrorPanel = document.evaluate(
        "//div[@class='error_panel']",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);

    if(allErrorPanel.snapshotLength != 1 )
    {
            //alert("程序出错，可能是hiwinwin改版了");
            GM_log("fake flow#alreadyGot 程序出错，可能是hiwinwin改版了,error_panel number:"+allErrorPanel.snapshotLength);
    }	
    else
    {
        thisErrorPanel=allErrorPanel.snapshotItem(0);
        var error_info=thisErrorPanel.firstChild.innerHTML;
        
        if(error_info == "对不起，您当前有未完成的来路访问任务，请先完成之后再接手新的任务")
        {
            //history.go(-1);
            //playAudio2.play();
            unsafeWindow.opener.top.document.getElementById("annouceAlreadyGot").onclick()
        }
        else if(error_info.indexOf("IP")!=-1)
        {
            //playAudio2.play();
        }
        else
        {
            confirm(error_info);
            GM_log("fake flow#alreadyGot 错误信息有误，error_info="+error_info);
        }
    }
}