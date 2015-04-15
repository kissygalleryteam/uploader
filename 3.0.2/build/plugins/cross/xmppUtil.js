/*
combined files : 

kg/uploader/3.0.2/plugins/cross/xmppUtil

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
