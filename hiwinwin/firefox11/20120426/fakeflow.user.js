// ==UserScript==
// @name          Better to get fake flow mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com 
// @include       http://www.hiwinwin.com/task/count/index.aspx
// @include       http://www.hiwinwin.com/task/count/
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==

//disable log
//GM_log=function(){}


if(document.referrer.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx")!=-1)
{
    handleGetMissionStaffPage()
}
else
{
    handleTooSlowPage()
}

function handleGetMissionStaffPage()
{
    var thisReflashImages,allReflashImages;

    allReflashImages = document.evaluate(
        "//img[@class='cursor']",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);



    if(allReflashImages.snapshotLength != 1 )
    {
            //alert("程序出错，可能是hiwinwin改版了");
            GM_log("fake flow#common 程序出错，可能是hiwinwin改版了");
    }	

    thisReflashImages = allReflashImages.snapshotItem(0);
	
	$(".cursor ")[0].waitForLoadTime=0
	
    unsafeWindow.goPage = function (n) {

    //need to wait for get mission page loaded
    if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceLoaded")[0].need2wait) != "undefined" && $("#annouceLoaded")[0].need2wait == 1 && $(".cursor ")[0].waitForLoadTime < 60)
    {
		$(".cursor ")[0].waitForLoadTime=$(".cursor ")[0].waitForLoadTime+1
        setTimeout("goPage(0);",2000+Math.random()*1000);
        //GM_log("setTimeout ,reflash ");
        return 
    }
	$(".cursor ")[0].waitForLoadTime=0
	
    //need to wait for mission page ?
    if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceSuccess")[0].need2wait) != "undefined" && $("#annouceSuccess")[0].need2wait == 1)
    {
        setTimeout("goPage(0);",2000+Math.random()*1000);
        //GM_log("setTimeout ,reflash ");
        return 
    }


    var qs = 'page=' + n + '&cnn=1&nows=' + (new Date()).getTime();
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
            randomId=parseInt(Math.random()*$(".tbl a").length,10)%$(".tbl a").length
            GM_log("randomId="+randomId+",allAnchors.length="+$(".tbl a").length)
            var thisLink=	$(".tbl a")[randomId].toString();
            GM_log("fetch mission ");
            //alert(thisLink+typeof(thisLink));
            //document.getElementById("playAudioGot").play();

            //fetch mission directly
            //location.href=thisLink;
            
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
        else
        {
            //GM_log("not get mission ");

        }

        if( GM_getValue( "keepReflash",0 ) == 1 )
        {
            setTimeout("goPage(0);",2000+Math.random()*1000);
            //GM_log("setTimeout ,reflash ");
        }

    }
    }
    };
    xml.open('get', url, true);
    xml.setRequestHeader('If-Modified-Since', '0');
    xml.send('');
		// to do
	$(".cursor ")[0].reloadTimeoutId=setTimeout("\
												if(document.getElementById('annouceSuccess').need2wait!=1)\
												{\
													if(document.getElementById('annouceLoaded').need2wait==1) \
													{\
														document.getElementById('annouceLoaded').need2wait=0\
													}\
													else\
													{\
														goPage(0);\
													}\
												}",60000)

    } 

    thisReflashImages.onclick= function() 
    {
        if(GM_getValue("keepReflash",0)==0)
        {
            GM_setValue("keepReflash",1);//valid keepReflash
            unsafeWindow.goPage(0);
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
        GM_log("press key ="+event.keyCode);
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
	

    function reflashMission()
    {
        if( GM_getValue( "keepReflash" ) == 1 )
        {
            //setTimeout("alert('test setTimeout')",1000)
            setTimeout("goPage(0);",1500+Math.random()*1000);
        }
    }
    reflashMission()
} 

function handleTooSlowPage()
{
    unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
}

   
//GM_log("GM script end")