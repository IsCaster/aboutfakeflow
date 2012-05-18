// ==UserScript==
// @name          Better to search in taobao
// @namespace     http://www.caster.org
// @description   Better to search in taobao 
// @include       http://s.taobao.com/search?q=*
// @include       http://*.taobao.com/?q=*
// @include       http://*.taobao.com/search.htm*
// @include       http://*.taobao.com/?search=*
// @include       http://*.tmall.com/?q=*
// @include       http://*.tmall.com/search.htm*
// @include       http://*.tmall.com/?search=*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==


function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js");
    script.addEventListener('load', function() {
            var script = document.createElement("script");
            script.textContent = "(" + callback.toString() + ")();";
            document.body.appendChild(script);
        }, false);
    document.body.appendChild(script);
}



// the guts of this userscript
function main_search() {
    //Compatible change for Chrome extension
    window.unsafeWindow || (
        unsafeWindow = (function() {
            var el = document.createElement('p');
            el.setAttribute('onclick', 'return window;');
            return el.onclick();
        }())
    );

    // console.info || (console.info = function (message) {
        // console.info(message);
    // }
    // );

    var isBuggedChrome=false;
    if(typeof(GM_setValue)!='undefined') 
    {
        var gsv=GM_setValue.toString();
        if(gsv.indexOf('staticArgs')>0) { isBuggedChrome=false; console.info('GreaseMonkey Api detected...'); } 
        else if(gsv.match(/not\s+supported/)) { isBuggedChrome=true;  console.info('Bugged Chrome GM Api detected...'); }
    } 
    else 
    { 
        isBuggedChrome=true; console.info('No GM Api detected...'); 
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
                console.info("error setting value: " + e);
            }
        }
        
        GM_deleteValue = function(key) {
            try {
                window.localStorage.removeItem(keyPrefix + key);
            } catch (e) {
                console.info("error removing value: " + e);
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

    console.info($(".seller > a").length)
    
    var shopkeepers=";"
    
    for(var i=0 ;i<$(".seller > a").length;++i )
    {
        if(shopkeepers.indexOf(";"+$(".seller > a")[i].innerHTML+";")==-1)
        {
            shopkeepers=shopkeepers+$(".seller > a")[i].innerHTML+";"
        }
    }
    
    resultDiv=document.createElement("div")
    resultDiv.innerHTML=shopkeepers
    $("#page")[0].insertBefore(resultDiv,$("#W-Content")[0]);
	
	resultUrlsDiv=document.createElement("p")
    resultUrlsDiv.id="resultUrls"
    $("#page")[0].insertBefore(resultUrlsDiv,$("#W-Content")[0]);
	
	anchorInput=document.createElement("input")
	anchorInput.type="text"
	anchorInput.id="anchorOfUrls"
	
	$("#page")[0].insertBefore(anchorInput,$("#W-Content")[0])
	
	getUrlsBtn=document.createElement("input")
	getUrlsBtn.type="button"
	getUrlsBtn.value="获取urls"
	getUrlsBtn.onclick=function()
	{
		var anchor=$("#anchorOfUrls")[0].value
		if(anchor=="")
		{
			anchor=0
		}
		else
		{
			anchor=parseInt(anchor,10)-1
		}
		
		var resultUrls=""
		
		if(anchor>=0 && anchor<=$(".EventCanSelect").length-1)
		{
			resultUrls=resultUrls+$(".EventCanSelect")[anchor].href+";"
		}
		
		
		for(var i=1;i<44;i++)
		{
			if( anchor+i >=0 && anchor+i <= $(".EventCanSelect").length-1)
			{
				resultUrls=resultUrls+$(".EventCanSelect")[anchor+i].href+";"
			}
			if( anchor-i >=0 && anchor-i <= $(".EventCanSelect").length-1)
			{
				resultUrls=resultUrls+$(".EventCanSelect")[anchor-i].href+";"
			}
		}
        resultUrls=resultUrls.replace(/;$/,"")
		$("#resultUrls")[0].innerHTML=resultUrls
	}
	$("#page")[0].insertBefore(getUrlsBtn,$("#W-Content")[0])
    
    //add No.* for urls
    for(var i=0;i<$(".EventCanSelect").length;++i)
    {
        numberNode=document.createTextNode("NO."+(i+1)+" ")
        $(".EventCanSelect")[i].parentNode.insertBefore(numberNode,$(".EventCanSelect")[i])
    }
}

function inshop_search()
{
	window.unsafeWindow || (
        unsafeWindow = (function() {
            var el = document.createElement('p');
            el.setAttribute('onclick', 'return window;');
            return el.onclick();
        }())
    );
	
	resultUrlsDiv=document.createElement("p")
    resultUrlsDiv.id="resultUrls"
    $(".shop-hesper-bd ")[0].parentNode.insertBefore(resultUrlsDiv,$(".shop-hesper-bd ")[0]);
	
	anchorInput=document.createElement("input")
	anchorInput.type="text"
	anchorInput.id="anchorOfUrls"
	
	$(".shop-hesper-bd ")[0].parentNode.insertBefore(anchorInput,$(".shop-hesper-bd ")[0])
	
	getUrlsBtn=document.createElement("input")
	getUrlsBtn.type="button"
	getUrlsBtn.value="获取urls"
	getUrlsBtn.onclick=function()
	{
		var anchor=$("#anchorOfUrls")[0].value
		if(anchor=="")
		{
			anchor=0
		}
		else
		{
			anchor=parseInt(anchor,10)-1
		}
		
		var resultUrls=""
		
		if(anchor>=0 && anchor<=$(".permalink").length-1)
		{
			resultUrls=resultUrls+$(".permalink")[anchor].href+";"
		}
		
		
		for(var i=1;i<44;i++)
		{
			if( anchor+i >=0 && anchor+i <= $(".permalink").length-1)
			{
				resultUrls=resultUrls+$(".permalink")[anchor+i].href+";"
			}
			if( anchor-i >=0 && anchor-i <= $(".permalink").length-1)
			{
				resultUrls=resultUrls+$(".permalink")[anchor-i].href+";"
			}
		}
        resultUrls=resultUrls.replace(/;$/,"")
		$("#resultUrls")[0].innerHTML=resultUrls
	}
	$(".shop-hesper-bd ")[0].parentNode.insertBefore(getUrlsBtn,$(".shop-hesper-bd ")[0])
	
	
}

// load jQuery and execute the main function
if(location.href.indexOf("http://s.taobao.com/search?q=")!=-1)
{
	addJQuery(main_search);
}	
else if(location.href.indexOf(".taobao.com/?q=")!=-1 
	|| location.href.indexOf(".taobao.com/search.htm")!=-1 
	||location.href.indexOf(".taobao.com/?search=")!=-1  
	||location.href.indexOf(".tmall.com/?q=")!=-1 
	|| location.href.indexOf(".tmall.com/search.htm")!=-1 
	||location.href.indexOf(".tmall.com/?search=")!=-1  
	)
{
	addJQuery(inshop_search);
}