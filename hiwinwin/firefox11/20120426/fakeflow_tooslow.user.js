// ==UserScript==
// @name          Better to get fake flow mission avoid alert
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com ,to avoid alert when failed to get the mission
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx?id=*
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==
GM_log("too slow");


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
	<audio id=\"playAudioTooSlow\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21108?filename%3dtooslow.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	";
	
var playAudio1=document.getElementById("playAudioTooSlow");

//alert(location.href);
playAudio1.play();

