document.write("<div id='kf2' style='display:none; position:absolute;' onmouseover='show(this)' onmouseout='hide(this);'><table class='tbl_kf2' border='0' cellspacing='1' cellpadding='3'>");
document.write("<tr><td colspan='4' class='kf_time'>工作时间：09:30-17:30(周一至日) 19:30-21:30(周一至五)</td></tr>");
document.write("<tr class='kf_bar2'><td>业务指导</td><td>申诉专员</td><td>财务专员</td></tr><tr class='kf_txt2'>");
document.write("<td>" + sqq('4006865979', '多工号企业QQ') + "</td>");
document.write("<td>" + sqq('920634766', '申诉一号') + sqq('1269088690', '申诉二号') + "</td>");
document.write("<td>" + sqq('1343491298', '充值专员') + sqq('1416587352', '提现专员') + "</td>");
document.write("</tr><tr class='kf_txt2 f_b f_orange'><td colspan='4'>QQ临时通话容易失败，请先加客服好友。　<span class='f_blue'>双赢官方客服电话：400-686-5979</span><br />欢迎来电或加QQ咨询刷信誉的安全方法和注意事项，<br />我们的客服将为您提供安全刷信誉的经验、教材和指导</td></tr></table></div>");
document.write("<div id='fx' style='display:none; position:absolute;' class='share share_box' onmouseover='show(this)' onmouseout='hide(this);'><div class='share_bar'>分享到...</div><ul>" + sfx("tqq|腾讯微博;qzone|QQ空间;tsina|新浪微博;tsohu|搜狐微博;baidu|百度收藏;kaixin001|开心网;renren|人人网;douban|豆瓣网;sohu|白社会;hi|百度空间;tianya|天涯社区;msn|MSN;email|邮件;i139|手机", "") + "</ul><div class='share_btm'>登录后分享，您将成为推荐人</div></div></div>");

function showKF2(obj) {
	var _div = document.getElementById("kf2");
	var p = fGetXY(obj);
	_div.style.top = (p.y + 16)  + "px";
	_div.style.left = (p.x - 400) + "px";
	_div.style.display = "inline";
}
function sqq(qq, name) {
    return "<p><a target='_blank' href='http://wpa.qq.com/msgrd?v=3&uin=" + qq + "&site=qq&menu=yes'>"
     + "<img border='0' src='http://wpa.qq.com/pa?p=1:" + qq + ":17' alt='" + name + "' title='" + name + "' /></a><strong> " + name + "</strong><br />QQ：" + qq + "</p>";
}
function showFX(obj) {
    var _div = document.getElementById("fx");
    var p = fGetXY(obj);
    _div.style.top = (p.y + 16) + "px";
    _div.style.left = (p.x - 175) + "px";
    _div.style.display = "inline";
}
function sfx(webIds, uid) {
    var html = "";
    var sto = webIds.split(";");
    for (var i = 0; i < sto.length; i++) {
        var webId = sto[i].split("|");
        html += '<li><a href="/Share.aspx?webId=' + webId[0] + '&uid=' + uid + '" target="_blank" class="jtico jtico_' + webId[0] + '">' + webId[1] + '</a></li>';
    }
    return html;
}
function fGetXY(aTag){
	var oTmp = aTag;
	var pt = new Point(0,0);
	do {
	pt.x += oTmp.offsetLeft;
	pt.y += oTmp.offsetTop;
	oTmp = oTmp.offsetParent;
	} while(oTmp && oTmp.tagName!="BODY");
	return pt;
}
function Point(iX, iY){
	this.x = iX;
	this.y = iY;
}
function qqTip(qq) {
    alert('QQ临时通话容易失败，请先加客服好友。');
    return true;
}