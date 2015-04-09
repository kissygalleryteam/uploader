/*
combined files : 

kg/uploader/3.0.1/plugins/imgcrop/imgcrop

*/
/**
 * @fileoverview 图片裁剪
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.1/plugins/imgcrop/imgcrop',function(S, Node,Base,ImgCrop) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name ImgCropPlugin
     * @class 图片裁剪插件
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function ImgCropPlugin(config) {
        var self = this;
        //调用父类构造函数
        ImgCropPlugin.superclass.constructor.call(self, config);
        self.set('config',config);
    }
    S.extend(ImgCropPlugin, Base, /** @lends ImgCropPlugin.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var config = self.get('config');
            var crop = new ImgCrop(config);
            self.set('crop',crop);
            uploader.on('success',self._successHandler,self);
            uploader.on('select',self._selectHandler,self);
            crop.on('imgload',function(){
                self.set('isRender',true);
            })
        },
        _successHandler:function(ev){
            var self = this;
            var crop = self.get('crop');
            var file = ev.file;
            var id = file.id;
            var url = ev.result.url;
            crop.set('url',url);
            var target = '.J_CropArea_'+id;
            var $target = $(target);
            if(!$target.length) return false;
            crop.set('areaEl',target);
            crop.container = $target;
            crop.set('areaWidth',$target.width());
            crop.set('areaHeight',$target.height());
            crop.render();
        },
        _selectHandler:function(ev){
            var self = this;
            var isRender = self.get('isRender');
            var crop = self.get('crop');
            if(!isRender) return false;
            crop.destroy();
        }
    }, {ATTRS : /** @lends ImgCropPlugin*/{
        /**
         * 插件名称
         * @type String
         * @default imgcrop
         */
        pluginId:{
            value:'imgcrop'
        },
        /**
         * 是否已经初始化
         * @type Boolean
         * @default false
         */
        isRender:{value:false},
        config:{value:{}}
    }});
    return ImgCropPlugin;
}, {requires : ['node','base','gallery/imgcrop/2.1/index']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
