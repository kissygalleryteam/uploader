/**
 * @fileoverview 进度条集合
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/plugins/imageZoom/imageZoom',function(S, Node, Base,IMGDD) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name TagConfig
     * @class 进度条集合
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
            uploader.on('success',self._successHandler,self);
        },
        /**
         * 上传成功了添加图片放大器
         * @param ev
         * @private
         */
        _successHandler:function(ev){
            var self = this;
            var file = ev.file;
            var id = file.id;
            //服务器端返回的数据
            var result = file.result;
            var sUrl =  result.url;
            var $img = $('.J_Pic_'+id);
            $img.attr('data-original-url',sUrl);
            $img.addClass('J_ImgDD');
            self._renderIMGDD(file.target);
        },
        /**
         * 运行图片放大器
         * @private
         */
        _renderIMGDD:function($target){
            if(!$target || !$target.length) return false;
            var imageDD = new IMGDD();
            imageDD.add($target,'.J_ImgDD');
        }
    }, {ATTRS : /** @lends ImageZoom*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'imageZoom'
        }
    }});
    return ImageZoom;
}, {requires : ['node','base','gallery/image-dd/1.0/index']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */