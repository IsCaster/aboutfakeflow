// ==UserScript==
// @name          Better to get fake flow mission # when got a mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com ,work when got a mission ,play notification audio
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==
GM_log("Got a mission");


//if(document.referrer!="http://www.hiwinwin.com/task/count/" && document.referrer!="http://www.hiwinwin.com/task/count/index.aspx")
{
	/*
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
		<audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21109?filename%3dgot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
		";
		
	var playAudio1=document.getElementById("playAudioGot");
	
	*/
	
	
	//auto open Mission Dialog
	var thisMissionImages,allMissionImages;
	
	allMissionImages = document.evaluate(
		"//a[@class='link_t']",
		document,
		null,
		XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
		null);
	
	if(allMissionImages.snapshotLength != 2 && allMissionImages.snapshotLength != 0)
	{
			//alert("程序出错，可能是hiwinwin改版了");
			GM_log("程序出错，可能是hiwinwin改版了");
	}	
	if(allMissionImages.snapshotLength == 2)
	{
		thisMissionImages =	allMissionImages.snapshotItem(0);
		thisMissionImages.onclick();
		//playAudio1.play();
	}
	else
	{
		/*
		clearTimeout();
		setTimeout("unsafeWindow = (function() { \
									var el = document.createElement('p');\
									el.setAttribute('onclick', 'return window;');\
									return el.onclick();\
								}()) ;unsafeWindow.location.href='Taskin.aspx'",5000);
		*/
	}
}


//location.href="http://www.hiwinwin.com/task/count/";
