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
 *//**
 * @fileoverview 横排队列发送消息
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('gallery/uploader/1.4/themes/ershouUploader/message', function(S, Node){
	
	var $ = Node.all,
		LOG_PRE = '[ershouUploader: Message] ';
	
	function Message(config){
		var self = this;
		self.config = S.mix({
			msgContainer: '#J_MsgBoxUpload',
			successMsgCls: 'msg-success',
			hintMsgCls: 'msg-hint',
			errorMsgCls: 'msg-error'
		}, config);
		// Message.superclass.constructor.call(self, config);
		S.log(LOG_PRE + 'Constructed');
	}
	
	S.augment(Message, {
		
		/**
		 * 向msg容器发送消息
		 */
		send: function(msg, type){
			var self = this;
			if(!msg){
				S.log(LOG_PRE + 'You did not tell me what to show.');
				return false;
			}
			var msgBox = self.config.msgContainer,
				newClsName = self.config[type + 'MsgCls'],
				successCls = self.config.successMsgCls,
				hintCls = self.config.hintMsgCls,
				errorCls = self.config.errorMsgCls;
			if(msgBox){
				switch(type){
					case 'success':
					case 'hint':
					case 'error':
						$(msgBox).html(msg);
						$(msgBox).replaceClass([successCls, hintCls, errorCls].join(' '), newClsName);
						return true;
						break;
					default:
						S.log(LOG_PRE + 'type error');
						return false;
						break;
				}
			}
		}
		
	});
	
	return Message;
	
}, {
	requires: [
		'node'
	]
});
/**
 * @fileoverview 设置为主图功能，本来想作为插件去写，但是发现这么简单的功能不适合做插件，做成插件反而复杂了。
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-03-07
 * @requires KISSY 1.2+
 */
KISSY.add('gallery/uploader/1.4/themes/ershouUploader/setMainPic', function(S, Node){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue: setMainPic] ';
	
	function SetMainPic(mainPicInput, queueContainer){
		var self = this,
			mainPicInput = $(mainPicInput),
			queueContainer = $(queueContainer);
		// config = S.mix(_config, config);
		if(!mainPicInput || mainPicInput.length <= 0){
			S.log(LOG_PRE + 'cannot find mainPicInput, SetMainPic function disabled.');
			return false;
		}
		if(!queueContainer || queueContainer.length <= 0){
			S.log(LOG_PRE + 'cannot find queue container');
			return false;
		}
		self.queueContainer = queueContainer;
		self.input = mainPicInput;
	}
	
	S.augment(SetMainPic, {
		/**
		 * 将队列项设置为主图
		 * @param {HTMLElement|String} liElem 需要设置主图的li元素或者是主图路径
		 */
		setMainPic: function(liElem){
			var self = this,
				// container = self.container,
				queueContainer = self.queueContainer,
				uploadQueue = $('li', queueContainer);
			if(S.isString(liElem)){
				S.each(uploadQueue, function(item, index){
					var url = $(item).attr('data-url');
					if(url == liElem){
						liElem = item;
						return true;
					}
				});
			}
			var	curMainPic = self.getMainPic(),
				liElem = $(liElem);
			if(!liElem || liElem.length <= 0){
				// var uploadQueue = $('li', queueContainer);
				if(!uploadQueue[0]){
					S.log(LOG_PRE + 'There is no pic. I cannot set any pic as main pic. So I will empty the main pic input.');
					$(self.input).val('');
					return null;
				}else{
					if(curMainPic.length > 0){
						S.log(LOG_PRE + 'Already have a main pic. Since you do not tell me which one to set as main pic, I will do nothing.');
						return curMainPic;
					}else{
						S.log(LOG_PRE + 'No li element specified. I will set the first pic as main pic.');
						liElem = uploadQueue[0];
					}
				}
			}
			var	liWrapper = $('.J_Wrapper', liElem),
				mainPicLogo = $('<span class="main-pic-logo">主图</span>'),
				mainPicUrl = $(liElem).attr('data-url');
			if(curMainPic.length > 0){
				$(curMainPic).removeClass('main-pic');
				$('.main-pic-logo', curMainPic).remove();
			}
			$(liElem).addClass('main-pic');
			$(mainPicLogo).appendTo(liWrapper);
			$(self.input).val(mainPicUrl);
			S.log(LOG_PRE + 'write main pic url to :' + mainPicUrl);
			return liElem;
		},
		
		/**
		 * 获取当前主图所在li
		 */
		getMainPic: function(){
			var self = this;
			return $(self.queueContainer).children('.main-pic');
		},
		/**
		 * 获取当前主图的路径
		 */
		getMainPicUrl: function(){
			var self = this;
			return $(self.input).val();
		}
	});
	
	// S.extend(SetMainPic, Base, {
// 		
		// _init: function(){
			// var self = this,
				// container = $(self.get('container'));
			// if(!container || container.length <= 0){
				// S.log(LOG_PRE + 'cannot find container');
				// return false;
			// }
		// },
// 		
		// /**
		 // * 将所选id的图片设置为主图
		 // */
		// setMainPic: function(id){
			// var self = this;
		// },
// 		
		// /**
		 // * 获取当前主图
		 // */
		// getMainPic: function(){
			// var self = this;
// 			
		// }
// 		
	// }, {
		// ATTRS: {
// 			
			// 'mainPicInput': {
				// value: '#J_MainPic'
			// },
			// 'container': {
				// value: ''
			// }
// 			
		// }
	// });
	
	return SetMainPic;
	
}, {
	requires: [
		'node'
	]
});