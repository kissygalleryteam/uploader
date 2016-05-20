/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function (S, Node, RichBase,JSON,UA,IframeType, AjaxType, FlashType, HtmlButton, SwfButton, Queue) {
    var LOG_PREFIX = '[uploader]:';
    var EMPTY = '';
    var $ = Node.all;
    var UPLOADER_FILES = 'text/uploader-files';
    /**
     * @name Uploader
     * @class 异步文件上传组件，支持ajax、flash、iframe三种方案
     * @constructor
     */
    /**
     * @name Uploader#select
     * @desc  选择完文件后触发
     * @event
     * @param {Array} ev.files 文件完文件后返回的文件数据
     */

    /**
     * @name Uploader#add
     * @desc  向队列添加文件后触发
     * @since 1.4
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#start
     * @desc  开始上传后触发
     * @event
     * @param {Number} ev.index 要上传的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#progress
     * @desc  正在上传中时触发，这个事件在iframe上传方式中不存在
     * @event
     * @param {Object} ev.file 文件数据
     * @param {Number} ev.loaded  已经加载完成的字节数
     * @param {Number} ev.total  文件总字节数
     */

    /**
     * @name Uploader#complete
     * @desc  上传完成（在上传成功或上传失败后都会触发）
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#success
     * @desc  上传成功后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#error
     * @desc  上传失败后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     * @param {Object} ev.status 服务器端返回的状态码，status如果是-1，说明是前端验证返回的失败
     */

    /**
     * @name Uploader#cancel
     * @desc  取消上传后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     */

    /**
     * @name Uploader#uploadFiles
     * @desc  批量上传结束后触发
     * @event
     */

    /**
     * @name Uploader#remove
     * @desc  从队列中删除文件后触发
     * @since 1.4
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#themeLoad
     * @since 1.4
     * @desc 主题加载后触发
     * @event
     */

    var Uploader = RichBase.extend(/** @lends Uploader.prototype*/{
        constructor:function (target, config) {
            var self = this;
            Uploader.superclass.constructor.call(self, config);
            self.set('target', target);
            self._init();
        },
        /**
         * @return {Uploader}
         */
        _init:function () {
            var self = this;

            var $target = self.get('target');
            if (!$target.length) {
                S.log('目标元素不存在！');
                return false;
            }
            //上传方案选择
            var type = self.get('type');
            var UploaderType = self.getUploadType(type);
            //生成模拟按钮，并实例化按钮类
            self._replaceBtn();
            self._renderButton();
            self._renderQueue();
            self._renderUploaderCore(UploaderType);
            return self;
        },
        /**
         * 将input替换成上传按钮
         * @return {NodeList}
         * @private
         */
        _replaceBtn:function () {
            var self = this;
            var $btn = self.get('target');
            if (!$btn.length) return false;
            //渲染模拟按钮
            var text = $btn[0].defaultValue || self.get('text');
            var btnHtml = S.substitute(self.get('btnTpl'), {text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);
            //将按钮上name配置到属性上（Button实例必须用到）
            if(!self.get('name') && $btn.attr('name')){
                  self.set('name',$btn.attr('name'));
            }
            //用于tagConfig插件解析按钮上的组件配置
            self.set('_oldInput',$btn.clone());
            self.set('fileInput',$btn);
            self.set('target', $aBtn);
            return $aBtn;
        },
        /**
         * 上传指定队列索引的文件
         * @param {Number} index 文件对应的在上传队列数组内的索引值
         * @example
         * //上传队列中的第一个文件，uploader为Uploader的实例
         * uploader.upload(0)
         */
        upload:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, uploadType = self.get('uploadType'),
                type = self.get('type'),
                queue = self.get('queue'),
                file = queue.get('files')[index],
                uploadParam;
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '队列中索引值为' + index + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if (self.get('curUploadIndex') != EMPTY || self.get('curUploadIndex') === 0) {
                alert('第' + self.get('curUploadIndex') + '文件正在上传，请上传完后再操作！');
                return false;
            }
            //iframe，上传参数使用input元素
            uploadParam = file.input;
            //如果是flash上传，使用id即可
            if(type == 'flash') uploadParam = file.input.id;
            //如果是ajax上传直接传文件数据
            if (type == 'ajax') uploadParam = file.data;
            if (file['status'] === 'error') {
                return false;
            }
            //阻止文件上传
            if (!self.get('isAllowUpload')) return false;
            //设置当前上传的文件id
            self.set('curUploadIndex', index);
            //触发文件上传前事件
            self.fire(Uploader.event.START, {index:index, file:file});
            //改变文件上传状态为start
            queue.fileStatus(index, Uploader.status.START);
            //开始上传
            uploadType.upload(uploadParam);
        },
        /**
         * 取消文件上传，当index参数不存在时取消当前正在上传的文件的上传。cancel并不会停止其他文件的上传（对应方法是stop）
         * @param {Number} index 队列数组索引
         * @return {Uploader}
         */
        cancel:function (index) {
            var self = this, uploadType = self.get('uploadType'),
                queue = self.get('queue'),
                statuses = Uploader.status,
                status = queue.fileStatus(index);
            if (S.isNumber(index) && status != statuses.SUCCESS) {
                uploadType.stop();
                queue.fileStatus(index, statuses.CANCEL);
            } else {
                //取消上传后刷新状态，更改路径等操作请看_uploadStopHanlder()
                uploadType.stop();
                //存在批量上传操作，继续上传其他文件
                self._continueUpload();
            }
            return self;
        },
        /**
         * 停止上传动作
         * @return {Uploader}
         */
        stop:function () {
            var self = this;
            self.set('uploadFilesStatus', EMPTY);
            self.cancel();
            return self;
        },
        /**
         * 批量上传队列中的指定状态下的文件
         * @param {String} status 文件上传状态名
         * @return {Uploader}
         * @example
         * //上传队列中所有等待的文件
         * uploader.uploadFiles("waiting")
         */
        uploadFiles:function (status) {
            var self = this;
            if (!S.isString(status)) status = Uploader.status.WAITING;
            self.set('uploadFilesStatus', status);
            self._uploaderStatusFile(status);
            return self;
        },
        /**
         * 上传队列中的指定状态下的文件
         * @param {String} status 文件上传状态名
         * @return {Uploader}
         */
        _uploaderStatusFile:function (status) {
            var self = this, queue = self.get('queue'),
                fileIndexs = queue.getIndexs(status);
            //没有存在需要上传的文件，退出上传
            if (!fileIndexs.length) {
                self.set('uploadFilesStatus', EMPTY);
                self.fire(Uploader.event.UPLOAD_FILES);
                return false;
            }
            //开始上传等待中的文件
            self.upload(fileIndexs[0]);
            return self;
        },
        /**
         * 是否支持ajax方案上传
         * @return {Boolean}
         */
        isSupportAjax:function () {
            var isSupport = false;
            try {
                if (FormData) isSupport = true;
            } catch (e) {
                isSupport = false;
            }
            return isSupport;
        },
        /**
         * 是否支持flash方案上传
         * @return {Boolean}
         */
        isSupportFlash:function () {
            var fpv = S.UA.fpv();
            return S.isArray(fpv) && fpv.length > 0;
        },
        /**
         *  运行上传核心类（根据不同的上传方式，有所差异）
         * @private
         */
        _renderUploaderCore:function(UploadType){
            var self = this;
            var type = self.get('type');
            if (!UploadType) return false;

            var serverConfig = {action:self.get('action'),data:self.get('data'),dataType:'json'};
            var button = self.get('button');
            //如果是flash异步上传方案，增加swfUploader的实例作为参数
            if (self.get('type') == Uploader.type.FLASH) {
                S.mix(serverConfig, {swfUploader:button.get('swfUploader')});
            }
            serverConfig.fileDataName = self.get('name');
            serverConfig.CORS = self.get('CORS');
            serverConfig.filter = self.get('filter');
            var uploadType = new UploadType(serverConfig);
            var uploaderTypeEvent = UploadType.event;
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHandler, self);
            uploadType.on(uploaderTypeEvent.ERROR, self._uploadCompleteHandler, self);
            //监听上传器上传进度事件
            if (uploaderTypeEvent.PROGRESS) uploadType.on(uploaderTypeEvent.PROGRESS, self._uploadProgressHandler, self);
            //监听上传器上传停止事件
            uploadType.on(uploaderTypeEvent.STOP, self._uploadStopHanlder, self);
            self.set('uploadType', uploadType);
            return uploadType;
        },
        /**
         * 获取上传方式类（共有iframe、ajax、flash三种方式）
         * @type {String} type 上传方式
         * @return {IframeType|AjaxType|FlashType}
         */
        getUploadType:function (type) {
            var self = this, types = Uploader.type,
                UploadType;
            //如果type参数为auto，那么type=['ajax','flash','iframe']
            if (type == types.AUTO) type = [types.AJAX,types.IFRAME];
            //如果是数组，遍历获取浏览器支持的上传方式
            if (S.isArray(type) && type.length > 0) {
                S.each(type, function (t) {
                    UploadType = self._getType(t);
                    if (UploadType) return false;
                });
            } else {
                UploadType = self._getType(type);
            }
            return UploadType;
        },
        /**
         * 获取上传方式
         * @param {String} type 上传方式（根据type返回对应的上传类，比如iframe返回IframeType）
         */
        _getType:function (type) {
            var self = this, types = Uploader.type, UploadType,
                isSupportAjax = self.isSupportAjax(),
                isSupportFlash = self.isSupportFlash();
            switch (type) {
                case types.IFRAME :
                    UploadType = IframeType;
                    break;
                case types.AJAX :
                    UploadType = isSupportAjax && AjaxType || false;
                    break;
                case types.FLASH :
                    UploadType = isSupportFlash && FlashType || false;
                    break;
                default :
                    S.log(LOG_PREFIX + 'type参数不合法');
                    return false;
            }
            if (UploadType) S.log(LOG_PREFIX + '使用' + type + '上传方式');
            self.set('type', type);
            return UploadType;
        },
        /**
         * 运行Button上传按钮组件
         * @return {Button}
         */
        _renderButton:function () {
            var self = this, button, Button,
                type = self.get('type'),
                buttonTarget = self.get('target'),
                multiple = self.get('multiple'),
                disabled = self.get('disabled'),
                name = self.get('name');
            var config = {name:name, multiple:multiple, disabled:disabled,srcFileInput:self.get("fileInput")};
            if (type == Uploader.type.FLASH) {
                Button = SwfButton;
                S.mix(config, {size:self.get('swfSize')});
            } else {
                Button = HtmlButton;
            }
            button = new Button(buttonTarget, config);
            //监听按钮改变事件
            button.on('change', self._select, self);
            //运行按钮实例
            button.render();
            self.set('button', button);
            //since v1.4.1 #25
            //IE10下，将多选禁用掉
            if(type == Uploader.type.IFRAME && UA.ie<10){
                self.set('multiple',false);
            }
            return button;
        },
        /**
         * 运行Queue队列组件
         * @return {Queue} 队列实例
         */
        _renderQueue:function () {
            var self = this, queue = new Queue();
            //将上传组件实例传给队列，方便队列内部执行取消、重新上传的操作
            queue.set('uploader', self);
            queue.on('add',function(ev){
                self.fire(Uploader.event.ADD,ev);
            });
            //监听队列的删除事件
            queue.on('remove', function (ev) {
                self.fire(Uploader.event.REMOVE,ev);
            });
            self.set('queue', queue);
            return queue;
        },
        /**
         * 选择完文件后
         * @param {Object} ev 事件对象
         */
        _select:function (ev) {
            var self = this,
                queue = self.get('queue'),
                curId = self.get('curUploadIndex'),
                files = ev.files;
            S.each(files, function (file) {
                //文件大小，IE浏览器下不存在
                if (!file.size) file.size = 0;
                //chrome文件名属性名为fileName，而firefox为name
                if (!file.name) file.name = file.fileName || EMPTY;
                //如果是flash上传，并不存在文件上传域input
                file.input = ev.input || file;
            });
            files = self._processExceedMultiple(files);
            self.fire(Uploader.event.SELECT, {files:files});
            //阻止文件上传
            if (!self.get('isAllowUpload')) return false;
            queue.add(files, function () {
                //如果不存在正在上传的文件，且允许自动上传，上传该文件
                if (curId == EMPTY && self.get('autoUpload')) {
                    self.uploadFiles();
                }
            });
        },
        /**
         * 超过最大多选数予以截断
         */
        _processExceedMultiple:function (files) {
            var self = this, multipleLen = self.get('multipleLen');
            if (multipleLen < 0 || !S.isArray(files) || !files.length) return files;
            return S.filter(files, function (file, index) {
                return index < multipleLen;
            });
        },
        /**
         * 当上传完毕后返回结果集的处理
         */
        _uploadCompleteHandler:function (ev) {
            var self = this, result = ev.result, status, event = Uploader.event,
                queue = self.get('queue'), index = self.get('curUploadIndex');
            if (!S.isObject(result)) return false;
            //将服务器端的数据保存到队列中的数据集合
            queue.updateFile(index, {result:result});
            //文件上传状态
            status = Number(result.status);
            // 只有上传状态为1时才是成功的
            if (status === 1) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(index, Uploader.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS, {index:index, file:queue.getFile(index), result:result});
            } else {
                var msg = result.msg || result.message || EMPTY;
                result.msg = msg;
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, Uploader.status.ERROR, {msg:msg, result:result});
                self.fire(event.ERROR, {msg:msg,status:status, result:result, index:index, file:queue.getFile(index)});
            }
            //置空当前上传的文件在队列中的索引值
            self.set('curUploadIndex', EMPTY);
            self.fire(event.COMPLETE, {index:index, file:queue.getFile(index), result:result});
            //存在批量上传操作，继续上传
            self._continueUpload();
        },
        /**
         * 取消上传后调用的方法
         */
        _uploadStopHanlder:function () {
            var self = this, queue = self.get('queue'),
                index = self.get('curUploadIndex');
            //更改取消上传后的状态
            queue.fileStatus(index, Uploader.status.CANCEL);
            //重置当前上传文件id
            self.set('curUploadIndex', EMPTY);
            self.fire(Uploader.event.CANCEL, {index:index});
        },
        /**
         * 如果存在批量上传，则继续上传
         */
        _continueUpload:function () {
            var self = this,
                uploadFilesStatus = self.get('uploadFilesStatus');
            if (uploadFilesStatus != EMPTY) {
                self._uploaderStatusFile(uploadFilesStatus);
            }
        },
        /**
         * 上传进度监听器
         */
        _uploadProgressHandler:function (ev) {
            var self = this, queue = self.get('queue'),
                index = self.get('curUploadIndex'),
                file = queue.getFile(index);
            S.mix(ev, {file:file});
            queue.fileStatus(index, Uploader.status.PROGRESS, ev);
            self.fire(Uploader.event.PROGRESS, ev);
        },
        /**
         * 上传成功后执行的回调函数
         * @param {Object} data 服务器端返回的数据
         */
        _success:function (data) {
            if (!S.isObject(data)) return false;
            var self = this, url = data.url,
                fileIndex = self.get('curUploadIndex'),
                queue = self.get('queue');
            if (!S.isString(url)) return false;
            //追加服务器端返回的文件url
            queue.updateFile(fileIndex, {'sUrl':url});
        },
        /**
         * 使用指定主题
         * @param {Theme} oTheme 主题类
         * @return  {Uploader|Boolean}
         */
        theme:function (oTheme) {
            var self = this;
            var theme = self.get('theme');
            if(!oTheme)return false;
            if (theme) {
                S.log('不支持重新渲染主题！');
                return self;
            }
            oTheme.set('uploader',self);
            oTheme.set('queue',self.get('queue'));
            oTheme.render && oTheme.render();
            self.fire('themeRender', {theme:theme, uploader:self});
            self.set('theme', oTheme);
            return self;
        },
        /**
         * 渲染默认数据
         * @param target
         */
        restore:function(target){
            var self = this;
            var fileResults;
            self.set('hasRestore',true);
            if(!target){
                var theme = self.get('theme');
                if(!theme) return false;
                var $queueTarget = theme.get('queueTarget');
                if(!$queueTarget || !$queueTarget.length) return false;
                /**
                 * demo:
                 *<script type="text/uploader-files">
                    [{
                    "name":"icon_evil.gif",
                    "url": "http://tp4.sinaimg.cn/1653905027/50/5601547226/1",
                    "desc":"默认数据的图片描述"
                    }]
                  </script>
                 */
                var $script = $queueTarget.all('script');
                $script.each(function(el){
                    if(el.attr('type') == UPLOADER_FILES){
                        fileResults = el.html();
                    }
                });
            }else{
                var $target = $(target);
                if(!$target.length) {
                    S.log('restore()：不存在target！');
                    return false;
                }
                fileResults = $target.text();
            }
            fileResults = JSON.parse(fileResults);
            if(!fileResults.length) return false;
            var queue = self.get('queue');
            var file;
            S.each(fileResults, function (fileResult) {
                fileResult.status = 1;
                file = {
                    type:'restore',
                    name:fileResult.name || '',
                    url:fileResult.url || '',
                    result:fileResult
                };
                //向队列添加文件
                var queueFile = queue.add(file);
                var id = queueFile.id;
                var index = queue.getFileIndex(id);
                //改变文件状态为成功
                queue.fileStatus(index, 'success', {index:index, id:id, file:queueFile});
                //触发uploader的监听器
                self.fire('success',{file:queueFile,result:queueFile.result});
            });
        }
    }, {ATTRS:/** @lends Uploader.prototype*/{
        /**
         * 上传组件的目标元素（一般为file表单域）
         * @type NodeList
         * @since 1.4
         * @default ""
         */
        target:{
            value:EMPTY,
            getter:function (v) {
                return $(v);
            }
        },
        /**
         * 上传按钮上的文案，会优先选取元素的value
         * @since 1.5
         * @default ""
         */
        text:{value:'上传文件'},
        /**
         * 文件域
         * @type NodeList
         * @since 1.4
         * @default ""
         */
        fileInput:{
            value:EMPTY
        },
        /**
         * 主题实例
         * @type Theme
         * @since 1.4
         * @default ""
         */
        theme:{ value:EMPTY },
        /**
         * 模拟上传按钮模版，不推荐替换
         * @type String
         * @since 1.4
         */
        btnTpl:{
            value:'<a href="javascript:void(0)" class="g-u ks-uploader-button"><span class="btn-text">{text}</span></a>'
        },
        /**
         * Button按钮的实例
         * @type Button
         * @default {}
         */
        button:{value:{}},
        /**
         * Queue队列的实例
         * @type Queue
         * @default {}
         */
        queue:{value:{}},
        /**
         * 采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","flash","iframe"]。
         * @type String|Array
         * @default "auto"
         * @since V1.2 （当“type” : “auto”，等价于["ajax","flash","iframe"]）
         */
        type:{value:'auto'},
        /**
         * 是否开启多选支持，部分浏览器存在兼容性问题
         * @type Boolean
         * @default false
         * @since V1.2
         */
        multiple:{
            value:false,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('multiple', v);
                }
                return v;
            }
        },
        /**
         * 用于限制多选文件个数，值为负时不设置多选限制
         * @type Number
         * @default -1
         * @since V1.2.6
         */
        multipleLen:{ value:-1 },
        /**
         * 是否可用,false为可用
         * @type Boolean
         * @default false
         * @since V1.2
         */
        disabled:{
            value:false,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('disabled', v);
                }
                return v;
            }
        },
        /**
         * 服务器处理上传的路径
         * @type String
         * @default ''
         */
        action:{
            value:EMPTY,
            setter:function (v) {
                var self = this, uploadType = self.get('uploadType');
                if(uploadType && !S.isEmptyObject(uploadType)) uploadType.set('action', v);
                return v;
            }
        },
        /**
         * 此配置用于动态修改post给服务器的数据，会覆盖serverConfig的data配置
         * @type Object
         * @default {}
         * @since V1.2.6
         */
        data:{
            value:{},
            setter:function (v) {
                if (S.isObject(v)) {
                    var self = this, uploadType = self.get('uploadType');
                    if(uploadType && !S.isEmptyObject(uploadType)) uploadType.set('data', v);
                }
                return v;
            }
        },
        /**
         * 是否允许上传文件
         * @type Boolean
         * @default true
         */
        isAllowUpload:{value:true},
        /**
         * 是否自动上传
         * @type Boolean
         * @default true
         */
        autoUpload:{value:true},
        /**
         * 服务器端返回的数据的过滤器
         * @type Function
         * @default function(){}
         */
        filter:{
            value:EMPTY,
            setter:function (v) {
                var self = this;
                var uploadType = self.get('uploadType');
                if (uploadType && !S.isEmptyObject(uploadType))uploadType.set('filter', v);
                return v;
            }
        },
        /**
         *  当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
         *  @type Number
         *  @default ""
         */
        curUploadIndex:{value:EMPTY},
        /**
         * 上传方式实例
         * @type UploaderType
         * @default ''
         */
        uploadType:{value:EMPTY},
        /**
         * 强制设置flash的尺寸，只有在flash上传方式中有效，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        swfSize:{value:{}},
        /**
         * 是否调用了restore方法
         * @type Boolean
         * @default false
         */
        hasRestore:{value:false},
        /**
         * Button按钮的实例
         * @type Button
         * @default {}
         */
        button:{value:{}},
        /**
         * Queue队列的实例
         * @type Queue
         * @default {}
         */
        queue:{value:{}},
        /**
         *  当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
         *  @type Number
         *  @default ""
         */
        curUploadIndex:{value:EMPTY},
        /**
         *  当前上传的文件
         *  @type Object
         *  @default ""
         */
        curFile:{
            value:EMPTY,
            getter:function(){
                var self = this;
                var file = EMPTY;
                var curUploadIndex = self.get('curUploadIndex');
                if(S.isNumber(curUploadIndex)){
                    var queue = self.get('queue');
                    file = queue.getFile(curUploadIndex);
                }
                return file;
            }
        },
        /**
         * 上传方式实例
         * @type UploaderType
         * @default {}
         */
        uploadType:{value:{}},
        /**
         * 文件域元素
         * @type NodeList
         * @default ""
         */
        fileInput:{value:EMPTY},
        /**
         * 存在批量上传文件时，指定的文件状态
         * @type String
         * @default ""
         */
        uploadFilesStatus:{value:EMPTY},
        /**
         * 强制设置flash的尺寸，只有在flash上传方式中有效，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        swfSize:{value:{}},
        /**
         * 是否跨域
         */
        CORS:{value:false},
        /**
         * 超时时间，默认10分钟
         * @since V1.5.4
         */
        timeout:{
            value:600,
            setter:function(v){
                var self = this;
                var uploadType = self.get('uploadType');
                if (uploadType && !S.isEmptyObject(uploadType)){
                    uploadType.set('timeout', v);
                }
                return v;
            }
        }
    }}, 'Uploader');
    S.mix(Uploader, /** @lends Uploader*/{
        /**
         * 上传方式，{AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'}
         */
        type:{AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'},
        /**
         * 组件支持的事件列表，{ RENDER:'render', SELECT:'select', START:'start', PROGRESS : 'progress', COMPLETE:'complete', SUCCESS:'success', UPLOAD_FILES:'uploadFiles', CANCEL:'cancel', ERROR:'error' }
         *
         */
        event:{
            //选择完文件后触发
            SELECT:'select',
            //向队列添加一个文件后触发
            ADD:'add',
            //开始上传后触发
            START:'start',
            //正在上传中时触发
            PROGRESS:'progress',
            //上传完成（在上传成功或上传失败后都会触发）
            COMPLETE:'complete',
            //上传成功后触发
            SUCCESS:'success',
            //批量上传结束后触发
            UPLOAD_FILES:'uploadFiles',
            //取消上传后触发
            CANCEL:'cancel',
            //上传失败后触发
            ERROR:'error',
            //移除队列中的一个文件后触发
            REMOVE:'remove',
            //初始化默认文件数据时触发
            RESTORE:'restore'
        },
        /**
         * 文件上传所有的状态，{ WAITING : 'waiting', START : 'start', PROGRESS : 'progress', SUCCESS : 'success', CANCEL : 'cancel', ERROR : 'error', RESTORE: 'restore' }
         */
        status:{
            WAITING:'waiting',
            START:'start',
            PROGRESS:'progress',
            SUCCESS:'success',
            CANCEL:'cancel',
            ERROR:'error'
        }
    });
    return Uploader;
}, {requires:['node', 'rich-base','json', 'ua','./type/iframe', './type/ajax', './type/flash', './button/base', './button/swfButton', './queue']});
/**
 * changes:
 * 明河：1.5
 *          - [-] 删除_oldInput
 *          - [!] 将input append到容器，而不是重新创建一个
 * 明河：1.4
 *           - 重构模块
 *           - 去掉urlsInputName参数
 *           - 新增add和remove事件
 *           - 去掉主题的自动异步加载
 */