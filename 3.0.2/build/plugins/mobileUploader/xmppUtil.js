/*
combined files : 

kg/uploader/3.0.2/plugins/mobileUploader/xmppUtil

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
