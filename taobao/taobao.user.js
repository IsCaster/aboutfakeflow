// ==UserScript==
// @name          Better to search in taobao
// @namespace     http://www.caster.org
// @description   Better to search in taobao 
// @include       http://s.taobao.com/search?*
// @include       http://*.taobao.com/?q=*
// @include       http://*.taobao.com/?*
// @include       http://*.taobao.com/?order=*
// @include       http://*.taobao.com/?pageNum=*
// @include       http://*.taobao.com/search.htm*
// @include       http://*.taobao.com//search.htm*
// @include       http://*.taobao.com/?search=*
// @include       http://*.taobao.com//?search=*
// @include       http://*.tmall.com/?q=*
// @include       http://*.tmall.com/?*
// @include       http://*.tmall.com/search.htm*
// @include       http://*.tmall.com//search.htm*
// @include       http://*.tmall.com/?search=*
// @include       http://*.tmall.com//?search=*
// @include       http://*.tmall.com/shop/view_shop.htm?q=*
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

// unsafeWindow.GM_getValue = function(key, defValue) {
    // var retval = window.localStorage.getItem(keyPrefix + key);
    // if (retval == null || typeof(retval) == "undefined") {
        // return defValue;
    // }
    // return retval;
// }

// unsafeWindow.GM_setValue = function(key, value) {
    // try {
        // window.localStorage.setItem(keyPrefix + key, value);
    // } catch (e) {
        // console.info("error setting value: " + e);
    // }
// }

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

    var isBuggedChrome=true;


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

    console.info($(".list-item .seller > a:first-child").length)
    
    var shopkeepers=";"
    var shopkeepersHtml=";"
    for(var i=0 ;i<$(".list-item .seller > a:first-child").length;++i )
    {
        if(shopkeepers.indexOf(";"+$(".seller > a:first-child")[i].innerHTML+";")==-1)
        {
            shopkeepers=shopkeepers+$(".seller > a:first-child")[i].innerHTML+";"
            shopkeepersHtml=shopkeepersHtml+"<a href='javascript:showShopkeeperUrls(\""+$(".seller > a:first-child")[i].innerHTML +"\")'>"+$(".seller > a:first-child")[i].innerHTML+"</a>"+";"
        }
    }
    
    resultDiv=document.createElement("div")
    resultDiv.innerHTML=shopkeepersHtml
    unsafeWindow.shopkeepers=shopkeepers
    $("#page")[0].insertBefore(resultDiv,$("#W-Content")[0]);
	
	resultUrlsDiv=document.createElement("p")
    resultUrlsDiv.id="resultUrls"
    $("#page")[0].insertBefore(resultUrlsDiv,$("#W-Content")[0]);
	
	anchorInput=document.createElement("input")
	anchorInput.type="text"
	anchorInput.id="anchorOfUrls"
	
	$("#page")[0].insertBefore(anchorInput,$("#W-Content")[0])
	anchorInput.onkeydown =  function (event)
    {
        event = event||window.event;
        //console.info("press key ="+event.keyCode);
        if(event.keyCode==13 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F7	
        {
            $("#getUrlsBtn")[0].click()
            //console.info("invalid keepReflash");
        }
    }
    
    unsafeWindow.showShopkeeperUrls=function(shopkeeper)
    {
        //query by the shopkeeper
        var resultUrls=""
        for(var i=0 ;i<$(".list-item .seller > a:first-child").length;++i )
        {
            if($(".list-item .seller > a:first-child")[i].innerHTML==shopkeeper)
            {
                resultUrls=resultUrls+$(".list-item .EventCanSelect")[i].href+";"
            }
        }
        resultUrls=resultUrls.replace(/;$/,"")
		$("#resultUrls")[0].innerHTML=resultUrls
    }
    
	getUrlsBtn=document.createElement("input")
	getUrlsBtn.type="button"
	getUrlsBtn.value="获取urls"
    getUrlsBtn.id="getUrlsBtn"
	getUrlsBtn.onclick=function()
	{
		var anchor=$("#anchorOfUrls")[0].value.replace(/\s*$/,"").replace(/^\s*/,"").replace(/\*+/,"*")
        if(anchor!=""&&anchor.indexOf("*")!=-1)
        {
            //part1***part2
            parts=anchor.split("*")
            shopkeeperArray=unsafeWindow.shopkeepers.split(";")
            
            for(var i=0;i<shopkeeperArray.length;++i)
            {
                //start with part1 and end with part2
                //console.info("index="+ shopkeeperArray[i].indexOf(parts[1],shopkeeperArray[i].length-parts[1].length))
                if(shopkeeperArray[i].indexOf(parts[0])==0&&shopkeeperArray[i].indexOf(parts[1],shopkeeperArray[i].length-parts[1].length)==shopkeeperArray[i].length-parts[1].length)
                {
                    unsafeWindow.showShopkeeperUrls(shopkeeperArray[i])
                    return;
                }
            }
            $("#resultUrls")[0].innerHTML="不存在的掌柜名"
            return;
        }
		else if(anchor!=""&&unsafeWindow.shopkeepers.indexOf(";"+anchor+";")!=-1)
		{
            unsafeWindow.showShopkeeperUrls(anchor)
			return;
		}
        else if(anchor=="")
        {
            anchor=0
        }
		else
		{
			anchor=parseInt(anchor,10)-1
		}
		
        if(isNaN(anchor))
        {
            $("#resultUrls")[0].innerHTML="不存在的掌柜名"
            return;
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
    var isBuggedChrome=true;
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


    console.info('inshop_search'); 
	window.unsafeWindow || (
        unsafeWindow = (function() {
            var el = document.createElement('p');
            el.setAttribute('onclick', 'return window;');
            return el.onclick();
        }())
    );
	
	resultUrlsDiv=document.createElement("p")
    resultUrlsDiv.id="resultUrls"
    var itemListElements
    var addBeforeElement
    if($(".shop-hesper-bd ").length>=1)
    {
        itemListElements=$(".shop-hesper-bd ")
        addBeforeElement=itemListElements[0]
	}
    else
    {
        itemListElements=$(".shop-list ")
        addBeforeElement=itemListElements[1]
    }
    

    addBeforeElement.parentNode.insertBefore(resultUrlsDiv,addBeforeElement);
    
    anchorInput=document.createElement("input")
    anchorInput.type="text"
    anchorInput.id="anchorOfUrls"
    anchorInput.onkeydown =  function (event)
    {
        event = event||window.event;
        //console.info("press key ="+event.keyCode);
        if(event.keyCode==13 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F7	
        {
            $("#getUrlsBtn")[0].click()
            //console.info("invalid keepReflash");
        }
    }
    addBeforeElement.parentNode.insertBefore(anchorInput,addBeforeElement)
    

    getUrlsBtn=document.createElement("input")
    getUrlsBtn.type="button"
    getUrlsBtn.value="获取urls"
    getUrlsBtn.id="getUrlsBtn"
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
        
        if(anchor>=0 && anchor<=itemListElements.find(".permalink").length-1)
        {
            resultUrls=resultUrls+itemListElements.find(".permalink")[anchor].href+";"
        }
        
        
        for(var i=1;i<itemListElements.find(".permalink").length;i++)
        {
            if( anchor+i >=0 && anchor+i <= itemListElements.find(".permalink").length-1)
            {
                resultUrls=resultUrls+itemListElements.find(".permalink")[anchor+i].href+";"
            }
            if( anchor-i >=0 && anchor-i <= itemListElements.find(".permalink").length-1)
            {
                resultUrls=resultUrls+itemListElements.find(".permalink")[anchor-i].href+";"
            }
        }
        resultUrls=resultUrls.replace(/;$/,"")
        $("#resultUrls")[0].innerHTML=resultUrls
    }
    addBeforeElement.parentNode.insertBefore(getUrlsBtn,addBeforeElement)


    
    getAllUrlsBtn=document.createElement("input")
    getAllUrlsBtn.type="button"
    getAllUrlsBtn.value="获取所有urls"
    getAllUrlsBtn.id="getAllUrlsBtn"
    getAllUrlsBtn.onclick=function()
    {
        GM_setValue("bGetAllUrls","1")
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
        
        if(anchor>=0 && anchor<=itemListElements.find(".permalink").length-1)
        {
            resultUrls=resultUrls+itemListElements.find(".permalink")[anchor].href+";"
        }
        
        
        for(var i=1;i<itemListElements.find(".permalink").length;i++)
        {
            if( anchor+i >=0 && anchor+i <= itemListElements.find(".permalink").length-1)
            {
                resultUrls=resultUrls+itemListElements.find(".permalink")[anchor+i].href+";"
            }
            if( anchor-i >=0 && anchor-i <= itemListElements.find(".permalink").length-1)
            {
                resultUrls=resultUrls+itemListElements.find(".permalink")[anchor-i].href+";"
            }
        }
        resultUrls=resultUrls.replace(/;$/,"")
        GM_setValue("allUrls",resultUrls)
            
        if(itemListElements.find(".next").length>=1)
        {
            itemListElements.find(".next")[0].click()
        }
        else if($(".page-next").length>=1)
        {
            $(".page-next")[0].click()
        }
        else
        {
            $("#resultUrls")[0].innerHTML=resultUrls
            GM_setValue("bGetAllUrls","0")
            GM_setValue("allUrls","")
        }
    }
    addBeforeElement.parentNode.insertBefore(getAllUrlsBtn,addBeforeElement)
    stopGetAllUrlsBtn=document.createElement("input")
    stopGetAllUrlsBtn.type="button"
    stopGetAllUrlsBtn.value="stop"
    stopGetAllUrlsBtn.id="stopGetAllUrlsBtn"
    stopGetAllUrlsBtn.onclick=function()
    {
        GM_setValue("bGetAllUrls","0")
    }
    addBeforeElement.parentNode.insertBefore(stopGetAllUrlsBtn,addBeforeElement)

	if(GM_getValue("bGetAllUrls","0")=="1")
    {
        resultUrls=";"
        for(var i=0;i<itemListElements.find(".permalink").length;i++)
        {
            resultUrls=resultUrls+itemListElements.find(".permalink")[i].href+";"
        }
        resultUrls=resultUrls.replace(/;$/,"")
        
        preAllUrls=GM_getValue("allUrls","")
        resultUrls=preAllUrls+resultUrls
        
        GM_setValue("allUrls",resultUrls)
        
        if(itemListElements.find(".next").length>=1)
        {
            itemListElements.find(".next")[0].click()
        }
        else if($(".page-next").length>=1)
        {
            $(".page-next")[0].click()
        }
        else
        {
            $("#resultUrls")[0].innerHTML=resultUrls
            GM_setValue("bGetAllUrls","0")            
            GM_setValue("allUrls","")
        }
    }

}

// load jQuery and execute the main function
if(location.href.indexOf("http://s.taobao.com/search?")!=-1)
{
	addJQuery(main_search);
}	
else if(location.href.indexOf(".taobao.com/?q=")!=-1 
	|| location.href.indexOf(".taobao.com/search.htm")!=-1 
    || location.href.indexOf(".taobao.com//search.htm")!=-1 
	||location.href.indexOf(".taobao.com/?search=")!=-1  
    ||location.href.indexOf(".taobao.com//?search=")!=-1  
	||location.href.indexOf(".tmall.com/?q=")!=-1 
	|| location.href.indexOf(".tmall.com/search.htm")!=-1 
    || location.href.indexOf(".tmall.com//search.htm")!=-1 
	||location.href.indexOf(".tmall.com/?search=")!=-1  
    ||location.href.indexOf(".tmall.com//?search=")!=-1  
    ||location.href.indexOf(".taobao.com/?order=")!=-1  
    ||location.href.indexOf(".tmall.com/shop/view_shop.htm?q=")!=-1  
    ||location.href.indexOf(".tmall.com/?")!=-1  
    || location.href.indexOf(".taobao.com/?")!=-1 
	)
{
	addJQuery(inshop_search);
}