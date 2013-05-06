KISSY.add(function(f,g,h){function c(a){c.superclass.constructor.call(this,a)}var e=g.all;f.extend(c,h,{render:function(){var a=this;c.superclass.render.call(a);var b=a.get("uploader");b.on("remove",function(){a._changeText()});b.on("success",function(){a._changeText()});b=b.get("target").text();a.set("defaultText",b)},_addHandler:function(a){var a=a.file,b=a.id,d=e(".J_Del_"+b);d.data("data-file",a);d.on("click",this._delHandler,this);a=e(".J_Pic_"+b);a.show();this.preview(a)},_errorHandler:function(a){var b=
this,d=a.msg,a=a.file;f.log(d);if(!a)return!1;var c=a.id;e(".J_ErrorMsg_"+c).html("\u4e0a\u4f20\u5931\u8d25");f.later(function(){alert(d);b.get("uploader").get("queue").remove(c)},1E3)},_changeText:function(){var a=this.get("uploader"),b=this.getFilesLen(),d=a.get("target").children("span"),c=this.get("maxText"),e=this.get("defaultText"),a=a.get("max");Number(a)<=b?d.text(f.substitute(c,{max:a})):d.text(e)}},{ATTRS:{name:{value:"refundUploader"},use:{value:"proBars,filedrop,preview,imageZoom"},fileTpl:{value:'<li id="queue-file-{id}" class="g-u" data-name="{name}"><div class="pic-wrapper"><div class="pic"><span><img class="J_Pic_{id} preview-img" src="" /></span></div><div class=" J_Mask_{id} pic-mask"></div><div class="status-wrapper J_FileStatus"><div class="status waiting-status"><p>\u7b49\u5f85\u4e0a\u4f20</p></div><div class="status start-status progress-status success-status"><div class="J_ProgressBar_{id}">\u4e0a\u4f20\u4e2d...</div></div><div class="status error-status"><p class="J_ErrorMsg_{id}">\u4e0a\u4f20\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\uff01</p></div></div></div><div><a class="J_Del_{id} del-pic" href="#">\u5220\u9664</a></div></li>'},
defaultText:{value:""},maxText:{value:"\u60a8\u5df2\u4e0a\u4f20\u6ee1{max}\u5f20\u56fe\u7247"}}});return c},{requires:["node","gallery/uploader/1.4/themes/imageUploader/index"]});
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