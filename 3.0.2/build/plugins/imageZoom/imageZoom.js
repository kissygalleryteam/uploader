/*
combined files : 

kg/uploader/3.0.2/plugins/imageZoom/imageZoom

*/
/**
 * @fileoverview 图片放大器
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/imageZoom/imageZoom',function(S, Node, Base,Albums) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name ImageZoom
     * @class 图片放大器
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function ImageZoom(config) {
        var self = this;
        //调用父类构造函数
        ImageZoom.superclass.constructor.call(self, config);
    }
    S.extend(ImageZoom, Base, /** @lends ImageZoom.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var theme = uploader.get('theme');
            if(!theme) return false;
            var imageHook = self.get('imageHook');
            var albums = new Albums({
                baseEl: theme.get('queueTarget'),
                img: imageHook
            });

            albums.get('baseEl').delegate('click', imageHook, function(e){
                var target = e.target;
                albums.show($(target));
            });
            self.set("albums",albums);
            uploader.on('success',self._successHandler,self);
        },
        /**
         * 上传成功了添加图片放大器
         * @param ev
         * @private
         */
        _successHandler:function(ev){
            var file = ev.file;
            var id = file.id;
            //服务器端返回的数据
            var result = file.result;
            var sUrl =  result.url;
            var $img = $('.J_Pic_'+id);
            $img.attr('data-original-url',sUrl);
        }
    }, {ATTRS : /** @lends ImageZoom*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'imageZoom'
        },
        /**
         * 图片放大器实例
         */
        albums:{
            value:EMPTY
        },
        /**
         * 图片元素的hook
         */
        imageHook:{
            value:'.preview-img'
        }
    }});
    return ImageZoom;
}, {requires : ['node','base','gallery/albums/1.1/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
