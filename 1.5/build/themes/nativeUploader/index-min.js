/*!build time : 2013-12-22 1:42:03 PM*/
KISSY.add("gallery/uploader/1.5/theme",function(a,b,c){function d(a){var b=this;d.superclass.constructor.call(b,a)}var e="",f=b.all,g={BUTTON:"-button",QUEUE:"-queue"},h="text/uploader-theme";return a.extend(d,c,{render:function(){var a=this,b=a.get("uploader");b.set("theme",a),a._addThemeCssName(),a._tplFormHtml(),a._bind()},_selectHandler:function(){},_addHandler:function(){},_removeHandler:function(){},_waitingHandler:function(){},_startHandler:function(){},_progressHandler:function(){},_successHandler:function(){},_errorHandler:function(){},_restore:function(){var b=this,c=b.get("uploader"),d=c.getPlugin("urlsInput");if(!d)return!1;var e=d.get("autoRestore");if(!e)return!1;var f=c.get("queue"),g=f.get("files");return g.length?(a.each(g,function(a,d){a.status="success",c.fire("add",{file:a,index:d}),b._renderHandler("_successHandler",{file:a,result:a.result}),b._hideStatusDiv(a)}),b):!1},_addThemeCssName:function(){var b=this,c=b.get("name"),d=b.get("queueTarget"),f=b.get("uploader"),h=f.get("target");return d.length?c==e?!1:(d.length&&d.addClass("ks-uploader-queue "+c+g.QUEUE),h.addClass(c+g.BUTTON),b):(a.log("\u4e0d\u5b58\u5728\u5bb9\u5668\u76ee\u6807\uff01"),!1)},_bind:function(){var b=this,c=b.get("uploader"),d=["add","remove","select","start","progress","success","error","complete"];c.on(d[0],function(a){var d=b._appendFileDom(a.file),e=c.get("queue");e.updateFile(a.index,{target:d})}),c.on(d[1],function(a){b._removeFileDom(a.file)}),a.each(d,function(a){c.on(a,function(a){var c="_"+a.type+"Handler";b._renderHandler(c,a)})})},_renderHandler:function(a,b){var c=this,d=c[a];c._setStatusVisibility(b.file),d&&d.call(c,b)},_setStatusVisibility:function(b){var c=this;if(!a.isObject(b)||a.isEmptyObject(b))return c;c._hideStatusDiv(b);var d=b.status,e=b.target;if(!e.length)return!1;var f=e.all("."+d+"-status");f.length&&f.show();var g=["waiting","start","uploading","progress","error","success"];return a.each(g,function(a){e.removeClass(a)}),e.addClass(d),c},_hideStatusDiv:function(b){if(!a.isObject(b))return!1;var c=b.target;c&&c.length&&c.all(".status").hide()},_appendFileDom:function(b){var c,d=this,e=d.get("fileTpl"),g=f(d.get("queueTarget"));return g.length?(c=a.substitute(e,b),f(c).hide().appendTo(g).fadeIn(.4).data("data-file",b)):!1},_removeFileDom:function(b){if(!a.isObject(b))return!1;var c=b.target;return c&&c.length?(c.fadeOut(.4,function(){c.remove()}),void 0):!1},_tplFormHtml:function(){var a=this,b=a.get("fileTpl"),c=f(a.get("queueTarget")),d=!1;if(!c.length)return!1;var e=c.all("script");return e.each(function(c){c.attr("type")==h&&(d=!0,b=c.html(),a.set("fileTpl",b))}),b}},{ATTRS:{name:{value:e},use:{value:e},fileTpl:{value:e},authMsg:{value:{}},queueTarget:{value:e,getter:function(a){return f(a)}},queue:{value:e},uploader:{value:e}}}),d},{requires:["node","base"]}),KISSY.add("gallery/uploader/1.5/themes/nativeUploader/index",function(a,b,c){function d(a){var b=this;d.superclass.constructor.call(b,a)}var e=b.all;return a.extend(d,c,{_addHandler:function(a){var b=this,c=a.file,d=c.id,f=e(".J_Del_"+d);f.data("data-file",c),f.on("click",b._delHandler,b),b.hideBtn()},_removeHandler:function(){var a=this,b=a.get("uploader"),c=b.get("target");c.fadeIn(.3)},_startHandler:function(){},_progressHandler:function(a){var b=this,c=a.file,d=c.id,f=a.percentage,g=e(".J_Progress_"+d);g.length&&(b._setDisplayMsg(!0,c),g.text(f+"%"))},_successHandler:function(a){var b=this,c=a.file,d=a.result;d&&b._changeImageSrc(a),b._setDisplayMsg(!1,c),e(".J_StatusWrapper_"+c.id).hide()},_errorHandler:function(b){var c=this,d=b.msg,f=b.file,g=b.file.id;e(".J_ErrorMsg_"+g).html(d),c._setDisplayMsg(!0,f),a.log(d)},_setDisplayMsg:function(a,b){if(!b)return!1;var c=e(".J_Mask_"+b.id);c[a&&"show"||"hide"]()},_delHandler:function(a){a.preventDefault();var b=this,c=b.get("uploader"),d=c.get("queue"),f=e(a.currentTarget).data("data-file");if(f){var g=d.getFileIndex(f.id);d.remove(g);var h=c.get("target");h.fadeIn(.3)}},hideBtn:function(){var a=this,b=a.get("uploader"),c=b.get("target");if(!c.length)return!1;var d=b.getPlugin("auth");if(!d)return!1;var e=d.get("max");if(!e)return!1;var f=a.get("queue"),g=f.get("files"),h=g.length;h>=3&&c.fadeOut(.3)},getFilesLen:function(a){a||(a="success");var b=this,c=b.get("queue"),d=c.getFiles(a);return d.length},_changeImageSrc:function(a){var b=a.file,c=b.id,d=a.result,f=d.url,g=e(".J_Pic_"+c);return g.show(),g.attr("src",f),f}},{ATTRS:{name:{value:"native-uploader"},fileTpl:{value:'<li id="queue-file-{id}" class="g-u" data-name="{name}"><div class="pic"><img class="J_Pic_{id} preview-img" src="" /></div><div class=" J_Mask_{id} pic-mask"></div><div class="status-wrapper J_StatusWrapper_{id}"><div class="status waiting-status">0%</div><div class="status progress-status success-status J_Progress_{id}"></div > <div class="status error-status"><p class="J_ErrorMsg_{id}">\u4e0a\u4f20\u5931\u8d25</p></div></div><a class="J_Del_{id} del-pic" href="#"></a></li>'}}}),d},{requires:["node","../../theme"]});