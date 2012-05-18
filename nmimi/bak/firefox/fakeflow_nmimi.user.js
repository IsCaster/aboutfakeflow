// ==UserScript==
// @name          fake flow mission for nmimi
// @namespace     http://www.caster.org
// @description   used on fake flow Module of nmimi.com 
// @include       http://wwww.nmimi.com/Mission/FMDating.aspx*
// @include       http://www.nmimi.com/Mission/FMDating.aspx*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

GM_log("enter GM script :fake flow mission for nmimi");

//Compatible change for Chrome extension
/*
if(typeof(unsafeWindow)=="undefined")
{
	unsafeWindow = (function() {
		var el = document.createElement('p');
		el.setAttribute('onclick', 'return window;');
		return el.onclick();
	}());
}

if(typeof(GM_log) == "undefined")
{

	GM_log = function (message) {
    console.info(message);
	}
}

GM_log("GM_setValue is "+typeof(GM_setValue));

var isBuggedChrome=false;

if(typeof(GM_setValue)!='undefined') 
{
    var gsv=GM_setValue.toString();
    if(gsv.indexOf('staticArgs')>0) { isBuggedChrome=false; GM_log('GreaseMonkey Api detected...'); } 
    else if(gsv.match(/not\s+supported/)) { isBuggedChrome=true;  GM_log('Bugged Chrome GM Api detected...'); }
} 
else 
{ 
	isBuggedChrome=true; GM_log('No GM Api detected...'); 
}

if(isBuggedChrome)
{ 
	var keyPrefix = "my_own_script_keyprefix."; // I also use a '.' for seperation
	
	GM_getValue = function(key, defValue) {
	    var retval = window.localStorage.getItem(keyPrefix + key);
	    if (retval == null || typeof(retval) == "undefined") {
	        return defValue;
	    }
	    return retval;
	}
	
	GM_setValue = function(key, value) {
	    try {
	        window.localStorage.setItem(keyPrefix + key, value);
	    } catch (e) {
	        GM_log("error setting value: " + e);
	    }
	}
	
	GM_deleteValue = function(key) {
	    try {
	        window.localStorage.removeItem(keyPrefix + key);
	    } catch (e) {
	        GM_log("error removing value: " + e);
	    }
	}
	
	GM_listValues = function() {
	    var list = [];
	    var reKey = new RegExp("^" + keyPrefix);
	    for (var i = 0, il = window.localStorage.length; i < il; i++) {
	        // only use the script's own keys
	        var key = window.localStorage.key(i);
	        if (key.match(reKey)) {
	            list.push(key.replace(keyPrefix, ''));
	        }
	    }
	    return list;
	}
};
*/

//get refresh button
var thisRefreshImages,allRefreshImages;

allRefreshImages = document.evaluate(
	"//a[@class='bbtton6_a']",
	document,
	null,
	XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
	null);



if(allRefreshImages.snapshotLength != 1 )
{
		//alert("程序出错，可能是nimimi改版了");
		GM_log("fake flow#common 程序出错，可能是nimimi改版了");
}	

thisRefreshImages = allRefreshImages.snapshotItem(0);

//add a keepRefresh button

var trigerRefreshBtn=document.createElement("input");//invisible
trigerRefreshBtn.id="trigerRefresh";
trigerRefreshBtn.type="submit";
trigerRefreshBtn.value=0;

trigerRefreshBtn.onclick=function ()
{
	GM_log("trigerRefreshBtn onclick");
	var evt = document.createEvent("MouseEvents");   
  evt.initEvent("click", true, true);   
  this.nextSibling.dispatchEvent(evt);  
  
}

thisRefreshImages.parentNode.insertBefore(trigerRefreshBtn,thisRefreshImages);


var keepRefreshBtn=document.createElement("input");
keepRefreshBtn.id="keepRefresh";
keepRefreshBtn.type="submit";
keepRefreshBtn.value="给我刷";
keepRefreshBtn.onclick=function ()
{
	document.getElementById("trigerRefresh").value=1;//valid keepRefresh	
	GM_log("valid keepRefresh");
  	this.nextSibling.onclick(); //triger trigerReflesh  
  
}
thisRefreshImages.parentNode.insertBefore(keepRefreshBtn,trigerRefreshBtn);






//change function GetDatingResult

unsafeWindow.GetDatingResult = function (i,s){
	GM_log("enter GetDatingResult");
	$("#trigerRefresh")[0].type="button";
	
    $("#divTaskBody").hide();
    $("#reLoad").show();
    //GM_log(typeof(unsafeWindow.jQuery.postJOSN));
    unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/GetDaTingData",{"pageIndex":i,"pageSize":s,"key":""}, function(result){
        if(result.state == 1){
            artDialog({content:"服务器拒绝获取数据。原因：您的登录已失效，或者您已在其他地方登录！",id:"alarm"},function(){});
            isBuff=false;
        }else if(result.state==2){
            artDialog({content:"服务器拒绝获取数据。原因：为了平台接任务的公平，以及减少平台服务器的压力，此页请不要打开多个！<br/>如果您长期没有操作，只需要按F5刷新本页即可！",id:"alarm"},function(){});
            isBuff=false;
        }else{
            var htm="";
            for(i=0;i<result.itemList.length;i++){
                var item = result.itemList[i];
                htm+="<tr>";
                htm+="<td class=\"id\" style=\"width:195px;\">";
                htm+="<p class=\"m\" title=\"来路流量任务\">";
                
                htm+=item.mId+"</p><em>Post Time："+item.createAt+"</em></td>";
                htm+="<td class=\"poster\"></td>";
                htm+="<td class=\"price\"><p>"+item.gPrice+"</p></td>";
                htm+="<td class=\"oktime\">";
                htm+="<p>"+ item.fc + "/" + item.yc + "</p>";
                htm+="</td>";
                htm+="<td class=\"gold\" style=\"width:200px;\">";
                switch(item.mState){
                    case 1:
                        htm+="<em>等待接手</em>";
                        break;
                    case 2:
                    case 3:
                    case 4:
                        htm+="<em>任务进行中...</em>";
                        break;
                    case 255:
                        htm+="任务已完成";
                        break;
                }
                htm+="</td>";
                htm+="<td class=\"do\">";
                switch (item.mState)
                {
                    case 1:;
                        htm+="<a class=\"button4_a\" href=\"javascript:void(0);\" onclick=\"AccceptMis('"+item.mId+"',this);\">抢此任务</a>";
                        break;
                    case 2:
                        htm+="<p class=\"s_2\">任务已被接手</p>";
                        break;
                    case 3:
                    case 4:
                        htm+="<p class=\"s_2\">任务已暂停</p>";
                        break;
                    case 255:
                        htm+="<p class=\"s_3\">任务已完成</p>";
                        break;
                }
                htm+="</td>";
            }
            $("#TaskItem").html(htm);
            GM_log("mission count: "+$(".button4_a").length);
            if($(".button4_a").length >= 1)
            {
            	GM_log("check a mission ");
            	$(".button4_a")[0].onclick();
        	}
        }
        
        $("#reLoad").hide();
        $(".reListTitle tbody>tr:odd").addClass("tcolor");
        $("#divTaskBody").show(); 
		
		//document.getElementById("trigerRefresh").value=1;
        GM_log(" trigerRefresh = "+document.getElementById("trigerRefresh").value);
        if( $("#trigerRefresh")[0].value == 1 )
		{
			clearTimeout();
			setTimeout("document.getElementById('trigerRefresh').onclick();",1500);
	    	GM_log("setTimeout refresh in loading  ");
		}
        

    });
}

//response to got a mission
unsafeWindow.AccceptMis = function(mid,btn){
    $(btn).attr("disabled","disabled");
    //var tipsDialog=artDialog({content:"处理中，请稍候...",id:"tips",lock:true});
    //DisabledClose();
    unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/AcceptMission",{"mid":mid}, function(result){
        //tipsDialog.close();  
        /*     
        if(result.StateCode==0){
            artDialog({content:"恭喜您，抢到一个来路流量任务了！",id:"alarm",fixed:true,yesText:"查看",lock:true,noText:"关闭,接续抢任务"},function(){
                window.location.href="/Mission/MyAcceptFlowMission.aspx";
            },function(){
                GoPage(1);
            });
            GoPage(1);
        }else{
            $(btn).removeAttr("disabled");
            switch(result.StateCode){
                case -1:{
                    artDialog({content:result.StateMsg,id:"alarm",fixed:true,yesText:"查看投诉处理情况",lock:true},function(){
                        window.location.href="/Member/MyTouSu.aspx?t=1";
                    });
                    break;
                }
                default:{
                    artDialog({content:result.StateMsg,id:"alarm",fixed:true,yesText:"关闭",lock:true},
                    function(){
                        GoPage(1);
                    });
                    break;
                }
            }
            DisabledClose();
            return;
        }*/
        if(result.StateCode==0){
        	GM_log("啥,又抢到了一个来路流量任务");
        	$("#trigerRefresh")[0].type="radio";
    	}	
        GoPage(1);
    });
}

//response to key press

document.body.onkeydown =  function (event)
{
	event = event||window.event;
	GM_log("press key ="+event.keyCode);
	if(event.keyCode==119 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F8	
	{
		document.getElementById("trigerRefresh").value=0;//invalid keepRefresh
		GM_log("invalid keepRefresh");
	}
}


function refreshMission()
{
	if( document.getElementById("trigerRefresh").value == 1 )
	{
		clearTimeout();
		setTimeout("document.getElementById('trigerRefresh').onclick();",1500);
    	GM_log("setTimeout refresh in loading  ");
	}
}

GM_log("refreshMission");
refreshMission();

