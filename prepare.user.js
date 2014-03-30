// ==UserScript==
// @name          perpare fakeflow
// @namespace     http://www.caster.org
// @description   perpare for fakeflow running
// @include       http://wwww.nmimi.com/*
// @include       http://www.nmimi.com/*
// @include       http://www.hiwinwin.com/*
// @include       http://www.16bang.com/*
// @require       http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js
// @version       1.0
// @run-at document-start
// ==/UserScript==

unsafeWindow.alert=function (){}
unsafeWindow.opener.location.reload=function (){} 