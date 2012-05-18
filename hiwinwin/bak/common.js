var isSubmitFlag = false;
var isAlert = true;
var userAgent = navigator.userAgent.toLowerCase();
var is_opera = userAgent.indexOf("opera") != -1 && opera.version();
var is_moz = (navigator.product == "Gecko") && userAgent.substr(userAgent.indexOf("firefox") + 8, 3);
var is_ie = (userAgent.indexOf("msie") != -1 && !is_opera) && userAgent.substr(userAgent.indexOf("msie") + 5, 3);
var is_ie7 = parseFloat(userAgent.substr(userAgent.indexOf("msie") + 5, 3)) > 6;
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "")
};

function copy(a) {
    if (is_ie) {
        clipboardData.setData("Text", a);
        alert("复制成功")
    } else {
        if (prompt("请你使用 Ctrl+C 复制到剪贴板", a)) {
            alert("复制成功")
        }
    }
    return false
}
function avoidReSubmit(a) {
    dialog(400, 250, "正在提交数据", "", "<div class='submiting'>正在提交数据，请耐心等待</div>");
    if (a) {
        getObj(a).disabled = true
    }
    allReadonly();
    if (isSubmitFlag) {
        alert("正在提交数据，请耐心等待，无需重复提交");
        return false
    } else {
        isSubmitFlag = true
    }
    return true
}
function dialog(k, c, j, a, e) {
    if (getObj("shadow")) {
        return
    }
    var l = document.createElement("div");
    l.id = "shadow";
    l.className = "shadow";
    if (is_ie7 && document.body.scrollHeight > 4000) {
        l.style.height = "4000px"
    } else {
        l.style.height = document.body.scrollHeight + "px"
    }
    var f = getObj("dialog");
    if (f) {
        document.body.removeChild(f)
    }
    f = document.createElement("div");
    f.id = "dialog";
    f.className = "dialog";
    f.style.marginLeft = "-" + k / 2 + "px";
    f.style.width = k + "px";
    f.style.height = c + "px";
    if (is_ie7 || is_moz) {
        f.style.marginTop = "-" + c / 2 + "px";
        f.style.position = "fixed"
    } else {
        var d = parent.document.body.scrollTop + parent.document.documentElement.scrollTop;
        var b = d + 80;
        var g = b > 0 ? b : 0;
        f.style.top = g + "px"
    }
    var m = '<div class="dialog_t"></div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="dialog_s"></td><td><div class="dialog_r"><div class="dialog_bar"><span style="float:left; padding-left:10px;" id="dialog_title">' + j + '</span><span onclick="doCut();" id="ff_ss" style="cursor:pointer;float:right; padding-right:10px;">×</span></div><div id="dialogBody" style="background:#FFF; height:' + (c - 16) + 'px;">';
    if (a) {
        if (a.indexOf("?") < 0) {
            a += "?"
        }
        a += "&thime=" + Math.random();
        m += '<iframe src="' + a + '" width="' + (k - 16) + 'px" height="' + (c - 16) + 'px" frameborder="0" scrolling="auto"></iframe>'
    } else {
        m += e
    }
    m += '</div></div></td><td class="dialog_s"></td></tr></table><div class="dialog_t"></div>';
    f.innerHTML = m;
    document.body.appendChild(l);
    document.body.appendChild(f);
    this.doCut = function () {
        f.style.display = "none";
        document.body.removeChild(l)
    };
    this.doCut2 = function (h) {
        reflesh(h)
    }
}
function reflesh(a) {
    if (a) {
        window.location.href = a
    } else {
        window.location.href = window.location.href
    }
}
function allReadonly() {
    var b = document.getElementsByTagName("input");
    for (var a = 0; a < b.length; a++) {
        b[a].readOnly = true
    }
    b = document.getElementsByTagName("textarea");
    for (var a = 0; a < b.length; a++) {
        b[a].readOnly = true
    }
}
function goBack() {
    window.location.href = document.referrer;
    return false
}
function getObj(a) {
    return (typeof (a) == "object") ? a : document.getElementById(a)
}
function getValue(a) {
    return getObj(a).value
}
function getRV(b) {
    var d = "";
    var a = document.getElementsByName(b);
    for (var c = 0; c < a.length; c++) {
        if (a[c].checked) {
            d = a[c].value
        }
    }
    return d
}
function setValue(b, a) {
    getObj(b).value = a
}
function hide(b) {
    var a = getObj(b);
    if (a) {
        a.style.display = "none"
    }
}
function show(b) {
    var a = getObj(b);
    if (a) {
        a.style.display = ""
    }
}
function PageQuery(a) {
    if (a.length > 1) {
        this.q = a.substr(1)
    } else {
        this.q = null
    }
    this.keyValuePairs = new Array();
    if (this.q) {
        for (var b = 0; b < this.q.split("&").length; b++) {
            this.keyValuePairs[b] = this.q.split("&")[b]
        }
    }
    this.getKeyValuePairs = function () {
        return this.keyValuePairs
    };
    this.getValue = function (d) {
        for (var c = 0; c < this.keyValuePairs.length; c++) {
            if (this.keyValuePairs[c].split("=")[0] == d) {
                return this.keyValuePairs[c].split("=")[1]
            }
        }
        return false
    };
    this.getParameters = function () {
        var c = new Array(this.getLength());
        for (var d = 0; d < this.keyValuePairs.length; d++) {
            c[d] = this.keyValuePairs[d].split("=")[0]
        }
        return c
    };
    this.getLength = function () {
        return this.keyValuePairs.length
    }
}
function setQS() {
    var b = new PageQuery(window.location.search);
    var c = "";
    for (var a = 0; a < b.getLength(); a++) {
        c = b.getParameters()[a];
        if (getObj(c)) {
            getObj(c).value = unescape(decodeURI(b.getValue(c)))
        }
    }
}
function getQuery(a) {
    var b = document.location.search.substr(1).split("&");
    for (i = 0; i < b.length; i++) {
        var c = b[i].split("=");
        if (c.length > 1 && c[0] == a) {
            return c[1]
        }
    }
    return ""
}
function addClass(b, a) {
    var c = b.className.trim();
    if (c.indexOf(a) < 0) {
        b.className = c + " " + a
    }
}
function removeClass(b, a) {
    var c = b.className.trim();
    if (c.indexOf(a) >= 0) {
        b.className = c.replace(a, "")
    }
}
function showQQ(a) {
    if (a) {
        document.write("<a href='tencent://message/?uin=" + a + "'><img width='25' height='17' border='0'  src='http://wpa.qq.com/pa?p=1:" + a + ":17' alt='' /></a>")
    }
}
function addEvent(c, b, a) {
    if (c.attachEvent) {
        c["e" + b + a] = a;
        c[b + a] = function () {
            c["e" + b + a](window.event)
        };
        c.attachEvent("on" + b, c[b + a])
    } else {
        c.addEventListener(b, a, false)
    }
}
function removeEvent(c, b, a) {
    if (c.detachEvent) {
        c.detachEvent("on" + b, c[b + a]);
        c[b + a] = null
    } else {
        c.removeEventListener(b, a, false)
    }
}
function doCheck(checks) {
    var result = true;
    isAlert = true;
    for (var i = 0; i < checks.length; i++) {
        var check = checks[i];
        var str = "";
        try {
            for (var j = 0; j < check.length; j++) {
                if (j == 0) {
                    str = check[0] + "('"
                }
                if (j == (check.length - 1)) {
                    str += check[j] + "')"
                } else {
                    if (j > 0) {
                        str += check[j] + "','"
                    }
                }
            }
            result = eval(str)
        } catch (e) {
            alert(str)
        }
        if (!result && isAlert) {
            isAlert = false
        }
    }
    result = result && isAlert;
    isAlert = true;
    return result
}
function isMatch(b, a) {
    return b.test(a.trim())
}
function doAlert(c, b) {
    addClass(b, "txt_fail");
    addEvent(b, "keyup", function () {
        if (event.keyCode > 30) {
            removeClass(b, "txt_fail")
        }
    });
    b.title = c;
    if (isAlert) {
        alert(c);
        try {
            b.focus()
        } catch (a) {}
    }
    return false
}
function isEmpty(c, a) {
    if (arguments.length == 1) {
        if (c.trim() == "") {
            return false
        } else {
            return true
        }
    } else {
        var b = getObj(c);
        if (b.value.trim() == "") {
            return doAlert(a + "  不能为空", b)
        } else {
            return true
        }
    }
}
function isLength(e, b, c, a) {
    var d = getObj(e);
    if (d.value.trim().length < c || d.value.trim().length > a) {
        if (c == a) {
            return doAlert(b + "  长度必须为 " + c + "位", d)
        } else {
            return doAlert(b + "  长度范围为 " + c + "～" + a, d)
        }
    } else {
        return true
    }
}
function isEqual(c, b, g, f, a) {
    if (arguments.length == 2) {
        return c.trim() == b.trim()
    } else {
        var e = getObj(c);
        var d = getObj(b);
        if (e.value.trim() == d.value.trim()) {
            if (a) {
                return doAlert(g + " 和 " + f + "  不允许相同", d)
            } else {
                return true
            }
        } else {
            if (a) {
                return true
            } else {
                return doAlert(g + " 和 " + f + "  不一致", d)
            }
        }
    }
}
function isRange(e, b, c, a) {
    var d = getObj(e);
    if (parseFloat(d.value.trim()) < c || parseFloat(d.value.trim()) > a) {
        return doAlert(b + "  数值范围为 " + c + "～" + a, d)
    } else {
        return true
    }
}
function isNum(c, a) {
    if (arguments.length == 1) {
        return isMatch(/^\d*$/, c.trim())
    } else {
        var b = getObj(c);
        if (!isMatch(/^\d*$/, b.value)) {
            return doAlert(a + "  必须为数字", b)
        } else {
            return true
        }
    }
}
function isNumber(c, a) {
    if (arguments.length == 1) {
        return isMatch(/^\d*$/, c.trim())
    } else {
        var b = getObj(c);
        if (!isMatch(/^\d+$/, b.value)) {
            return doAlert(a + "  必须为整数", b)
        } else {
            return true
        }
    }
}
function isEmail(e, b, a) {
    if (arguments.length == 1) {
        if (isEmpty(e)) {
            return false
        }
        var c = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return isMatch(c, e)
    } else {
        var d = getObj(e);
        if (!a) {
            if (!isEmpty(d.value)) {
                return true
            }
        }
        var c = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        if (!isMatch(c, d.value)) {
            return doAlert(b + "  不是有效的电子邮件地址", d)
        } else {
            return true
        }
    }
}
function isStock(c, a) {
    if (arguments.length == 1) {
        return isMatch(/^\d+(\.\d{1,2})?$/, c.trim())
    } else {
        var b = getObj(c);
        if (!isMatch(/^\d+(\.\d{1,2})?$/, b.value)) {
            return doAlert(a + "  小数点后只允许两位", b)
        } else {
            return true
        }
    }
}
function isMoney(c, a) {
    if (arguments.length == 1) {
        return isMatch(/^[+-]?\d*(,\d{3})*(\.\d+)?$/g, c.trim())
    } else {
        var b = getObj(c);
        if (!isMatch(/^[+-]?\d*(,\d{3})*(\.\d+)?$/g, b.value)) {
            return doAlert(a + "  不是有效的数字", b)
        } else {
            return true
        }
    }
}
function checkAll(c, d, b) {
    var b = b ? b : "chkall";
    for (var a = 0; a < c.elements.length; a++) {
        var f = c.elements[a];
        if (f.name && f.name != b && (!d || (d && f.name.match(d)))) {
            f.checked = c.elements[b].checked
        }
    }
}
function thumbImg(b, a) {
    if (b.width > a) {
        b.height = b.height * a / b.width;
        b.width = a;
        b.title = "新窗口打开预览";
        b.style.cursor = "pointer";
        b.onclick = function () {
            openDynaWin("图片预览", "<img src='" + b.src + "' />")
        }
    }
}
function openDynaWin(c, b) {
    var d = "<html><head><title>" + c + " - 双赢网</title></head><body><table align='center' width='100%'><tr><td align='center' >";
    d += b + "</td></tr><tr><td align='center'><input type='button' style='font-size:9pt' value='关闭窗口' onclick='javascript:window.close()'></td></tr></table></body></html>";
    var a = window.open();
    a.document.write(d);
    a.document.close()
}
Ajax = function () {
    function b(d, e) {
        function k() {}
        var g = e.async !== false,
            c = e.method || "GET",
            j = e.encode || "UTF-8",
            h = e.data || null,
            l = e.success || k,
            f = e.failure || k;
        c = c.toUpperCase();
        if (h && typeof h == "object") {
            h = _serialize(h)
        }
        if (c == "GET" && h) {
            d += (d.indexOf("?") == -1 ? "?" : "&") + h;
            h = null
        }
        var m = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        m.onreadystatechange = function () {
            a(m, l, f)
        };
        m.open(c, d, g);
        if (c == "POST") {
            m.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=" + j)
        }
        m.setRequestHeader("If-Modified-Since", "0");
        m.send(h);
        return m
    }
    function a(f, e, c) {
        if (f.readyState == 4) {
            var d = f.status;
            if (d >= 200 && d < 300) {
                e(f)
            } else {
                c(f)
            }
        } else {}
    }
    return {
        request: b
    }
}();

function _serialize(f) {
    var c = [];
    for (var d in f) {
        if (d == "__VIEWSTATE") {
            continue
        }
        if (d == "times") {
            continue
        }
        var g = f[d];
        if (g.constructor == Array) {
            for (var e = 0, b = g.length; e < b; e++) {
                c.push(d + "=" + encodeURIComponent(g[e]))
            }
        } else {
            c.push(d + "=" + encodeURIComponent(g))
        }
    }
    return c.join("&")
}
function formToHash(f) {
    var g = {},
        e;
    for (var d = 0, a = f.elements.length; d < a; d++) {
        e = f.elements[d];
        if (e.name == "" || e.disabled) {
            continue
        }
        switch (e.tagName.toLowerCase()) {
        case "fieldset":
            break;
        case "input":
            switch (e.type.toLowerCase()) {
            case "radio":
                if (e.checked) {
                    g[e.name] = e.value
                }
                break;
            case "checkbox":
                if (e.checked) {
                    if (!g[e.name]) {
                        g[e.name] = [e.value]
                    } else {
                        g[e.name].push(e.value)
                    }
                }
                break;
            case "button":
                break;
            case "image":
                break;
            default:
                g[e.name] = e.value;
                break
            }
            break;
        case "select":
            if (e.multiple) {
                for (var c = 0, b = e.options.length; c < b; c++) {
                    if (e.options[c].selected) {
                        if (!g[e.name]) {
                            g[e.name] = [e.options[c].value]
                        } else {
                            g[e.name].push(e.options[c].value)
                        }
                    }
                }
            } else {
                g[e.name] = e.value
            }
            break;
        default:
            g[e.name] = e.value;
            break
        }
    }
    f = e = null;
    return g
};