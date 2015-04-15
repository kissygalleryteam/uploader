/*
combined files : 

kg/uploader/3.0.2/plugins/miniLogin/miniLogin

*/
/**
 * @fileoverview mini登陆框（用于通用接口）
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/miniLogin/miniLogin',function(S, Node, Base,token,ML) {
    var EMPTY = '';
    var $ = Node.all;

    function MiniLogin(config) {
        var self = this;
        //调用父类构造函数
        MiniLogin.superclass.constructor.call(self, config);
    }
    S.extend(MiniLogin, Base, /** @lends MiniLogin.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            uploader.on('select',function(){
                var isLogin = ML.check();
                if(!isLogin){
                    var autoUpload = uploader.get('autoUpload');
                    var isSetUpload = false;
                    if(autoUpload){
                        uploader.set('autoUpload',false);
                        isSetUpload = true;
                    }
                    ML.show({}, function() {
                        token(uploader,function(){
                            uploader.uploadFiles();
                        });
                        if(isSetUpload) uploader.set('autoUpload',true)
                    });
                }
            })
        }
    }, {ATTRS : /** @lends MiniLogin*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'miniLogin'
        }
    }});
    return MiniLogin;
}, {requires : ['node','base','../../token','tbc/mini-login/1.4.0/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
