/*!build time : 2015-04-15 6:37:49 PM*/
KISSY.add("kg/uploader/3.0.2/type/base",function(a,b,c){function d(a){var b=this;d.superclass.constructor.call(b,a)}{var e="";b.all}return a.mix(d,{event:{START:"start",STOP:"stop",SUCCESS:"success",ERROR:"error"}}),a.extend(d,c,{upload:function(){},stop:function(){},_processResponse:function(b){var c=this,d=c.get("filter"),f={};if(a.isString(b))try{f=a.JSON.parse(b),d!=e&&(f=d.call(c,b)),f=c._fromUnicode(f)}catch(g){var h=b+"\uff0c\u8fd4\u56de\u7ed3\u679c\u96c6responseText\u683c\u5f0f\u4e0d\u5408\u6cd5\uff01";a.log(h),c.fire("error",{status:-1,result:{msg:h}})}else a.isObject(b)&&(f=b,d!=e&&(f=d.call(c,b)),f=c._fromUnicode(f));return a.log("\u670d\u52a1\u5668\u7aef\u8f93\u51fa\uff1a"+a.JSON.stringify(f)),f},_fromUnicode:function(b){function c(b){a.each(b,function(d,e){a.isObject(b[e])?c(b[e]):b[e]=a.isString(d)&&a.fromUnicode(d)||d})}return a.isObject(b)?(c(b),b):b}},{ATTRS:{action:{value:e},data:{value:{}},filter:{value:e}}}),d},{requires:["node","base"]}),KISSY.add("kg/uploader/3.0.2/type/flash",function(a,b,c){function d(a){var b=this;d.superclass.constructor.call(b,a),b.isHasCrossdomain(),b._init()}var e="",f="[uploader-FlashType]:";return a.mix(d,{event:a.merge(c.event,{SWF_READY:"swfReady",PROGRESS:"progress"})}),a.extend(d,c,{_init:function(){var b=this,c=b.get("swfUploader");return c?(c.on("contentReady",function(){b.fire(d.event.SWF_READY)},b),c.on("uploadStart",b._uploadStartHandler,b),c.on("uploadProgress",b._uploadProgressHandler,b),c.on("uploadCompleteData",b._uploadCompleteDataHandler,b),void c.on("uploadError",b._uploadErrorHandler,b)):(a.log(f+"swfUploader\u5bf9\u8c61\u4e3a\u7a7a\uff01"),!1)},upload:function(b){var c=this,d=c.get("swfUploader"),e=c.get("action"),f="POST",g=c.get("data"),h=c.get("fileDataName");return h||(h="Filedata"),c.set("uploadingId",b),a.mix(g,{type:"flash"}),d.upload(b,e,f,g,h),c},stop:function(){var a=this,b=a.get("swfUploader"),c=a.get("uploadingId");return c!=e&&(b.cancel(c),a.fire(d.event.STOP,{id:c})),a},_uploadStartHandler:function(a){var b=this;b.fire(d.event.START,{file:a.file})},_uploadProgressHandler:function(b){var c=this;a.mix(b,{loaded:b.bytesLoaded,total:b.bytesTotal}),a.log(f+"\u5df2\u7ecf\u4e0a\u4f20\u5b57\u8282\u6570\u4e3a\uff1a"+b.bytesLoaded),c.fire(d.event.PROGRESS,{loaded:b.loaded,total:b.total})},_uploadCompleteDataHandler:function(a){var b=this,c=b._processResponse(a.data);b.set("uploadingId",e),b.fire(d.event.SUCCESS,{result:c})},_uploadErrorHandler:function(a){var b=this;b.set("uploadingId",e),b.fire(d.event.ERROR,{msg:a.msg})},isHasCrossdomain:function(){var b=location.hostname;a.io({url:"//"+b+"/crossdomain.xml",dataType:"xml",error:function(){a.log("\u7f3a\u5c11crossdomain.xml\u6587\u4ef6\u6216\u8be5\u6587\u4ef6\u4e0d\u5408\u6cd5\uff01")}})}},{ATTRS:{action:{value:e,getter:function(b){var c=/^http/;if(!c.test(b)&&!/\/\//.test(b)){var d,e=location.href,f=e.split("/");d=a.filter(f,function(a,b){return b<f.length-1}),b=d.join("/")+"/"+b}return b}},swfUploader:{value:e},uploadingId:{value:e}}}),d},{requires:["node","./base"]});