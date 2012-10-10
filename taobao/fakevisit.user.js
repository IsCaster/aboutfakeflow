// ==UserScript==
// @name          fake visit item url
// @namespace     http://www.caster.org
// @description   1. fake visit item url on taobao.com , maybe reduce the chance of being added to blacklist 2. submit the shopkeeper information
// @include       http://caster.webfactional.com/fakevisit
// @include       http://s.taobao.com/search?q=*
// @include       http://item.taobao.com/item.htm?*
// @include       http://detail.tmall.com/item.htm?*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==
GM_log("enter GM script");
if(location.href.indexOf("http://caster.webfactional.com/fakevisit")!=-1)
{
	handleFakeVisitPage()
}
else if(location.href.indexOf("http://s.taobao.com/search?q=")!=-1)
{
	handleTaobaoSearchPage()
}
else if(location.href.indexOf("http://item.taobao.com/item.htm?")!=-1||location.href.indexOf("http://detail.tmall.com/item.htm?")!=-1)
{
	handleTaobaoItemPage()
}

function handleFakeVisitPage()
{
	GM_setValue("url",$("#url")[0].innerHTML.replace(/&amp;/g,"&"))
    keyword=$("#keyword")[0].innerHTML
    if(keyword=="")
    {
        // to do
        setTimeout(function(){unsafeWindow.close()},2000)
    }
    else
    {
        url="http://s.taobao.com/search?q="+keyword
        $("#keyword")[0].innerHTML=$("#keyword")[0].innerHTML+";"+url
        $("#searchpageframe")[0].contentWindow.open(url)    
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
            unsafeWindow.open(url)
        }
        openContainP.click()
    }
    var tryPageNum=4
    url=GM_getValue("url","")
    GM_log("handleTaobaoSearchPage,url="+url)
    if(url=="")
    {
        unsafeWindow.close()
        return;
    }
    if($("a[href*='"+url+"']").length>=1)
    {
        $("a[href*='"+url+"']")[0].click()
        return;
    }
    else
    {
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
            GM_log("pageTotalNum="+pageTotalNum)
            if(pageIndex==pageTotalNum)
            {
                //last page
                openItemPage();
            }
            else if(pageIndex<tryPageNum)
            {
                // go to next page
                GM_log($("#jumpto ")[0].nextSibling.nextSibling)
                $("#jumpto")[0].nextSibling.nextSibling.click()
            }
            else if(pageIndex==tryPageNum)//go to random page 
            {
                randomPageIndex=Math.round(Math.random()*(pageTotalNum-tryPageNum))%pageTotalNum+tryPageNum+1
                $("#jumpto")[0].value=randomPageIndex
                $("#jumpto")[0].nextSibling.nextSibling.click()
            }
            else if(pageIndex>tryPageNum)
            {
                //just jump to item url without finding the item url in search page
                openItemPage()
            }
        }
        
    }
}

function handleTaobaoItemPage()
{
    GM_log("handleTaobaoItemPage")
    if(unsafeWindow.opener)
    {
        unsafeWindow.opener.close()
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
                                </form>"
    document.body.insertBefore(submitShopkeeper,null)
    GM_log("submitshopkeeper")
    $("#submitshopkeeper")[0].submit()
}

