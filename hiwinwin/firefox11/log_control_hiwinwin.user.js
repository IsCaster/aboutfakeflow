// ==UserScript==
// @name          log control of hiwinwin
// @namespace     http://www.caster.org
// @description   control login/logout on site hiwinwin.com
// @include       http://www.hiwinwin.com/member/Logon.aspx
// @include       http://www.hiwinwin.com/
// @include       http://www.hiwinwin.com/member/
// @include       http://www.hiwinwin.com/member/Password.aspx?*
// @include       http://www.hiwinwin.com/finance/Exchange.aspx?referrer=http%3a%2f%2fwww.hiwinwin.com%2fmember%2f
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
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

//init
if(GM_getValue("userName","")=="")
{
    GM_setValue("userName","abc")
    GM_setValue("password","1234")
    GM_setValue("opPassword","4567")
    GM_setValue("questionId","0")
    GM_setValue("answer","")
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


init()

unsafeWindow.gaussianGenerate = function (mean, stdev)
{
    function rnd_snd() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }
    return rnd_snd()*stdev+mean
}

if(location.href.indexOf("http://www.hiwinwin.com/member/Logon.aspx")!=-1)
{
    handleLoginPage()
}
else if(location.href=="http://www.hiwinwin.com/")
{
    $("#clickContain")[0].onclick($("a[href='http://www.hiwinwin.com/member/Logon.aspx']")[0])
}
else if(location.href=="http://www.hiwinwin.com/member/")
{
    if(document.referrer=="http://www.hiwinwin.com/member/Logon.aspx")
    {
        /*if(Math.random()>=0.5)//to do
        {
            setTimeout(function(){
                    //$("#ff_ss")[0].click()
                    $("a[href='../finance/Exchange.aspx']")[0].click()
                },1514+Math.random()*2000)
        }
        else*/
        {
            setTimeout(function(){
                    $("#clickContain")[0].onclick($("a[href='/task/count/']")[0])
                },1514+Math.random()*2000)
        }
    }
}
else if(location.href.indexOf("http://www.hiwinwin.com/member/Password.aspx?")!=-1)
{
    if(document.referrer.indexOf("http://www.hiwinwin.com/member/Password.aspx?")==-1)
    {
        setTimeout(function(){
                $("#password")[0].value=GM_getValue("opPassword")
                $("#clickContain")[0].onclick($("#btnSubmit")[0])
            },2324+Math.random()*2000)
    }
}
else if(location.href=="http://www.hiwinwin.com/finance/Exchange.aspx?referrer=http%3a%2f%2fwww.hiwinwin.com%2fmember%2f")
{
    if(document.referrer=="http://www.hiwinwin.com/member/Password.aspx?url=%2ffinance%2fExchange.aspx")
    {
        setTimeout(function(){
                $("#clickContain")[0].onclick($("a[href='/task/count/']")[0])
            },3123+Math.random()*2000)    
    }
}


function handleLoginPage()
{
    unsafeWindow.getBase64Image=function (img) {
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
    
    if($(".error_panel").length>=1)
    {
        if($(".error_panel")[0].innerHTML.indexOf("验证码不正确")==-1)
        {
            //password or username error ,abandon
            return;
        }
        //maybe image code error try again
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
        if(questionId!="0")
        {
            $("#questionId")[0].value=questionId
            $("#questionId")[0].onchange()
            $("#answer")[0].value=answer
        }
        else
        {
            $("#questionId")[0].value=questionId
            $("#questionId")[0].onchange()
        }
        setTimeout(function(){
                var dataURL = unsafeWindow.getBase64Image($("#imgCode")[0])
                input = "codeImg="+encodeURIComponent(dataURL)
                GM_log(input)
                GM_xmlhttpRequest({
                    method: "POST",
                    url: db_server+"/querycode",
                    data: input,
                    headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(xhr) {
                        data=eval('('+xhr.responseText+')')
                        $("#code")[0].value=data.code
                        setTimeout(function(){ 
                                $("#clickContain")[0].onclick($("#btnSubmit")[0])
                            },1000+Math.random()*4000)
                    }
                })
            }
        ,5000)
    }
    else
    {
        GM_log("userName="+userName+",password="+password+",opPassword="+opPassword+",answer="+answer)
        GM_log("miss login message")
    }
}

