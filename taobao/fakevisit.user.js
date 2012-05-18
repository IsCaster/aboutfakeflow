// ==UserScript==
// @name          fake visit item url
// @namespace     http://www.caster.org
// @description   1. fake visit item url on taobao.com , maybe reduce the chance of being added to blacklist 2. submit the shopkeeper information
// @include       http://www.fakeflowdb.com/fakevisit
// @include       http://s.taobao.com/search?q=*
// @include       http://item.taobao.com/item.htm?*
// @include       http://detail.tmall.com/item.htm?*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==
GM_log("enter GM script");
if(location.href.indexOf("http://www.fakeflowdb.com/fakevisit")!=-1)
{
	handleFakeVisitPage()
}
else if(location.href.indexOf("http://s.taobao.com/search?q=")!=-1)
{
	handleTaobaoSearchPage()
}
else if(location.href.indexOf("http://www.16bang.com/returnFlow.asp")!=-1)
{
	handleTaobaoItemPage()
}

function handleFakeVisitPage()
{
	GM_setValue("url",$("#url")[0].innerHTML)
    keyword=$("#keyword")[0].innerHTML
    url="http://s.taobao.com/search?q="+encodeURIComponent(keyword)
    $("#searchpageframe")[0].contentWindow.open(url)
}

function handleTaobaoSearchPage()
{
    var tryPageNum=4
    url=GM_getValue("url","")
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
        pageinfo=$(".page-info")[0].innerHTML.split("/")
        pageIndex=parseInt(pageinfo[0],10)
        pageTotalNum=parseInt(pageinfo[1],10)
        if(pageIndex==pageTotalNum)
        {
            //last page
            unsafeWindow.open(url)
        }
        else if(pageIndex<tryPageNum)
        {
            // go to next page
            $("button[title='指定页码']")[0].click()
        }
        else if(pageIndex==tryPageNum)//go to random page 
        {
            randomPageIndex=Math.round(Math.random()*(pageTotalNum-tryPageNum))%pageTotalNum+tryPageNum+1
            $("input[title='指定页码']")[0].value=randomPageIndex
            $("button[title='指定页码']")[0].click()
        }
        else if(pageIndex>tryPageNum)
        {
            //just jump to item url without finding the item url in search page
            unsafeWindow.open(url)
        }
        
    }
}

function handleTaobaoItemPage()
{
    var shopkeeper=""
    if($(".hCard ").length>0)
    {
        shopkeeper=$(".hCard ")[0].title
        
    }
    else
    {
        //invalid shopkeeper, wrong page ?
        shopkeeper="invalid"
    }
    
    submitShopkeeper=document.createElement("div")
    submitShopkeeper.innerHTML="<form id='submitshopkeeper' action='http://www.fakeflowdb.com/submitshopkeeper' method='post' >\
                                    <input name='url' type='hidden' value='"+document.href+"'/>\
                                    <input name='shopkeeper' type='hidden' value='"+shopkeeper+"'/>\
                                </form>"
    document.body.insertBefore(submitShopkeeper,null)                        
    $("#submitshopkeeper")[0].submit()
}