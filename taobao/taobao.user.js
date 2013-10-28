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
// @include       http://*.tmall.com/shop/view_shop.htm?tsearch=*
// @include       http://*.tmall.com/shop/view_shop.htm?q=*
// @include       http://*.tmall.com/shop/viewShop.htm?q=*
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

    var retryTimes=0
    function ShowShopkeeper()
    {       
        var atLeastNumber=9
        if($("li.result-info").length>0)
        {
            sumNumber=$("li.result-info")[0].innerHTML.replace(/件宝贝/,"")

        }
        else if($(".result-count").length>0)
        {
            sumNumber=$(".result-count")[0].innerHTML.replace(/件宝贝/,"")
            
        }
        else if($(".result-count-cont em").length>0)
        {
            sumNumber=$(".result-count-cont em")[0].innerHTML
        }
        else if($(".nav-topbar-content span.h").length==1)
        {
            sumNumber=$(".nav-topbar-content span.h")[0].innerHTML
        }
        sumNumber=parseInt(sumNumber)
        
        if($(".page-info").length!=0)
        {
            pageinfo=$(".page-info")[0].innerHTML.split("/")
            pageIndex=parseInt(pageinfo[0],10)
            pageTotalNum=parseInt(pageinfo[1],10)
        }
        else
        {
            pageIndex=1
            pageTotalNum=1
        }

        if(pageTotalNum==1)
        {
            atLeastNumber=sumNumber
            if(atLeastNumber>9)
            {
                atLeastNumber=9
            }
        }
        else if(pageIndex!=pageTotalNum)
        {
            atLeastNumber=9
        }
        else
        {
            atLeastNumber=sumNumber-44-40*(pageIndex-2)
            if(atLeastNumber>9)
            {
                atLeastNumber=9
            }
        }


        
        console.info("ShowShopkeeper() atLeastNumber="+atLeastNumber)
        
        tagA_class=""
        listContent_class=""
        if($(".tb-content").length>0)
        {
            listContent_class=".tb-content "
        }
        else if($(".list-content").length>0)
        {
            listContent_class=".list-content "
        }
        
        if($(listContent_class+"a.EventCanSelect").length>=atLeastNumber) 
        {
            tagA_class=listContent_class+"a.EventCanSelect"
        }
        else if($(listContent_class+"h3.summary a").length>=atLeastNumber)
        {
            tagA_class=listContent_class+"h3.summary a"
        }
        else
        {
            for(var i=10;i<990;i=i+10)
            {
                if($(listContent_class+"a.s"+i).length>=atLeastNumber) 
                {
                    tagA_class=listContent_class+"a.s"+i
                }
            }
        }
        
        console.info("tagA_class="+tagA_class)
        if(tagA_class=="")
        {
            retryTimes=retryTimes+1
            console.info("ShowShopkeeper() no urls recheck later.  No."+retryTimes)
            if(retryTimes<60)
            {
                setTimeout(function()
                {
                    ShowShopkeeper()
                },2000)
                return
            }
            else
            {
                return
            }
        }
        
        console.info("item number:"+$(tagA_class).length)
        
        shopkeeper_selector=""
        
        if($(".list-item .seller > a:first-child").length>0)
        {
            shopkeeper_selector=".list-item .seller > a:first-child"
        }
        else if($(".item .seller > a:first-child").length>0)
        {
            shopkeeper_selector=".item .seller > a:first-child"
        }
        else
        {
            //alert("外挂程序出错，请联系管理员")
        }
        
        console.info("shopkeeper number:"+$(shopkeeper_selector).length)
        
        var shopkeepers=";"
        var shopkeepersHtml=";"
        for(var i=0 ;i<$(shopkeeper_selector).length;++i )
        {
            if(shopkeepers.indexOf(";"+$(shopkeeper_selector)[i].innerHTML.replace(/\s*/g,"")+";")==-1)
            {
                shopkeepers=shopkeepers+$(shopkeeper_selector)[i].innerHTML.replace(/\s*/g,"")+";"
                shopkeepersHtml=shopkeepersHtml+"<a href='javascript:showShopkeeperUrls(\""+$(shopkeeper_selector)[i].innerHTML.replace(/\s*/g,"") +"\")'>"+$(shopkeeper_selector)[i].innerHTML.replace(/\s*/g,"")+"</a>"+";"
            }
        }
        
        if($("#W-Content").length>0)
        {
            addAreaIn=$("#W-Content")[0]
        }
        else if($(".tb-container").length>0)
        {
            addAreaIn=$(".tb-container")[0]
        }
        else
        {
            alert("外挂程序出错，请联系管理员")
        }
        
        resultDiv=document.createElement("div")
        resultDiv.innerHTML=shopkeepersHtml
        unsafeWindow.shopkeepers=shopkeepers
        $("#page")[0].insertBefore(resultDiv,addAreaIn);
        
        resultUrlsDiv=document.createElement("p")
        resultUrlsDiv.id="resultUrls"
        $("#page")[0].insertBefore(resultUrlsDiv,addAreaIn);
        
        anchorInput=document.createElement("input")
        anchorInput.type="text"
        anchorInput.id="anchorOfUrls"
        
        $("#page")[0].insertBefore(anchorInput,addAreaIn)
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
            for(var i=0 ;i<$(shopkeeper_selector).length;++i )
            {
                if($(shopkeeper_selector)[i].innerHTML.replace(/\s*/g,"")==shopkeeper)
                {
                    resultUrls=resultUrls+$(tagA_class)[i].href+";"
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
            
            if(anchor>=0 && anchor<=$(tagA_class).length-1)
            {
                resultUrls=resultUrls+$(tagA_class)[anchor].href+";"
            }
            
            
            for(var i=1;i<44;i++)
            {
                if( anchor+i >=0 && anchor+i <= $(tagA_class).length-1)
                {
                    resultUrls=resultUrls+$(tagA_class)[anchor+i].href+";"
                }
                if( anchor-i >=0 && anchor-i <= $(tagA_class).length-1)
                {
                    resultUrls=resultUrls+$(tagA_class)[anchor-i].href+";"
                }
            }
            resultUrls=resultUrls.replace(/;$/,"")
            $("#resultUrls")[0].innerHTML=resultUrls
        }
        $("#page")[0].insertBefore(getUrlsBtn,addAreaIn)
        
        //add No.* for urls
        for(var i=0;i<$(tagA_class).length;++i)
        {
            numberNode=document.createTextNode("NO."+(i+1)+" ")
            $(tagA_class)[i].parentNode.insertBefore(numberNode,$(tagA_class)[i])
            //if($(".item-box .summary").length>0)
            //{
            //    $(".item-box .summary")[i].insertBefore(numberNode,$(".item-box .summary")[i].firstChild)
            //}
        }
    }
    
    setTimeout(function()
        {
            ShowShopkeeper()
        },500)
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
    else if($(".shop-list ").length>=1)
    {
        itemListElements=$(".shop-list ")
        addBeforeElement=itemListElements[1]
    }
    else if($(".J_TItems ").length>=1)
    {
        itemListElements=$(".J_TItems ")
        addBeforeElement=itemListElements[0]
    }
    
	
	var itemHrefLinks
	if(itemListElements.find(".permalink").length>=1)
	{
		itemHrefLinks=itemListElements.find(".permalink")
	}
	else
	{
		itemHrefLinks=itemListElements.find(".item-name")
	}

    addBeforeElement.parentNode.insertBefore(resultUrlsDiv,addBeforeElement);
    
    anchorInput=document.createElement("input")
    anchorInput.type="text"
    anchorInput.id="anchorOfUrls"
    anchorInput.onkeydown =  function (event)
    {
        event = event||window.event;
        //console.info("press key ="+event.keyCode);
        if(event.keyCode==13 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press Enter
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
        
        if(anchor>=0 && anchor<=itemHrefLinks.length-1)
        {
            resultUrls=resultUrls+itemHrefLinks[anchor].href+";"
        }
        
        
        for(var i=1;i<itemHrefLinks.length;i++)
        {
            if( anchor+i >=0 && anchor+i <= itemHrefLinks.length-1)
            {
                resultUrls=resultUrls+itemHrefLinks[anchor+i].href+";"
            }
            if( anchor-i >=0 && anchor-i <= itemHrefLinks.length-1)
            {
                resultUrls=resultUrls+itemHrefLinks[anchor-i].href+";"
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
        
        if(anchor>=0 && anchor<=itemHrefLinks.length-1)
        {
            resultUrls=resultUrls+itemHrefLinks[anchor].href+";"
        }
        
        
        for(var i=1;i<itemHrefLinks.length;i++)
        {
            if( anchor+i >=0 && anchor+i <= itemHrefLinks.length-1)
            {
                resultUrls=resultUrls+itemHrefLinks[anchor+i].href+";"
            }
            if( anchor-i >=0 && anchor-i <= itemHrefLinks.length-1)
            {
                resultUrls=resultUrls+itemHrefLinks[anchor-i].href+";"
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
        for(var i=0;i<itemHrefLinks.length;i++)
        {
            resultUrls=resultUrls+itemHrefLinks[i].href+";"
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
    ||location.href.indexOf(".tmall.com/shop/view_shop.htm?tsearch=")!=-1  
    ||location.href.indexOf(".tmall.com/shop/view_shop.htm?q=")!=-1 
    ||location.href.indexOf(".tmall.com/shop/viewShop.htm?q=")!=-1  
    ||location.href.indexOf(".tmall.com/?")!=-1  
    || location.href.indexOf(".taobao.com/?")!=-1 
	)
{
	addJQuery(inshop_search);
}