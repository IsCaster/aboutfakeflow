// ==UserScript==
// @name          Better to get fake flow mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com 
// @include       http://www.hiwinwin.com/task/count/index.aspx
// @include       http://www.hiwinwin.com/task/count/
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx*
// @include       http://www.hiwinwin.com/Error.aspx
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// @version 1.02
// @updateURL http://www.fakeflowdb.com:9080/static/fakeflow.user.js
// @downloadURL http://www.fakeflowdb.com:9080/static/fakeflow.user.js
// ==/UserScript==

//disable log
//GM_log=function(){}

db_server1="http://caster.webfactional.com"
db_server2="http://www.fakeflowdb.com:9080"

//db_server_flag=GM_getValue("db_server_flag","undefined")
db_server_flag=2
if(db_server_flag=="undefined")
{
    GM_setValue("db_server_flag",1)
    db_server=db_server1
}
else if(db_server_flag==1)
{
    db_server=db_server1
}
else if(db_server_flag==2)
{
    db_server=db_server2
}

init()

unsafeWindow.gaussianGenerate = function (mean, stdev)
{
    function rnd_snd() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }
    return rnd_snd()*stdev+mean
}

if(location.href=="http://www.hiwinwin.com/task/count/" 
	|| location.href=="http://www.hiwinwin.com/task/count/index.aspx" )
{
    handleGetMissionPage()
}
else if( location.href=="http://www.hiwinwin.com/task/count/Taskin.aspx" )
{
    handleDoMissionPage()
}
else if(location.href.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx?id=")==0)
{
    handleGetMissionResultPage()
}

function init()
{
    var clickContainP=document.createElement("p");
    clickContainP.id='clickContain';
    clickContainP.onclick=function(obj)
    {
        /*if(typeof(obj.click)!="undefined")
        {
            GM_log(obj.click)
            obj.click();
            return
        }*/
        if(     (typeof(obj.onmouseover)!="undefined" && obj.onmouseover !=null ) ||
                (typeof(obj.onmousedown)!="undefined" && obj.onmousedown !=null ) ||
                (typeof(obj.onfocus)!="undefined" && obj.onfocus !=null ) ||
                (typeof(obj.onblur)!="undefined" && obj.onblur !=null ) ||
                (typeof(obj.onmouseup)!="undefined" && obj.onmouseup !=null ) ||
                (typeof(obj.onmouseout)!="undefined" && obj.onmouseout !=null ) ||
                (typeof(obj.onkeyup)!="undefined" && obj.onkeyup !=null ) ||
                (typeof(obj.onkeydown)!="undefined" && obj.onkeydown !=null ) ||
                (typeof(obj.onkeypress)!="undefined" && obj.onkeypress !=null ) ||
                (typeof(obj.oninput)!="undefined" && obj.oninput !=null ) ||
                (typeof(obj.onchange)!="undefined" && obj.onchange !=null ) ||
                (typeof(obj.onpaste)!="undefined" && obj.onpaste !=null ) 
            )
        {
            confirm("系统在检测外挂点击？？？")
            return 
        }
        
        if(obj.style.display!="" || obj.hidden )
        {
            confirm("点击目标不可见，系统在坑我吗？")
            return 
        }
        
        var evt1 = document.createEvent("MouseEvents");
        evt1.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt2 = document.createEvent("MouseEvents");
        evt2.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt3 = document.createEvent("MouseEvents");     
        evt3.initMouseEvent ("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt4 = document.createEvent("MouseEvents");     
        evt4.initMouseEvent ("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var evt5 = document.createEvent("MouseEvents");     
        evt5.initMouseEvent ("mouseout", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

		obj.dispatchEvent(evt1);
		obj.dispatchEvent(evt2);
        obj.focus()
		obj.dispatchEvent(evt3);
        obj.dispatchEvent(evt4);
        if( Math.random() > 0.5 )
        {
            obj.dispatchEvent(evt5);
        }
        //console.info("dispatch over")
    }
    document.body.insertBefore(clickContainP,document.body.firstChild);  	
}

/*
$0.onclick=function(){console.info ("click")}
$0.onmouseup=function(){console.info ("onmouseup")}
$0.onmousedown=function(){console.info ("onmousedown")}
$0.onmouseover=function(){console.info ("onmouseover")}
$0.onmouseout=function(){console.info ("onmouseout")}

$0.onkeyup=function(){console.info ("onkeyup")}
$0.onkeydown=function(){console.info ("onkeydown")}
$0.onkeypress=function(){console.info ("onkeypress")}
$0.onfocus=function(){console.info ("onfocus")}
$0.onblur=function(){console.info ("onblur")}
$0.oninput=function(){console.info ("oninput")}
$0.onchange=function(){console.info ("onchange")}
$0.onpaste=function(){console.info ("onpaste")}

$("#clickContain")[0].onclick($0)
*/

function handleGetMissionPage()
{
    function jumpToNextPage()
    {
        confirm("休息一下？点击会自动继续。")
        location.reload()
    }

    function checkMissionLink()
    {
        if($("#taskLst .p_l_20").length >= 1 )
        {  
            if($("#taskLst .link_t ").length >= 1 )
            {
                if (Math.random()<0.05)
                {
                    //long break 
                    var clickTimeout=Math.round(unsafeWindow.gaussianGenerate(30000,60000))
                    if(clickTimeout<30000)
                    {
                        clickTimeout=30000+Math.round(Math.random()*10000)
                    }
                }
                else
                {
                    //quick click
                    var clickTimeout=Math.round(unsafeWindow.gaussianGenerate(1000,2000))
                    if(clickTimeout<100)
                    {
                        clickTimeout=100+Math.round(Math.random()*100)
                    }
                    
                }
                GM_log("click get mission link timeout ="+clickTimeout)
                randomId=-1
                invalidMissionIdList=GM_getValue("invalidMissionId","")
                oldMissionIdList=GM_getValue("oldMissionId","")
                //start from the second one
                for(var i=0;i<$("#taskLst .link_t ").length;++i)
                {   
                    hi_mission_id=$("#taskLst .link_t ")[i].parentNode.parentNode.firstChild.nextSibling.innerHTML.replace(/^任务编号：/,"")
                    
                    if(invalidMissionIdList.indexOf(hi_mission_id+";")==-1  && oldMissionIdList.indexOf(hi_mission_id+";")==-1   )
                    {
                        randomId=i;
                        GM_log("randomId="+randomId+",missionId="+hi_mission_id)
                        break;
                    }
                }
                /*
                total=$("#taskLst .link_t ").length
                randomId=Math.round(Math.random()*total)%total
                */
                if(randomId==-1)
                {
                    jumpToNextPage()
                }
                else
                {
                    setTimeout(function(){$("#clickContain")[0].onclick($("#taskLst .link_t ")[randomId])},clickTimeout)
                }
            }

        }
        else
        {
            setTimeout(function(){checkMissionLink()},100)
        }
    }
    
    //check if it's a new day reset invalidMissionIdList oldMissionIdList
    var d = new Date();
    
    if( d.getMinutes()<30 && GM_getValue("reset_date","") != ""+d.getFullYear()+d.getMonth()+d.getDate())
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
    
    checkMissionLink();
}

function handleDoMissionPage()
{
    if($(".link_t ").length==2)
    {
        function openMissionDialog()
        { 
            if($("#dialog iframe").length==0)
            {
                GM_log("open mission dialog")
                $("#clickContain")[0].onclick( $(".link_t")[0] )
                //$(".link_t")[0].onclick() 
            }
            
            if($("#dialog iframe").length <= 0 )
            {
                confirm("程序出错，请联系管理员。No.160")
            }
            
            $("#dialog iframe")[0].loadtime=0
            $("#dialog iframe")[0].urls=new Array()
            $("#dialog iframe")[0].hi_mission_id=$(".link_t ")[0].parentNode.parentNode.firstChild.nextSibling.innerHTML
            $("#dialog iframe")[0].fake_spm=""
            $("#dialog iframe")[0].fetchResultTime ="0"
            
            $("#dialog iframe")[0].onload = iframeOnload
        }
        
        function iframeOnload()
        {
            unsafeWindow.getBase64Image = function (img) 
            {
                // Create an empty canvas element
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                // Copy the image contents to the canvas
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                

                // Get the data-URL formatted image
                // Firefox supports PNG and JPEG. You could check img.src to
                // guess the original format, but be aware the using "image/jpg"
                // will re-encode the image.
                var dataURL = canvas.toDataURL("image/png");

                //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                return dataURL
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
                fakeVisitDiv=document.createElement("div")
                fakeVisitDiv.innerHTML="<form id='fakevisit' action='"+db_server+"/fakevisit' method='post' target='_blank' >\
                                            <input name='url' type='hidden' value='"+url+"'/>\
                                            <input name='keyword' type='hidden' value='"+encodeURIComponent(keyword)+"'/>\
                                            <input name='message' type='hidden' value='"+encodeURIComponent(message)+"'/>\
                                            <input name='site' type='hidden' value='hiwinwin'/>\
                                        </form>"
                if($("#fakevisit").length==0)
                {
                    document.body.insertBefore(fakeVisitDiv,null) 
                }
                else
                {
                    $("#fakevisit")[0].outerHTML=fakeVisitDiv.innerHTML
                }
                $("#fakevisit")[0].submit()
            }
            
            function getCode()
            {
                //send VerificationPic to fakeflowdb
                var dataURL=unsafeWindow.getBase64Image($("#dialog iframe").contents().find("#imgCode")[0])
                GM_setValue("dataURL",dataURL)
                //GM_log("dataURL="+dataURL)
                
                //GM_log("get code")
                input = "codeImg="+encodeURIComponent(dataURL)
                GM_log(input)
                GM_xmlhttpRequest({
                    method: "POST",
                    url: db_server+"/querynewcode",
                    data: input,
                    headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(xhr) {
                            data=eval('('+xhr.responseText+')')
                            GM_log("data.code="+data.code)
                            
                            $("#clickContain")[0].onclick($("#dialog iframe").contents().find("#code")[0])
                            $("#dialog iframe").contents().find("#code")[0].value=data.code;
                            
                            fillUrls()
                        }
                    }
                )
            }
            
            
            function fillUrls()
            {
                var bCodeErr=false
                if($("#dialog iframe").contents().find(".error_panel").length>=1&&$("#dialog iframe").contents().find(".error_panel")[0].innerHTML.indexOf("验证码不正确")!=-1)
                {
                    //try again
                    $("#dialog iframe")[0].loadtime=$("#dialog iframe")[0].loadtime-1
                    bCodeErr=true
                }
                else if ($("#dialog iframe").contents().find(".error_panel").length>=1&&$("#dialog iframe").contents().find(".error_panel")[0].innerHTML.indexOf("商品网址验证失败")!=-1)
                {
                    if($("#dialog iframe")[0].loadtime>=2)
                    {
                        //GM_log("previous url link")
                        //show previous url link
                        preUrlLink=$("#dialog iframe")[0].contentDocument.createElement("a")
                        preUrlLink.innerHTML="之前尝试的url"
                        preUrlLink.href=GM_getValue("url","")
                        $("#dialog iframe").contents().find(".bar_dl")[0].insertBefore(preUrlLink,null)
                        
                        //fail before
                        //send fail message

                        if($("#dialog iframe")[0].fetchResultTime!="-1" &&( $("#dialog iframe")[0].fetchResultTime!="0" || $("#dialog iframe")[0].loadtime>$("#dialog iframe")[0].urls.length))
                        {
                            //if fetchResultTime == "0" && $("#dialog iframe")[0].loadtime<=$("#dialog iframe")[0].urls.length don't send fail message
                            message=GM_getValue("message")
                            shopkeeper=GM_getValue("shopkeeper","")
                            itemId=""
                            url=preUrlLink.href
                            if(typeof(GM_getValue("itemId"))!="undefined")
                            {
                                itemId=GM_getValue("itemId")
                            }
                            site="hiwinwin"
                            
                            fetchResultTime=$("#dialog iframe")[0].fetchResultTime
                            //submit success url
                            input = "message="+encodeURIComponent(message)+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site+";fetchResultTime="+fetchResultTime
                                    +";idInSite="+$("#dialog iframe")[0].hi_mission_id
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
                                        //GM_log('validResultWindow : '+validResultWindow)
                                    }
                                })
                        }
                    }
                }
                
                
                while($("#dialog iframe")[0].loadtime<=$("#dialog iframe")[0].urls.length)
                {
                    if($("#dialog iframe")[0].urls[$("#dialog iframe")[0].loadtime-1].indexOf('http://')==0)
                    {
                        GM_log("url No."+$("#dialog iframe")[0].loadtime+" ,try it now ,url="+$("#dialog iframe")[0].urls[$("#dialog iframe")[0].loadtime-1])
                        
                        url = $("#dialog iframe")[0].urls[$("#dialog iframe")[0].loadtime-1]
                        $("#dialog iframe").contents().find("#itemurl")[0].value=url;
                        GM_setValue("url",url)

                        if($("#dialog iframe")[0].loadtime >= 1  || bCodeErr )
                        {
                            var checkUrlTimeout=Math.round(unsafeWindow.gaussianGenerate(10000,2000))
                            if(checkUrlTimeout<4669)
                            {
                                checkUrlTimeout=4669+Math.round(Math.random()*1000)
                            }
                            
                            
                            
                            if($("#dialog iframe")[0].fetchResultTime=="0") //need 2 fakevisit 
                            {
                                //fake visit item on taobao.com
                                GM_log("doFakeVisit No.279")
                                doFakeVisit(url)
                            }
                            else
                            {
                                // just open the item link
                                $("#openContainIframe").contents().find("#openContainA")[0].href=urls[url_index]
                                $("#openContainIframe").contents().find("#openContainA")[0].click()

                            }
                            
                            GM_log("route 1 : click,checkUrlTimeout="+checkUrlTimeout)

                            setTimeout(function(){
                                    $("#clickContain")[0].onclick($("#dialog iframe").contents().find("#imgCode + input")[0]);
                                },
                                checkUrlTimeout
                            )

                        }
                        else
                        {
                            GM_log("should not be here, No.296")
                        }
                        return ;
                    }
                    else
                    {
                        $("#dialog iframe")[0].loadtime=$("#dialog iframe")[0].loadtime+1
                    }
                }
                if($("#dialog iframe")[0].loadtime>$("#dialog iframe")[0].urls.length)
                {
                    //no more urls
                    getUrls()
                }
            }
            
            function getUrls()
            {
                //init 
                $("#dialog iframe")[0].loadtime=0
                $("#dialog iframe")[0].urls=new Array()
                $("#dialog iframe")[0].fetchResultTime ="0"
            
                //get messages
                var message="";
                var site="hiwinwin";
                var shopkeeper="";
                client=$(".top_right .f_b_org")[0].innerHTML // username
                var missionType="none"
                if($("#dialog iframe").contents().find(".f_b_green + td")[1].innerHTML.indexOf("根据搜索提示打开搜索结果列表中掌柜名为：")>=0)
                {
                    missionType="inSearchPage"
					message+=$("#dialog iframe").contents().find(".main_dl strong")[1].innerHTML+";"//put the shopkeeper in front
                    message+=$("#dialog iframe").contents().find(".main_dl strong")[0].innerHTML+";"
                    shopkeeper=$("#dialog iframe").contents().find(".main_dl strong")[1].innerHTML+";"
                    message+=$("#dialog iframe").contents().find(".f_b_green + td")[3].innerHTML+";"
                }
                else
                {
                    missionType="inShop"
                    for(var i=0;i<$("#dialog iframe").contents().find(".main_dl strong").length ;++i)
                    {
                        message+=$("#dialog iframe").contents().find(".main_dl strong")[i].innerHTML+";"
                    }
                    message+=$("#dialog iframe").contents().find(".f_b_green + td")[3].innerHTML+";"//提示信息
                    
                    shopkeeper=$("#dialog iframe").contents().find(".main_dl strong")[0].innerHTML+";"
                }
                GM_setValue("message",message)
                GM_setValue("shopkeeper",shopkeeper.replace(/\s*/g,""))
                
                // generate fake spm param
                if($("#dialog iframe")[0].fake_spm=="")
                {
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
                    if(missionType=="inSearchPage")
                    {
                        part1=Math.floor(Math.random()*120)
                        part2=generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                            +generateLetterOrNumber()+generateLetterOrNumber()+generateLetterOrNumber()
                        $("#dialog iframe")[0].fake_spm="a230r.1.14."+part1+"."+part2
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
                        $("#dialog iframe")[0].fake_spm="a1z10."+part1+part2+"."+part3+"."+part4
                    }
                    else
                    {
                        $("#dialog iframe")[0].fake_spm=""
                    }
                    GM_log('$("#dialog iframe")[0].fake_spm='+$("#dialog iframe")[0].fake_spm)
                }
                
                //GM_log("post message")
                input=	'message='+encodeURIComponent(message)+
                        ';shopkeeper='+encodeURIComponent(shopkeeper)+
                        ';site='+site+
                        ';local='+GM_getValue("bLocal","90002")+
                        ";client="+encodeURIComponent(client)+
                        ";idInSite="+$("#dialog iframe")[0].hi_mission_id
                
				// request=$.get(db_server+"/queryurl",input,function(data){
                // GM_log("query return");
                // },"json")
                
                //var jsonString=JSON.stringify(input).replace(/:/g,'=').replace(/^{/,'').replace(/}$/,'')
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
                            //$("#dialog iframe")[0].itemId=data.itemId
                            GM_setValue("itemId",data.itemId)
                            GM_log("GM_getValue('itemId')="+GM_getValue('itemId'))
                        }    
                        else
                        {
                            GM_setValue("itemId","")
                            //$("#dialog iframe")[0].itemId=""
                        }
                        
                        
                        if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
                        {
                            //GM_log("data.urls.length="+data.urls.length)
                            $("#dialog iframe")[0].urls=data.urls
                            

                            if($("#dialog iframe")[0].fake_spm!="")
                            {
                                for (var i =0 ;i< $("#dialog iframe")[0].urls.length; ++i)
                                {
                                    // replace spm
                                    $("#dialog iframe")[0].urls[i]=$("#dialog iframe")[0].urls[i].replace(/&spm=[0-9a-zA-Z\.\-]*/,"&spm="+$("#dialog iframe")[0].fake_spm)
                                    $("#dialog iframe")[0].urls[i]=$("#dialog iframe")[0].urls[i].replace(/\?spm=[0-9a-zA-Z\.\-]*&/,"?spm="+$("#dialog iframe")[0].fake_spm+"&")
                                    
                                    if($("#dialog iframe")[0].urls[i].indexOf($("#dialog iframe")[0].fake_spm) < 0)
                                    {
                                        // add fake_spm
                                        $("#dialog iframe")[0].urls[i]=$("#dialog iframe")[0].urls[i].replace(/\?/,"?spm="+$("#dialog iframe")[0].fake_spm+"&")
                                    }
                                }
                            }
                            $("#dialog iframe")[0].loadtime=1
                            if(typeof(data.fetchResultTime)!="undefined")
                            {

                                $("#dialog iframe")[0].fetchResultTime=data.fetchResultTime
                            }
                            else
                            {
                                $("#dialog iframe")[0].fetchResultTime="0"
                            }

                            fillUrls()
                        }
                        else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                        {
                            // useless now
                            // something old status with RunMode
                        }
                        else if (data.status>=30001&&data.status<40000)
                        {
                            setTimeout(getUrls,3000)
                            $("#dialog iframe")[0].fetchResultTime="-1"
                            //$("#playAudioGot")[0].play()
                        }
                        else if (data.status==40001)
                        {
                            var invalidMissionIdList=GM_getValue("invalidMissionId","")
                            if(invalidMissionIdList.indexOf($("#dialog iframe")[0].hi_mission_id+";")==-1)
                            {
                                invalidMissionIdList=invalidMissionIdList+$("#dialog iframe")[0].hi_mission_id+";"
                                GM_setValue("invalidMissionId",invalidMissionIdList)
                            }
                            
                            setTimeout(function(){$("#dialog iframe").contents().find("#quitMissionBtn")[0].click()},10124)
                        }
                        else
                        {
                            GM_log("return wrong status ! data.status="+data.status)
                            $("#dialog iframe")[0].fetchResultTime="-1"
                        }

                        
                    }
                });
                
                //GM_log("after post message")
            }
            
            this.loadtime=this.loadtime+1
            
            // check scripts changes
            iframeScriptStr='\n'+
                            '  function checkForm() {\n'+
                            '    if (getValue("itemurl").indexOf("http://") != 0) {\n'+
                            '      return doAlert("商品网址不正确", getObj("itemurl"));\n'+
                            '    }\n'+
                            '    var checks = [\n'+
                            '    ["isEmpty", "itemurl", "商品地址"],\n'+
                            '    ["isEmpty", "code", "验证码"]];\n'+
                            '    var result = doCheck(checks);\n'+
                            '    if (result)\n'+
                            '      return avoidReSubmit();\n'+
                            '    return result;\n'+
                            '  }\n'+
                            '  function isReport() {\n'+
                            '    return confirm("您确定该来路是无效的么？");\n'+
                            '  }\n'

            
            if (this.contentDocument.scripts.length!=0 &&
                    (
                    this.contentDocument.scripts.length!=3 ||
                    this.contentDocument.scripts[0].outerHTML != '<script type="text/javascript" src="../js/common.js"></script>' ||
                    this.contentDocument.scripts[1].outerHTML != '<script type="text/javascript" src="../js/task.js"></script>' ||
                    this.contentDocument.scripts[2].innerHTML != iframeScriptStr
                    )
                )
            {
                confirm("脚本有变动，在检测外挂？请联系管理员")
                return 
            }
            
            
            //quit mission button
			quitMissionBtn=this.contentDocument.createElement("input")
			quitMissionBtn.value="退出任务"
			quitMissionBtn.type="button"
			quitMissionBtn.id="quitMissionBtn"
			quitMissionBtn.onclick=function()
			{
				$("#clickContain")[0].onclick( $("#ff_ss")[0] )
                isQuitTskString='function isQuitTsk() {\n'+
                    '    return confirm("您确定要退出该任务么？");\n'+
                    '  }'
                if( isQuitTskString==unsafeWindow.isQuitTsk.toString())
                {
                    unsafeWindow.isQuitTsk=function(){return true}
                }
                else
                {
                    confirm("程序出错，isQuitTsk出现变化，请联系管理员！")
                    return 
                }
                setTimeout(
                        function()
                        {
                            $("#clickContain")[0].onclick( $(".link_t ")[1] )
                        },
                        1015+Math.random()*2000
                    )
                
				//$(".link_t ")[1].click()
			}
			$("#dialog iframe").contents().find("#goon")[0].parentElement.insertBefore(quitMissionBtn,null)
            
            var openContainIframe = document.createElement("iframe");
            openContainIframe.id="openContainIframe"
            document.body.insertBefore(openContainIframe,null) 
            var openContainA = $("#openContainIframe")[0].contentDocument.createElement("a");
            openContainA.target="_blank"
            openContainA.rel="noreferrer"
            openContainA.id="openContainA"
            $("#openContainIframe")[0].contentDocument.body.insertBefore(openContainA,null) 
            
            
            
            //check if it's a success dialog
            if($("#dialog iframe").contents().find(".tip_less").length==1)
            {
                if($("#dialog iframe").contents().find(".tip_less")[0].innerHTML.indexOf("商品网址验证成功，成功完成来路访问")>=0)
                {
                    // success
                    GM_log("mission completed ,fetchResultTime="+this.fetchResultTime)
                    
                    client=$(".top_right .f_b_org")[0].innerHTML // username

                    if(this.fetchResultTime!="0")//need 2 submit result
                    {
                        message=GM_getValue("message")
                        shopkeeper=GM_getValue("shopkeeper","")
                        itemId=""
                        if(typeof(GM_getValue("itemId"))!="undefined")
                        {
                            itemId=GM_getValue("itemId")
                        }
                        //code=GM_getValue("code")
                        //codeImg=GM_getValue("codeImg")
                        url=GM_getValue("url")
                        site="hiwinwin"
                        
                        //submit success url
                        input = "message="+encodeURIComponent(message)+";shopkeeper="+encodeURIComponent(shopkeeper)+
                            ";itemId="+itemId+";url="+encodeURIComponent(url)+
                            ";site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)+
                            ";idInSite="+$("#dialog iframe")[0].hi_mission_id
                        
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
                            }
                        })

                        //submit success code
                        // input = "codeImg="+encodeURIComponent(codeImg)+";code="+encodeURIComponent(code)
                        // GM_log("input="+input)
                        // GM_xmlhttpRequest({
                            // method: "POST",
                            // url: db_server+"/submitcode",
                            // data: input,
                            // headers: {
                            // "Accept": "application/json",
                            // "Content-Type": "application/x-www-form-urlencoded",
                            // },
                            // onload: function(xhr) {
                                // GM_log('submit code return: response='+xhr.responseText)
                            // }
                        // })
                    }
                    else
                    {
                        //send heart beat packet
                        site="hiwinwin"                        
                        input = "site="+encodeURIComponent(site)+";client="+encodeURIComponent(client)
                        
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
                            }
                        })
                    }
                    // to do for test
                    //else
                    
                    if(this.fetchResultTime!="0" && this.fetchResultTime != "-1" )//&& this.fetchResultTime != "-1" ,need 2 fakevisit 
                    // fetchResultTime==-1 mean the urls is handled in local or invalid status
                    {
                        //fake visit item on taobao.com
                        GM_log("doFakeVisit No.692")
                        doFakeVisit(GM_getValue("url"))
                    }
                    
                    
                    clickTimeout=Math.round(unsafeWindow.gaussianGenerate(3000,3000))
                    if(clickTimeout<2035)
                    {
                        clickTimeout=2035+Math.round(Math.random()*1000)
                    }
                    setTimeout(
                        function()
                        {
                            if( $("#dialog iframe").length>0 && $("#dialog iframe").contents().find("#goon").length >0 )
                            {
                                GM_log("商品网址验证成功 click button[确定]")
                                $("#clickContain")[0].onclick( $("#dialog iframe").contents().find("#goon")[0] )
                                // $("#dialog iframe").contents().find("#goon")[0].onclick()
                            }
                        },
                        clickTimeout
                    )
                    return
                }
            }
            else
            {
                getCode()
            }
            

        }
        
        viewMissionTimeout=Math.round(unsafeWindow.gaussianGenerate(4000,5000))
        if(viewMissionTimeout<2124)
        {
            viewMissionTimeout=2124+Math.round(Math.random()*1000)
        }
        
        setTimeout(openMissionDialog ,viewMissionTimeout) 
    }
    else if($(".link_t ").length==0)
    {
        // no mission now ,jump to get new mission
        clickTimeout=Math.round(unsafeWindow.gaussianGenerate(3000,3000))
        if(clickTimeout<2035)
        {
            clickTimeout=2035+Math.round(Math.random()*1000)
        }
        setTimeout(
            function()
            {
                if($(".menu_you a").length > 0)
                {
                    //$(".menu_you a")[0].click()
                    $("#clickContain")[0].onclick( $(".menu_you a")[0] )
                }
            },
            clickTimeout
        )
        
    }
    else if($(".link_t ").length>2)
    {
        confirm("怎么就有多个任务了?")
    }
}


function handleGetMissionResultPage()
{
    if( document.scripts[0].innerHTML.indexOf("对不起，您慢了一步，请您接手其他的任务") >=0 )
    {
        var clickTimeout=Math.round(unsafeWindow.gaussianGenerate(4000,20000))
        if(clickTimeout<1169)
        {
            clickTimeout=1169+Math.round(Math.random()*1000)
        }
        GM_log("wait to jump")
        if(document.scripts[0].innerHTML.indexOf("alert")==0)
        {
            setTimeout(function() {eval(document.scripts[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))},clickTimeout )
        }
        else
        {
            confirm("返回的代码不在预期范围内，请联系管理员")
        }
    }
    //'对不起，您的IP接手该任务已超过该任务的IP要求'
    //'对不起，您接手该任务已超过该任务限制的接手次数'
    else if( document.scripts[0].innerHTML.indexOf("对不起，您的IP接手该任务已超过该任务的IP要求") >=0 ||
        document.scripts[0].innerHTML.indexOf("对不起，您接手该任务已超过该任务限制的接手次数") >=0
    )
    {
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
         
            if ( results == null ) {
                return "";
            } else {
                return results[1];
            }
        }
        missionId=getUrlParam("id")
        
        var oldMissionIdList=GM_getValue("oldMissionId","")
        if(oldMissionIdList.indexOf(missionId+";")==-1)
        {
            oldMissionIdList=oldMissionIdList+missionId+";"
            GM_setValue("invalidMissionId",oldMissionIdList)
        }
        
        var clickTimeout=Math.round(unsafeWindow.gaussianGenerate(4000,20000))
        if(clickTimeout<1169)
        {
            clickTimeout=1169+Math.round(Math.random()*1000)
        }
        GM_log("wait to jump")
        if(document.scripts[0].innerHTML.indexOf("alert")==0)
        {
            setTimeout(function() {eval(document.scripts[0].innerHTML.replace(/alert/,"GM_log").replace(/&amp;/,"&"))},clickTimeout )
        }
        else
        {
            confirm("返回的代码不在预期范围内，请联系管理员")
        }
    }
    else
    {
        confirm("未知信息，请联系管理员")
    }
}