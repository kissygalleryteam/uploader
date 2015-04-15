/*
combined files : 

kg/uploader/3.0.2/plugins/mobileUploader/xmppUtil
kg/uploader/3.0.2/plugins/mobileUploader/qrcode

*/
KISSY.add('kg/uploader/3.0.2/plugins/mobileUploader/xmppUtil',function(S){

    var XmppUtil = {

        begin : false,

        localMap : {

        },

        init : function(){


            var self = this;

            if(self.begin == true){
                return ;
            }

            self.begin = true;

            /**
             KISSY.TBC.umpp.register('1063', function(data) {
				// appid 涓烘偍鐨� mpp 搴旂敤 id
				console.log(data);
				alert("hi mpp");
				var d = data[0];
				var jsondata = KISSY.JSON.parse(d.content);
				var subType = jsondata.subType;
				var callbackData = jsondata.data;
				var qr = self.localMap[subType];
				var qrPara = qr.param;


				var messageType = jsondata.mtype;

				if(messageType && messageType == "appCancle"){
					qr.hide(qr);
					return ;
				}

				qrPara.xmppcallback({
					data : callbackData,
					bizMap : qrPara
				});
			});
             **/
            /****/
            KISSY.getScript('//a.tbcdn.cn/p/xmpp/1.0/xmpp.js', function() {
                xmpp.register({
                    ctype: 'login', // 闀块摼鎺ョ被鍨�
                    appId: '1063', // 鐩稿叧搴旂敤 appId
                    subType: '1' // 鐩稿叧涓氬姟涓嬬殑娑堟伅绫诲瀷, 璇ラ」鍙€�
                }, function(data) {
                    // 鍥炶皟鍑芥暟
                    //console.log(data);
                    //alert("hi mpp");

                    var i = 0;
                    for(;i<data.length;i++){
                        var appid = data[i].t1;
                        if(appid == "1063"){
                            var d = data[i];
                            var jsondata = d.content;

                            if(typeof jsondata == "string"){
                                jsondata = KISSY.JSON.parse(jsondata);
                            }

                            var subType = jsondata.subType;
                            var callbackData = jsondata.data;
                            var qr = self.localMap[subType];
                            var qrPara = qr.param;

                            var messageType = jsondata.mtype;

                            if(messageType && messageType == "appCancle"){
                                qr.hide(qr);
                                return ;
                            }
                            qrPara.xmppcallback({
                                data : callbackData,
                                bizMap : qrPara
                            });
                        }

                    }

                });
            });



        },

        registerXmpp : function(subType,qrPara){
            this.localMap[subType]=qrPara;
        }
    };

    return XmppUtil;

});
KISSY.add('kg/uploader/3.0.2/plugins/mobileUploader/qrcode',function(S,Node, UA, XmppUtil){

    var $=Node.all;

    var QRURL = "//m.service.taobao.com/getQrCode.htm";
    var CheckAppUrl = "//m.service.taobao.com/checkApp.htm";
    var QRApiUrl = "//m.service.taobao.com/qrCodeApi.htm";
    var btname2 = "%E6%AD%A3%E5%9C%A8%E8%8E%B7%E5%8F%96%E4%BA%8C%E7%BB%B4%E7%A0%81..";

    var TPL='';
    TPL += '	<div class="qrcode">';
    TPL += '<div class="loading"></div>';
    TPL += '	</div>';

    var TPL_Qr_Code = '<div class="qrcode-qr"><div class="hd">推荐使用<a href="//app.taobao.com/download/taoApps.htm?spm=a210u.1000832.297503.39.REFn4e&pageIndex=5" target="_blank">淘宝客户端</a>扫描下面的二维码：<\/div>';
    TPL_Qr_Code += '<div class="bd">';
    TPL_Qr_Code += '<div><span class="J_qrimg">'+decodeURIComponent(btname2)+'</span></div>';
    TPL_Qr_Code += '</div>';
    TPL_Qr_Code += '<div class="ft">';
    TPL_Qr_Code += '<a href="#" class="J_close"><span>关闭</span></a>';
    TPL_Qr_Code += '</div>';
    TPL_Qr_Code += '<div class="preview-tip">如果手机端提示上传成功，页面没有添加图片，<br/>请点击<a class="J_preview">手动插入</a></div>';
    TPL_Qr_Code += '</div></div>';

    var aname1 = "%E5%B7%B2%E7%BB%8F%E5%90%91%E4%BD%A0%E7%9A%84%E6%89%8B%E6%9C%BA%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%8C%E6%89%93%E5%BC%80%E6%B6%88%E6%81%AF%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E7%94%A8%E6%89%8B%E6%9C%BA%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87%EF%BC%81";
    var aname2 = "%E8%8B%A5%E9%95%BF%E6%97%B6%E9%97%B4%E6%B2%A1%E6%94%B6%E5%88%B0%E6%B6%88%E6%81%AF%EF%BC%8C%E5%85%88%E6%89%8B%E5%8A%A8%E5%BC%80%E5%90%AF%E6%B7%98%E5%AE%9D%E5%AE%A2%E6%88%B7%E7%AB%AF%EF%BC%8C%E5%86%8D%E7%82%B9%E5%87%BB%E6%8C%89%E9%92%AE%E9%87%8D%E5%8F%91%E6%B6%88%E6%81%AF";
    var aname3 = "%E9%87%8D%E8%AF%95";
    var aname4 = "%E6%94%BE%E5%BC%83%E4%BC%A0%E5%9B%BE";

    var TPL_APP = '<div class="qrcode-app"><div class="app-title"><h3>'+decodeURIComponent(aname1)+'</h3></div>';
    TPL_APP += '<div class="app-body"><span>'+decodeURIComponent(aname2)+'</span><span><span class="J_QrCountdown count-down" data-count="10"></span><button class="J_QrRetry retry" type="button" style="display: none;">\u91cd\u8bd5</button></span></div>';
    TPL_APP += '<div class="app-ft"><span><a href="#" class="J_App_Cancle">'+decodeURIComponent(aname4)+'</a></span></div></div>';


    var xmppUtil = XmppUtil;

    function QRCode(config){
        var param = {};
        var cfg = config||{};
        var biz = cfg.bizMap;
        delete cfg.bizMap;

        S.mix(param,cfg);
        S.each(biz,function(v,k){
            param["biz_"+k] = v;
        });
        if(!param.subType){
            param.subType = "qrcode"+S.guid();
        }

        if(param.title){
            param.title = encodeURIComponent(param.title);
        }

        this.callback = config.callback;

        this.param = param;
        this.isRender = false;
        this.isBind = false;

        var self = this;

        if(UA.ie == 6){
            self.$mask4ie6 = S.all('<iframe src="about:blank" style="display:none; left:-9999px; top:-9999px;" class="tb-qrcode-sb-mask-4-ie6" ></iframe>'); //keep it first...
            S.ready(function(){
                S.all('body').append(self.$mask4ie6);
            });
        }

    }


    S.augment(QRCode,S.EventTarget,{


        checkApp : function(callback){
            var self = this;
            if(self.param.daily ){
                CheckAppUrl = "//m.service.daily.taobao.net/checkApp.htm";
            }
            self.param._tt=new Date().getTime();
            S.IO({
                dataType:'jsonp',
                url:CheckAppUrl,
                data:self.param,
                jsonpCallback:"CheckApp",
                success:function (data) {
                    var datajson = data;

                    self.param.qrid = datajson.qrid;
                    self.param.mk = datajson.mk;
                    self.param.t = datajson.t;

                    if(datajson.appResult && datajson.appResult ==true){
                        self.container.html(TPL_APP);
                        /****/
                        self.countDown( self.container.one('.J_QrCountdown'), function(){
                            self.container.one('.J_QrCountdown').hide();
                            self.container.one('.J_QrRetry').show();
                        } )
                        self.isCheckApp = true;
                        if(self.$mask4ie6){
                            self.$mask4ie6.css({"width":362,"height":173});
                        }
                        return ;
                    }else{
                        self.container.html(TPL_Qr_Code);
                        self.getQR(function(){
                            self.container.children().slideDown(0.3);
                        });
                        if(self.$mask4ie6){
                            self.$mask4ie6.css({"width":222,"height":294});
                        }
                    }
                    callback && callback.call(self);
                }
            });

        },



        countDown: function(target, callback){
            var self = this;

            var count = target.attr('data-count') || 10, curCount = count;
            target.html(curCount + "\u79d2");

            if(self.countdownInterval){
                clearInterval( self.countdownInterval );
            }

            self.countdownInterval = setInterval(function(){
                target.html( --curCount + "\u79d2" );
                if( curCount == '0' ){
                    clearInterval( self.countdownInterval );
                    callback();
                }
            }, 1000);
        },

        //鑾峰彇浜岀淮鐮佺殑鍦板潃
        getQR: function(callback){
            var self = this;

            //return QRURL+"?"+S.param(this.param);

            if(self.param.daily ){
                QRURL = "//m.service.daily.taobao.net/getQrCode.htm";
            }
            self.param._tt=new Date().getTime();
            S.IO({
                dataType:'jsonp',
                url:QRURL,
                data:self.param,
                jsonpCallback:"QrCodeGetPic",
                success:function (data) {
                    var datajson = data;

                    var imgpanel = self.container.one(".J_qrimg");

                    var img = document.createElement("img");
                    img.onload = function(){
                        imgpanel.html("").append(img);
                        callback && callback();
                    }
                    img.src=datajson.picurl;
                }
            });
        },
        render: function(){
            var self = this,
                container = $(TPL);
            $(document.body).append(container);
            self.container = container;
            self.isRender = true;
            self.bindEvent();
            self.xmpp();
        },

        bindEvent : function(){
            var self = this;
            if(self.param.daily ){
                QRApiUrl = "//m.service.daily.taobao.net/qrCodeApi.htm";
            }

            self.container.delegate('click', '.J_QrRetry', function(e){
                //閲嶈瘯寮傛璇锋眰

                self.param.api = "retry";
                self.param._tt=new Date().getTime();

                S.IO({
                    dataType:'jsonp',
                    url:QRApiUrl,
                    data:self.param,
                    jsonpCallback:"QrCodeRetry",
                    success:function (data) {
                        var datajson = data;

                        self.container.one('.J_QrCountdown').show();
                        self.countDown( self.container.one('.J_QrCountdown'), function(){
                            //鍊掕鏃剁粨鏉�
                            self.container.one('.J_QrCountdown').hide();
                            self.container.one('.J_QrRetry').show();
                        })

                        self.container.one('.J_QrRetry').hide();
                    },
                    error: function(d){

                    }
                });
                /**
                 self.container.hide();
                 self.container.html(TPL_Qr_Code);
                 self.container.show();
                 self.getQR();
                 **/
                //閲嶈瘯寮傛璇锋眰
            });

            self.container.delegate('click', '.J_App_Cancle', function(e){


                //鍙栨秷寮傛璇锋眰

                if(self.param.daily ){
                    QRApiUrl = "//m.service.daily.taobao.net/qrCodeApi.htm";
                }
                self.param.api = "cancle";
                self.param._tt=new Date().getTime();
                S.IO({
                    dataType:'jsonp',
                    url:QRApiUrl,
                    data:self.param,
                    jsonpCallback:"QrCodeCancle",
                    success:function (data) {
                        var datajson = data;
                        self.container.hide();
                        if(UA.ie == 6){
                            self.$mask4ie6.hide();
                        }
                    },
                    error: function(d){

                    }
                });

            });
            self.container.delegate('click', '.J_close', function(ev){
                ev.halt();
                self.container.hide();
                if(self.$mask4ie6){
                    self.$mask4ie6.css({"left":-9999,"top":-9999}).hide();
                }
            });
            self.container.delegate('click', '.J_preview', function(ev){
                ev.halt();
                self.previewUploadResult(self.param);
            });

        },

        show: function(){
            var self = this;
            if(!self.isRender) self.render();
            self.container.fadeIn(0.3,function(){
                self.checkApp();
            });
            if(self.$mask4ie6){
                setTimeout(function(){
                    self.$mask4ie6.css({
                        left :self.container.css('left'),
                        top  :self.container.css('top')
                    }).show();
                });
            }
        },
        hide: function(_self){
            var self = _self || this;

            if(self.$mask4ie6){
                self.$mask4ie6.css({"left":-9999,"top":-9999}).hide();
            }
            self.container.hide();
            if(self.countdownInterval){
                clearInterval( self.countdownInterval );
            }
        },

        //娉ㄥ唽XMPP娑堟伅
        xmpp: function(){
            var self = this;
            xmppUtil.init();
            xmppUtil.registerXmpp(self.param.subType,self);

        },

        xmppcallback: function(data){

        },

        previewUploadResult : function(data){
            var self = this;
            S.IO({
                dataType:'jsonp',
                url:'//m.service.taobao.com/previewUploadResult.htm',
                jsonpCallback:"getPreviewResult",
                data:{
                    qrid : data.qrid,
                    mk : data.mk
                },
                success:function (r) {
                    if(r.success==true){
                        if(r.data){
                            self.param.xmppcallback(r.data);
                        }
                    }

                },
                error: function(d){

                }
            });
        },

        offset: function(x,y){
            this.container.css({
                top:x,
                left:y
            })
        }

    });


    return QRCode;

},{
    requires: ['node','ua','./xmppUtil']
});



