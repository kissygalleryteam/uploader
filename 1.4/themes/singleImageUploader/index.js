/**
 * @fileoverview 单图片上传主题
 * @author 明河、溪夏
 **/
KISSY.add('gallery/uploader/1.4/themes/singleImageUploader/index',function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name singleImageUploader
     * @class 单图片上传主题
     * @constructor
     */
    function singleImageUploader(config) {
        var self = this;
        //调用父类构造函数
        singleImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(singleImageUploader, ImageUploader, /** @lends singleImageUploader.prototype*/{
        render:function(){
            var self = this;
            singleImageUploader.superclass.render.call(self);
            var uploader = self.get('uploader');
            //单图片上传，必须禁用多选
            uploader.set('multiple',false);
        },
        _selectHandler:function(){
            var self = this;
            var queue = self.get('queue');
            var len = queue.get('files').length;
            if(len) queue.clear();
        }
    }, {ATTRS:/** @lends singleImageUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "imageUploader"
         */
        name:{value:'singleImageUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<div class="uploader-img-wrapper">' +
                '<div class="uploader-img">' +
                '<a href="javascript:void(0);"><img class="J_Pic_{id} preview-img" src="" /></a>' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                '<div class="status waiting-status"><p>等待上传，请稍候</p></div>' +
                '<div class="status start-status progress-status success-status">' +
                '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                '</div>' +
                '<div class="status error-status">' +
                '<p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>' +
                '</div>' +
                '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
            '</div>'
        }
    }});
    return singleImageUploader;
}, {requires:['node', '../imageUploader/index']});
/**
 * changes:
 * 明河：1.4
 *           - 重构，继承于ImageUploader
 */
