// ==UserScript==
// @name          fake visit item url
// @namespace     http://www.caster.org
// @description   1. fake visit item url on taobao.com , maybe reduce the chance of being added to blacklist 2. submit the shopkeeper information
// @include       http://caster.webfactional.com/fakevisit
// @include       http://s.taobao.com/search?*
// @include       http://item.taobao.com/item.htm?*
// @include       http://detail.tmall.com/item.htm?*
// @include       http://item.tmall.com/item.htm?*
// @include       http://love.taobao.com/*
// @include       http://www.taobao.com/go/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==
GM_log("enter GM script");
if(location.href.indexOf("http://caster.webfactional.com/fakevisit")!=-1)
{
	handleFakeVisitPage()
}
else if(location.href.indexOf("http://s.taobao.com/search?")!=-1)
{
	handleTaobaoSearchPage()
}
else if(location.href.indexOf("http://item.taobao.com/item.htm?")!=-1||location.href.indexOf("http://detail.tmall.com/item.htm?")!=-1||location.href.indexOf("http://item.tmall.com/item.htm?")!=-1)
{
	handleTaobaoItemPage()
}
else if(location.href.indexOf("http://love.taobao.com/")!=-1 || location.href.indexOf("http://www.taobao.com/go")!=-1 )
{
	handleInvalidItemPage()
}

function handleFakeVisitPage()
{
	itemUrl=$("#url")[0].innerHTML.replace(/&amp;/g,"&")
	itemId=$("#itemId")[0].innerHTML
    keyword=$("#keyword")[0].innerHTML
	
	itemUrl=itemUrl.replace(/spm=[^&]*&/,"&").replace(/spm=[^&]*$/,"")

    if(keyword=="")
    {
        unsafeWindow.open(itemUrl)
        setTimeout(function(){unsafeWindow.close()},2000)
    }
    else
    {
		if(itemId=="")
		{
			GM_setValue("url",itemUrl)
			url="http://s.taobao.com/search?q="+keyword
			$("#keyword")[0].innerHTML=$("#keyword")[0].innerHTML+";"+url
			$("#searchpageframe")[0].contentWindow.open(url)    
		}
		else
		{
			itemId_s=itemId.replace(/id=/,"")
			url="http://s.taobao.com/search?spm=a230r.1.8.5."+itemId_s+"&q="+keyword
			$("#keyword")[0].innerHTML=$("#keyword")[0].innerHTML+";"+url
			$("#searchpageframe")[0].contentWindow.open(url)
		}
        setTimeout(function(){unsafeWindow.close()},2000)
    }
}

function handleTaobaoSearchPage()
{
    function openItemPage()
    {
        var openContainP=document.createElement("p");
        document.body.insertBefore(openContainP,null);

        openContainP.onclick=function()
        {
			if(itemId!="")
			{
				unsafeWindow.open("http://item.taobao.com/item.htm?"+itemId)
			}
			else
			{
				unsafeWindow.open(url)
			}
        }
        openContainP.click()
		setTimeout(function(){unsafeWindow.close()},50000)
    }
	
	function getUrlParam(name)
	{
		var regexS;
		var regexl;
		var results;
		
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		regexS = "[\\?&]"+name+"=([^&#]*)";
		regex = new RegExp(regexS);
		results = regex.exec (location.href);
		//note: don't write space after command exec
		
		if ( results == null ) 
		{
			return "";
		}
		else 
		{
			return results[1];
		}
    }
    
    //add a p tag  to fake mouse click
    var clickContainP=document.createElement("p");
    clickContainP.id='clickContain';
    clickContainP.onclick=function(obj)
    {
        var evt1 = document.createEvent("MouseEvents");
        evt1.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt2 = document.createEvent("MouseEvents");
        evt2.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt3 = document.createEvent("MouseEvents");     
        evt3.initMouseEvent ("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        //$("#toClick")[0].dispatchEvent(evt1);
        //$("#toClick")[0].dispatchEvent(evt2);
        //$("#toClick")[0].dispatchEvent(evt3);
		obj.dispatchEvent(evt1);
		obj.dispatchEvent(evt2);
		obj.dispatchEvent(evt3);
		setTimeout(function(){unsafeWindow.close()},50000)
    }
    document.body.insertBefore(clickContainP,null);  	
 
	url=""
	itemId=""
	jumpto_para=getUrlParam("jumpto")
    //new taobao style
    s_para=getUrlParam("s")
    n_para=getUrlParam("n")
    
	if(jumpto_para==""&&(s_para==""||s_para=="0"))//first_page
	{
		fake_spm=getUrlParam("spm")
        GM_log("handleTaobaoSearchPage,fake_spm="+fake_spm)
		itemId_s=fake_spm.replace(/a230r\.1\.8\.5\./,"")
		if(fake_spm!=itemId_s)
		{
			itemId="id="+itemId_s
		}
	}
	else
	{
		if(unsafeWindow.opener.document.getElementById("itemId")!=null)
		{
			itemId=unsafeWindow.opener.document.getElementById("itemId").innerHTML
		}
	}
    
    if(unsafeWindow.opener)
    {
        unsafeWindow.opener.close()
    }
	
	if(itemId=="")
	{
		url=GM_getValue("url","")
	}
	else
	{
		var itemIdP=document.createElement("p");
		itemIdP.id='itemId';
		itemIdP.innerHTML=itemId
		document.body.insertBefore(itemIdP,null);  
	}
 
    var tryPageNum=4
    GM_log("handleTaobaoSearchPage,url="+url+",itemId="+itemId)
    if(url==""&&itemId=="")
    {
        unsafeWindow.close()
        return;
    }
	
	if($("#filterPageForm").length>0)
	{
		$("#filterPageForm")[0].target="_blank"
        //for the new version of taobao
        //$("#filterPageForm").target="_blank"
        GM_log("handleTaobaoSearchPage,set blank")
	}
	
    if(unsafeWindow.gotoPage && unsafeWindow.gotoPage.toString().indexOf("window.location = url")!=-1)
    {
        unsafeWindow.gotoPage= function(form) {
            var page = 6;
            var pageSize = 40;
            var tNum = 4000;
            var start = 200;
            var maxPage = 100;
            var newPage = document.getElementById('jumpto').value;

            if(parseInt(newPage) > maxPage) {
                newPage = maxPage;
            }

            var newStart = start + (newPage - page) * pageSize;
            if (newStart < 0) newStart = 0;
            var url = form.action + '&s=' + newStart + '&n=' + pageSize;
            form.action = url;
            //window.location = url;
            //form.submit();
            GM_log("open url="+url)
            unsafeWindow.open(url)
            
            return false;

        }
    }
    
    var  retryTimes=0
    function checkUrlInPage()
    {
        tagA_class=""
        if($("a.s80").length>0) 
        {
            tagA_class=".s80"
        }
        else if($("a.s70").length>0) 
        {
            tagA_class=".s70"
        }
        else if($("a.s90").length>0) 
        {
            tagA_class=".s90"
        }
        else if($("a.s170").length>0) 
        {
            tagA_class=".s170"
        }
        else if($("a.s190").length>0) 
        {
            tagA_class=".s190"
        }
        else if($("a.s180").length>0) 
        {
            tagA_class=".s180"
        }
        else if($("a.EventCanSelect").length>0) 
        {
            tagA_class=".EventCanSelect"
        }
        
        if(tagA_class=="")
        {
            retryTimes=retryTimes+1
            GM_log("checkUrlInPage() no urls recheck later.  No."+retryTimes)
            if(retryTimes<60)
            {
                setTimeout(function()
                {
                    checkUrlInPage()
                },1000)
                return
            }
        }

        //for the new version of taobao 1
        GM_log("tagA_class="+tagA_class)
        if(itemId!="")
        {

            if($("a"+tagA_class+"[href*='"+itemId+"&']").length>=1)
            {
                GM_log("1.find url")
                var evt1 = document.createEvent("MouseEvents");
                evt1.initMouseEvent("mousedown", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                var evt2 = document.createEvent("MouseEvents");     
                evt2.initMouseEvent ("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                $("a"+tagA_class+"[href*='"+itemId+"&']")[0].id="toClick"
                setTimeout(function(){clickContainP.onclick($("#toClick")[0])},1000)
                
                return;
            }
            else if($("a"+tagA_class+"[href$='"+itemId+"']").length>=1)
            {
                GM_log("2.find url")
                $("a"+tagA_class+"[href$='"+itemId+"']")[0].id="toClick"
                setTimeout(function(){clickContainP.onclick($("#toClick")[0])},1000)
                return;
            }
        }
        else if($("a"+tagA_class+"[href*='"+url+"']").length>=1)
        {
            GM_log("3.find url")
            var evt1 = document.createEvent("MouseEvents");
            evt1.initMouseEvent("mousedown", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            var evt2 = document.createEvent("MouseEvents");     
            evt2.initMouseEvent ("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            $("a"+tagA_class+"[href*='"+url+"']")[0].id="toClick"
            setTimeout(function(){clickContainP.onclick($("#toClick")[0])},1000)
            return;
        }   
            
        if($(".page-info").length==0)
        {
            //only one page
            openItemPage()
        }
        else
        {
            pageinfo=$(".page-info")[0].innerHTML.split("/")
            pageIndex=parseInt(pageinfo[0],10)
            pageTotalNum=parseInt(pageinfo[1],10)
            GM_log("pageNum="+$(".page-info")[0].innerHTML)
            if(pageIndex==pageTotalNum)
            {
                //last page
                openItemPage();
            }
            else if(pageIndex<tryPageNum)
            {
                // go to next page
                GM_log($("#jumpto ")[0].nextSibling.nextSibling)
                //$("#jumpto")[0].nextSibling.nextSibling.click()
                setTimeout(function(){clickContainP.onclick($("#jumpto")[0].nextSibling.nextSibling)},1000)
            }
            else if(pageIndex==tryPageNum)//go to random page 
            {
                randomPageIndex=Math.round(Math.random()*(pageTotalNum-tryPageNum))%pageTotalNum+tryPageNum+1
                $("#jumpto")[0].value=randomPageIndex
                //$("#jumpto")[0].nextSibling.nextSibling.click()
                setTimeout(function(){clickContainP.onclick($("#jumpto")[0].nextSibling.nextSibling)},1000)
            }
            else if(pageIndex>tryPageNum)
            {
                //just jump to item url without finding the item url in search page
                openItemPage()
            }
        }
    }
    
    setTimeout(function()
        {
            checkUrlInPage()
        },1000)
}

function handleTaobaoItemPage()
{
    GM_log("handleTaobaoItemPage,location.href="+location.href)
	
	function getUrlParam(name)
	{
		var regexS;
		var regexl;
		var results;
		
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		regexS = "[\\?&]"+name+"=([^&#]*)";
		regex = new RegExp(regexS);
		results = regex.exec (location.href);
		//note: don't write space after command exec
		
		if ( results == null ) 
		{
			return "";
		}
		else 
		{
			return results[1];
		}
    }
 
	if(unsafeWindow.opener)
    {
        unsafeWindow.opener.close()
    }  
 
	itemTitle=""
 
	spm=getUrlParam("spm")
	if(spm=="")//direct visit
	{
		if($(".tb-detail-hd h3").length>0)
		{
			itemTitle=$(".tb-detail-hd h3")[0].lastChild.textContent
		}
	}

    var shopkeeper=""
    if($(".hCard ").length>0)
    {
        shopkeeper=$(".hCard ")[0].title
        
    }
    else if($(".shop-title a").length>0)
    {
        shopkeeper=$(".shop-title a")[0].innerHTML
        
    }
    else
    {
        //invalid shopkeeper, wrong page ?
        shopkeeper="invalid"
    }
	
	
    
    submitShopkeeper=document.createElement("div")
    submitShopkeeper.innerHTML="<form id='submitshopkeeper' action='http://caster.webfactional.com/submitshopkeeper' method='post' >\
                                    <input name='url' type='hidden' value='"+location.href+"'/>\
                                    <input name='shopkeeper' type='hidden' value='"+encodeURIComponent(shopkeeper)+"'/>\
									<input name='itemTitle' type='hidden' value='"+encodeURIComponent(itemTitle)+"'/>\
                                </form>"
    document.body.insertBefore(submitShopkeeper,null)
    GM_log("submitshopkeeper")
    setTimeout(function(){$("#submitshopkeeper")[0].submit()},6000)
}

function handleInvalidItemPage()
{
	setTimeout(function(){unsafeWindow.close()},2000)
}