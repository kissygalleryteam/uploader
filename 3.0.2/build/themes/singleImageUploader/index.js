/*
combined files : 

kg/uploader/3.0.2/theme
kg/uploader/3.0.2/themes/imageUploader/index
kg/uploader/3.0.2/themes/singleImageUploader/index

*/
/**
 * @fileoverview 上传组件主题基类
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('kg/uploader/3.0.2/theme',function (S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    //主题样式名前缀
    var classSuffix = {BUTTON:'-button', QUEUE:'-queue'};
    //html中拉取主题模版的容器的type：<script type="text/uploader-theme"></script>
    var HTML_THEME = 'text/uploader-theme';
    /**
     * @name Theme
     * @class 上传组件主题基类
     * @constructor
     * @extends Base
     * @requires Queue
     */
    function Theme(config) {
        var self = this;
        //调用父类构造函数
        Theme.superclass.constructor.call(self, config);
    }

    S.extend(Theme, Base, /** @lends Theme.prototype*/{
        /**
         * 运行主题（供主题扩展使用）
         */
        render:function(){
            var self = this;
            var uploader = self.get("uploader");
            uploader.set('theme',self);
            self._addThemeCssName();
            self._tplFormHtml();
            self._bind();
        },
        /**
         * 选择文件后执行的方法
         * @private
         */
        _selectHandler:function(){

        },
        /**
         * 队列添加完一个文件后触发
         */
        _addHandler:function (ev) {

        },
        /**
         * 删除队列中的文件后触发的监听器
         */
        _removeHandler:function (ev) {

        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function (ev) {

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

        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {

        },
        /**
         * 渲染默认数据
         * @private
         */
        _restore:function(){
            var self = this;
            var uploader = self.get('uploader');
            var urlsInput = uploader.getPlugin('urlsInput');
            if(!urlsInput) return false;
            var autoRestore = urlsInput.get('autoRestore');
            if(!autoRestore) return false;

            var queue = uploader.get('queue');
            var files = queue.get('files');
            if(!files.length) return false;

            S.each(files,function(file,i){
                //将存在的文件数据渲染到队列DOM中，状态为success
                file.status = 'success';
                uploader.fire('add',{file:file,index:i});
                self._renderHandler('_successHandler',{file:file,result:file.result});
                self._hideStatusDiv(file);
            });

            return self;
        },
        /**
         * 将主题名写入到队列和按钮目标容器，作为主题css样式起始
         */
        _addThemeCssName:function () {
            var self = this;
            var name = self.get('name');
            var $queueTarget = self.get('queueTarget');
            var uploader = self.get('uploader');
            var $btn = uploader.get('target');
            if(!$queueTarget.length){
                S.log('不存在容器目标！');
                return false;
            }
            if (name == EMPTY) return false;
            if($queueTarget.length)  $queueTarget.addClass('ks-uploader-queue ' + name + classSuffix.QUEUE);
            $btn.addClass(name + classSuffix.BUTTON);
            return self;
        },
        /**
         * 监听uploader的事件
         * @private
         */
        _bind:function(){
            var self = this;
            var uploader = self.get('uploader');
            var uploaderEvents = ['add','remove','select','start','progress','success','error','complete'];

            uploader.on(uploaderEvents[0],function(ev){
                var $target = self._appendFileDom(ev.file);
                var queue = uploader.get('queue');
                queue.updateFile(ev.index,{target:$target});
            });

            uploader.on(uploaderEvents[1],function(ev){
                self._removeFileDom(ev.file);
            });
            S.each(uploaderEvents,function(e){
                uploader.on(e,function(ev){
                    var handlerName = '_'+ev.type+'Handler';
                    self._renderHandler(handlerName,ev);
                });
            })
        },
        /**
         * 运行监听器方法
         * @private
         */
        _renderHandler:function(handlerName,ev){
            var self = this;
            var handler = self[handlerName];
            self._setStatusVisibility(ev.file);
            handler && handler.call(self,ev);
        },
        /**
         * 设置各个状态下的消息可见性
         * @param {Object} file 文件
         */
        _setStatusVisibility:function (file) {
            var self = this;
            if(!S.isObject(file) || S.isEmptyObject(file)) return self;
            self._hideStatusDiv(file);
            //处理消息层的显影
            var status = file.status;
            var $target = file.target;
            if(!$target.length) return false;
            var $status = $target.all('.'+status+'-status');
            if($status.length){
                $status.show();
            }
            //处理队列元素的状态样式
            var statuses = ['waiting','start','uploading','progress','error','success'];
            S.each(statuses,function(status){
                $target.removeClass(status);
            });
            $target.addClass(status);
            return self;
        },
        /**
         * 隐藏消息层
         * @private
         */
        _hideStatusDiv:function(file){
            if(!S.isObject(file)) return false;
            var $target = file.target;
            $target && $target.length && $target.all('.status').hide();
        },
        /**
         * 当队列添加完文件数据后向队列容器插入文件信息DOM结构
         * @param {Object} fileData 文件数据
         * @return {KISSY.NodeList}
         */
        _appendFileDom:function (fileData) {
            var self = this;
            var tpl = self.get('fileTpl');
            var $target = $(self.get('queueTarget'));
            var hFile;
            if (!$target.length) return false;
            hFile = S.substitute(tpl, fileData);
            return $(hFile).hide().appendTo($target).fadeIn(0.4).data('data-file', fileData);
        },
        /**
         *  移除文件DOM
         * @private
         */
        _removeFileDom:function(file){
            if(!S.isObject(file)) return false;
            var $target = file.target;
            if(!$target || !$target.length) return false;
            $target.fadeOut(0.4,function(){
                $target.remove();
            })
        },
        /**
         * 从html中拉取模版
         * @private
         * @return {String}
         */
        _tplFormHtml:function(){
            var self = this;
            var tpl = self.get('fileTpl');
            var $target = $(self.get('queueTarget'));
            var hasHtmlTpl = false;
            if(!$target.length) return false;

            var $tpl = $target.all('script');
            $tpl.each(function(el){
                if(el.attr('type') == HTML_THEME){
                    hasHtmlTpl = true;
                    tpl = el.html();
                    self.set('fileTpl',tpl);
                }
            });

            return tpl;
        }

    }, {ATTRS:/** @lends Theme.prototype*/{
        /**
         *  主题名
         * @type String
         * @default ""
         */
        name:{value:EMPTY},
        /**
         * 需要加载的uploader插件
         * @type String
         * @default ''
         */
        use:{value:EMPTY},
        /**
         * 主题模版
         * @type String
         * @default ""
         */
        fileTpl:{value:EMPTY },
        /**
         * 验证消息
         * @since 1.4
         * @type Object
         */
        authMsg:{
            value:{}
        },
        /**
         * 队列目标元素（一般是ul），队列的实例化过程在Theme中
         * @type NodeList
         * @default ""
         */
        queueTarget:{
            value:EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        /**
         * Queue（上传队列）实例
         * @type Queue
         * @default ""
         */
        queue:{value:EMPTY},
        /**
         * Uploader 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY}
    }});
    return Theme;
}, {requires:['node', 'base']});
/**
 * changes:
 * 明河：1.5
 *      - 增加ioError事件的监听
 * 明河：1.4
 *           - 去掉状态层概念和log消息
 *           - 增加默认渲染数据操作
 *           - 去掉插件加载
 *           - 增加从html拉取模版的功能
 *           - 增加从外部快速覆盖主题监听器的功能
 *           - 增加主题配置验证消息的功能
 *           - queueTarget优化
 *           - 去掉extend参数
 *           - 去掉cssUrl参数
 *           - 修正authMsg失效的设置失效的问题
 */
/**
 * @fileoverview 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
 * @author 苏河、紫英、明河
 **/
KISSY.add('kg/uploader/3.0.2/themes/imageUploader/index',function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name ImageUploader
     * @class 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 苏河、紫英、明河
     */
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
            var $target = file.target;
            var $delBtn = $('.J_Del_'+id) ;
            //显示/隐藏删除按钮
            $target.on('mouseover mouseout',function(ev){
                if(ev.type == 'mouseover'){
                    $delBtn.show();
                    self._setDisplayMsg(true,file);
                }else{
                    $delBtn.hide();
                    self._setDisplayMsg(false,file);
                }
            });
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
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
             var self = this;
             var msg = ev.msg || ev.result.msg || ev.result.message;
             var file = ev.file;
             if(!file) return false;
             var id = ev.file.id;
             //打印错误消息
             $('.J_ErrorMsg_' + id).html(msg);
             self._setDisplayMsg(true,ev.file);
             //向控制台打印错误消息
             S.log(msg);
        },
        /**
         * 显示“你还可以上传几张图片”
         */
        _setCount:function(){
            var self = this;
            //用于显示上传数的容器
            var elCount = self.get('elCount');
            if(!elCount.length) return false;
            var uploader = self.get('uploader');
            var auth = uploader.getPlugin('auth') ;
            if(!auth) return false;

            var max = auth.get('max');
            if(!max) return false;

            var len = self.getFilesLen();
            elCount.text(Number(max)-len);
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
            if($img.attr('src') == EMPTY || S.UA.safari){
                $img.show();
                $img.attr('src',url);
            }
        }
    }, {ATTRS:/** @lends ImageUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "imageUploader"
         */
        name:{value:'imageUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="g-u" data-name="{name}">' +
                '<div class="pic">' +
                    '<a href="javascript:void(0);"><img class="J_Pic_{id} preview-img" src="" /></a>' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                    '<div class="status waiting-status"><p>等待上传，请稍候</p></div>' +
                    '<div class="status start-status progress-status success-status">' +
                        '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                    '</div>' +
                    '<div class="status error-status">' +
                        '<p class="J_ErrorMsg_{id}">服务器故障，请稍候再试！</p></div>' +
                '</div>' +
                '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
            '</li>'
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
        },
        /**
         * 统计上传张数的容器
         * @type KISSY.NodeList
         * @default '#J_UploadCount'
         */
        elCount:{
            value:'#J_UploadCount',
            getter:function(v){
                return $(v);
            }
        }
    }});
    return ImageUploader;
}, {requires:['node', '../../theme']});
/**
 * @fileoverview 单图片上传主题
 * @author 明河、溪夏
 **/
KISSY.add('kg/uploader/3.0.2/themes/singleImageUploader/index',function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name singleImageUploader
     * @class 单图片上传主题
     * @constructor
     */
    function singleImageUploader(config) {
        var self = this;
        //调用父类构造函数
        singleImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(singleImageUploader, ImageUploader, /** @lends singleImageUploader.prototype*/{
        render:function(){
            var self = this;
            singleImageUploader.superclass.render.call(self);
            var uploader = self.get('uploader');
            //单图片上传，必须禁用多选
            uploader.set('multiple',false);
        },
        _selectHandler:function(){
            var self = this;
            var queue = self.get('queue');
            var len = queue.get('files').length;
            if(len) queue.clear();
        }
    }, {ATTRS:/** @lends singleImageUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "imageUploader"
         */
        name:{value:'singleImageUploader'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<div class="uploader-img-wrapper">' +
                '<div class="uploader-img">' +
                '<a href="javascript:void(0);"><img class="J_Pic_{id} preview-img" src="" /></a>' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper">' +
                '<div class="status waiting-status"><p>等待上传，请稍候</p></div>' +
                '<div class="status start-status progress-status success-status">' +
                '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                '</div>' +
                '<div class="status error-status">' +
                '<p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>' +
                '</div>' +
                '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
            '</div>'
        }
    }});
    return singleImageUploader;
}, {requires:['node', '../imageUploader/index']});
/**
 * changes:
 * 明河：1.4
 *           - 重构，继承于ImageUploader
 */

