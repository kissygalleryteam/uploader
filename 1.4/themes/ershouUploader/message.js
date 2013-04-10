/**
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
