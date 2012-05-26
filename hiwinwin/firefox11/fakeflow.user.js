// ==UserScript==
// @name          Better to get fake flow mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com 
// @include       http://www.hiwinwin.com/task/count/index.aspx
// @include       http://www.hiwinwin.com/task/count/
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==

//disable log
//GM_log=function(){}
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
	if(document.referrer.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx")!=-1)
	{
        location.href="javascript:window.close()"
		return;
	}
    else if(document.referrer=="")
    {
        handleGetMissionStaffPage()
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
	}
	else if(location.href.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx?id=")!=-1)
	{
		var showMsg=document.createElement("p");
		showMsg.innerHTML=document.scripts[0].innerHTML;    
		document.body.insertBefore(showMsg,null);
	}

	if(document.referrer=="http://www.hiwinwin.com/task/count/")
	{   
		unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
	}
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
        GM_log("setTimeout ,wait For Load  ");
        return 
    }
	$(".cursor ")[0].waitForLoadTime=0
	
    //need to wait for mission page ?
    if( GM_getValue( "keepReflash",0 ) == 1 && typeof($("#annouceSuccess")[0].need2wait) != "undefined" && $("#annouceSuccess")[0].need2wait == 1)
    {
        setTimeout("goPage(0);",2000+Math.random()*1000);
        GM_log("setTimeout ,wait For Success  ");
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
            randomId=Math.round(Math.random()*$(".tbl a").length,10)%$(".tbl a").length
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
            
            if($(".p_l_20").length<=0)
            {
                //been added to the blacklist?
                //stop fresh
                GM_setValue( "keepReflash",0 )
                
            }

        }

        if( GM_getValue( "keepReflash",0 ) == 1 )
        {
            //setTimeout("goPage(0);",2000+Math.random()*1000);
            //GM_log("setTimeout ,reflash ");
            var refreshTimeout=0
            GM_log("goPage(0); calculate refreshTimeout")
            if($(".tbl a").length>=2)
            {   
                refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(1500,1000))
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
            GM_log("goPage(0); refreshTimeout="+refreshTimeout)
            setTimeout("goPage(0);",refreshTimeout);
        }

    }
    }
    };
    xml.open('get', url, true);
    xml.setRequestHeader('If-Modified-Since', '0');
    xml.send('');

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
        
        if( GM_getValue( "keepReflash" ) == 1 )
        {
            //setTimeout("alert('test setTimeout')",1000)
            setTimeout("goPage(0);",1500+Math.random()*1000);
        }
    }
    //reflashMission()
    openContainP.click()
} 

function handleTooSlowPage()
{
    unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
}


function annouceGetMission()
{
    
    var playSoundDiv=document.createElement("div");
    playSoundDiv.id='playSoundOutter';

    document.body.insertBefore(playSoundDiv,null);

    playSoundDiv.innerHTML = " \
        <audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        ";
    
    $("#playAudioGot")[0].volume=0.3;
    
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
                $("iframe")[0].fetchResultTime=-1
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
            
 
            //check if it's a success dialog
            if($("iframe").contents().find(".tip_less").length==1)
            {
                if($("iframe").contents().find(".tip_less")[0].innerHTML.indexOf("商品网址验证成功，成功完成来路访问")>=0)
                {
                    // success
                    GM_log("mission completed ,fetchResultTime="+this.fetchResultTime)
                    
                    if(this.fetchResultTime!=0)//need 2 submit result
                    {
                        message=GM_getValue("message")
                        shopkeeper=GM_getValue("shopkeeper","")
                        itemId=this.itemId
                        code=GM_getValue("code")
                        codeImg=GM_getValue("codeImg")
                        url=GM_getValue("url")
                        site="hiwinwin"
                        
                        //submit success url
                        input = "message="+encodeURIComponent(message.replace(/\s*/g,""))+";shopkeeper="+encodeURIComponent(shopkeeper)+
                            ";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site
                        
                        GM_log("input="+input)
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "http://caster.webfactional.com/submitresultsuccess",
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
                            // url: "http://caster.webfactional.com/submitcode",
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
                    // to do for test
                    //else
                    {
                        //fake visit item on taobao.com
                        url=GM_getValue("url")
                        message=GM_getValue("message")
                        keyword=message.split(";")[1]
                        keyword=keyword.replace(/淘宝/g,"").replace(/关键词/g,"").replace(/搜索/g,"").replace(/搜/g,"").replace(/首页/g,"")
                        fakeVisitDiv=document.createElement("div")
                        fakeVisitDiv.innerHTML="<form id='fakevisit' action='http://caster.webfactional.com/fakevisit' method='post' target='_blank' >\
                                                    <input name='url' type='hidden' value='"+url+"'/>\
                                                    <input name='keyword' type='hidden' value='"+keyword+"'/>\
                                                </form>"
                        document.body.insertBefore(fakeVisitDiv,null)                        
                        $("#fakevisit")[0].submit()
                    }
                    unsafeWindow.doCut();
                    
                    unsafeWindow.open("http://www.hiwinwin.com/task/count/")
                    setTimeout(function(){unsafeWindow.opener.top.document.getElementById("annouceComplete").onclick()}, 2000)
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
                url: "http://caster.webfactional.com/querycode",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.code="+data.code)
                        $("iframe").contents().find("#code")[0].value=data.code;
                        
                        while($("iframe")[0].loadtime<=$("iframe")[0].urls.length)
                        {
                            if($("iframe")[0].urls[$("iframe")[0].loadtime-1].indexOf('http://')==0)
                            {
                                GM_log("url No."+$("iframe")[0].loadtime+" ,try it now ,url="+$("iframe")[0].urls[$("iframe")[0].loadtime-1])
                                $("iframe").contents().find("#itemurl")[0].value=$("iframe")[0].urls[$("iframe")[0].loadtime-1];

                                
                                var checkUrlTimeout=0
                                if($("iframe")[0].loadtime<=1)
                                {
                                    // to do assume code will return soon.
                                    // checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(25000,10000))
                                    // if(checkUrlTimeout<13876)
                                    // {
                                        // checkUrlTimeout=13876
                                    // }
                                }
                                else
                                {
                                    checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(6000,2000))
                                    if(checkUrlTimeout<2169)
                                    {
                                        checkUrlTimeout=2169
                                    }
                                    GM_log("route 1 : click,checkUrlTimeout="+checkUrlTimeout)
                                    setTimeout(function(){$("iframe").contents().find("#imgCode + input")[0].click();},checkUrlTimeout)
                                }
                                break;
                            }
                            else
                            {
                                $("iframe")[0].loadtime=$("iframe")[0].loadtime+1
                            }
                        }
                    }
                })
            
            
            
            unsafeWindow.getUrls=function()
            {
                //get messages
                var message="";
                var site="hiwinwin";
                var shopkeeper="";
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
                }
                GM_setValue("message",message.replace(/\s*/g,""))
                GM_setValue("shopkeeper",shopkeeper.replace(/\s*/g,""))
             
                //GM_log("post message")
                input=	'message='+encodeURIComponent(message.replace(/\s*/g,""))+
                        ';shopkeeper='+encodeURIComponent(shopkeeper)+
                        ';site='+site+
                        ';local='+GM_getValue("bLocal","90002");
                
				// request=$.get("http://caster.webfactional.com/queryurl",input,function(data){
                // GM_log("query return");
                // },"json")
                
                //var jsonString=JSON.stringify(input).replace(/:/g,'=').replace(/^{/,'').replace(/}$/,'')
                GM_log(input)
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "http://caster.webfactional.com/queryurl",
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
                        
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.status = "+data.status)
                        if(typeof(data.itemId)!="undefined")
                        {
                            GM_log("data.itemId = "+data.itemId)
                            $("iframe")[0].itemId=data.itemId
                        }    
                        else
                        {
                            $("iframe")[0].itemId=""
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

                                $("iframe")[0].fetchResultTime=parseInt(data.fetchResultTime,10)
                            }
                            else
                            {
                                $("iframe")[0].fetchResultTime=0
                            }
                            /*
                            if(typeof(data.code)!="undefined")
                            {
                                $("iframe").contents().find("#code")[0].value=data.code;
                                
                                $("iframe").contents().find("input[name='btnSubmit']").click();
                            }*/
                            
                            // to do  assume code will return soon
                            //if($("iframe").contents().find("#code")[0].value!="")
                            {
                                checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(15000,10000))
                                if(checkUrlTimeout<5876)
                                {
                                    checkUrlTimeout=5876
                                }
                                GM_log("route 2 : check url checkUrlTimeout="+checkUrlTimeout)
                                //$("iframe").contents().find("#imgCode + input")[0].click()
                                setTimeout(function(){$("iframe").contents().find("#imgCode + input")[0].click()},checkUrlTimeout)
                            }
                            
                        }
                        else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                        {
                            //unsafeWindow.doCut();
                            //location.herf=$(".link_t ")[1].href;
                            $("iframe")[0].fetchResultTime=-1
                            //playmusic	
                            $("#playAudioGot")[0].play()
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
                            setTimeout(unsafeWindow.getUrls(),20000)
                            $("#playAudioGot")[0].play()
                        }
                        else if (data.status==40001)
                        {
                            setTimeout($("#quitMissionBtn")[0].click(),2124)
                        }
                        else
                        {
                            $("iframe")[0].fetchResultTime=-1
                            //playmusic	
                            $("#playAudioGot")[0].play()
                            if(GM_getValue("runMode",1)==2)
                            {
                                //$("iframe").contents().find("#quitMissionBtn")[0].click()
                            }
                        }

                    }
                });
                
                //GM_log("after post message")
            }
            if(this.loadtime<=1)
            {
                unsafeWindow.getUrls()
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
                $("iframe")[0].fetchResultTime=-1
                //$("iframe").contents().find("#itemurl")[0].value=GM_getValue("url","")
                
                //playmusic	
                $("#playAudioGot")[0].play()
				
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
			unsafeWindow.opener.top.document.getElementById("annouceComplete").onclick()
		}
    }

}