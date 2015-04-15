/*
combined files : 

kg/uploader/3.0.2/plugins/tagConfig/tagConfig

*/
/**
 * @fileoverview 从input上拉取配置覆盖组件配置
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/tagConfig/tagConfig',function(S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    var UPLOADER_OPTIONS = ['autoUpload','postData','action','multiple','multipleLen','uploadType','disabled'];
    var AUTH_OPTIONS = ['max','maxSize','allowRepeat','allowExts','required','widthHeight'];
    /**
     * @name TagConfig
     * @class 从input上拉取配置覆盖组件配置
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function TagConfig(config) {
        var self = this;
        //调用父类构造函数
        TagConfig.superclass.constructor.call(self, config);
    }
    S.extend(TagConfig, Base, /** @lends TagConfig.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var input = uploader.get('_oldInput');
            if(!input) return false;
            self.set('uploader',uploader);
            self.set('input',input);
            self.cover();
        },
        /**
         * 覆盖组件配置
         */
        cover:function(){
            var self = this;
            self._setUploaderConfig();
            self._setAuthConfig();
            return self;
        },
        /**
         * 设置上传配置
         * @private
         */
        _setUploaderConfig:function(){
            var self = this;
            var $input = self.get('input');
            var value;
            var uploader = self.get('uploader');
            S.each(UPLOADER_OPTIONS,function(option){
                value = $input.attr(option);
                if(value){
                    switch (option){
                        case 'postData' :
                            option = 'data';
                            value = S.JSON.parse(value);
                            if(!S.isEmptyObject(value)){
                                value = S.merge(uploader.get('data'),value);
                            }
                            break;
                        case 'uploadType':
                            option = 'type';
                            break;
                        case 'autoUpload' || 'disabled' || 'multiple':
                            value = value == 'true';
                            break;
                    }
                    uploader.set(option,value);
                }
            })
        },
        /**
         * 设置验证配置
         * @private
         */
        _setAuthConfig:function(){
            var self = this;
            var $input = self.get('input');
            var uploader = self.get('uploader');
            var auth = uploader.getPlugin('auth');
            if(!auth) return false;
            var value;
            var msg;
            S.each(AUTH_OPTIONS,function(option){
                value = $input.attr(option);
                if(value){
                    //demo:max="3"
                    switch (option){
                        case 'allowRepeat' || 'required':
                            value = value == 'true';
                            break;
                        case 'maxSize' || 'max':
                            value = Number(value);
                            break;
                    }
                    auth.set(option,value);
                }
                //配置验证消息
                //demo:max-msg="每次最多上传{max}个文件！"
                msg = $input.attr(option + '-msg');
                if(msg){
                    auth.msg(option,msg);
                }
            })
        }
    }, {ATTRS : /** @lends TagConfig*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'tagConfig'
        },
        /**
         * 原生文件上传域
         * @type NodeList
         * @default ''
         */
        input:{
            value:EMPTY
        }
    }});
    return TagConfig;
}, {requires : ['node','base']});
/**
 * changes:
 * 明河：1.4
 *           - 新增模块，用于解析按钮标签上的配置
 *           - 修正auth的msg被主题覆盖的问题，该组件必须在加载组件时才触发
 */
