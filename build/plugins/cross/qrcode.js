/*
combined files : 

kg/uploader/3.0.2/plugins/cross/xmppUtil
kg/uploader/3.0.2/plugins/cross/qrcode

*/
KISSY.add('kg/uploader/3.0.2/plugins/cross/xmppUtil',function(S){

    var XmppUtil = {

        begin : false,

        localMap : {

        },

        token : '',

        maxid : 0,

        initOcsIm : function(token,mmaxid){
            var self = this;

            S.IO({
                dataType:'jsonp',
                url:"//ocs.service.taobao.com/bfm.glyz",
                data:{
                    tk : token,
                    version:2,
                    callback : "callbackX",
                    maxid : mmaxid
                },
                jsonp: "callbackName",
                success:function (data){
                    for (var i=0;i<data.length;i++){
                        var _maxid  = parseInt(data[i].head.id);
                        if(_maxid>self.maxid){
                            self.maxid = _maxid;
                        }
                        var cmd = data[i].cmd;
                        var jsondata = data[i].body;

                        if(typeof jsondata == "string"){
                            jsondata = jsondata.replace("\r\n","");
                            jsondata = KISSY.JSON.parse(jsondata);
                        }

                        var subType = jsondata.subType;
                        var callbackData = jsondata.data;
                        var qr = self.localMap[subType];
                        var qrPara = qr.param;

                        if(cmd && cmd == "qrcodeCancle"){
                            qr.hide(qr);
                            S.later(function(){self.initOcsIm(self.token,self.maxid);},2000);
                            return ;
                        }
                        qrPara.xmppcallback({
                            data : callbackData,
                            bizMap : qrPara
                        });

                    }
                    S.later(function(){self.initOcsIm(self.token,self.maxid);},700);
                },
                error:function (response,textStatus,xhrobj){
                    S.log(textStatus);
                    S.log(xhrobj);
                }
            });
        },

        setToken : function(ttoken){
            this.token = ttoken;
        },

        init : function(token){


            var self = this;

            if(self.begin == true){
                return ;
            }

            self.begin = true;
            self.initOcsIm(token,0);

        },

        registerXmpp : function(subType,qrPara){
            this.localMap[subType]=qrPara;
        }
    }
    return XmppUtil;

});
KISSY.add('kg/uploader/3.0.2/plugins/cross/qrcode',function(S,Node, UA, XmppUtil){

    var $=Node.all;

    var QRURL = "//m.service.taobao.com/getQrCode.htm";
    var CheckAppUrl = "//m.service.taobao.com/checkApp.htm";
    var QRApiUrl = "//m.service.taobao.com/qrCodeApi.htm";
    var btname2 = "%E6%AD%A3%E5%9C%A8%E8%8E%B7%E5%8F%96%E4%BA%8C%E7%BB%B4%E7%A0%81..";

    var TPL='';
    TPL += '	<div class="qrcode">';
    TPL += '<div class="loading"></div>';
    TPL += '	</div>';

    var TPL_Qr_Code = '<div class="qrcode-qr"><div class="hd">推荐使用<a href="//app.taobao.com/software/detail.htm?spm=a210u.1000874.0.0.BEz792&appId=520001" target="_blank">淘宝客户端</a>扫描下面的二维码：<\/div>';
    TPL_Qr_Code += '<div class="bd">';
    TPL_Qr_Code += '<div><span class="J_qrimg">'+decodeURIComponent(btname2)+'</span></div>';
    TPL_Qr_Code += '</div>';
    TPL_Qr_Code += '<div class="ft">';
    TPL_Qr_Code += '<a href="#" class="J_close"><span>关闭</span></a>';
    TPL_Qr_Code += '</div>';
    TPL_Qr_Code += '<div class="preview-tip">如果手机端提示上传成功，页面没有添加图片，<br/>请点击<a class="J_preview">手动插入</a></div>';
    TPL_Qr_Code += '</div></div>';

    var TPL_APP = '<div class="app-title"><h3>请打开您手机上的淘宝客户端，可以直接用手机上传图片！</h3></div>';
    TPL_APP += '<div class="app-body"><span>若长时间没收到消息，先手动开启淘宝客户端，再点击</span><span><span class="J_QrCountdown count-down" data-count="10"></span><button class="J_QrRetry retry" type="button" style="display: none;">重发消息</button></span></div>';
    TPL_APP += '<div class="app-ft"><span><a href="#" class="J_App_Cancle">放弃传图</a></span></div>';


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
        this.xmppUtil = xmppUtil;

        var self = this;

        if(UA.ie == 6){
            self.$mask4ie6 = S.all('<iframe src="about:blank" style="display:none; left:-9999px; top:-9999px;" class="tb-qrcode-sb-mask-4-ie6" ></iframe>'); //keep it first...
            S.ready(function(){
                S.all('body').append(self.$mask4ie6);
            });
        }

    }


    S.augment(QRCode,S.EventTarget,{


        checkApp : function(){
            var self = this;
            if(self.param.daily && self.param.daily=="true"){
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

                    self.xmppUtil.setToken(self.param.qrid);
                    self.xmppUtil.init(self.param.qrid);

                    if(datajson.appResult && datajson.appResult ==true){
                        self.container.addClass('qrcode-app').html(TPL_APP);
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

        //获取二维码的地址
        getQR: function(callback){
            var self = this;

            //return QRURL+"?"+S.param(this.param);

            if(self.param.daily && self.param.daily=="true"){
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

        //渲染对话款
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
            if(self.param.daily && self.param.daily=="true"){
                QRApiUrl = "//m.service.daily.taobao.net/qrCodeApi.htm";
            }

            self.container.delegate('click', '.J_QrRetry', function(e){
                //重试异步请求

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
                            //倒计时结束
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
                //重试异步请求
            });

            self.container.delegate('click', '.J_App_Cancle', function(e){


                //取消异步请求

                if(self.param.daily && self.param.daily=="true"){
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

        //注册XMPP消息
        xmpp: function(){
            var self = this;
            //xmppUtil.init();
            self.xmppUtil.registerXmpp(self.param.subType,self);

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



