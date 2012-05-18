// ==UserScript==
// @name          fake flow mission for nmimi to complete mission
// @namespace     http://www.caster.org
// @description   used on fake flow Module of nmimi.com to complete a mission
// @include       http://wwww.nmimi.com/Mission/FMValid.aspx?id=*
// @include       http://www.nmimi.com/Mission/FMValid.aspx?id=*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

GM_log("enter GM script :fake flow mission for nmimi to complete mission");

/**
 * Get URL parameters
 * @param the name of the parameter from the URL to retrieve
 * @return the requested parameter value if exists else an empty string
 */
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

unsafeWindow.getNmmValue=function(key,defaultValue)
{
    missionId=unsafeWindow.getUrlParam("id");
    if(missionId.length>0)
    {
        keyMap=GM_getValue(key,"")
        if(keyMap.length>0)
        {
            i_start=keyMap.indexOf("id"+missionId+"=")
            if(i_start!=-1)
            {
                i_start=i_start+missionId.length+3
                i_end=keyMap.indexOf(";",i_start);
                return keyMap.substring(i_start,i_end);
            }
        }
    }
    if(typeof(defaultValue)=="undefined")
    {
        defaultValue=""
    }
    return defaultValue
}
unsafeWindow.setNmmValue=function(key,value)
{
    missionId=unsafeWindow.getUrlParam("id");
    if(missionId.length>0)
    {
        keyMap=GM_getValue(key,"")
        if(keyMap.indexOf("id"+missionId+"=")!=-1)
        {
            re_str="id"+missionId+"=[^;]*;"
            re = new RegExp(re_str);

            keyMap=keyMap.replace(re,"id"+missionId+"="+value+";")
            GM_setValue(key,keyMap)
        }
        else
        {
            keyMap=keyMap+"id"+missionId+"="+value+";"
            GM_setValue(key,keyMap)
        }
    }
}

unsafeWindow.delNmmValue=function(key)
{
    missionId=unsafeWindow.getUrlParam("id");
    if(missionId.length>0)
    {
        keyMap=GM_getValue(key,"")
        if(keyMap.indexOf("id"+missionId+"=")!=-1)
        {
            re_str="id"+missionId+"=[^;]*;"
            re = new RegExp(re_str);
            keyMap=keyMap.replace(re,"")
            GM_setValue(key,keyMap)
        }
    }
}


//add a feather ,click url input area ,select all text

$("#txtUrl")[0].onclick=function()
{
    GM_log("click #txtUrl")
    this.setSelectionRange(0, this.value.length);
    GM_log("5")
}

//handle invalid mission
var invalidMissionDiv=document.createElement("div")
invalidMissionDiv.innerHTML="<input type='button' id='invalidMissionBtn' value='无效任务' />"

$(".zheng")[0].insertBefore(invalidMissionDiv,null);

$("#invalidMissionBtn")[0].onclick = function()
{
    itemId=unsafeWindow.getNmmValue("itemId","")

    message=""
    site="nmimi"
    if($(".step + div").length>=1)
    {
        for(var i=0;i<$(".step + div").length;++i)
        {
            message=message+$(".step + div")[i].innerHTML+";"
        }
        GM_log("message="+message)
    }
    input = 'message='+encodeURIComponent(message)+
        ';itemId='+encodeURIComponent(itemId)+
        ';site='+site;
    GM_log(input)
    GM_xmlhttpRequest({
        method: "POST",
        url: "http://www.fakeflowdb.com/invalidmission",
        data: input,
        headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        },
        onload: function(xhr) {
            GM_log('submit invalid mission return: response='+xhr.responseText)
            location.href="http://www.fakeflowdb.com/close"
        }});

}

//check if mission completed
if(document.scripts[0].innerHTML=="window.opener.location.reload();alert('恭喜已验证成功！本页将关闭！');window.close();")
{
    GM_log("mission completed")
    message=unsafeWindow.getNmmValue("message")//it's already encodeURIComponent
    GM_log("1")
    itemId=unsafeWindow.getNmmValue("itemId")
    GM_log("2")
    url=unsafeWindow.getNmmValue("url")
    site="nmimi"
    GM_log("3")
    //submit success url
    input = "message="+message+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site
    
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
    //unsafeWindow.delNmmValue("message")
    location.href="http://www.fakeflowdb.com/close"
}

//hook submit url to nmimi.com process
if($('#linkValid').length>=1)
{
    $('#linkValid')[0].onclick=function()
    {
        unsafeWindow.setNmmValue("url",$("#txtUrl")[0].value)
        return true;
    }
}

//check the mission process
if(document.referrer==location.href)
{
    //mission query urls before
    //to do

}
else
{

    //new mission
    //get tips
    if($(".step + div").length>=1)
    {
        message="";
        for(var i=0;i<$(".step + div").length;++i)
        {
            message=message+$(".step + div")[i].innerHTML+";"
        }
        unsafeWindow.setNmmValue("message",encodeURIComponent(message))
        GM_log("message="+message)
        shopkeeper=""
        site="nmimi"

        input = 'message='+encodeURIComponent(message)+
				';shopkeeper='+encodeURIComponent(shopkeeper)+
				';site='+site;
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

				//response_data['status']
				// value       meaning
				// 10001       find url in urlCache
				// 10002       find url in database
				// 10003       find url in MissionQueue.doneBuffer
				// 10004       got url by mission customer, fetch result
				// 10005       changed detector to fetch result

				// 20001       timeout when wait for mission custmoer submit urls ,quit mission
				// 20002       no need to wait ,once timeout when wait for mission custmoer submit urls
				// 20003       same as 20002 ,just for debug to make it different
				// 20004       same as 20002 ,just for debug to make it different
                
                // 40001       invalid mission ,should quit the mission
				data=eval('('+xhr.responseText+')')
				GM_log("data.itemId is a "+typeof(data.itemId))
                if(typeof(data.itemId)!="undefined")
                    unsafeWindow.setNmmValue("itemId",data.itemId)

				if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
				{
					$("#txtUrl")[0].value=data.urls[0];
					if(typeof(data.fetchResultTime)!="undefined")
					{
						unsafeWindow.setNmmValue("fetchResultTime",data.fetchResultTime)
					}
					else
					{
						unsafeWindow.setNmmValue("fetchResultTime",0)
					}
                    $("#linkValid")[0].click()

				}
				else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
				{
					//unsafeWindow.doCut();
					//location.herf=$(".link_t ")[1].href;

				}
                else if(data.status==40001)
                {
                    location.href="http://www.fakeflowdb.com/close"
                }

			}
		});

		GM_log("after post message")
    }
}


// to do :decide when to play sound
// sound module
var playSoundDiv=document.createElement("div");
playSoundDiv.id='playSoundOutter';



//playSoundEmbed.src='file:///E:/MyDocuments/来路流量相关/tada.wav';
//playSoundEmbed.src='file:///F:/kugou/吴雨霏 - 句句我爱你.mp3';
//playSoundEmbed.width=100;
//playSoundEmbed.height=100;
//playSoundEmbed.loop=false;
//playSoundEmbed.autostart=true;
//var divTaskLst = unsafeWindow.getObj('taskLst');

document.body.insertBefore(playSoundDiv,null);

//playSoundDiv=unsafeWindow.getObj('playSoundOutter');

playSoundDiv.innerHTML = " \
	<audio id=\"playAudioGet2Work\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21112?filename%3get2work.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
	";
//http://storage.live.com/items/96902E43106FA83C%21109?filename%3dgot.ogg


$(".bbtton6_a")[0].timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);


GM_log("script end")