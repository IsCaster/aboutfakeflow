// ==UserScript==
// @name          Better to do fake flow mission of yuuboo
// @namespace     http://www.caster.org
// @description   used on fake flow Module of yuuboo.com 
// @include       http://www.yuuboo.com/quest.php?type=pv*
// @include       http://www.yuuboo.com/member/doquest.php?type=pv&status=2
// @include       http://www.yuuboo.com/member/questinfo.php?questid=*&type=pv&act=isend&idd=*
// @include       http://www.yuuboo.com/doquest.php?publisher=*&number=*&type=pv&act=take
// @include       http://www.yuuboo.com/member/login.php*
// @include       http://www.yuuboo.com/member/index.php
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.0.min.js
// @version 1.00
// @updateURL http://www.fakeflowdb.com:9080/static/fakeflow_yb.user.js
// @downloadURL http://www.fakeflowdb.com:9080/static/fakeflow_yb.user.js
// ==/UserScript==

//disable log
//GM_log=function(){}

db_server="http://www.fakeflowdb.com:9080"


unsafeWindow.gaussianGenerate = function (mean, stdev)
{
    function rnd_snd() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }
    return rnd_snd()*stdev+mean
}

if(location.href.indexOf("http://www.yuuboo.com/quest.php?type=pv") == 0)
    //include http://www.yuuboo.com/quest.php?type=pv&page=2
{
    handleGetQuestPage()
}
else if(location.href=="http://www.yuuboo.com/member/doquest.php?type=pv&status=2" )
{
    handleDoQuestPage()
}
else if(location.href.replace(/http:\/\/www\.yuuboo\.com\/member\/questinfo.php\?questid=[0-9]*&type=pv&act=isend&idd=[0-9]*/,"")=="")
{
    handleCheckUrlResultPage()
}
else if(location.href.replace(/http:\/\/www\.yuuboo\.com\/doquest\.php\?publisher=[0-9]*&number=[0-9]*&type=pv&act=take/,"")=="")
{
    handleGetQuestResultPage()
}
else if(location.href.indexOf("http://www.yuuboo.com/member/login.php") == 0 )
{
    handleLoginPage()
}
else if(location.href=="http://www.yuuboo.com/member/index.php")
{
    handleMemberPage()
}

function doFakeVisit(url)
{
    //fake visit item on taobao.com
    //url=GM_getValue("url")
    
    if(typeof(url)=="undefined" || url == "")
    {
        confirm("doFakeVisit 出错，请联系程序员");
    }
    message=GM_getValue("message")
    keyword=message.split(";")[1]
    keyword=keyword.replace(/淘宝/g,"").replace(/关键词/g,"").replace(/搜索/g,"").replace(/搜/g,"").replace(/首页/g,"").replace(/所在地/g,"").replace(/地区/g,"")
    //keyword=""
    fakeVisitDiv=document.createElement("div")
    fakeVisitDiv.innerHTML="<form id='fakevisit' action='"+db_server+"/fakevisit' method='post' target='_blank' >\
                                <input name='url' type='hidden' value='"+url+"'/>\
                                <input name='keyword' type='hidden' value='"+encodeURIComponent(keyword)+"'/>\
                                <input name='message' type='hidden' value='"+encodeURIComponent(message)+"'/>\
                                <input name='site' type='hidden' value='yuuboo'/>\
                            </form>"
    if($("#fakevisit").length==0)
    {
        document.body.insertBefore(fakeVisitDiv,null) 
    }
    else
    {
        $("#fakevisit")[0].innerHTML=fakeVisitDiv.innerHTML
    }
    $("#fakevisit")[0].submit()
}


function handleGetQuestPage()
{
    GM_log("enter handleGetQuestPage")
    
    //check if it's 24:00:00 reset invalidMissionIdList oldMissionIdList
    var d = new Date();
    
    if(d.getHours()==0 && d.getMinutes()<30 && GM_getValue("reset_date","") != ""+d.getFullYear()+d.getMonth()+d.getDate())
    {
        GM_setValue("reset_date",""+d.getFullYear()+d.getMonth()+d.getDate())
        GM_log("reset invalidMissionIdList oldMissionIdList ,date : "+d.getFullYear()+d.getMonth()+d.getDate())
        
        GM_setValue("oldMissionId","")
        if(d.getDay()==1)
        {
            //reset invalidMissionIdList weekly
            GM_setValue("invalidMissionId","")
        }
    }
    
    var keepRefreshBtn=document.createElement("input");
    keepRefreshBtn.id="keepRefresh";
    keepRefreshBtn.type="button";
    if(GM_getValue("keepRefresh",0)==0)
    {
        keepRefreshBtn.value="off";
    }
    else
    {
        keepRefreshBtn.value="on";
    }
    keepRefreshBtn.onclick=function ()
    {
        setTimeout(function(){
                GM_log("keepRefresh="+GM_getValue("keepRefresh",0))
                if(GM_getValue("keepRefresh",0)==0)
                {
                    GM_setValue("keepRefresh",1);//valid keepRefresh
                    $("#keepRefresh")[0].value="on"
                    GM_log("valid keepRefresh");
                }   
                else
                {
                    GM_setValue("keepRefresh",0);//valid keepRefresh
                    $("#keepRefresh")[0].value="off"
                    GM_log("invalid keepRefresh");
                }
            },0)

      
    }
    
    $("div.dating")[0].insertBefore(keepRefreshBtn,$("div#questList")[0])
    
    
    if($(".tableList tr[title='把鼠标放到任务要求的图标上，会显示详细的说明哦～']").length < 0)
    {
        GM_log("wrong tableList items, maybe site updated! ")
        GM_setValue("keepRefresh",1);//invalid keepRefresh
        $("#keepRefresh")[0].value="off"
        confirm("tableList 有变化 外挂需要更新，请联系管理员")
    }
    
    if( GM_getValue( "keepRefresh",0 ) == 1 )
    {
        if($("a.button5").length>=1)
        {   
            refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(2000,2000))
            if(refreshTimeout<424)
            {
                refreshTimeout=424
            }
            
            var randomId=-1
            var invalidMissionIdList=GM_getValue("invalidMissionId","")
            var oldMissionIdList=GM_getValue("oldMissionId","")
              

            for(var i=0;i<$(".tableList tr[title='把鼠标放到任务要求的图标上，会显示详细的说明哦～'] ").length;++i)
            {   
                missionId=$(".tableList tr[title='把鼠标放到任务要求的图标上，会显示详细的说明哦～'] ")[i].childNodes[1].childNodes[4].textContent
                
                if(invalidMissionIdList.indexOf(missionId+";")==-1 && oldMissionIdList.indexOf(missionId+";")==-1  )
                {
                    GM_log("missionId="+missionId)
                    randomId=i;
                    break;
                }
            }
            GM_log("randomId= "+randomId)
            if(randomId==-1)
            {   
                //no valid quest maybe jump to next page
                GM_log ("no valid quest maybe jump to next page")
                
                jumpNextTimeout=Math.round(unsafeWindow.gaussianGenerate(4000,6000))
                if(jumpNextTimeout<2124)
                {
                    jumpNextTimeout=2124
                }
                setTimeout(function(){$("a.next")[0].click()},jumpNextTimeout);

                return;
                /*
                total_num=$(".tableList tr[title='把鼠标放到任务要求的图标上，会显示详细的说明哦～'] ").length
                
                GM_log("total_num= "+total_num)
                randomId=Math.floor(Math.random()*total_num)%total_num
                */
            }
            
            
            GM_log("randomId= "+randomId)
            setTimeout(function(){$(".tableList tr[title='把鼠标放到任务要求的图标上，会显示详细的说明哦～'] a.button5")[randomId].click()},refreshTimeout);
        }
        else
        {
            refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(10000,20000))
            if(refreshTimeout<2124)
            {
                refreshTimeout=2124
            }
            setTimeout(function(){location.reload()},refreshTimeout);
        }
    }
}


function handleDoQuestPage()
{
    if($(".tableList tr[title='点击“任务信息”按钮可以查看任务属性并对该任务进行操作！'] span.deeppurple a").length >= 1)
    {
        var openContainA = document.createElement("a");
        openContainA.target="_blank"
        openContainA.rel="noreferrer"
        openContainA.id="openContainA"
        document.body.insertBefore(openContainA,null) 
    
        waitingTimeout=Math.round(unsafeWindow.gaussianGenerate(2000,2000))
        if(waitingTimeout<424)
        {
            waitingTimeout=424
        }
        var missionId=$(".tableList tr[title='点击“任务信息”按钮可以查看任务属性并对该任务进行操作！'] span.deeppurple a")[0].innerHTML
        
        var bNewQuest=false
        if(GM_getValue("missionId","")!=missionId)
        {
            bNewQuest=true
            GM_setValue("missionId",missionId)
            var generateLetterOrNumber= function()
            {
                mark=Math.floor(Math.random()*(10+26*2))
                if(mark <10)
                {
                    return mark+""
                }
                else if (mark >= 10 && mark <= 35)
                {
                    nCharCode ="A".charCodeAt(0)+mark-10
                    return String.fromCharCode(nCharCode)
                }
                else if(mark >= 36 && mark < 62)
                {
                    nCharCode ="a".charCodeAt(0)+mark-36
                    return String.fromCharCode(nCharCode)
                }
                else
                {
                    return "z"
                }

            }
            
            
            if(1 || missionType=="inSearchPage" ) // always in this branch
            {
                part1=Math.floor(Math.random()*120)
                part2=generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                    +generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                fake_spm="a230r.1.14."+part1+"."+part2
                GM_log("fake_spm="+fake_spm)
            }
            else if(missionType=="inShop")
            {
                mark=Math.random()
                if(mark < 0.2 )
                {
                    part1="3.w4011-"
                }
                else if(mark >= 0.2 && mark < 0.4)
                {
                    part1="3.w4002-"
                }
                else if(mark >= 0.4 && mark < 0.6)
                {
                    part1="1.w4004-"
                }
                else if(mark >= 0.6 && mark < 0.8)
                {
                    part1="1.w5002-"
                }
                else
                {
                    part1="4.w5003-"
                }
                part2=Math.floor(Math.random()*9000000000)+1000000000
                part3=Math.floor(Math.random()*100)
                part4=generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                    +generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                fake_spm="a1z10."+part1+part2+"."+part3+"."+part4
            }
            
            GM_setValue("fake_spm",fake_spm)
        }
        
        setTimeout(
            function(){$(".tableList tr[title='点击“任务信息”按钮可以查看任务属性并对该任务进行操作！'] span.deeppurple a")[0].onclick()},waitingTimeout)
            
        //aui_title
        
        function waitForQuestDialog()
        {
            GM_log("waitForQuestDialog")
            if($(".aui_dialog .aui_title").length>=1 && $(".aui_dialog .aui_title")[0].innerHTML=="任务信息")
            {
                if(bNewQuest)
                {
                    setTimeout(function(){getUrls()},1000)
                }
                else
                {
                    var sUrls=GM_getValue("urls","")
                    var urls=sUrls.split(";caster;")
                    var url_index=GM_getValue("url_index",9999)
                    
                    GM_log("check urls["+url_index+"/"+urls.length+"]")
                    if(url_index < urls.length)
                    {
                        // just open the item link
                        $("#openContainA")[0].href=urls[url_index]
                        $("#openContainA")[0].click()
                    
                        GM_setValue("url_index",url_index+1)
                        GM_setValue("url",urls[url_index])
                        unsafeWindow.checkUrl(urls[url_index],false)
                    }
                    else
                    {
                        // wrong urls ,get new ones
                        setTimeout(function(){getUrls()},1000)
                    }
                }
                
            }
            else
            {
                setTimeout(function(){waitForQuestDialog()},2000)
            }
        }
        
        function getUrls()
        {
            GM_log("getUrls() enter")
            var message="";
            var site="yuuboo";
            var shopkeeper="";
            
            var client=$("div.outerLink b")[0].innerHTML
            if(client!=GM_getValue("client",""))
            {
                GM_setValue("client",client)
            }
            GM_log($("div.aui_content table.tableForm td")[1].innerHTML)
            shopkeeper=$("div.aui_content table.tableForm td ")[1].childNodes[3].innerHTML+";" // shopkeeper
            message += shopkeeper
            message += $("div.aui_content table.tableForm #key")[0] .innerHTML+";" //keyword
            message += $("div.aui_content table.tableForm #searchHelp")[0] .innerHTML+";" //hints
            message += $("div.aui_content table.tableForm td ")[1].firstChild.textContent+";" // shopkeeper's yuuboo account

            GM_setValue("message",message)
            GM_setValue("shopkeeper",shopkeeper)
            
            price=$("div.aui_content table.tableForm td span.red ")[0].innerHTML
            GM_setValue("price",price)
            
            input=	'message='+encodeURIComponent(message)+
            ';shopkeeper='+encodeURIComponent(shopkeeper)+
            ';site='+site+
            ';local='+"90002"+
            ";client="+encodeURIComponent(client)+
            ";idInSite="+missionId
            
            GM_log(input)
            GM_xmlhttpRequest({
                method: "POST",
                url: db_server+"/queryurl",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                    /*
                    response_data['status']  
                            
                    value       meaning
                    10001       find url in urlCache
                    10002       find url in database
                    10003       find url in MissionQueue.doneBuffer
                    10004       got url by mission customer, fetch result
                    10005       changed detector to fetch result
                    
                    20001       timeout when wait for mission custmoer submit urls ,quit mission
                    20002       no need to wait ,once timeout when wait for mission custmoer submit urls 
                    20003       same as 20002 ,just for debug to make it different
                    20004       same as 20002 ,just for debug to make it different
                    */
                    GM_log("queryurl xhr.responseText = \n"+xhr.responseText);
                    data=eval('('+xhr.responseText+')')
                    GM_log("data.status = "+data.status)
                    if(typeof(data.itemId)!="undefined")
                    {
                        GM_log("data.itemId = "+data.itemId)
                        GM_setValue("itemId",data.itemId)
                        GM_log("GM_getValue('itemId')="+GM_getValue('itemId'))
                    }    
                    else
                    {
                        GM_setValue("itemId","")
                        //$("iframe")[0].itemId=""
                    }
                    
                    if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
                    {
                        urls=data.urls;
                        url_index=0
                        if(urls.length >0 )
                        {
                            GM_setValue("urls",data.urls.join(";caster;"))
                            GM_setValue("url_index",url_index+1)
                            if(typeof(data.fetchResultTime)!="undefined")
                            {
                                GM_setValue("fetchResultTime",data.fetchResultTime)
                            }
                            else
                            {
                                GM_setValue("fetchResultTime","0")
                            }
                            GM_setValue("url",urls[0])
                            
                            if(data.fetchResultTime == "0" )//&& this.fetchResultTime != "-1" ,need 2 fakevisit 
                            {
                                //fake visit item on taobao.com
                                GM_log("doFakeVisit 1")
                                doFakeVisit(GM_getValue("url"))
                            }
                            else
                            {

                                // just open the item link
                                $("#openContainA")[0].href=GM_getValue("url")
                                $("#openContainA")[0].click()
                            }
                            unsafeWindow.checkUrl(urls[0],data.status!=10004)

                        }
                        else
                        {
                            confirm("返回的urls为空，程序出错，请联系管理员")
                        }

                    }
                    else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                    {
                        // useless now
                        
                        //unsafeWindow.doCut();
                        //location.herf=$(".link_t ")[1].href;
                        GM_setValue("fetchResultTime","-1")
                        if(typeof(data.trace)!="undefined")
                        {
                            GM_log(data.trace)
                        }
                    }
                    else if(data.status>=30001&&data.status<40000)
                    {
                        GM_setValue("fetchResultTime","-1")
                        setTimeout(function(){getUrls()},10000)
                    }
                    else if(data.status==40001)
                    {
                        //TODO quit quest
                        //annouce complete
                        GM_log("invalid quest")
                        
                        var invalidMissionIdList=GM_getValue("invalidMissionId","")
                        if(invalidMissionIdList.indexOf(missionId+";")==-1)
                        {
                            invalidMissionIdList=invalidMissionIdList+missionId+";"
                            GM_setValue("invalidMissionId",invalidMissionIdList)
                        }
                        
                        setTimeout(function(){$("div.aui_content table.tableForm td a span")[0].click()},10124)
                    }
                    else if(data.status=80000)
                    {
                        GM_setValue("keepRefresh",0)
                        setTimeout(function(){getUrls()},0)
                    }
                    else if(data.status=80001)
                    {
                        GM_setValue("keepRefresh",1)
                        setTimeout(function(){getUrls()},0)
                    }
                    else
                    {
                        GM_setValue("fetchResultTime","-1")
                    }   


                    
                }
            });
            
        }
        
        unsafeWindow.checkUrl = function( url, bWaitingLonger)
        {
            var fake_spm=GM_getValue("fake_spm","")
            if(fake_spm!="")
            {
                // replace spm
                url=url.replace(/&spm=[0-9a-zA-Z\.\-]*/,"&spm="+fake_spm)
                url=url.replace(/\?spm=[0-9a-zA-Z\.\-]*&/,"?spm="+fake_spm+"&")
                
                if(url.indexOf(fake_spm) < 0)
                {
                    // add fake_spm
                    url=url.replace(/\?/,"?spm="+fake_spm+"&")
                }
            }
        
            $("div.aui_content table.tableForm #usr")[0].value=url
            
            
            var checkUrlTimeout=7876
            if(!bWaitingLonger)
            {
                checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(15000,2000))
                if(checkUrlTimeout<5169)
                {
                    checkUrlTimeout=5169
                }
            }
            else
            {
                checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(25000,8000))
                if(checkUrlTimeout<9876)
                {
                    checkUrlTimeout=9876
                }
            }    
            
            GM_log("checkUrlTimeout="+checkUrlTimeout)
            setTimeout(function(){$("table.tableForm input[value='核对商品地址']")[0].click()},checkUrlTimeout)
        }
        
        waitForQuestDialog()
    }
    else if ($("#Head3").length >=1)
    {
        // no quest now ,jump to pick up quest
        
        var jumpTimeout=Math.round(unsafeWindow.gaussianGenerate(5000,5000))
        if(jumpTimeout<1169)
        {
            jumpTimeout=1169
        }
        setTimeout(function(){$("#Head3")[0].click()},jumpTimeout)
    }
}


function handleCheckUrlResultPage()
{
    
    if( $("#js_content")[0].innerHTML.indexOf("你搜索到的网址不正确,请重新进行搜索！") >=0 )
    {
        //submit fail
        message=GM_getValue("message")
        shopkeeper=GM_getValue("shopkeeper","")
        itemId=GM_getValue("itemId","")
        url=GM_getValue("url","")
        missionId=GM_getValue("missionId","")

        site="yuuboo"
        
        fetchResultTime=GM_getValue("fetchResultTime","")
        //submit success url
        input = "message="+encodeURIComponent(message)+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site+";fetchResultTime="+fetchResultTime
                +";idInSite="+missionId
        GM_log("submitresultfail:"+input)
        GM_xmlhttpRequest({
                method: "POST",
                url: db_server+"/submitresultfail",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                    GM_log('submit fail return: response='+xhr.responseText)
                    eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
                }
            })
    }
    else if($("#js_content")[0].innerHTML.indexOf("确认浏览已完成，你已经获得发布点，发布方的流量也获得增加。加油！") >=0 )
    {
        //submit success
        price =GM_getValue("price",0.26)
        client=GM_getValue("client","")
        
        
        
        
        if(GM_getValue("fetchResultTime","")!="0")//need 2 submit result
        {
            
            url=GM_getValue("url")
            doFakeVisit(url)
            
            message=GM_getValue("message","")
            shopkeeper=GM_getValue("shopkeeper","")
            itemId=GM_getValue("itemId","")
            site="yuuboo"
            missionId=GM_getValue("missionId","")
            
            //submit success url
            input = "message="+encodeURIComponent(message)+";shopkeeper="+encodeURIComponent(shopkeeper)+
                ";itemId="+itemId+";url="+encodeURIComponent(url)+
                ";site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)+
                ";idInSite="+missionId+";price="+price
            
            GM_log("input="+input)
            GM_xmlhttpRequest({
                method: "POST",
                url: db_server+"/submitresultsuccess",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                    GM_log('submit url return: response='+xhr.responseText)
                    
                    eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
                }
            })
        }
        else
        {
            //send heart beat packet
            client=GM_getValue("client","")
            site="yuuboo"                        
            input = "site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)+";price="+price
            
            GM_log("input="+input)
            GM_xmlhttpRequest({
                method: "POST",
                url: db_server+"/heartbeat",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                    GM_log('send heart beat packet return : response='+xhr.responseText)
                    
                    eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
                }
            })
        }
    }
    else if($("#js_content")[0].innerHTML.indexOf("对不起，该任务不存在或者已经被撤销！请注意，来路流量区的任务必须在接手后30分钟内完成！") >=0 )
    {
        eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
    }
}

function handleGetQuestResultPage()
{
    if( $("#js_content").length >=1 && $("#js_content")[0].innerHTML.indexOf("出于安全交易的考虑，一个平台号一天只能接手同一个流量地址1次！") >=0 )
    {
        //record old quest id
        
        unsafeWindow.getUrlParam = function (name) {
            var regexS;
            var regexl;
            var results;
         
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            regexS = "[\\?&]"+name+"=([^&#]*)";
            regex = new RegExp(regexS);
            results = regex.exec (location.href);
                    //note: don't write space after command exec
         
            if ( results == null ) {
                return "";
            } else {
                return results[1];
            }
        }
        
        var missionId=unsafeWindow.getUrlParam("number")
        
        var oldMissionIdList=GM_getValue("oldMissionId","")
        if(oldMissionIdList.indexOf(missionId+";")==-1)
        {
            oldMissionIdList=oldMissionIdList+missionId+";"
            GM_setValue("oldMissionId",oldMissionIdList)
        }
        eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
        
    }
    else if( $("#js_content").length >=1 && $("#js_content")[0].innerHTML.indexOf("您被该用户列入黑名单，不能接该任务！") >=0 )
    {
        //record invalid quest id
        
        unsafeWindow.getUrlParam = function (name) {
            var regexS;
            var regexl;
            var results;
         
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            regexS = "[\\?&]"+name+"=([^&#]*)";
            regex = new RegExp(regexS);
            results = regex.exec (location.href);
                    //note: don't write space after command exec
         
            if ( results == null ) {
                return "";
            } else {
                return results[1];
            }
        }
        
        var missionId=unsafeWindow.getUrlParam("number")
        
        var invalidMissionIdList=GM_getValue("invalidMissionId","")
        if(invalidMissionIdList.indexOf(missionId+";")==-1)
        {
            invalidMissionIdList=invalidMissionIdList+missionId+";"
            GM_setValue("invalidMissionId",invalidMissionIdList)
        }
        eval($("#js_content")[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))
        
    }
}

function handleLoginPage()
{
    if(GM_getValue("userName","")=="")
    {
        GM_setValue("userName","abc")
        GM_setValue("password","1234")
        GM_setValue("opPassword","4567")
        GM_setValue("questionId","-1")
        GM_setValue("answer","")
    }
    
    userName=GM_getValue("userName","")
    password=GM_getValue("password","")
    opPassword=GM_getValue("opPassword","")
    questionId=GM_getValue("questionId","")
    answer=GM_getValue("answer","")
    
    if(userName!=""&&password!=""&&opPassword!=""&&(questionId=="0"||answer!=""))
    {
        $("#username")[0].value=userName
        $("#password")[0].value=password
        
        if($("#question").length >=1 && questionId >= 0)
        {
            $("#question")[0].options[questionId].selected=true
            $("#answer")[0].value=answer
        }
        /*if(userName!="abc")
        {
            setTimeout(function(){$("#btnSubmit").click()},1000+Math.random()*4000)
        }*/
    }
    
}

function handleMemberPage()
{
    GM_log("enter handleMemberPage")
    
    if(document.referrer == "http://www.yuuboo.com/member/login.php")
    {
        if($(".aui_close").length>=1)
        {
            GM_log("close dialog")
            $(".aui_close")[0].click()
        }
        var jumpTimeout=Math.round(unsafeWindow.gaussianGenerate(5000,5000))
        if(jumpTimeout<2169)
        {
            jumpTimeout=2169
        }
        setTimeout(function(){$("#Head3")[0].click()},jumpTimeout)
    }
}