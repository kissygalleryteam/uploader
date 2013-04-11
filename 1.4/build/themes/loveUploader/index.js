/**
 * @fileoverview 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
 * @author 苏河、紫英、明河
 **/
KISSY.add('gallery/uploader/1.4/themes/loveUploader/index', function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name ImageUploader
     * @class 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 苏河、紫英、明河
     */
    function LoveUploader(config) {
        var self = this;
        //调用父类构造函数
        LoveUploader.superclass.constructor.call(self, config);
    }

    S.extend(LoveUploader, ImageUploader, /** @lends LoveUploader.prototype*/{

    }, {ATTRS:/** @lends LoveUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "loveUploader"
         */
        name:{value:'loveUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="tb-pic120">' +
                    '<a href="javascript:void(0);"><img class="J_Pic_{id} preview-img" src="" /></a>' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                    '<div class="status waiting-status tips-upload-waiting"><p class="tips-text">等待上传，请稍候</p></div>' +
                    '<div class="status start-status progress-status success-status tips-uploading">' +
                        '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                    '</div>' +
                    '<div class="status error-status tips-upload-error">' +
                        '<p class="J_ErrorMsg_{id} tips-text">上传失败，请重试！</p></div>' +
                '</div>' +
                '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
            '</li>'
        },
        /**
         * 统计上传张数的容器
         * @type KISSY.NodeList
         * @default '#J_UploadCount'
         */
        elCount:{value:'#J_UploadCount'}
    }});
    return LoveUploader;
}, {requires:['node', 'gallery/uploader/1.4/themes/imageUploader/index']});