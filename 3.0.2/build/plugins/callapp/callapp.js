/*
combined files : 

kg/uploader/3.0.2/plugins/callapp/callapp

*/
/**
 * @fileoverview 唤醒app
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/callapp/callapp',function(S, Node, Base) {
    /**
     * @name Paste
     * @class 唤醒app，只用于native-uploader
     * @since 1.5
     * @constructor
     * @extends Base
     */
    function CallApp(config) {
        var self = this;
        //调用父类构造函数
        CallApp.superclass.constructor.call(self, config);
    }
    S.extend(CallApp, Base, /** @lends CallApp.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            var self = this;
            if(!uploader) return false;
            uploader.on('no-windVane',function(){
                if(!lib || !lib.callapp){
                    alert(self.get('noSupport'));
                    return false;
                }
                var msg = self.get('msg');
                var cp = lib.callapp;
                if(confirm(msg)){
                    var url = self.get('url');
                    cp.gotoPage(url);
                }
            })
        }
    }, {ATTRS : /** @lends CallApp*/{
        /**
         * 插件名称
         * @type String
         */
        pluginId:{
            value:'callapp'
        },
        /**
         * 要跳转的url
         */
        url:{ value: '' },
        msg:{value:'上传功能只能在淘宝客户端中使用，是否跳转到客户端？'},
        noSupport:{value:'非常抱歉，上传功能只能在淘宝客户端中使用T_T'},
        /**
         * smartbanner的实例
         */
        sb:{value:''}
    }});
    return CallApp;
}, {requires : ['node','base']});
