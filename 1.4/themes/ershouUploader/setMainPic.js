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