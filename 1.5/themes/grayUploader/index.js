/**
 * @fileoverview 退款凭证上传主题，继承于imageUploader主题
 * @author 明河
 **/
KISSY.add(function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name grayUploader
     * @class 退款凭证上传主题，继承于imageUploader主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 明河
     */
    function grayUploader(config) {
        var self = this;
        //调用父类构造函数
        grayUploader.superclass.constructor.call(self, config);
    }

    S.extend(grayUploader, ImageUploader, /** @lends grayUploader.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        render:function () {
            var self = this;
            grayUploader.superclass.render.call(self);
        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addHandler:function(ev){
            var self = this;
            var file = ev.file;
            var id = file.id;
            var $target = file.target;
            var $actionBar =  $('.J_ActionBar_'+id);
            //显示/隐藏删除按钮
            $target.on('mouseenter mouseleave',function(ev){
                if(ev.type == 'mouseenter'){
                    $actionBar.slideDown(0.3);
                    self._setDisplayMsg(true,file);
                }else{
                    $actionBar.slideUp(0.3);
                    self._setDisplayMsg(false,file);
                }
            });

            var $delBtn = $('.J_Del_'+id) ;
            $delBtn.data('data-file',file);
            //点击删除按钮
            $delBtn.on('click',self._delHandler,self);

            var $zoom = $('.J_Zoom_'+id);
            $zoom.on('click',function(){

            })

            //显示图片预览
            var $img = $('.J_Pic_' + id);
            $img.show();
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
            var self = this;
             var msg = ev.msg;
             var file = ev.file;
             //向控制台打印错误消息
             S.log(msg);
             if(!file) return false;
             var id = file.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html('上传失败');

             S.later(function(){
                 var uploader = self.get('uploader');
                 var queue = uploader.get('queue');
                 queue.remove(id);
             },1000);
        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {
            var self = this;
            var file = ev.file;
            var id = file.id;
            //服务器端返回的数据
            var result = file.result;
            self._setCount();
            //获取服务器返回的图片路径写入到src上
            if(result) self._changeImageSrc(ev);
            $('.J_Mask_'+id).hide();

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
         * 显示/隐藏遮罩层（遮罩层在出现状态消息的时候出现）
         * @param isShow
         * @param data
         * @return {Boolean}
         * @private
         */
        _setDisplayMsg:function(isShow,data){
            if(!data) return false;
            var $mask = $('.J_Mask_' + data.id);
            //出错的情况不允许隐藏遮罩层
            if($mask.parent('li') && $mask.parent('li').hasClass('error')) return false;
            $mask[isShow && 'fadeIn' || 'fadeOut'](0.3);
        }
    }, {ATTRS:/** @lends grayUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "grayUploader"
         */
        name:{value:'grayUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="g-u" data-name="{name}">' +
                '<div class="pic-wrapper">' +
                    '<div class="pic">' +
                        '<span><img class="J_Pic_{id} preview-img" src="" /></span>' +
                    '</div>' +
                    '<div class=" J_Mask_{id} pic-mask"></div>' +
                    '<div class="status-wrapper J_FileStatus">' +
                        '<div class="status waiting-status"><p>等待上传</p></div>' +
                        '<div class="status start-status progress-status success-status">' +
                            '<div class="J_ProgressBar_{id}">上传中...</div>' +
                        '</div>' +
                        '<div class="status error-status">' +
                            '<p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>' +
                    '</div>' +
                '</div>'+
                '<div class="action-bar J_ActionBar_{id} grid">'+
                    '<a class="g-u J_Del_{id}" href="#nowhere" title="删除"><span class="icon del-icon">删除</span></a>'+
                    '<a class="g-u J_Zoom_{id}" data-id="{id}" href="#nowhere" title="放大"><span class="icon zoom-icon">放大</span></a>' +
                '</div>' +
            '</li>'
        }
    }});
    return grayUploader;
}, {requires:['node', '../imageUploader/']});