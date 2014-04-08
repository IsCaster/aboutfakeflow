// ==UserScript==
// @name          Better to do fake flow mission of yuuboo, run at start
// @namespace     http://www.caster.org
// @description   used on fake flow Module of yuuboo.com 
// @include       http://www.yuuboo.com/doquest.php?publisher=*&number=*&type=pv&act=take
// @include       http://www.yuuboo.com/member/questinfo.php?questid=*&type=pv&act=isend&idd=*
// @include       http://www.yuuboo.com/member/questinfo.php?questid=*&type=pv&act=remove
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.0.min.js
// @version 1.00
// @updateURL http://www.fakeflowdb.com:9080/static/fakeflow_yb.user.js
// @downloadURL http://www.fakeflowdb.com:9080/static/fakeflow_yb.user.js
// @run-at document-start
// ==/UserScript==

//disable log
//GM_log=function(){}

if(location.href.replace(/http:\/\/www\.yuuboo\.com\/doquest\.php\?publisher=[0-9]*&number=[0-9]*&type=pv&act=take/,"")=="")
{
    handleGetQuestResultPage()
}
else if(location.href.replace(/http:\/\/www\.yuuboo\.com\/member\/questinfo.php\?questid=[0-9]*&type=pv&act=isend&idd=[0-9]*/,"")=="")
{
    handleCheckUrlResultPage()
}
else if(location.href.replace(/http:\/\/www\.yuuboo\.com\/member\/questinfo.php\?questid=[0-9]*&type=pv&act=remove/,"")=="")
{
    handleQuitQuestPage()
}


function handleGetQuestResultPage()
{
    unsafeWindow.alert= function(){}
    GM_log(document.scripts[0].innerHTML);
    if( document.scripts[0].innerHTML.indexOf("接手任务成功，你必须在30分钟内按照任务的提示在淘宝搜索卖家的宝贝，然后回平台确认浏览。") >= 0)
    {
        return
    }
    else if( document.scripts[0].innerHTML.indexOf("没有这个任务或已经被别人抢先接手！请重新接手其他任务！") >= 0 )
    {
        return
    }
    else if( document.scripts[0].innerHTML.indexOf("接手任务失败！可能已被别人抢先接手！请重新接手其他任务！") >= 0 )
    {
        return
    }
    else if( document.scripts[0].innerHTML.indexOf("出于安全考虑，同一IP一天只能接手30个来路流量任务，你当前IP是") >= 0 )
    {
        newBody=document.createElement("body");        
        document.body=newBody
        
        divContent=document.createElement("div");
        divContent.innerHTML=document.scripts[0].innerHTML
        divContent.id="js_content"
        document.body.insertBefore(divContent,null)                        
        
        //document.body.innerHTML=document.scripts[0].innerHTML
        document.scripts[0].innerHTML=""  
        confirm("要换ip了")
        return
    }
    else if( document.scripts[0].innerHTML.indexOf("出于安全交易的考虑，一个平台号一天只能接手同一个流量地址1次！") >= 0 )
    {
        newBody=document.createElement("body");        
        document.body=newBody
        
        divContent=document.createElement("div");
        divContent.innerHTML=document.scripts[0].innerHTML
        divContent.id="js_content"
        document.body.insertBefore(divContent,null)                        
        
        //document.body.innerHTML=document.scripts[0].innerHTML
        document.scripts[0].innerHTML=""  
    }
    else
    {
        confirm("未知的提示信息，请联系管理员")
    }
}

function handleCheckUrlResultPage()
{
    unsafeWindow.alert= function(){}
    GM_log(document.scripts[0].innerHTML);
    if( document.scripts[0].innerHTML.indexOf("你搜索到的网址不正确,请重新进行搜索！") >= 0 ||
        document.scripts[0].innerHTML.indexOf("确认浏览已完成，你已经获得发布点，发布方的流量也获得增加。加油！") >= 0 
        )
    {
        newBody=document.createElement("body");        
        document.body=newBody
        
        divContent=document.createElement("div");
        divContent.innerHTML=document.scripts[0].innerHTML
        divContent.id="js_content"
        document.body.insertBefore(divContent,null)                        
        
        //document.body.innerHTML=document.scripts[0].innerHTML
        document.scripts[0].innerHTML=""  
    }
    else
    {
        confirm("未知的提示信息，请联系管理员")
    }
}

function handleQuitQuestPage()
{
    unsafeWindow.alert= function(){}
    GM_log(document.scripts[0].innerHTML);
    if( document.scripts[0].innerHTML.indexOf("撤销接手成功，退出任务！") < 0  
        )
    {
        confirm("未知的提示信息，请联系管理员")
    }
}