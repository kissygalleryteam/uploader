/**
 * @fileoverview 退款凭证上传主题，继承于imageUploader主题
 * @author 明河
 **/
KISSY.add(function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name RefundUploader
     * @class 退款凭证上传主题，继承于imageUploader主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 明河
     */
    function RefundUploader(config) {
        var self = this;
        //调用父类构造函数
        RefundUploader.superclass.constructor.call(self, config);
    }

    S.extend(RefundUploader, ImageUploader, /** @lends RefundUploader.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        render:function () {
            var self = this;
            RefundUploader.superclass.render.call(self);
            var uploader = self.get('uploader');
            //当移除文件后改变按钮上的文案
            uploader.on('remove',function(){
                self._changeText();
            });
            uploader.on('success',function(){
                self._changeText();
            });
            //获取下按钮上的文案
            var $btn = uploader.get('target');
            var text = $btn.text();
            self.set('defaultText',text);
        },
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

            //显示图片预览
            var $img = $('.J_Pic_' + id);
            $img.show();
            self.preview($img);
        },
        _progressHandler:function (ev) {
            var progress=Math.ceil(ev.loaded*100/ev.total);
            var id=ev.file.id,queue=$('#queue-file-'+id);
            $('.current-progress',queue).html(progress+'%');
            $('.progress-bar',queue).css('border','1px solid #336699');
        },
        _successHandler:function (ev) {
            var id=ev.file.id,queue=$('#queue-file-'+id);
            var result=ev.result;
            var uploader = this.get('uploader');
            var auth = uploader.getPlugin('auth');
            if(result.status){
                $('.J_ZoomPic',queue).attr('data-zoom-img',ev.file.sUrl);
                $('.file-preview',queue).removeClass('hidden');
                $('.current-progress',queue).html('100%').addClass('complete').removeClass('progress');
                var uploader = this.get('uploader');
                var q = uploader.get('queue'),loaded_length=q.getFiles('success').length;
                $('#J_UploadNum').html('已上传'+loaded_length+'张，还可以上传'+(auth.get('max')-loaded_length)+'张');
            }else{
                $('.current-progress',queue).html('0%').removeClass('complete').removeClass('progress');
                $('.progress-bar',queue).css('border','1px solid #ccc');
            }
            var queue = uploader.get('queue');
            S.each(queue.get('files'),function(file,index){
                if(file.id === id){
                    if(index == queue.get('files').length - 2){
                        S.later(function(){
                            auth._maxStopUpload();
                        },1000);
                    }
                }
            })
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
            var self = this;
             var msg = ev.msg||ev.result.msg;
             var file = ev.file;
             //向控制台打印错误消息
             var id = file.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
        },
        /**
         * 改变按钮上的文案
         * @private
         */
        _changeText:function(){
            var self = this;
            var uploader = self.get('uploader');
            var len = self.getFilesLen();
            var $btnTarget = uploader.get('target');
            var $text = $btnTarget.children('span');
            //demo:'您已上传满{max}张图片'
            var maxText = self.get('maxText');
            //demo:上传图片
            var defaultText = self.get('defaultText');
            var max = uploader.get('max');
            if(Number(max) <= len){
                //改变按钮文案
                $text.text(S.substitute(maxText,{max:max}));
            }else{
                $text.text(defaultText);
            }
        }
    }, {ATTRS:/** @lends RefundUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "refundUploader"
         */
        name:{value:'refundUploader'},
        /**
         * 引入的插件
         * @type String
         * @default 'proBars,filedrop,preview,imageZoom'
         */
        use:{value:'proBars,filedrop,preview,imageZoom'},
        // fileTpl:{
        //     value:KISSY.Node.all('#J_UploadTpl').text()
        // },
        /**
         * 按钮上的默认文案（只读）
         * @type String
         * @default ''
         */
        defaultText:{value:'点击上传图片'},
        /**
         * 当达到最大上传数时按钮上改变的文案
         * @type String
         * @default '您已上传满{max}张图片'
         */
        maxText:{value:'您已上传满{max}张图片'}
    }});
    return RefundUploader;
}, {requires:['node', 'gallery/uploader/1.4/themes/imageUploader/index']});