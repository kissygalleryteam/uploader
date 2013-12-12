/**
 * @fileoverview native图片上传主题
 * @author 明河
 **/
KISSY.add(function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    function ImageUploader(config) {
        var self = this;
        //调用父类构造函数
        ImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(ImageUploader, Theme, /** @lends ImageUploader.prototype*/{
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
         * 删除文件后重新计算下上传数
         * @private
         */
        _removeHandler:function(){
            this._setCount();
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
            var self = this;
            var file = ev.file;
            var id = file.id;
            var percentage = ev.percentage;
            var $precentage = $('.J_Progress_'+id);
            if($precentage.length){
                self._setDisplayMsg(true,file);
                $precentage.text(percentage+"%");
            }
        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {
            var self = this;
            var file = ev.file;
            //服务器端返回的数据
            var result = ev.result;
            //获取服务器返回的图片路径写入到src上
            if(result) self._changeImageSrc(ev);
            self._setDisplayMsg(false,file);
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
             var self = this;
             var msg = ev.msg;
             var file = ev.file;
             var id = ev.file.id;
             //打印错误消息
             $('.J_ErrorMsg_' + id).html(msg);
             self._setDisplayMsg(true,ev.file);
             //向控制台打印错误消息
             S.log(msg);
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
            $mask[isShow && 'show' || 'hide']();
        },
        /**
         * 删除图片后触发
         */
        _delHandler:function(ev){
            ev.preventDefault();
            var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var file = $(ev.currentTarget).data('data-file');
            if(file){
                var index = queue.getFileIndex(file.id);
                var status = file.status;
                //如果文件还在上传，取消上传
                if(status == 'start' || status == 'progress'){
                    uploader.cancel(index);
                }
                queue.remove(index);
            }
        },
        /**
         * 获取成功上传的图片张数，不传参的情况获取成功上传的张数
         * @param {String} status 状态
         * @return {Number} 图片数量
         */
        getFilesLen:function(status){
            if(!status) status = 'success';
            var self = this,
            queue = self.get('queue'),
            //成功上传的文件数
            successFiles = queue.getFiles(status);
            return successFiles.length;
        },
        /**
         * 将服务器返回的图片路径写到预览图片区域，部分浏览器不支持图片预览
         */
        _changeImageSrc:function(ev){
            var file = ev.file;
            var id = file.id;
            var result = ev.result;
            var url = result.url;
            var $img = $('.J_Pic_' + id);
            $img.show();
            $img.attr('src',url);
            return url;
        }
    }, {ATTRS:/** @lends ImageUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         */
        name:{value:'native-uploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="g-u" data-name="{name}">' +
                '<div class="pic">' +
                    '<img class="J_Pic_{id} preview-img" src="" />' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                    '<div class="status waiting-status"></div>' +
                    '<div class="status progress-status success-status J_Progress_{id}"></div > ' +
                    '<div class="status error-status">' +
                        '<p class="J_ErrorMsg_{id}">上传失败</p></div>' +
                    '</div>' +
                '<a class="J_Del_{id} del-pic" href="#"></a>' +
            '</li>'
        }
    }});
    return ImageUploader;
}, {requires:['node', '../../theme']});