/**
 * @fileoverview 使用图片裁剪的主题
 * @author 明河
 **/
KISSY.add(function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name CropUploader
     * @class 使用图片裁剪的主题
     * @constructor
     */
    function CropUploader(config) {
        var self = this;
        //调用父类构造函数
        CropUploader.superclass.constructor.call(self, config);
    }

    S.extend(CropUploader, ImageUploader, /** @lends CropUploader.prototype*/{
        render:function(){
            var self = this;
            CropUploader.superclass.render.call(self);
            var uploader = self.get('uploader');
            //单图片上传，必须禁用多选
            uploader.set('multiple',false);
        },
        _selectHandler:function(){
            var self = this;
            var queue = self.get('queue');
            var len = queue.get('files').length;
            if(len) queue.clear();
        },
        _addHandler:function(){

        }
    }, {ATTRS:/** @lends CropUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "imageUploader"
         */
        name:{value:'cropUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<div class="uploader-img-wrapper">' +
                '<div class="uploader-img J_CropArea_{id}"></div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                '<div class="status waiting-status"><p>等待上传，请稍候</p></div>' +
                '<div class="status start-status progress-status success-status">' +
                '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                '</div>' +
                '<div class="status error-status">' +
                '<p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>' +
                '</div>' +
            '</div>'
        }
    }});
    return CropUploader;
}, {requires:['node', '../imageUploader/index']});
/**
 * changes:
 * 明河：1.4
 *           - 新增主题，用于图片裁剪
 */
