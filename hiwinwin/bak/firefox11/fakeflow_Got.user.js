// ==UserScript==
// @name          Better to get fake flow mission # when got a mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com ,work when got a mission ,play notification audio
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==
GM_log("Got a mission");

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
	<audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	";
	
var playAudio1=document.getElementById("playAudioGot");
playAudio1.volume=0.15;
playAudio1.play();
GM_log("playAudio1.play();");

//location.href="http://www.hiwinwin.com/task/count/";
