/**
 * @fileoverview kissy的editor（编辑器）组件的上传
 * @author 明河
 **/
KISSY.add('gallery/uploader/1.4/themes/editorMultipleUploader/index',function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name EditorMultipleUploader
     * @class kissy的editor（编辑器）组件的上传
     * @constructor
     * @extends Theme
     * @requires Theme
     * @author 明河
     */
    function EditorMultipleUploader(config) {
        var self = this;
        //调用父类构造函数
        EditorMultipleUploader.superclass.constructor.call(self, config);
    }

    S.extend(EditorMultipleUploader, Theme, /** @lends EditorMultipleUploader.prototype*/{
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addHandler:function(ev){
            var self = this;
            var file = ev.file;
            var id = file.id;
            var $delBtn = $('.J_Del_'+id) ;
            $delBtn.data('data-file',file);
            //点击删除按钮
            $delBtn.on('click',self._delHandler,self);
        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler:function (ev) {

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function (ev) {

        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {
            var self = this;
            var file = ev.file;
            var id = file.id;
            //如果不存在进度条插件，隐藏进度条容器
            var uploader = self.get('uploader');
            var proBars = uploader.getPlugin('proBars');
            if(!proBars){
                var target = file.target;
                if(!target) return false;
                target.all('.J_ProgressBar_'+id).hide();
            }
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
             var self = this;
             var msg = ev.msg || ev.result.msg;
             var file = ev.file;
             if(!file) return false;
             var id = ev.file.id;
             //打印错误消息
             $('.J_ErrorMsg_' + id).html(msg);
             //向控制台打印错误消息
             S.log(msg);
        },
        /**
         * 删除图片后触发
         */
        _delHandler:function(ev){
             var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var file = $(ev.target).data('data-file');
            var index = queue.getFileIndex(file.id);
            var status = file.status;
            //如果文件还在上传，取消上传
             if(status == 'start' || status == 'progress'){
                 uploader.cancel(index);
             }
            queue.remove(index);
        }
    }, {ATTRS:/** @lends EditorMultipleUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "editorMultipleUploader"
         */
        name:{value:'editorMultipleUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<tr id="queue-file-{id}" data-name="{name}">'+
                '<td class="ks-editor-upload-filename">{name}</td>'+
                '<td class="ks-editor-upload-filesize">{textSize}</td>'+
                '<td class="ks-editor-upload-progress">'+
                    '<div class="status-wrapper">'+
                        '<div class="status waiting-status start-status progress-status success-status">'+
                            '<div class="J_ProgressBar_{id} ks-editor-progressbar"></div>'+
                            '<span class="ks-editor-progressbar-title J_ProgressCount_{id}">0%</span>' +
                        '</div>'+
                        '<div class="status error-status">' +
                            '<p class="J_ErrorMsg_{id}">服务器故障，请稍候再试！</p>' +
                        '</div>' +
                    '</div>'+
                '</td>'+
                '<td>'+
                    '<a href="#" class="ks-editor-upload-delete J_Del_{id} del-pic">删除</a>'+
                '</td>'+
            '</tr>'
        },
        /**
         * 允许上传的文件类型
         * @since 1.4
         * @type String
         * @default jpg,png,gif,jpeg
         */
        allowExts:{
            value:'jpg,png,gif,jpeg'
        },
        /**
         * 验证消息
         * @type Object
         * @since 1.4
         * @default {}
         */
        authMsg:{
            value:{
                max:'每次最多上传{max}个图片！',
                maxSize:'图片超过{maxSize}！',
                required:'至少上传一张图片！',
                allowExts:'不支持{ext}格式！',
                allowRepeat:'该图片已经存在！',
                widthHeight:'图片尺寸不符合要求！'
            }
        }
    }});
    return EditorMultipleUploader;
}, {requires:['node', 'gallery/uploader/1.4/theme']});