// ==UserScript==
// @name          fake flow mission for nmimi
// @namespace     http://www.caster.org
// @description   used on fake flow Module of nmimi.com 
// @include       http://wwww.nmimi.com/Mission/FMDating.aspx
// @include       http://www.nmimi.com/Mission/FMDating.aspx
// @exclude       http://diveintogreasemonkey.org/*
// ==/UserScript==

//Compatible change for Chrome extension
window.unsafeWindow || (
	unsafeWindow = (function() {
		var el = document.createElement('p');
		el.setAttribute('onclick', 'return window;');
		return el.onclick();
	}())
);

GM_log || (GM_log = function (message) {
    console.info(message);
}
);

GM_log("GM_setValue is "+GM_setValue.toString());

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
trigerRefreshBtn.value="";

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
	GM_setValue("keepRefresh",1);//valid keepRefresh	
	GM_log("valid keepRefresh");
  this.nextSibling.onclick(); //triger trigerReflesh  
  
}
thisRefreshImages.parentNode.insertBefore(keepRefreshBtn,trigerRefreshBtn);

//change function GoPage
unsafeWindow.GoPage= function (index){
	var pageSize=15;//defined in http://wwww.nmimi.com/js/FMDating.js
	GM_log("enter GoPage");
  unsafeWindow.GetDatingResult(index,pageSize);    
  unsafeWindow.SetPage(index);
  if(GM_getValue("keepRefresh",0)==1)
  {
	  clearTimeout();
		setTimeout("unsafeWindow = (function() \
		{ var el = document.createElement('p');\
		el.setAttribute('onclick', 'return window;');\
		return el.onclick();}()) ; \
		unsafeWindow.document.getElementById('trigerRefresh').onclick();",1000);
	  GM_log("setTimeout refresh in keepRefresh ");
	}   
	GM_log(document.getElementById("TaskItem").innerHTML);
}

//response to key press

document.body.onkeydown =  function (event)
{
	event = event||window.event;
	GM_log("press key ="+event.keyCode);
	if(event.keyCode==119 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F7	
	{
		GM_setValue("keepRefresh",0);//invalid keepRefresh
		GM_log("invalid keepRefresh");
	}
}


function refreshMission()
{
	if( GM_getValue( "keepRefresh",0 ) == 1 )
	{
		clearTimeout();
		setTimeout("unsafeWindow = (function() \
		{ var el = document.createElement('p');\
		el.setAttribute('onclick', 'return window;');\
		return el.onclick();}()) ; \
		unsafeWindow.document.getElementById('trigerRefresh').onclick();",1000);
    GM_log("setTimeout refresh in loading  ");
	}
}

GM_log("refreshMission");
refreshMission();

