// ==UserScript==
// @name          log control of hiwinwin
// @namespace     http://www.caster.org
// @description   control login/logout on site hiwinwin.com
// @include       http://www.hiwinwin.com/member/Logon.aspx
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==

//disable log
//GM_log=function(){}
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


//for test
GM_setValue("userName","敲棋")
GM_setValue("password","yhcjc2w")
GM_setValue("opPassword","mhczc1w")
GM_setValue("questionId","0")
GM_setValue("answer","")
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
        var dataURL = unsafeWindow.getBase64Image($("#imgCode")[0])
        input = "codeImg="+encodeURIComponent(dataURL)
        GM_log(input)
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://caster.webfactional.com/querycode",
            data: input,
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            },
            onload: function(xhr) {
                data=eval('('+xhr.responseText+')')
                $("#code")[0].value=data.code
                setTimeout(function(){$("#btnSubmit").click()},5000+Math.random()*6000)
            }
        })
        
        
    }
    else
    {
        GM_log("userName="+userName+",password="+password+",opPassword="+opPassword+",answer="+answer)
        GM_log("miss login message")
    }
}
