// ==UserScript==
// @name          fake flow mission for 16bang 
// @namespace     http://www.caster.org
// @description   used on fake flow Module of 16bang.com
// @include       http://www.16bang.com/shualiuliang*
// @include       http://www.16bang.com/myGetFlowList.asp*
// @include       http://www.16bang.com/returnFlow.asp*
// @exclude       http://diveintogreasemonkey.org/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// ==/UserScript==

GM_log("enter GM script");
if(location.href.indexOf("http://www.16bang.com/shualiuliang")!=-1)
{
	handleMissionListPage()
}
else if(location.href.indexOf("http://www.16bang.com/myGetFlowList.asp")!=-1)
{
	handleMyMissonPage()
}
else if(location.href.indexOf("http://www.16bang.com/returnFlow.asp")!=-1)
{
	handleQuitMissionPage()
}

function handleMissionListPage(mean,stdev)
{
	unsafeWindow.gaussianGenerate = function (mean, stdev)
	{
		function rnd_snd() {
			return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
		}
		return rnd_snd()*stdev+mean
	}

	//add a keep refresh button
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
					$("#missionset img[src='images/flow2.gif']")[0].parentNode.onclick(); //triger trigerReflesh  
				}   
			
			},0)

	  
	}
	$("#missionset")[0].parentNode.insertBefore(keepRefreshBtn,$("#missionset")[0]);
	
	//add a message board
	var messageBoard=document.createElement("p");
	messageBoard.id="messageBoard"
	keepRefreshBtn.parentNode.insertBefore(messageBoard,keepRefreshBtn.nextSibling)

	//defined in mission.js
	var mission_sort="";
	var mission_page=1;
	var mission_url="flowInner.asp"; 
	GM_log("handleMissionListPage")
	unsafeWindow.showmission=function()
	{
		GM_log("showmission")
		$("#missionset")[0].innerHTML = "<div class=\"tt5\" style=\"text-align:center;\"><img src=/images/ajax.gif>&nbsp;<font style=color:Red; font-weight:bolder;>加载中……</font></div>";
		var url=mission_url+"?fr="+mission_sort+"&page="+mission_page;
		$("#prostate")[0].style.display="";
		unsafeWindow.SubmitMsg("get",url,"missionset","prostate",0,0);
	} 
	
	unsafeWindow.SubmitMsg=function(methodStyle,url,divId,ajaxpro,iseval,isout)
	{
		// clear message board
		$("#messageBoard")[0].innerHTML=""
		
		if(url.indexOf("flowInner.asp")!=-1)
		{
			var xmlhttp = unsafeWindow.getXMLRequester();
			if (!xmlhttp)
			{
				return;
			}
			xmlhttp.open(methodStyle, url, true);
			xmlhttp.onreadystatechange = function () 
				{ 
					unsafeWindow.OnReadyStateChng(xmlhttp, divId, ajaxpro,iseval,isout); 
					if(xmlhttp.readyState == 4)
					{
						if($("#missionset img[src='images/gettask6.jpg']").length>0)
						{
							var randomId=parseInt(Math.random()*$("#missionset img[src='images/gettask6.jpg']").length,10)%$("#missionset img[src='images/gettask6.jpg']").length
							GM_log("randomId="+randomId+",mission.length="+$("#missionset img[src='images/gettask6.jpg']").length)
							$("#missionset img[src='images/gettask6.jpg']")[randomId].parentNode.onclick()
						}

						var refreshTimeout=0
						if($("#missionset img[src='images/personal_icon.gif']").length!=0)
						{
							refreshTimeout=Math.round(unsafeWindow.gaussianGenerate(10,5)*1000)
							if(refreshTimeout<0)
							{
								refreshTimeout=0
							}
						}
						else//被加黑名单
						{
							refreshTimeout=300000+Math.random()*60000
						}
						setTimeout(function(){
							GM_log("post over, keepRefresh = "+GM_getValue("keepRefresh")+",refreshTimeout="+refreshTimeout);
							if( GM_getValue("keepRefresh") == 1 )
							{
								setTimeout(function(){
										$("#missionset img[src='images/flow2.gif']")[0].parentNode.onclick()
									},refreshTimeout);
								GM_log("setTimeout refresh in loading  ");
							}
								
						},0)
					}
				};
			xmlhttp.setRequestHeader("If-Modified-Since","0");
			xmlhttp.send(null);
		}
		else if(url.indexOf("getFlowTask.asp")!=-1)
		{
			var xmlhttp = unsafeWindow.getXMLRequester();
			if (!xmlhttp)
			{
				return;
			}
			xmlhttp.open(methodStyle, url, true);
			xmlhttp.onreadystatechange = function () 
				{ 
					var baktxt=xmlhttp.responseText;
					if(baktxt=="alert('流量任务接手成功');showmission();")
					{
						//annouce got a mission
					}
					else if(baktxt=="alert('对不起，您当前不在可接手范围');")
					{
						
					}
					$("#messageBoard")[0].innerHTML=baktxt
				};
			xmlhttp.setRequestHeader("If-Modified-Since","0");
			xmlhttp.send(null);
			
		}
		else 
		{
			var xmlhttp = unsafeWindow.getXMLRequester();
			if (!xmlhttp)
			{
				return;
			}
			xmlhttp.open(methodStyle, url, true);
			xmlhttp.onreadystatechange = function () 
				{ 
					unsafeWindow.OnReadyStateChng(xmlhttp, divId, ajaxpro,iseval,isout); 
				};
			xmlhttp.setRequestHeader("If-Modified-Since","0");
			xmlhttp.send(null);		
		}
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
	
}


function handleMyMissonPage()
{

	GM_log("handleMyMissonPage")
	//response to key press
	document.body.onkeydown =  function (event)
	{
		event = event||window.event;
		//GM_log("press key ="+event.keyCode);
		if(event.keyCode==119 && !event.altKey && !event.shiftKey&& !event.ctrlKey)//press F8	
		{
			GM_setValue("keepRefresh",0);//invalid keepRefresh
			GM_log("invalid keepRefresh");
		}
	}

	GM_log("build refresh button")
	refreshBtn=document.createElement("input")	
	refreshBtn.id="refreshBtn"
	refreshBtn.value="刷新本页"
	refreshBtn.type="button"
	refreshBtn.onclick=function ()
	{
		GM_log('$("#alertFram iframe").length = '+$("#alertFram iframe").length)
		if($("#alertFram iframe").length==0)//make sure no mission remain unhandled
		{
			unsafeWindow.showmission();
		}
		else//recheck 30s later
		{
			setTimeout(function(){
					if( GM_getValue("keepRefresh") == 1 )
					{
						setTimeout(function(){
								$("#refreshBtn")[0].onclick()
							},30000);
						GM_log("setTimeout recheck in loading  ");
					}
						
				},0)		
		}
	}
	$("#missionset")[0].parentNode.insertBefore(refreshBtn,$("#missionset")[0]);
	
	//play sound
	var playSoundDiv=document.createElement("div");
    playSoundDiv.id='playSoundOutter';
    document.body.insertBefore(playSoundDiv,null);
    playSoundDiv.innerHTML = " \
        <audio id=\"playAudioGot\"  preload=\"auto\" src=\"http://storage.live.com/items/96902E43106FA83C%21110?filename%3dalreadygot.ogg\" > <b>Your browser does not support the audio tag.</b> </audio> \
        ";
    $("#playAudioGot")[0].volume=0.3;

	GM_log("SubmitMsg")

	unsafeWindow.SubmitMsg=function(methodStyle,url,divId,ajaxpro,iseval,isout)
	{
		GM_log("in SubmitMsg")
		var xmlhttp = unsafeWindow.getXMLRequester();
		if (!xmlhttp)
		{
			return;
		}
		xmlhttp.open(methodStyle, url, true);
		xmlhttp.onreadystatechange = function () 
			{ 
				unsafeWindow.OnReadyStateChng(xmlhttp, divId, ajaxpro,iseval,isout); 
				if(xmlhttp.readyState == 4)
				{
					GM_log('$("#missionset a").length='+$("#missionset a").length)
					
					if($("#missionset a").length>0)
					{
						
						for(var i=$("#missionset a").length-1;i>=0;--i)
						{
							if($("#missionset a")[i].innerHTML=="检验地址")
							{
								$("#missionset a")[i].onclick()
								GM_log('$("#alertFram iframe")[0] : ' + $("#alertFram iframe")[0])
								
								$("#alertFram iframe")[0].loadtime=0
								$("#alertFram iframe")[0].urls=new Array()
								$("#alertFram iframe")[0].onload = function()
								{
									GM_log("iframe.onload this.contentDocument :"+this.contentDocument)
									
									this.loadtime=this.loadtime+1
									
                                    
									//quit mission button
									quitMissionBtn=this.contentDocument.createElement("input")
									quitMissionBtn.value="退出任务"
									quitMissionBtn.type="button"
									quitMissionBtn.id="quitMissionBtn"
									quitMissionBtn.onclick=function()
									{
										unsafeWindow.origin_doOk()
										//unsafeWindow.isQuitTsk=function(){return true}
										//$(".link_t ")[1].click()
									}
									$("#alertFram iframe").contents().find("#btnok")[0].parentElement.insertBefore(quitMissionBtn,null)
									
									
									//check if success to finish mission
									unsafeWindow.origin_doOk=unsafeWindow.doOk
									unsafeWindow.doOk=function()//call doOk mean mission finished
									{
										GM_log("doOk")
										setTimeout(function()
										{
											GM_log('GM_getValue("fetchResultTime",0)='+GM_getValue("fetchResultTime",0))
											if(GM_getValue("fetchResultTime",0)!=0)//need 2 submit result
											{
												message=GM_getValue("message")
												shopkeeper=GM_getValue("shopkeeper","")
												itemId=GM_getValue("itemId","")
												url=GM_getValue("url","")
												site="16bang"
												
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
											}    
											unsafeWindow.origin_doOk()
										},0)	
									}
									
									if($("#alertFram iframe").contents().find(".STYLE4").length==0)//check if it's a success dialog again
									{
										//unsafeWindow.doOk()
										return;
									}
									
									
									//hook submit process
									$("#alertFram iframe").contents().find('form')[0].onsubmit = function ()
									{
										GM_setValue("url",$("#alertFram iframe").contents().find("input[name='chkUrl']")[0].value)

										iframeCheckForm = (function() { 
																var el = $("#alertFram iframe")[0].contentDocument.createElement('p');
																el.setAttribute('onclick', 'return window.checkForm;');
																return el.onclick();
															}())
										
										return iframeCheckForm();
									}									
									
									if(this.loadtime<=1)
									{
										//get message
										var message=""
										var site="16bang"
										var shopkeeper=""
										for(var i=0;i<$("#alertFram iframe").contents().find(".STYLE4").length;++i)
										{
											message=message+$("#alertFram iframe").contents().find(".STYLE4")[i].innerHTML+";"
											
											if( $("#alertFram iframe").contents().find(".STYLE4")[i].parentNode.parentNode.innerHTML.indexOf("掌柜名称：")!=-1)
											{
												shopkeeper=$("#alertFram iframe").contents().find(".STYLE4")[i].innerHTML
											}
										}
										
										GM_setValue("message",message.replace(/\s*/g,""))
										GM_setValue("shopkeeper",shopkeeper.replace(/\s*/g,""))
									
										
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

												// response_data['status']  
														
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

												data=eval('('+xhr.responseText+')')
												GM_log("data.status = "+data.status)
												if(typeof(data.itemId)!="undefined")
													GM_setValue("itemId",data.itemId)
												else
													GM_setValue("itemId","")
												
												
												if(data.status>=10001&&data.status<20000)//get a set of url,let's just try
												{
													//GM_log("data.urls.length="+data.urls.length)
													$("#alertFram iframe")[0].urls=data.urls
													$("#alertFram iframe").contents().find("input[name='chkUrl']")[0].value=data.urls[0];
													if(typeof(data.fetchResultTime)!="undefined")
													{

														GM_setValue("fetchResultTime",data.fetchResultTime)
													}
													else
													{
														GM_setValue("fetchResultTime",0)
													}

													$("#alertFram iframe").contents().find("#btnok")[0].click()													
												}
												else if(data.status>=20001&&data.status<30000)//no url retrieved and no one get the mission in N(default:5) minutes,just give up
												{
													GM_setValue("fetchResultTime",-1)
													//playmusic	
													$("#playAudioGot")[0].play()
													// if(GM_getValue("runMode",1)==2)
													// {
														// $("iframe").contents().find("#quitMissionBtn")[0].click()
													// }
												}
												else
												{
													GM_setValue("fetchResultTime",-1)
													//playmusic	
													$("#playAudioGot")[0].play()
													// if(GM_getValue("runMode",1)==2)
													// {
														// $("iframe").contents().find("#quitMissionBtn")[0].click()
													// }
												}

											}
										});
										
										//GM_log("after post message")
									}
									else if(this.loadtime<=this.urls.length)
									{
										GM_log("url No."+this.loadtime+" ,try it now ,url="+this.urls[this.loadtime-1])
										$("#alertFram iframe").contents().find("input[name='chkUrl']")[0].value=this.urls[this.loadtime-1];
										GM_log("click")
										$("#alertFram iframe").contents().find("#btnok")[0].click()
									}
									else
									{
										GM_setValue("fetchResultTime",-1)
										//playmusic	
										$("#playAudioGot")[0].play()
										
										// if(GM_getValue("runMode",1)==2)
										// {
											// GM_log("auto quit")
											// $("iframe").contents().find("#quitMissionBtn")[0].click()
										// }
									}
									
								}
								break;
							}
						}
					}

					var refreshTimeout=0
					if($("#missionset img[src='images/alipay3.gif']").length!=0)
					{
						refreshTimeout=30000+Math.random()*20000
					}
					else//被加黑名单
					{
						refreshTimeout=300000+Math.random()*60000
					}
					setTimeout(function(){
						if( GM_getValue("keepRefresh") == 1 )
						{
							setTimeout(function(){
									$("#refreshBtn")[0].onclick()
								},refreshTimeout);
							GM_log("setTimeout refresh in loading  ");
						}
							
					},0)
				}
			};
		xmlhttp.setRequestHeader("If-Modified-Since","0");
		xmlhttp.send(null);
	}
								
}

function handleQuitMissionPage()
{

}