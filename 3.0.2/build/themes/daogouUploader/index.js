/*
combined files : 

kg/uploader/3.0.2/themes/daogouUploader/index

*/
/**
 * @fileoverview 淘宝导购平台的上传文件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/themes/daogouUploader/index',function (S, Node, DefaultTheme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name Daogou
     * @class 淘宝导购平台的上传文件
     * @constructor
     * @author 剑平（明河）<minghe36@126.com>
     */
    function Daogou(config) {
        var self = this;
        //调用父类构造函数
        Daogou.superclass.constructor.call(self, config);
    }

    S.extend(Daogou, DefaultTheme, /** @lends Daogou.prototype*/{
        /**
         * 选择文件后触发
         * @private
         */
        _selectHandler:function(ev){
            var file = ev.files[0];
            var name = file.name;
            $('.J_FileName').val(name);
        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler : function(ev){
             var self = this;
             var file = ev.file;
             self._showMsg(file,'.J_UploadingMsg');
        },
        _successHandler:function(ev){
            var self = this;
            var file = ev.file;
            self._showMsg(file,'.J_SuccessMsg');
        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function(ev){
            var self = this;
            var file = ev.file;
            if(!file) return false;
            var id = ev.file.id;
            var msg = ev.msg;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
            self._showMsg(ev.file,'.J_ErrorMsg');
        },
        /**
         * 显示错误消息
         * @param hook
         * @private
         */
        _showMsg:function(file,hook){
            var $target = $(file.target);
            $target.all('.status-msg').hide();
            $target.all(hook).show();
        }
    }, {ATTRS:/** @lends Daogou.prototype*/{
        /**
         *  主题名（文件名）
         * @type String
         * @default "daogouUploader"
         */
        name:{value:'daogouUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<div id="queue-file-{id}" class="file-uploading" data-name="{name}">' +
                '<div class="J_UploadingMsg status-msg">' +
                    '<p class="file-name">{name}</p>' +
                    '<p class="tx">正在部署，请稍候...</p>' +
                    '<div class="J_ProgressBar_{id} f-l uploader-progress"><img class="loading" src="//img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div>' +


                '<div class="J_SuccessMsg status-msg"><i class="i-success"></i><div class="tx"><b>上传成功!</b></div>' +

                '<div class="J_ErrorMsg status-msg"> <i class="i-tip"></i> <div class="tx"><b>上传失败：<i class="dg-light J_ErrorMsg_{id}"></i></b></div></div>' +
            '</div>'
        }
    }});
    return Daogou;
}, {requires:['node', 'kg/kg/uploader/3.0.2/2.0.1/themes/default/index']});
/**
 * changes:
 * 明河：1.4
 *           - 继承于Default主题
 */
