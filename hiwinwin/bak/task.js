var _iidd = 1;

function isIE() {
    var a = false;
    try {
        a = !-[1, ]
    } catch (b) {}
    return a
}
function openPrdUrl(a, b) {
    if (a.indexOf("trackid") > 0) {
        alert("该任务的商品含有淘宝客链接，请举报该发布人");
        return false
    }
    if (isIE()) {
        clipboardData.setData("Text", a);
        alert("您已经成功复制了网址，请粘贴到浏览器的地址栏，然后打开")
    } else {
        if (prompt("请你使用 Ctrl+C 复制到剪贴板", a)) {
            alert("您已经成功复制了网址，请粘贴到浏览器的地址栏，然后打开")
        }
    }
    return false
}
function fleshTime(c) {
    if (c < 0) {
        c = 0
    }
    var e = "iidd_" + (_iidd++);
    var d = "<span class='f_b_red' id='" + e + "'>" + parseInt(c / 60) + "分" + c % 60 + "秒</span>";
    document.write(d);
    var b = function () {
            c = c - 1;
            if (c <= 0) {
                window.clearInterval(a);
                c = 0
            }
            document.getElementById(e).innerHTML = parseInt(c / 60) + "分" + c % 60 + "秒"
        };
    var a = window.setInterval(b, 1000)
}
function copyComment(a) {
    if (is_ie) {
        clipboardData.setData("Text", a);
        alert("复制成功，请粘贴到实际交易的好评中")
    } else {
        if (prompt("请你使用 Ctrl+C 复制到剪贴板", a)) {
            alert("复制成功，请粘贴到实际交易的好评中")
        }
    }
    return false
}
function IsGetTask() {
    return confirm("您确定要接手此任务么？")
}
function IsDelTask() {
    return confirm("取消该任务将返回您全部扣押的平台任务担保金和任务发布点，\n\n但要额外扣除0.5个发布点\n\n您确定取消发布该任务么？")
}
function IsReTask() {
    return confirm("重新发布该任务将更新该任务发布时间从而使您的任务排名更加靠前，\n\n但是每重新发布一次扣除发布点0.5个，\n\n您确定要重新发布么？")
}
function IsRejectTask(a) {
    if (a < 3) {
        return confirm("您确定要辞退该接手人，将任务返回到“已发布，等待接手人”状态么？")
    } else {
        return confirm("您已辞退" + a + "个该任务的接手人了，再辞退接手人需要额外支付0.2个发布点；\n\n您确定要辞退么？")
    }
}
function IsAutoStop() {
    return confirm("自动暂停为接手方手动退出任务后将自动暂停此任务；\n\n【注意】一旦设置了自动暂停，本任务将永久具有自动暂停属性；\n\n您确定要此任务自动暂停么？")
}
function IsOutTask(b, e) {
    if (b >= 30) {
        document.write("<a href='?out=" + e + "' class='link_t' onclick='return IsQuitTask();'>退出任务</a>")
    } else {
        document.write("<a href='?out=" + e + "' class='link_t' id='out_" + e + "' onclick='alert(\"还需要" + (30 - b) + "秒可以退出\");return false;' disabled='disabled'>退出任务</a>");
        var c;
        var a = function () {
                b = b + 1;
                if (!c) {
                    c = document.getElementById("out_" + e)
                }
                if (b >= 30) {
                    window.clearInterval(d);
                    c.innerHTML = "退出任务";
                    c.disabled = false;
                    c.onclick = function () {
                        return IsQuitTask()
                    }
                } else {
                    c.innerHTML = "退出[" + (30 - b) + "]";
                    c.onclick = function () {
                        alert("还需要" + (30 - b) + "秒可以退出");
                        return false
                    }
                }
            };
        var d = window.setInterval(a, 1000)
    }
}
function IsQuitTask() {
    return confirm("您确定要退出该任务么？")
}
function IsPayTask(b, e, a) {
    var d = "请确保" + b + "上已经支付货款后，才进行平台确认，否则一经投诉将做封号处理！";
    var c = "\n\n【注意】该任务为#小时好评任务，请在发布人发货后#小时再确认收货";
    if (a && a != 0) {
        c = "\n\n【注意】该任务为签收任务，在快递未被签收前，" + b + "和平台禁止收货好评！"
    }
    if (e > 1 && a == 0) {
        c = c.replace(/#/g, (e - 1) * 24)
    }
    if (e > 1) {
        return confirm(d + c)
    } else {
        return confirm(d)
    }
}
function IsUnpayTask(a) {
    return confirm("您确定" + a + "还未支付货款？\n\n确认返回后，任务将返回到“已绑定，等待接手人支付”状态！")
}
function IsSendTask() {
    return confirm("您确认已经完成发货了么？")
}
function IsReceiveAheadTask() {
    return confirm("该任务为百分百真实任务，联盟要求发货满十二小时后才能确认收货\n\n您现在确认收货，在任务结束后只能得到一半任务发布点")
}
function IsReceiveTask(b, c, e, d, a) {
    if (e == 1) {
        alert("为了发布人的安全，请您更换IP后再进行确认收货");
        return false
    }
    var f = "";
    if (c) {
        f = "该任务为带字好评，请务必【复制好评内容】给对方带字的评价"
    }
    if (d == 1) {
        f = "该任务为带字好评且需要购物分享，请务必【复制好评内容】给对方带字的评价；\n\n同时完成购物分享，分享的内容请复制评价的内容"
    }
    if (a && a != 0) {
        f = "该任务为签收任务，请务必在您自己或您的家人、朋友、同事已签收了快递\n\n【未签收即收货您将无法得到保证金和发布点】"
    }
    if (f) {
        alert(f)
    }
    return confirm("请再次检查" + b + "上已经确认收货了，并且已经提交了好评\n\n如果提交不属实将视为放弃申诉权\n\n")
}
function IsConfirmTask(a, c, d, b) {
    if (c == 0 && d <= 2) {
        dialog(650, 500, "新手防假客服提醒", "../../dialog/TipCheater.aspx?id=" + b);
        return false
    }
    return confirm("确认审核后，您的该任务担保金与发布点将发放到接手方账户。\n\n请您确认" + a + "已经收到买方的全额货款，且已经收到对方好评！\n\n【受骗提醒】：淘宝上未收到款，主动联系您的工作人员都是骗子客服")
}
function IsGradeTask(b, a) {
    if (b <= 0) {
        return confirm("确认交易好评后您将获得该任务全部奖励发布点。\n\n您确认" + a + "上已经按照任务要求进行好评么？\n\n请真实提交，否则视为放弃申诉权！")
    } else {
        return confirm("该任务还未到规定好评期。\n\n现在提交好评您将只能获得50%的任务奖励发布点，确认提交好评么？")
    }
}
function changeNewTip() {
    if (getObj("new_tip").style.display == "none") {
        show("new_tip")
    } else {
        hide("new_tip")
    }
    return false
}
function changeIPTip(a) {
    alert("为了您和发布人的安全，请您先更换IP然后清空Cookies；\n\n再使用查询的买号登录" + a + "去确认收货和提交好评")
}
function examTip(b, a) {
    if (b >= 150 && a <= 5) {
        alert("您尚未通过双赢考试，我们建议您进行双赢考试\n\n本次登录后提醒5次后不再提醒，这是第" + a + "次\n\n考试请进入【联盟中心】-->【双赢考试】")
    }
}
function isTDown() {
    if (getRV("shopname") == "") {
        alert("请选择掌柜");
        return
    }
    var c = formToHash(getObj("myForm"));
    if (window.location.pathname.toLowerCase().indexOf("adds.aspx") > 0) {
        var e = document.getElementsByName("itemurl");
        var b = document.getElementsByName("price");
        var d = 0;
        for (var a = 0; a < e.length; a++) {
            if (e[a].value.trim().length > 0 && b[a].value.trim().length > 0) {
                c.itemurl = e[a].value;
                c.price = b[a].value;
                d++
            }
        }
        if (d > 1) {
            alert("对不起，当前暂不支持多个商品的检测");
            return
        }
    } else {
        if (getValue("price") == "" || getValue("itemurl") == "") {
            alert("请先设置好商品地址和价格");
            return
        }
    }
    c.remark = "";
    c.visitTip = "";
    c.visitKey = "";
    c.time = c.times;
    dialog(550, 450, "淘宝任务降权检测", "../../dialog/CheckTask.aspx?" + _serialize(c))
}
function chkTask(a) {
    Ajax.request("../ajax/CheckTask.aspx?" + a, {
        success: function (b) {
            hide("lb");
            getObj("result").innerHTML = b.responseText;
            show("rebtn")
        },
        failure: function (b) {
            alert("检测失败，请稍后再试；若多次失败请联系客服")
        }
    })
}
function doPro(c, b) {
    var d = 0;
    if (c > 400) {
        c = 400
    }
    var e = function () {
            c = c + 20;
            if (c >= 400) {
                window.clearInterval(a);
                c = 400
            }
            if (c >= 300 && d == 0) {
                chkTask(b);
                d = 1
            }
            var f = getObj("bar");
            f.style.width = c + "px";
            f.innerHTML = (c / 4) + "%"
        };
    var a = window.setInterval(e, 200)
};