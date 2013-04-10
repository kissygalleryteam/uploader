/**
 * @fileoverview 二手市场图片上传主题
 * @author 紫英(橘子)<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/themes/ershouUploader/index', function (S, Node, ImageUploader) {
    var EMPTY = '';
    var $ = Node.all;

    /**
     * @name ErshouUploader
     * @class 二手市场图片上传主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 紫英（橘子）<daxingplay@gmail.com>
     */
    function ErshouUploader(config) {
        var self = this;
        //调用父类构造函数
        ErshouUploader.superclass.constructor.call(self, config);
    }
    
    S.extend(ErshouUploader, ImageUploader, /** @lends ErshouUploader.prototype*/ {
        render:function(){
            var self = this;
            var uploader = self.get('uploader');
		}
    }, {
    	ATTRS: /** @lends ErshouUploader.prototype*/ {
    		/**
	         *  主题名
	         * @type String
	         * @default "ershouUploader"
	         */
	        name: {
	        	value: 'ershouUploader'
        	},
	        /**
	         * css模块路径
	         * @type String
	         * @default "gallery/uploader/1.4/themes/ershouUploader/style.css"
	         */
	        cssUrl: { 
	        	value: 'gallery/uploader/1.4/themes/ershouUploader/style.css'
			},
	        /**
	         * 队列使用的模板
	         * @type String
	         */
	        fileTpl:{
	        	value: '<li id="J_LineQueue-{id}" data-file-id="{id}" data-url="{sUrl}" data-name="{name}" data-size="{textSize}">'+
							'<div class="J_Wrapper wrapper">' +
								'<div class="tb-pic120">'+
									'<a href="javascript:void(0);"><img class="J_ItemPic" src="{sUrl}" /></a>'+
								'</div>'+
								'<div class="pic-mask"></div>'+
                                '<div class="status-wrapper">' +
                                    '<div class="status waiting-status tips-upload-waiting"><p>等待上传，请稍候</p></div>' +
                                    '<div class="status start-status progress-status success-status tips-upload-success">' +
                                    '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                                    '</div>' +
                                    '<div class="status error-status">' +
                                    '<p class="J_ErrorMsg_{id} tips-upload-error">上传失败，请重试！</p></div>' +
                                '</div>' +
								'<div class="upload-op-mask"></div>'+
								'<div class="upload-operations">'+
									'<a class="J_SetMainPic set-as-main" data-file-id="{id}" href="#">设为主图</a>'+
									'<a class="J_DeleltePic del-pic" data-file-id="{id}" href="#">删除</a>'+
								'</div>'+
							'</div>'+
						'</li>'
	        },
            use:{
                value:'proBars,filedrop,preview,coverPic'
            },
			/**
			 * 默认的提示消息
			 * @type String
			 */
			'defaultMsg': {
				value: '最多上传{max}张照片，每张图片小于5M'
			},
			/**
			 * 剩余多少张的消息
			 * @type String
			 */
			'leftMsg': {
				value: '还可以上传{left}张图片，每张小于5M。主图将在搜索结果中展示，请认真设置。'
			}
    	}
    });

    return ErshouUploader;
}, {
	requires:[ 'node', 'gallery/uploader/1.4/themes/imageUploader/index' ]
});
/**
 * changes:
 * 明河：1.4
 *           - 重构主题
 */