// ==UserScript==
// @name          Better to get fake flow mission # when got a mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of hiwinwin.com ,work when got a mission ,play notification audio
// @include       http://www.hiwinwin.com/task/count/Taskin.aspx*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==
//http://www.hiwinwin.com/dialog/TaskCount.aspx?id=*
//http://courses.ischool.berkeley.edu/i290-4/f09/resources/gm_jq_xhr.js	

//disable log
//GM_log=function(){}

if(location.href=="http://www.hiwinwin.com/task/count/Taskin.aspx")
{
    annouceGetMission()
    handleMission()
}
else if(location.href.indexOf("http://www.hiwinwin.com/task/count/Taskin.aspx?id=")!=-1)
{
    var showMsg=document.createElement("p");
    showMsg.innerHTML=document.scripts[0].innerHTML;    
    document.body.insertBefore(showMsg,null);
}

if(document.referrer=="http://www.hiwinwin.com/task/count/")
{   
    unsafeWindow.opener.top.document.getElementById("annouceLoaded").onclick() 
}


function annouceGetMission()
{
    
    var playSoundDiv=document.createElement("div");
    playSoundDiv.id='playSoundOutter';

    document.body.insertBefore(playSoundDiv,null);

    playSoundDiv.innerHTML = " \
        <audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        ";
    
    $("#playAudioGot")[0].volume=0.3;
    
    //GM_log(".msg_panel div count = "+$(".msg_panel div").length)
    if($(".msg_panel div").length!=0 &&$(".msg_panel div")[0].innerHTML.indexOf("任务接手成功，请尽快完成任务。"!=-1))
    {
        // openerWindow = (function() { 
                                        // var el = unsafeWindow.opener.top.document.createElement('p');
                                        // el.setAttribute('onclick', 'return window;');
                                        // return el.onclick();
                                    // }())

        openerWindow=unsafeWindow.opener.top
        //missionWindow=unsafeWindow.opener.top.opener
        //GM_log("openerWindow  requestResult.onclick="+openerWindow.document.getElementById("requestResult").onclick)
        openerWindow.document.getElementById("annouceSuccess").onclick()
    }    
}


function handleMission()
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


    if($(".link_t ").length==2)
    {
        $(".link_t ")[0].onclick();
        $("iframe")[0].loadtime=0
		$("iframe")[0].urls=new Array()
        $("iframe")[0].onload = function()
        {
			// if(typeof(this.clickTimeId)!="undefined")
			// {
				// clearTimeout(this.clickTimeId)
			// }
            this.loadtime=this.loadtime+1
            GM_log("$(\"iframe\")[0].onload time count :"+this.loadtime)
            
            //check if it's a success dialog
            if($("iframe").contents().find(".tip_less").length==1)
            {
                if($("iframe").contents().find(".tip_less")[0].innerHTML.indexOf("商品网址验证成功，成功完成来路访问")>=0)
                {
                    // success
                    GM_log("mission completed ")
                    
                    if(GM_getValue("fetchResultTime",0)!=0)//need 2 submit result
                    {
                        message=GM_getValue("message")
                        shopkeeper=GM_getValue("shopkeeper","")
                        itemId=GM_getValue("itemId")
                        code=GM_getValue("code")
                        codeImg=GM_getValue("codeImg")
                        url=GM_getValue("url")
                        site="hiwinwin"
                        
                        //submit success url
                        input = "message="+encodeURIComponent(message.replace(/\s*/g,""))+";shopkeeper="+encodeURIComponent(shopkeeper)+
                            ";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site
                        
                        GM_log("input="+input)
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "http://www.fakeflowdb.com/submitresultsuccess",
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
                            // url: "http://www.fakeflowdb.com/submitcode",
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
                    unsafeWindow.doCut();
                    
                    unsafeWindow.opener.top.document.getElementById("annouceComplete").onclick() 
                    //location.href='./'
                    //location.href="about:blank"
                    return
                }
                else
                {
                    GM_log("something wrong, can't arrive here")
                }
            }
            
            //not a success dialog	
            
            
            //hook submit process
            //GM_log("hook submit process")        
            
            $("iframe").contents().find('#myForm')[0].onsubmit = function ()
            {
                GM_setValue("url",$("iframe").contents().find("#itemurl")[0].value)
                GM_setValue("code",$("iframe").contents().find("#code")[0].value)

                iframeCheckForm = (function() { 
                                        var el = $('iframe')[0].contentDocument.createElement('p');
                                        el.setAttribute('onclick', 'return window.checkForm;');
                                        return el.onclick();
                                    }())
                
                return iframeCheckForm();
            }
            
            // one click to select all
            $("iframe").contents().find(".main_dl strong")[0].onclick = function () {
                var userSelection;
                
                //GM_log("unsafeWindow.getSelection is a "+typeof(unsafeWindow.getSelection))
                //GM_log("this.firstChild is a "+typeof(this.firstChild))
                
                if ($("iframe")[0].contentWindow.getSelection) {  // W3C default
                    userSelection = $("iframe")[0].contentWindow.getSelection();
                }  // an extra branch would be necessary if you want to support IE
            
                var textNode = this.firstChild;
                var theRange = $("iframe")[0].contentDocument.createRange();
                //GM_log("theRange is a "+typeof(theRange))
                // select 10th–15th character (counting starts at 0)
                theRange.setStart(textNode, 0);
                theRange.setEnd(textNode, this.firstChild.length);
                //GM_log("this.firstChild.length = "+this.firstChild.length)
                //GM_log("userSelection.addRange is a "+typeof(userSelection.addRange))
                // set user selection    
                userSelection.addRange(theRange);

            };
            
			if($("iframe").contents().find(".f_b_green + td")[1].innerHTML.indexOf("根据搜索提示打开搜索结果列表中掌柜名为：")==-1)
			{
				$("iframe").contents().find(".main_dl strong")[1].onclick=$("iframe").contents().find(".main_dl strong")[0].onclick
            }
                        
            //send VerificationPic to fakeflowdb
            var dataURL=unsafeWindow.getBase64Image($("iframe").contents().find("#imgCode")[0])
            GM_setValue("dataURL",dataURL)
            //GM_log("dataURL="+dataURL)
            
            //GM_log("get code")
            input = "codeImg="+encodeURIComponent(dataURL)
            GM_log(input)
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://www.fakeflowdb.com/querycode",
                data: input,
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: function(xhr) {
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.code="+data.code)
                        $("iframe").contents().find("#code")[0].value=data.code;
                        
                        if($("iframe")[0].loadtime<=$("iframe")[0].urls.length)
                        {
							GM_log("url No."+$("iframe")[0].loadtime+" ,try it now ,url="+$("iframe")[0].urls[$("iframe")[0].loadtime-1])
							$("iframe").contents().find("#itemurl")[0].value=$("iframe")[0].urls[$("iframe")[0].loadtime-1];

							GM_log("click")
							$("iframe").contents().find("#imgCode + input")[0].click()
                        }
                    }
                })
            
            if(this.loadtime<=1)
            {
                //get messages
                var message="";
                var site="hiwinwin";
                var shopkeeper="";
                if($("iframe").contents().find(".f_b_green + td")[1].innerHTML.indexOf("根据搜索提示打开搜索结果列表中掌柜名为：")>=0)
                {
                    message+=$("iframe").contents().find(".main_dl strong")[0].innerHTML+";"
                    shopkeeper=$("iframe").contents().find(".main_dl strong")[1].innerHTML+";"
                    message+=$("iframe").contents().find(".f_b_green + td")[3].innerHTML+";"
                }
                else
                {
                    for(var i=0;i<$("iframe").contents().find(".main_dl strong").length ;++i)
                    {
                        message+=$("iframe").contents().find(".main_dl strong")[i].innerHTML+";"
                    }
                    message+=$("iframe").contents().find(".f_b_green + td")[3].innerHTML+";"//提示信息
                }
                GM_setValue("message",message.replace(/\s*/g,""))
                GM_setValue("shopkeeper",shopkeeper.replace(/\s*/g,""))
             
                //GM_log("post message")
                input=	'message='+encodeURIComponent(message.replace(/\s*/g,""))+
                        ';shopkeeper='+encodeURIComponent(shopkeeper)+
                        ';site='+site+
                        ';status='+0;
                
				// request=$.get("http://www.fakeflowdb.com/queryurl",input,function(data){
                // GM_log("query return");
                // },"json")
                
                //var jsonString=JSON.stringify(input).replace(/:/g,'=').replace(/^{/,'').replace(/}$/,'')
                GM_log(input)
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "http://www.fakeflowdb.com/queryurl",
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
                        data=eval('('+xhr.responseText+')')
                        GM_log("data.status = "+data.status)
                        if(typeof(data.itemId)!="undefined")
                            GM_setValue("itemId",data.itemId)
                        else
                            GM_setValue("itemId","")
                        
                        
                        if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
                        {
							//GM_log("data.urls.length="+data.urls.length)
							$("iframe")[0].urls=data.urls
							GM_log("$('iframe')[0].urls.length="+$('iframe')[0].urls.length)
                            $("iframe").contents().find("#itemurl")[0].value=data.urls[0];
							GM_log('$("iframe").contents().find("#code")[0].value='+$("iframe").contents().find("#code")[0].value)
                            if(typeof(data.fetchResultTime)!="undefined")
                            {
								//for test
								//$("#playAudioGot")[0].play()
                                GM_setValue("fetchResultTime",data.fetchResultTime)
                            }
                            else
                            {
                                GM_setValue("fetchResultTime",0)
                            }
							/*
                            if(typeof(data.code)!="undefined")
                            {
                                $("iframe").contents().find("#code")[0].value=data.code;
                                
                                $("iframe").contents().find("input[name='btnSubmit']").click();
                            }*/
							
                            if($("iframe").contents().find("#code")[0].value!="")
                            {
                                $("iframe").contents().find("#imgCode + input")[0].click()
                            }
                            
                        }
                        else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                        {
                            //unsafeWindow.doCut();
                            //location.herf=$(".link_t ")[1].href;
                            GM_setValue("fetchResultTime",-1)
                            //playmusic	
                            $("#playAudioGot")[0].play()
                        }
                        else
                        {
                            GM_setValue("fetchResultTime",-1)
                            //playmusic	
                            $("#playAudioGot")[0].play()
                        }

                    }
                });
                
                //GM_log("after post message")
            }
            else if(this.loadtime<=this.urls.length)//loadtime >= 2 && loadtime <= urls.length
			{
				// GM_log("url No."+this.loadtime+" ,try it now ,url="+this.urls[this.loadtime-1])
				// $("iframe").contents().find("#itemurl")[0].value=this.urls[this.loadtime-1];
				// if($("iframe").contents().find("#code")[0].value!="")
				// {
					// GM_log("click")
					// $("iframe").contents().find("#imgCode + input")[0].click()
				// }

			}
			else
            {
                GM_setValue("fetchResultTime",-1)
                //$("iframe").contents().find("#itemurl")[0].value=GM_getValue("url","")
                
                //playmusic	
                $("#playAudioGot")[0].play()
            }

            /*
            request.done(function(data)
                {
                    GM_log("done");
                    });
            request.fail(function(jqXHR, textStatus)
                {
                    GM_log( "Request failed: " + textStatus );
                    });      
            request.always(function(data)
                {
                    GM_log("always");
                    });
            */		
                   
            //GM_log("after set xhr")
			
			//temporary fix the problem of no click sometime
			// this.clickTimeId=setTimeout('if($("iframe").contents().find("#code")[0].value!="" && $("iframe").contents().find("#itemurl")[0].value != "")\
                            // {\
                                // $("iframe").contents().find("#imgCode + input")[0].click()\
                            // }',30000)
        }

    }
    else if($(".link_t ").length==0)
    {
        //jump to the getting mission page
    }

}