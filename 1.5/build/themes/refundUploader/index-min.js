/*!build time : 2013-10-15 5:53:31 PM*/
KISSY.add("gallery/uploader/1.5/themes/refundUploader/index",function(a,b,c){function d(a){var b=this;d.superclass.constructor.call(b,a)}var e="",f=b.all;return a.extend(d,c,{render:function(){var a=this;d.superclass.render.call(a);var b=a.get("uploader");b.on("remove",function(){a._changeText()}),b.on("success",function(){a._changeText()});var c=b.get("target"),e=c.text();a.set("defaultText",e)},_addHandler:function(a){var b=this,c=a.file,d=c.id,e=f(".J_Del_"+d);e.data("data-file",c),e.on("click",b._delHandler,b);var g=f(".J_Pic_"+d);g.show()},_errorHandler:function(b){var c=this,d=b.msg,e=b.file;if(a.log(d),!e)return!1;var g=e.id;f(".J_ErrorMsg_"+g).html("\u4e0a\u4f20\u5931\u8d25"),a.later(function(){alert(d);var a=c.get("uploader"),b=a.get("queue");b.remove(g)},1e3)},_changeText:function(){var b=this,c=b.get("uploader"),d=b.getFilesLen(),e=c.get("target"),f=e.children("span"),g=b.get("maxText"),h=b.get("defaultText"),i=c.get("max");Number(i)<=d?f.text(a.substitute(g,{max:i})):f.text(h)}},{ATTRS:{name:{value:"refundUploader"},use:{value:"proBars,filedrop,preview,imageZoom"},fileTpl:{value:'<li id="queue-file-{id}" class="g-u" data-name="{name}"><div class="pic-wrapper"><div class="pic"><span><img class="J_Pic_{id} preview-img" src="" /></span></div><div class=" J_Mask_{id} pic-mask"></div><div class="status-wrapper J_FileStatus"><div class="status waiting-status"><p>\u7b49\u5f85\u4e0a\u4f20</p></div><div class="status start-status progress-status success-status"><div class="J_ProgressBar_{id}">\u4e0a\u4f20\u4e2d...</div></div><div class="status error-status"><p class="J_ErrorMsg_{id}">\u4e0a\u4f20\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\uff01</p></div></div></div><div><a class="J_Del_{id} del-pic" href="#">\u5220\u9664</a></div></li>'},defaultText:{value:e},maxText:{value:"\u60a8\u5df2\u4e0a\u4f20\u6ee1{max}\u5f20\u56fe\u7247"}}}),d},{requires:["node","gallery/gallery/uploader/1.5/themes/imageUploader/index"]});