// ==UserScript==
// @name          fake flow mission for nmimi when mission Got
// @namespace     http://www.caster.org
// @description   used on fake flow Module of nmimi.com when mission Got
// @include       http://wwww.nmimi.com/Mission/MyAcceptFlowMission.aspx*
// @include       http://www.nmimi.com/Mission/MyAcceptFlowMission.aspx*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

GM_log("enter GM script :fake flow mission for nmimi when mission Got");

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
//change function GetDatingResult

var pageSize=15;//defined in http://wwww.nmimi.com/js/MyAFMData.js
unsafeWindow.RefTask=function(page_index,s,autoOpen){
    $("#divTaskBody").hide();
    $("#reLoad").show();
    var state = $("#ddlfmstate").val(); 
    
    unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/GetMyAcceptFlowMissions",{"pageIndex":page_index,"pageSize":s,"state":state}, function(result){
        GM_log("enter JOSN callback");
        if(result.state==1){
            unsafeWindow.artDialog({content:"服务器拒绝获取数据。原因：您的登录已失效，或者您已在其他地方登录！",id:"alarm"},function(){});
        }else if(result.state==2){
            unsafeWindow.artDialog({content:"服务器拒绝获取数据。原因：为了平台接任务的公平，以及减少平台服务器的压力，此页请不要打开多个！<br/>如果您长期没有操作，只需要按F5刷新本页即可！",id:"alarm"},function(){});
        }else{
            var rowsCount = result.sumRows;
            unsafeWindow.SetPage(page_index,rowsCount);
            var htm="";
            htm+="<table  border=\"0\" cellpadding=\"0\" cellspacing=\"0\">";
            htm+="<thead>";
            htm+="<tr>";
            htm+="<td colspan=\"7\">";
            htm+="<ul>";
            htm+="<li class=\"id\">任务编号</li>";
            htm+="<li class=\"price\">悬赏金币</li>";
            htm+="<li class=\"oktime\">总流量</li>";
            htm+="<li class=\"gold\">验证状态</li>";
            htm+="<li class=\"state\" style=\"width:140px;\">同IP可接数/单帐号可接数</li>";
            htm+="<li class=\"do\" style=\"width:50px;\">操作</li>";
            htm+="</ul>";
            htm+="</td>";
            htm+="</tr>";
            htm+="</thead>";
            htm+="<tbody>";
            for(var i=0;i<result.itemList.length;i++){
                var item = result.itemList[i];
                htm+="<tr>";
                htm+="<td class=\"id\" style=\"width:190px;\">";
                htm+="<p class=\"m\" title=\"来路流量任务\">";
                
                htm+=item.mId+"</p><em>Post Time："+item.createAt+"</em></td>";
                htm+="<td class=\"price\"><p>"+ item.gPrice +"</p></td>";
                htm+="<td class=\"oktime\"><p>"+ item.fc + "</p></td>";
                htm+="<td class=\"gold\"><em>"+ (item.mState==255 ? "已完成":"进行中") +"</em></td>";
                htm+="<td class=\"state\"><em>"+ item.ipvc + "/" + item.uvc + "</em></td>";
                htm+="<td class=\"do\" align=\"right\">";
                switch(item.mState){
                    case 1:
                        htm+="<p><a href=\"javascript:void(0)\" onclick=\"window.open('/Mission/FMValid.aspx?id="+ item.id +"');\" class=\"button4_a\">开始验证</a> <a href=\"javascript:void(0);\" onclick=\"CancelM('"+ item.id +"','"+ item.mId +"')\" class=\"button4_a\">取消</a></p>";
                        htm+="<p style=\"margin-bottom:3px;\">剩余验证时间：<span style=\"color:#090;\">"+(item.syMin > 0 ? item.syMin : 0)+"分钟</span></p>";
                        break;
                    case 255:
                        htm+= item.completedAt + "<p class=\"over\" style=\"margin-top:3px;\">已经完成</p>";
                        break;
                }
                htm+="</td>";
                htm+="</tr>";
            }
            htm+="</tbody>";
            htm+="</table>";
            $("#divInfo").html(htm);
            $("#reLoad").hide();
            GM_log("autoOpen="+autoOpen); 
            if(autoOpen==1||page_index>=2)
            {
	            for(var i=0;i<$(".button4_a").length;i=i+2)
	            {
	            	GM_log("open Mission No." + (i+2)/2);
	            	$(".button4_a")[i].onclick();//点偶数的,是打开任务;奇数是取消任务.
	            }
        	}
        }

        $(".reListTitle tbody>tr:odd").addClass("tcolor");
        $(".reListTitle tbody td").css("border-width","0px");
        $("#divTaskBody").show();    
    });
    
}


$(".bbtton6_a")[0].onclick=function ()
{	
	if(typeof(this.timeoutId) != "undefined" )
	{
		clearTimeout(this.timeoutId);
		GM_log("clearTimeout");
	}
	GM_log(typeof($('#playAudioGet2Work')[0].pause));
	$('#playAudioGet2Work')[0].pause();
	this.timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
	unsafeWindow.RefTask(1, pageSize, 1);
}

unsafeWindow.SetPage=function(index,rowsCount){
	var pageCount = parseInt(rowsCount/pageSize)+1;
	GM_log("index="+index);
	var htm="";
	if(index>1)
	htm+="<a class=\"page-prev\" href=\"javascript:GoPage("+(index-1)+");\">上一页</a>";
	for(i=1;i<=pageCount;i++){
	
	if( index==i )
	htm+="<a class=\"on\">"+i+"</a>";
	else
	htm+="<a href=\"javascript:GoPage("+i+");\">"+i+"</a>"
	}
	if(index<pageCount)
	htm+="<a class=\"page-next\" href=\"javascript:GoPage("+(index+1)+");\">下一页</a>";
	$(".pageno").html(htm);
} 


// sound module
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

playSoundDiv.innerHTML = " \
	<audio id=\"playAudioGet2Work\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21112?filename%3get2work.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	";
//http://storage.live.com/items/96902E43106FA83C%21109?filename%3dgot.ogg


$(".bbtton6_a")[0].timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
