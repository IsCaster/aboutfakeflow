$=function (id) { return (typeof (id)=='object')?id:document.getElementById(id);};

function makeXmlReq() {
	var http_request = false;
	if (window.XMLHttpRequest) { // Mozilla, Safari,...
			http_request = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // IE
		try {
			http_request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				http_request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
		}
	}
	//TODO: warn
	return http_request;
}

function xmlGet(xml, name){
	if (xml){
		var xobj = xml.getElementsByTagName(name)[0];
		if (xobj){
			var ret = "";
			if (xobj.firstChild){
				ret = xobj.firstChild.data;
			}
			if (ret){
				if (ret == '0'){
					ret = 0;
				}
				return ret;	
			}
		}
	}
	return 0;
}

function hide_display(tid){
	var obj = $(tid);
	if (obj)
	  obj.className = "sp_no";
}

function show_ok(tid, msg) {
	var obj = $(tid);
	if (obj) {
	  obj.className = "sp_ok";
		if (msg)
			obj.innerHTML = msg;
	}
}

function show_error(tid, msg) {
	var obj = $(tid);
	if (obj) {
	  obj.className = "sp_error";
		if (msg)
			obj.innerHTML = msg;
	}
}