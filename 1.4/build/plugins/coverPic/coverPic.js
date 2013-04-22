/**
 * @fileoverview 从多张图片中选择一张作为封面图片或者主图。
 * @author 紫英（橘子）<daxingplay@gmail.com>，明河<jianping.xwh@taobao.com>

 */
KISSY.add('gallery/uploader/1.4/plugins/coverPic/coverPic', function(S, Node,Base){

    var $ = Node.all;

    /**
     * 从多张图片中选择一张作为封面图片或者主图
     * @param {NodeList | String} $input 目标元素
     * @param {Uploader} uploader uploader的实例
     * @constructor
     */
    function CoverPic($input,uploader){

    }
    S.extend(CoverPic, Base, /** @lends CoverPic.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;

        }
    },{
        ATTRS:/** @lends CoverPic.prototype*/{
            /**
             * 插件名称
             * @type String
             * @default urlsInput
             */
            pluginId:{
                value:'coverPic'
            }
        }
    });

    return CoverPic;

}, {
    requires: [ 'node','base' ]
});