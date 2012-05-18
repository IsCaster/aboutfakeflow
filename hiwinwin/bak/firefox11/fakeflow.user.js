// ==UserScript==
// @name          Better to get fake flow mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com 
// @include       http://www.hiwinwin.com/task/count/index.aspx
// @include       http://www.hiwinwin.com/task/count/
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==

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

//change function goPage
unsafeWindow.goPage = function (n)
{
  var qs = 'page=' + n + '&cnt=1&nows=' + (new Date()).getTime();
  unsafeWindow.getObj('taskLst').innerHTML = '<div class=\'submiting\'>任务加载中.....</p>';
  var xml = unsafeWindow.makeXmlReq();
  var url = '../../ajax/GetCount.aspx?' + qs;
  xml.onreadystatechange = function() {
      if (xml.readyState == 4) {
          if (xml.status == 200 || xml.status == 304) {
              var txt = xml.responseText;
              var divTaskLst = unsafeWindow.getObj('taskLst');
              divTaskLst.innerHTML = txt;
              var thisTaskTd=divTaskLst.firstChild.rows[0].cells[3];
              var allAnchors=thisTaskTd.getElementsByTagName("a");
              
              if( allAnchors.length > 0 )
              {
              	var thisLink=	allAnchors[allAnchors.length-1].toString();
              	//alert(thisLink+typeof(thisLink));
              	//document.getElementById("playAudioGot").play();
             
              	//location.href=thisLink;
              	GM_log("got mission ");
              	var requestResultWindow=document.getElementById("requestResult").contentWindow;
              	GM_log(typeof(requestResultWindow.open));
              	requestResultWindow.open(thisLink," ","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px; ");
             		GM_log("requestResultIframe.open ");
              	//try to get a mission and know the response
              	/*var xml2 = unsafeWindow.makeXmlReq();
              	xml2.onreadystatechange = function() {
              		//handle result
              		if (xml.readyState == 4) {
          					if (xml.status == 200 || xml.status == 304) {
          						var txt2 = xml2.responseText;
          						GM_log(txt2);
          						alert(txt2);
          						
          					}
          				}
              	}	
              	xml2.open('get', thisLink, true);
							  xml2.setRequestHeader('If-Modified-Since', '0');
							  xml2.send('');
							  */
              }
              else
              {
              	GM_log("not get mission ");
              	
              }
              if( GM_getValue( "keepReflash",0 ) == 1 )
            	{
            		setTimeout("goPage(0);",2000);
            		GM_log("setTimeout ,reflash ");
            	}
          }
      }
  };
  xml.open('get', url, true);
  xml.setRequestHeader('If-Modified-Since', '0');
  xml.send('');
}

thisReflashImages.onclick= function() 
{
	GM_setValue("keepReflash",1);//valid keepReflash
	unsafeWindow.goPage(0);
//  function goPage(n) 
/*	var n=1;
  {
    var qs = 'page=' + n + '&cnt=1&nows=' + (new Date()).getTime();
    unsafeWindow.getObj('taskLst').innerHTML = '<div class=\'submiting\'>任务加载中.....</p>';
    var xml = unsafeWindow.makeXmlReq();
    var url = '../../ajax/GetCount.aspx?' + qs;
    xml.onreadystatechange = function() {
        if (xml.readyState == 4) {
            if (xml.status == 200 || xml.status == 304) {
                var txt = xml.responseText;
                var divTaskLst = unsafeWindow.getObj('taskLst');
                divTaskLst.innerHTML = txt;
                var thisTaskTd=divTaskLst.firstChild.rows[0].cells[3];
                var allAnchors=thisTaskTd.getElementsByTagName("a");
                
                if( allAnchors.length > 0 )
                {
                	var thisLink=	allAnchors[0].toString();
                	//alert(thisLink+typeof(thisLink));
                	document.getElementById("playAudioGot").play();
               
                	location.href=thisLink;
                	//setTimeout("function()={}",1000);
                	//alert("还有？！");
                }
            }
        }
    };
    xml.open('get', url, true);
    xml.setRequestHeader('If-Modified-Since', '0');
    xml.send('');
	}	
	*/
}



//播放声音相关代码
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
	<audio id=\"playAudioTooSlow\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21108?filename%3dtooslow.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	<audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21109?filename%3dgot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	<audio id=\"playAudioAlreadyGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	<br/><br/><embed id=\"playSoundEmbed2\"  src=\"http://dmimg.5054399.com/mmusic/chuyin/shuaicongge.mp3\" enablejavascript=\"true\" loop=\"false\" 	autostart=\"false\"> </embed> \
	";
	//http://love.zlsdch.s3.sinaapp.com/13254264001.mp3


var playAudio1=document.getElementById("playAudio1");
playAudio1.play();
*/

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

//about cookie

/*
function getCookie(c_name)
{
	if (document.cookie.length>0)
	{ 
		c_start=document.cookie.indexOf(c_name + "=");
		if (c_start!=-1)
		{ 
			c_start=c_start + c_name.length+1 ;
			c_end=document.cookie.indexOf(";",c_start);
			if (c_end==-1) c_end=document.cookie.length ;
			return unescape(document.cookie.substring(c_start,c_end));
		} 
	}
	return "";
}


function setCookie(c_name,value,expiredays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : "; expires="+exdate.toGMTString());
}
*/
function reflashMission()
{
	if( GM_getValue( "keepReflash" ) == 1 )
	{
		setTimeout("goPage(0);",2000);
	}
}

GM_log("reflashMission");
reflashMission();