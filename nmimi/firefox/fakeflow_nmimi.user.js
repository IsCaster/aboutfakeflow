// ==UserScript==
// @name          fake flow mission for nmimi 
// @namespace     http://www.caster.org
// @description   used on fake flow Module of nmimi.com 
// @include       http://wwww.nmimi.com/Mission/MyAcceptFlowMission.aspx*
// @include       http://www.nmimi.com/Mission/MyAcceptFlowMission.aspx*
// @include       http://wwww.nmimi.com/Mission/FMValid.aspx?id=*
// @include       http://www.nmimi.com/Mission/FMValid.aspx?id=*
// @include       http://wwww.nmimi.com/Mission/FMDating.aspx*
// @include       http://www.nmimi.com/Mission/FMDating.aspx*
// @include       http://wwww.nmimi.com/Member/RecoverG.aspx*
// @include       http://www.nmimi.com/Member/RecoverG.aspx*
// @include       http://www.nmimi.com/AlarmMsg.aspx
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==

//GM_log("enter GM script");
//disable log
//GM_log=function(){}

//set run mode
//1: manual 2: auto
if(GM_getValue("runMode","undefined")=="undefined")
{
    GM_setValue("runMode",1)
}

//set run mode
//1: local 2: remote
if(GM_getValue("bLocal","undefined")=="undefined")
{
    GM_setValue("bLocal",90002)
}


if(location.href.indexOf("FMDating.aspx")!=-1)
{
    handleGetMissionPage()
}
else if(location.href.indexOf("FMValid.aspx")!=-1) 
{
    if(document.referrer.indexOf("MyAcceptFlowMission.aspx")!=-1)
    {
        handleValidPage();
    }
    else if(document.referrer==location.href)
    {
        handleValidResultPage();
    }
}
else if(location.href.indexOf("MyAcceptFlowMission.aspx")!=-1)
{
    handleMyMissonPage();
}
else if(location.href.indexOf("RecoverG.aspx")!=-1)
{
    handleRecoverGoldPage()
}

function handleMyMissonPage()
{

    //disable log
    GM_log=function(){}

    //clear saved GM settings
    GM_setValue("fetchResultTime","")
    GM_setValue("invalid","")
    GM_setValue("itemId","")
    GM_setValue("message","")
    GM_setValue("missionOpened","")
    GM_setValue("url","")
    GM_setValue("userName",$(".outerLink a")[0].innerHTML) //set client/userName
    unsafeWindow.keepRefresh=1
    
    var pageSize=15;//defined in http://wwww.nmimi.com/js/MyAFMData.js
    unsafeWindow.RefTask=function(page_index,s,autoOpen){
        GM_log("RefTask")
        
        setTimeout(function(){
            unsafeWindow.keepRefresh=GM_getValue("keepRefresh",0)
        },0)
        if(unsafeWindow.keepRefresh==0&&typeof(autoOpen)=="undefined")
        {
            return;
        }
        $("#divTaskBody").hide();
        $("#reLoad").show();
        var state = $("#ddlfmstate").val(); 
        
        unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/GetMyAcceptFlowMissions",{"pageIndex":page_index,"pageSize":s,"state":state}, function(result){
            GM_log("enter JOSN callback");
            if(result.state==1){
                unsafeWindow.artDialog({content:"服务器拒绝获取数据。原因：您的登录已失效，或者您已在其他地方登录！",id:"alarm"},function(){});
            }else if(result.state==2){
                unsafeWindow.artDialog({content:"服务器拒绝获取数据。原因：为了平台接任务的公平，以及减少平台服务器的压力，此页请不要打开多个！<br/>如果您长期没有操作，只需要按F5刷新本页即可！",id:"alarm"},function(){});
            }else{
                var rowsCount = result.sumRows;
                unsafeWindow.SetPage(page_index,rowsCount);
                var htm="";
                htm+="<table  border=\"0\" cellpadding=\"0\" cellspacing=\"0\">";
                htm+="<thead>";
                htm+="<tr>";
                htm+="<td colspan=\"7\">";
                htm+="<ul>";
                htm+="<li class=\"id\">任务编号</li>";
                htm+="<li class=\"price\">悬赏金币</li>";
                htm+="<li class=\"oktime\">总流量</li>";
                htm+="<li class=\"gold\">验证状态</li>";
                htm+="<li class=\"state\" style=\"width:140px;\">同IP可接数/单帐号可接数</li>";
                htm+="<li class=\"do\" style=\"width:50px;\">操作</li>";
                htm+="</ul>";
                htm+="</td>";
                htm+="</tr>";
                htm+="</thead>";
                htm+="<tbody>";
                for(var i=0;i<result.itemList.length;i++){
                    var item = result.itemList[i];
                    htm+="<tr>";
                    htm+="<td class=\"id\" style=\"width:190px;\">";
                    htm+="<p class=\"m\" title=\"来路流量任务\">";
                    
                    htm+=item.mId+"</p><em>Post Time："+item.createAt+"</em></td>";
                    htm+="<td class=\"price\"><p>"+ item.gPrice +"</p></td>";
                    htm+="<td class=\"oktime\"><p>"+ item.fc + "</p></td>";
                    htm+="<td class=\"gold\"><em>"+ (item.mState==255 ? "已完成":"进行中") +"</em></td>";
                    htm+="<td class=\"state\"><em>"+ item.ipvc + "/" + item.uvc + "</em></td>";
                    htm+="<td class=\"do\" align=\"right\">";
                    switch(item.mState){
                        case 1:
                            htm+="<p><a href=\"javascript:void(0)\" onclick=\"window.open('/Mission/FMValid.aspx?id="+ item.id +"');\" class=\"button4_a\">开始验证</a> <a href=\"javascript:void(0);\" onclick=\"CancelM('"+ item.id +"','"+ item.mId +"')\" class=\"button4_a\">取消</a></p>";
                            htm+="<p style=\"margin-bottom:3px;\">剩余验证时间：<span style=\"color:#090;\">"+(item.syMin > 0 ? item.syMin : 0)+"分钟</span></p>";
                            break;
                        case 255:
                            htm+= item.completedAt + "<p class=\"over\" style=\"margin-top:3px;\">已经完成</p>";
                            break;
                    }
                    htm+="</td>";
                    htm+="</tr>";
                }
                htm+="</tbody>";
                htm+="</table>";
                $("#divInfo").html(htm);
                $("#reLoad").hide();
                //GM_log("autoOpen="+autoOpen); 
                if((typeof(autoOpen)!="undefined"&&autoOpen==1)||page_index>=2)//index >=2 or click refresh manually,open all valid mission ,to do
                {
                    GM_log("manually Open")
                    setTimeout(function(){
                        var invalidList=GM_getValue("invalid","")
                        var missionOpened=GM_getValue("missionOpened","")
                        var missionOpening=""
                        var bResetTimeout = 0
                        
                        if(GM_getValue("runMode",2)==2)
                        {
                            open_count=0
                            for(var i=0;i<=$(".button4_a").length-2;i=i+2)
                            {
                                GM_log("open Mission No." + (i+2)/2);
                                
                                if(typeof(invalidList)!="undefined")
                                {
                                    missionId=$(".button4_a")[i].onclick.toSource().replace(/.*id=([0-9]*).*/,"$1")
                                    
                                    missionOpening=missionOpening+"id"+missionId+";"
                                    if(invalidList.indexOf("id"+missionId+"=1;")==-1)
                                    {
                                        if(missionOpened.indexOf("id"+missionId+";")==-1)
                                        {
                                            bResetTimeout=1   
                                        }
                                        
                                        if(open_count<8)//open 8 page max
                                        {
                                            $(".button4_a")[i].onclick();//点偶数的,是打开任务;奇数是取消任务.
                                            open_count=open_count+1
                                        }    
                                    }
                                    else
                                    {
                                        //invalid mission 
                                        GM_log("invalid mission id="+missionId)
                                    }
                                    
                                }

                            }
                        }
                        else
                        {
                            open_count=0
                            for(var i=$(".button4_a").length-2;i>=0;i=i-2)
                            {
                                GM_log("open Mission No." + (i+2)/2);
                                
                                if(typeof(invalidList)!="undefined")
                                {
                                    missionId=$(".button4_a")[i].onclick.toSource().replace(/.*id=([0-9]*).*/,"$1")
                                    
                                    missionOpening=missionOpening+"id"+missionId+";"
                                    if(invalidList.indexOf("id"+missionId+"=1;")==-1)
                                    {
                                        if(missionOpened.indexOf("id"+missionId+";")==-1)
                                        {
                                            bResetTimeout=1
                                        }
                                    
                                        if(open_count<8)//open 8 page max
                                        {
                                            $(".button4_a")[i].onclick();//点偶数的,是打开任务;奇数是取消任务.
                                            open_count=open_count+1
                                        }    
                                    }
                                    else
                                    {
                                        //invalid mission 
                                        GM_log("invalid mission id="+missionId)
                                    }
                                    
                                }

                            } 
                        }
                        if(bResetTimeout)
                        {
                            if(typeof($(".bbtton6_a")[0].timeoutId) != "undefined" && $(".bbtton6_a")[0].timeoutId !=0)
                            {
                                // get a new mission
                                GM_log("get a new mission ,reset timeout")
                                clearTimeout($(".bbtton6_a")[0].timeoutId);
                                $('#playAudioGet2Work')[0].pause();
                                $(".bbtton6_a")[0].timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
                            }    
                        }    
                        GM_setValue("missionOpened",missionOpening)
                    },0)
                }
                else if(typeof(autoOpen)!="undefined"&&autoOpen==2)//autoOpen,ignore page 2+
                {   
                    GM_log("autoOpen")
                    setTimeout(function(){
                        var invalidList=GM_getValue("invalid","")
                        var missionOpened=GM_getValue("missionOpened","")
                        var missionOpening=""
                        var bResetTimeout = 0
                        
                        for(var i=$(".button4_a").length-2;i>=0;i=i-2)
                        {
                            GM_log("open Mission No." + (i+2)/2);
                            
                            if(typeof(invalidList)!="undefined")
                            {
                                missionId=$(".button4_a")[i].onclick.toSource().replace(/.*id=([0-9]*).*/,"$1")
                                
                                missionOpening=missionOpening+"id"+missionId+";"
                                if(invalidList.indexOf("id"+missionId+"=1;")==-1 && missionOpened.indexOf("id"+missionId+";")==-1)
                                {
                                    bResetTimeout=1
                                    $(".button4_a")[i].onclick();//点偶数的,是打开任务;奇数是取消任务.
                                }
                                else
                                {
                                    //invalid mission 
                                    GM_log("invalid mission id="+missionId)
                                }
                                
                            }

                        }
                        
                        if(bResetTimeout)
                        {
                            if(typeof($(".bbtton6_a")[0].timeoutId) != "undefined" && $(".bbtton6_a")[0].timeoutId !=0)
                            {
                                // get a new mission
                                GM_log("get a new mission ,reset timeout")
                                clearTimeout($(".bbtton6_a")[0].timeoutId);
                                $('#playAudioGet2Work')[0].pause();
                                $(".bbtton6_a")[0].timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
                            }    
                        }
                        
                        GM_setValue("missionOpened",missionOpening)
                    
                    },0)
                

                }
            }

            $(".reListTitle tbody>tr:odd").addClass("tcolor");
            $(".reListTitle tbody td").css("border-width","0px");
            $("#divTaskBody").show();    
        });
        
    }


    $(".bbtton6_a")[0].onclick=function ()
    {	
        if(typeof(this.timeoutId) != "undefined" )
        {
            clearTimeout(this.timeoutId);
            GM_log("clearTimeout");
        }
        GM_log(typeof($('#playAudioGet2Work')[0].pause));
        $('#playAudioGet2Work')[0].pause();
        this.timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
        unsafeWindow.RefTask(1, pageSize, 1);
    }

    unsafeWindow.SetPage=function(index,rowsCount){
        var pageCount = parseInt(rowsCount/pageSize)+1;
        GM_log("index="+index);
        var htm="";
        if(index>1)
        htm+="<a class=\"page-prev\" href=\"javascript:GoPage("+(index-1)+");\">上一页</a>";
        for(i=1;i<=pageCount;i++){
        
        if( index==i )
        htm+="<a class=\"on\">"+i+"</a>";
        else
        htm+="<a href=\"javascript:GoPage("+i+");\">"+i+"</a>"
        }
        if(index<pageCount)
        htm+="<a class=\"page-next\" href=\"javascript:GoPage("+(index+1)+");\">下一页</a>";
        $(".pageno").html(htm);
    } 


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


    $(".bbtton6_a")[0].timeoutId=setTimeout(" $('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);

    if(GM_getValue("runMode",2)==2)
    {
		
        setInterval("RefTask(1, pageSize, 1);",60000)
    }
    else
    {
		//for debug
        setInterval("RefTask(1, pageSize, 2);",40000)
    }
    GM_log("handleMyMissionPage end")
}

function handleValidPage()
{
        /**
     * Get URL parameters
     * @param the name of the parameter from the URL to retrieve
     * @return the requested parameter value if exists else an empty string
     */
    //disable log
    //GM_log=function(){}
             
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

	unsafeWindow.initResultPageOnload = function(targetId)
	{
		//GM_log("targetId="+targetId)
		targetWindow=window.open("",targetId)
		targetWindow.onload = function()
		{
            if(this.location.href=="http://wwww.nmimi.com/AlarmMsg.aspx")
            {
                //mission expired
                this.location.href="javascript:window.close()"
				GM_log("mission expired")
				unsafeWindow.location.href="javascript:window.close()"
            }
			//check if mission completed
			if(this.document.scripts[0].innerHTML=="window.opener.location.reload();alert('恭喜已验证成功！本页将关闭！');window.close();")
			{
				GM_log("mission completed fetchResultTime="+unsafeWindow.getNmmValue("fetchResultTime","0"))
				client=GM_getValue("userName") // username
                
				if(unsafeWindow.getNmmValue("fetchResultTime","0")!="0")//need to send result
				{
					message=unsafeWindow.getNmmValue("message")//it's already encodeURIComponent
					itemId=unsafeWindow.getNmmValue("itemId")
					url=unsafeWindow.getNmmValue("url")
					site="nmimi"
					//submit success url
					input = "message="+message+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site+";client="+encodeURIComponent(client)
					
					GM_log("input="+input)

					var validResultWindow=this
					GM_xmlhttpRequest({
						method: "POST",
						url: "http://caster.webfactional.com/submitresultsuccess",
						data: input,
						headers: {
						"Accept": "application/json",
						"Content-Type": "application/x-www-form-urlencoded",
						},
						onload: function(xhr) {
							GM_log('submit url return: response='+xhr.responseText)
							//GM_log('validResultWindow : '+validResultWindow)
							
							//close validResult page
							validResultWindow.location.href="javascript:window.close()"
							
							//close valid page
							location.href="javascript:window.close()"
						}
					})
				}
				else
				{	
                    //send heart beat packet
                    site="nmimi"                        
                    input = "site="+site+";client="+encodeURIComponent(client)
                    
                    GM_log("input="+input)
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "http://caster.webfactional.com/heartbeat",
                        data: input,
                        headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                        },
                        onload: function(xhr) {
                            GM_log('send heart beat packet return : response='+xhr.responseText)
                        }
                    })
					//close validResult page
					this.location.href="javascript:window.close()"
					//close valid page
					location.href="javascript:window.close()"
				}

			}
            else if(this.document.body.innerHTML.indexOf("此任务已完成地址验证！")!=-1)
            {
                //mission complete already
                //close validResult page
                this.location.href="javascript:window.close()"
                //close valid page
                location.href="javascript:window.close()"
            }
			else
			{
                GM_log("mission uncomplete")
				
                //this.location.href="javascript:window.close()"
                //send fail message
                message=unsafeWindow.getNmmValue("message")//it's already encodeURIComponent
                itemId=unsafeWindow.getNmmValue("itemId")
                url=unsafeWindow.getNmmValue("url")
                site="nmimi"
                
                fetchResultTime=unsafeWindow.getNmmValue("fetchResultTime","0")
                
                if(fetchResultTime!="-1" && (fetchResultTime!="0" || $('#linkValid')[0].url_index>=$('#linkValid')[0].urls.length ))
                {
                    //if fetchResultTime == "0" && url_index<=urls.length don't send fail message
                    //submit fail url
                    input = "message="+message+";itemId="+itemId+";url="+encodeURIComponent(url)+";site="+site+";fetchResultTime="+fetchResultTime
                    
                    GM_log(input)
                    var validResultWindow=this
                    GM_xmlhttpRequest({
                            method: "POST",
                            url: "http://caster.webfactional.com/submitresultfail",
                            data: input,
                            headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/x-www-form-urlencoded",
                            },
                            onload: function(xhr) {
                                GM_log('submit fail return: response='+xhr.responseText)
                                //GM_log('validResultWindow : '+validResultWindow)
                                
                                //close validResult page
                                validResultWindow.location.href="javascript:window.close()"
                            }
                        })
                }
                else
                {
                    this.location.href="javascript:window.close()"
                }
				unsafeWindow.checkUrl()
			}
		}
	}


    //add a feather ,click url input area ,select all text
    $("#txtUrl")[0].onclick=function()
    {
        //GM_log("click #txtUrl")
        this.setSelectionRange(0, this.value.length);

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
            //GM_log("message="+message)
        }
        input = 'message='+encodeURIComponent(message)+
            ';itemId='+encodeURIComponent(itemId)+
            ';site='+site;
        GM_log(input)
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://caster.webfactional.com/invalidmission",
            data: input,
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            },
            onload: function(xhr) {
                GM_log('submit invalid mission return: response='+xhr.responseText)
                
                unsafeWindow.setNmmValue("invalid","1")
                location.href="javascript:window.close()"
            }});

    }

    //hook submit url to nmimi.com process
    if($('#linkValid').length>=1)
    {
		var d = new Date()
		target_sub="validReslut_"+unsafeWindow.getUrlParam("id")+"_"+d.getTime()
		
		
		$('#linkValid')[0].urls=new Array()
		$('#linkValid')[0].url_index=0
		
        $('#linkValid')[0].onclick=function()
        {
            var d = new Date()
			targetId=target_sub+"_"+this.url_index+"_"+d.getTime()
            GM_log("targetId="+targetId)
			$('#form1')[0].target=targetId
            unsafeWindow.setNmmValue("url",$("#txtUrl")[0].value)
			unsafeWindow.initResultPageOnload(targetId)
            return true;
        }
		
		
		
		
    }


	unsafeWindow.checkUrl=function()
	{
		if($('#linkValid')[0].url_index<$('#linkValid')[0].urls.length)
		{
			$('#linkValid')[0].url_index=$('#linkValid')[0].url_index+1
			$("#txtUrl")[0].value=$('#linkValid')[0].urls[$('#linkValid')[0].url_index-1]
			GM_log('url='+$("#txtUrl")[0].value)

			//wait 2 second to click
			if($('#linkValid')[0].url_index>1)
			{
				setTimeout("$('#linkValid')[0].click()",2000)
			}
			else
			{
				$('#linkValid')[0].click()
			}
		}
		else
		{
			//unsafeWindow.setNmmValue("fetchResultTime",-1)
            setTimeout(function(){unsafeWindow.getUrls()},2000)
		}
	}
	

    unsafeWindow.getUrls=function(){
        //new mission
        //get urls
        if($(".step + div").length>=1)
        {
            message="";
            for(var i=0;i<$(".step + div").length;++i)
            {
                message=message+$(".step + div")[i].innerHTML+";"
            }
            unsafeWindow.setNmmValue("message",encodeURIComponent(message))
            bLocal=GM_getValue("bLocal","90002")
            //GM_log("message="+message)
            shopkeeper=""
            site="nmimi"
            input = 'message='+encodeURIComponent(message)+
                    ';shopkeeper='+encodeURIComponent(shopkeeper)+
                    ';site='+site+
                    ';local='+bLocal;
            GM_log(input)
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://caster.webfactional.com/queryurl",
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
                    //GM_log("data.itemId is a "+typeof(data.itemId))
                    if(typeof(data.itemId)!="undefined")
                    {
                        unsafeWindow.setNmmValue("itemId",data.itemId)
                        GM_log("data.itemId = "+data.itemId+";data.status = "+data.status)
                    }    
                    else
                        unsafeWindow.setNmmValue("itemId","")

                    if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
                    {
                        $('#linkValid')[0].urls=data.urls;
                        $('#linkValid')[0].url_index=0
                        if(typeof(data.fetchResultTime)!="undefined")
                        {
                            unsafeWindow.setNmmValue("fetchResultTime",data.fetchResultTime)
                        }
                        else
                        {
                            unsafeWindow.setNmmValue("fetchResultTime","0")
                        }
                        unsafeWindow.checkUrl()

                    }
                    else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
                    {
                        //unsafeWindow.doCut();
                        //location.herf=$(".link_t ")[1].href;
                        unsafeWindow.setNmmValue("fetchResultTime","-1")
                        if(typeof(data.trace)!="undefined")
                        {
                            GM_log(data.trace)
                        }

                    }
                    else if(data.status>=30001&&data.status<40000)
                    {
                        unsafeWindow.setNmmValue("fetchResultTime","-1")
                        setTimeout(function(){unsafeWindow.getUrls()},3000)
                    }
                    else if(data.status==40001)
                    {
                        unsafeWindow.setNmmValue("invalid","1")
                        location.href="javascript:window.close()"
                    }
                    else if(data.status=80000)
                    {
                        GM_setValue("keepRefresh",0)
                        setTimeout(function(){unsafeWindow.getUrls()},0)
                    }
                    else if(data.status=80001)
                    {
                        GM_setValue("keepRefresh",1)
                        setTimeout(function(){unsafeWindow.getUrls()},0)
                    }
                    else
                    {
                        unsafeWindow.setNmmValue("fetchResultTime","-1")
                    }
					//GM_log("fetchResultTime="+unsafeWindow.getNmmValue("fetchResultTime",0))
					
                }
            });

            //GM_log("after post message")
        }
    }
    
    unsafeWindow.getUrls()

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


    //$(".bbtton6_a")[0].timeoutId=setTimeout("	$('#playAudioGet2Work')[0].currentTime=0;$('#playAudioGet2Work')[0].play();",800000);
    if(GM_getValue("runMode",2)==2)
    {
        $('#linkValid')[0].closeTimeoutId=setTimeout("location.href='http://caster.webfactional.com/close'",56000)
    }
    else
    {
        setTimeout("location.href='http://caster.webfactional.com/close'",901000)
    }
    //GM_log("handleValidPage end")
	
	//url group  to check
	br=document.createElement("br")
	$("#invalidMissionBtn")[0].parentNode.insertBefore(br,null);
	
	urlsInput=document.createElement("textarea")
	urlsInput.type="text"
	urlsInput.id="urlsInput"
	urlsInput.style.width="400px"
    urlsInput.style.height="100px"
	$("#invalidMissionBtn")[0].parentNode.insertBefore(urlsInput,null);

	checkUrlGroupBtn=document.createElement("input")
	checkUrlGroupBtn.type="button"
	checkUrlGroupBtn.value="验证该组url"
	checkUrlGroupBtn.id="checkUrlGroupBtn"
	$("#invalidMissionBtn")[0].parentNode.insertBefore(checkUrlGroupBtn,null);
	checkUrlGroupBtn.onclick=function()
	{
		$('#linkValid')[0].url_index=0
		$('#linkValid')[0].urls=$("#urlsInput")[0].value.split(";")
		unsafeWindow.setNmmValue("fetchResultTime","-1")
		
		if(typeof($('#linkValid')[0].closeTimeoutId)!="undefined")
		{
			clearTimeout($('#linkValid')[0].closeTimeoutId)
		}
		unsafeWindow.checkUrl()
	}
}

function handleValidResultPage()
{
	GM_log("enter handleValidResultPage")

}


function handleGetMissionPage()
{
    //disable log
    GM_log=function(){}

    GM_log("enter GM script :fake flow mission for nmimi");


    //get refresh button
    var thisRefreshImages,allRefreshImages;

    allRefreshImages = document.evaluate(
        "//a[@class='bbtton6_a']",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);



    if(allRefreshImages.snapshotLength != 1 )
    {
            //alert("程序出错，可能是nimimi改版了");
            GM_log("fake flow#common 程序出错，可能是nimimi改版了");
    }	

    thisRefreshImages = allRefreshImages.snapshotItem(0);

    //add a keepRefresh button

    var trigerRefreshBtn=document.createElement("input");//invisible
    trigerRefreshBtn.id="trigerRefresh";
    trigerRefreshBtn.type="button";
    //trigerRefreshBtn.value=0;

    trigerRefreshBtn.onclick=function ()
    {
        GM_log("trigerRefreshBtn onclick");
        var evt = document.createEvent("MouseEvents");   
        evt.initEvent("click", true, true);   
        this.nextSibling.dispatchEvent(evt);  
    }

    thisRefreshImages.parentNode.insertBefore(trigerRefreshBtn,thisRefreshImages);


    var keepRefreshBtn=document.createElement("input");
    keepRefreshBtn.id="keepRefresh";
    keepRefreshBtn.type="button";
    keepRefreshBtn.value="给我刷";
    keepRefreshBtn.onclick=function ()
    {
        setTimeout(function(){
                GM_log("keepRefresh="+GM_getValue("keepRefresh",0))
                if(GM_getValue("keepRefresh",0)==0)
                {
                    GM_setValue("keepRefresh",1);//valid keepRefresh	
                    GM_log("valid keepRefresh");
                    $("#keepRefresh + input")[0].onclick(); //triger trigerReflesh  
                }   
            
            },0)

      
    }
    thisRefreshImages.parentNode.insertBefore(keepRefreshBtn,trigerRefreshBtn);






    //change function GetDatingResult

    unsafeWindow.GetDatingResult = function (i,s){
        GM_log("enter GetDatingResult");
        $("#trigerRefresh")[0].type="button";
        
        $("#divTaskBody").hide();
        $("#reLoad").show();
        //GM_log(typeof(unsafeWindow.jQuery.postJOSN));
        
        
        var jqxhr=unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/GetDaTingData",{"pageIndex":i,"pageSize":s,"key":""}, function(result){
            if(typeof($("#trigerRefresh")[0].reloadTimeoutId)!="undefined"&&$("#trigerRefresh")[0].reloadTimeoutId!=0)
            {
                clearTimeout($("#trigerRefresh")[0].reloadTimeoutId)
                $("#trigerRefresh")[0].reloadTimeoutId=0
            }
            
            if(result.state == 1){
                artDialog({content:"服务器拒绝获取数据。原因：您的登录已失效，或者您已在其他地方登录！",id:"alarm"},function(){});
                isBuff=false;
            }else if(result.state==2){
                artDialog({content:"服务器拒绝获取数据。原因：为了平台接任务的公平，以及减少平台服务器的压力，此页请不要打开多个！<br/>如果您长期没有操作，只需要按F5刷新本页即可！",id:"alarm"},function(){});
                isBuff=false;
            }else{
                var htm="";
                for(i=0;i<result.itemList.length;i++){
                    var item = result.itemList[i];
                    htm+="<tr>";
                    htm+="<td class=\"id\" style=\"width:195px;\">";
                    htm+="<p class=\"m\" title=\"来路流量任务\">";
                    
                    htm+=item.mId+"</p><em>Post Time："+item.createAt+"</em></td>";
                    htm+="<td class=\"poster\"></td>";
                    htm+="<td class=\"price\"><p>"+item.gPrice+"</p></td>";
                    htm+="<td class=\"oktime\">";
                    htm+="<p>"+ item.fc + "/" + item.yc + "</p>";
                    htm+="</td>";
                    htm+="<td class=\"gold\" style=\"width:200px;\">";
                    switch(item.mState){
                        case 1:
                            htm+="<em>等待接手</em>";
                            break;
                        case 2:
                        case 3:
                        case 4:
                            htm+="<em>任务进行中...</em>";
                            break;
                        case 255:
                            htm+="任务已完成";
                            break;
                    }
                    htm+="</td>";
                    htm+="<td class=\"do\">";
                    switch (item.mState)
                    {
                        case 1:;
                            htm+="<a class=\"button4_a\" href=\"javascript:void(0);\" onclick=\"AccceptMis('"+item.mId+"',this);\">抢此任务</a>";
                            break;
                        case 2:
                            htm+="<p class=\"s_2\">任务已被接手</p>";
                            break;
                        case 3:
                        case 4:
                            htm+="<p class=\"s_2\">任务已暂停</p>";
                            break;
                        case 255:
                            htm+="<p class=\"s_3\">任务已完成</p>";
                            break;
                    }
                    htm+="</td>";
                }
                $("#TaskItem").html(htm);
                GM_log("mission count: "+$(".button4_a").length);
                if($(".button4_a").length >= 1)
                {
                    GM_log("check a mission ");
                    $(".button4_a")[0].onclick();
                }
                
            }
            
            $("#reLoad").hide();
            $(".reListTitle tbody>tr:odd").addClass("tcolor");
            $("#divTaskBody").show(); 
            
            //document.getElementById("trigerRefresh").value=1;]
            var refreshTimeout=0
            if($(".tcolor").length!=0)
            {
                refreshTimeout=3000+Math.random()*2000
            }
            else//没有刷出来,被加黑名单?
            {
                refreshTimeout=300000+Math.random()*60000
            }
            setTimeout(function(){
                    GM_log("post over, keepRefresh = "+GM_getValue("keepRefresh"));
                    if( GM_getValue("keepRefresh") == 1 )
                    {
                        setTimeout("document.getElementById('trigerRefresh').onclick();",refreshTimeout);
                        GM_log("setTimeout refresh in loading  ");
                    }
                        
                },0)
                
        });
        if(typeof($("#trigerRefresh")[0].reloadTimeoutId)!="undefined"&&$("#trigerRefresh")[0].reloadTimeoutId!=0)
        {
            clearTimeout($("#trigerRefresh")[0].reloadTimeoutId)
            $("#trigerRefresh")[0].reloadTimeoutId=0
        }
        $("#trigerRefresh")[0].reloadTimeoutId=setTimeout("document.getElementById('trigerRefresh').onclick();",60000);
    }

    //response to got a mission
    unsafeWindow.AccceptMis = function(mid,btn){
        $(btn).attr("disabled","disabled");
        //var tipsDialog=artDialog({content:"处理中，请稍候...",id:"tips",lock:true});
        //DisabledClose();
        unsafeWindow.jQuery.postJOSN("/Action/FMSer.asmx/AcceptMission",{"mid":mid}, function(result){
     
            if(result.StateCode==0){
                GM_log("啥,又抢到了一个来路流量任务");
                $("#trigerRefresh")[0].type="radio";
            }	
            GoPage(1);
        });
    }

    //response to key press

    document.body.onkeydown =  function (event)
    {
        event = event||window.event;
        GM_log("press key ="+event.keyCode);
        if(event.keyCode==119 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F8	
        {
            GM_setValue("keepRefresh",0);//invalid keepRefresh
            GM_log("invalid keepRefresh");
        }
    }


    function refreshMission()
    {
        /*if( GM_getValue("keepRefresh",0) == 1 )
        {
            clearTimeout();
            setTimeout("document.getElementById('trigerRefresh').onclick();",1500);
            GM_log("setTimeout refresh in loading  ");
        }*/
    }

    //GM_log("refreshMission");
    refreshMission();
}


function handleRecoverGoldPage()
{
    if($("#div0 b")[0].innerHTML!="1个金币=0.4元")
    {
        alert("caster提醒您,您的金币收回价格不是0.4,可能您的vip已过期,建议您申请vip后再来回收金币")
    }
}
