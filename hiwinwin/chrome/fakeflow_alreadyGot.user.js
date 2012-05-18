// ==UserScript==
// @name          Better to get fake flow mission # when already got mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com ,work when already got mission
// @include       http://www.hiwinwin.com/Error.aspx
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==
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

playSoundDiv.innerHTML = " \
	<audio id=\"playAudioAlreadyGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	<audio id=\"playAudioChangeIP\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21111?filename%3dchangeip.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	";
	
var playAudio1=document.getElementById("playAudioAlreadyGot");
var playAudio2=document.getElementById("playAudioChangeIP");


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
		playAudio1.play();
	}
	else if(error_info == "IP")
	{
		playAudio2.play();
	}
	else
	{
		alert(error_info);
		GM_log("fake flow#alreadyGot 错误信息有误，error_info="+error_info);
	}
}


