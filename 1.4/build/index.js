/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/base', function (S, Base, Node,UA , IframeType, AjaxType, FlashType, HtmlButton, SwfButton, Queue) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader]:';

    /**
     * @name UploaderBase
     * @class 异步文件上传组件，支持ajax、flash、iframe三种方案
     * @constructor
     * @extends Base
     * @requires UrlsInput
     * @requires IframeType
     * @requires  AjaxType
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {Button} config.button *，Button按钮的实例
     * @param {Queue} config.queue *，Queue队列的实例
     * @param {String|Array} config.type *，采用的上传方案
     * @param {Object} config.serverConfig *，服务器端配置
     * @param {String} config.urlsInputName *，存储文件路径的隐藏域的name名
     * @param {Boolean} config.isAllowUpload 是否允许上传文件
     * @param {Boolean} config.autoUpload 是否自动上传
     * @example
     * var uploader = new UploaderBase({button:button,queue:queue,serverConfig:{action:'test.php'}})
     */
    function UploaderBase(config) {
        var self = this;
        //调用父类构造函数
        UploaderBase.superclass.constructor.call(self, config);
    }


    S.mix(UploaderBase, /** @lends UploaderBase*/{
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
    S.extend(UploaderBase, Base, /** @lends UploaderBase.prototype*/{
        /**
         * 上传指定队列索引的文件
         * @param {Number} index 文件对应的在上传队列数组内的索引值
         * @example
         * //上传队列中的第一个文件，uploader为UploaderBase的实例
         * uploader.upload(0)
         */
        upload:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, uploadType = self.get('uploadType'),
                type = self.get('type'),
                queue = self.get('queue'),
                file = queue.get('files')[index],
                uploadParam;
            if (!S.isPlainObject(file)) {
                S.log(LOG_PREFIX + '队列中不存在id为' + index + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if (self.get('curUploadIndex') != EMPTY) {
                alert('第' + self.get('curUploadIndex') + '文件正在上传，请上传完后再操作！');
                return false;
            }
            //文件上传域，如果是flash上传,input为文件数据对象
            uploadParam = file.input.id || file.input;
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
            self.fire(UploaderBase.event.START, {index:index, file:file});
            //改变文件上传状态为start
            queue.fileStatus(index, UploaderBase.status.START);
            //开始上传
            uploadType.upload(uploadParam);
        },
        /**
         * 取消文件上传，当index参数不存在时取消当前正在上传的文件的上传。cancel并不会停止其他文件的上传（对应方法是stop）
         * @param {Number} index 队列数组索引
         * @return {UploaderBase}
         */
        cancel:function (index) {
            var self = this, uploadType = self.get('uploadType'),
                queue = self.get('queue'),
                statuses = UploaderBase.status,
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
         * @return {UploaderBase}
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
         * @return {UploaderBase}
         * @example
         * //上传队列中所有等待的文件
         * uploader.uploadFiles("waiting")
         */
        uploadFiles:function (status) {
            var self = this;
            if (!S.isString(status)) status = UploaderBase.status.WAITING;
            self.set('uploadFilesStatus', status);
            self._uploaderStatusFile(status);
            return self;
        },
        /**
         * 上传队列中的指定状态下的文件
         * @param {String} status 文件上传状态名
         * @return {UploaderBase}
         */
        _uploaderStatusFile:function (status) {
            var self = this, queue = self.get('queue'),
                fileIndexs = queue.getIndexs(status);
            //没有存在需要上传的文件，退出上传
            if (!fileIndexs.length) {
                self.set('uploadFilesStatus', EMPTY);
                self.fire(UploaderBase.event.UPLOAD_FILES);
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
            //如果是flash异步上传方案，增加swfUploaderBase的实例作为参数
            if (self.get('type') == UploaderBase.type.FLASH) {
                S.mix(serverConfig, {swfUploader:button.get('swfUploader')});
            }
            serverConfig.fileDataName = self.get('name');
            var uploadType = new UploadType(serverConfig);
            var uploaderTypeEvent = UploadType.event;
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
            uploadType.on(uploaderTypeEvent.ERROR, function (ev) {
                self.fire(event.ERROR, {status:ev.status, result:ev.result});
                self._continueUpload();
            }, self);
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
            var self = this, types = UploaderBase.type,
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
            var self = this, types = UploaderBase.type, UploadType,
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
                name = self.get('name'),
                config = {name:name, multiple:multiple, disabled:disabled};
            if (type == UploaderBase.type.FLASH) {
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
            if(type == UploaderBase.type.IFRAME && UA.ie<10){
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
                self.fire(UploaderBase.event.ADD,ev);
            });
            //监听队列的删除事件
            queue.on('remove', function (ev) {
                self.fire(UploaderBase.event.REMOVE,ev);
            });
            self.set('queue', queue);
            return queue;
        },
        /**
         * 选择完文件后
         * @param {Object} ev 事件对象
         */
        _select:function (ev) {
            var self = this, autoUpload = self.get('autoUpload'),
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
            self.fire(UploaderBase.event.SELECT, {files:files});
            //阻止文件上传
            if (!self.get('isAllowUpload')) return false;
            queue.add(files, function () {
                //如果不存在正在上传的文件，且允许自动上传，上传该文件
                if (curId == EMPTY && autoUpload) {
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
        _uploadCompleteHanlder:function (ev) {
            var self = this, result = ev.result, status, event = UploaderBase.event,
                queue = self.get('queue'), index = self.get('curUploadIndex');
            if (!S.isObject(result)) return false;
            //将服务器端的数据保存到队列中的数据集合
            queue.updateFile(index, {result:result});
            //文件上传状态
            status = Number(result.status);
            // 只有上传状态为1时才是成功的
            if (status === 1) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(index, UploaderBase.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS, {index:index, file:queue.getFile(index), result:result});
            } else {
                var msg = result.msg || result.message || EMPTY;
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, UploaderBase.status.ERROR, {msg:msg, result:result});
                self.fire(event.ERROR, {status:status, result:result, index:index, file:queue.getFile(index)});
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
            queue.fileStatus(index, UploaderBase.status.CANCEL);
            //重置当前上传文件id
            self.set('curUploadIndex', EMPTY);
            self.fire(UploaderBase.event.CANCEL, {index:index});
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
            queue.fileStatus(index, UploaderBase.status.PROGRESS, ev);
            self.fire(UploaderBase.event.PROGRESS, ev);
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
        }
    }, {ATTRS:/** @lends UploaderBase.prototype*/{
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
         * 上传方式实例
         * @type UploaderBaseType
         * @default {}
         */
        uploadType:{value:{}},
        /**
         * UrlsInput实例
         * @type UrlsInput
         * @default ""
         */
        urlsInput:{value:EMPTY},
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
        swfSize:{value:{}}
    }});
    return UploaderBase;
}, {requires:['base', 'node', 'ua','./type/iframe', './type/ajax', './type/flash', './button/base', './button/swfButton', './queue']});
/**
 * changes:
 * 明河：1.4
 *           - Uploader上传组件的核心部分
 *           - 去掉 S.convertByteSize
 *           - 修正上传失败后无法继续上传其他文件的bug
 *//**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/button/base',function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[Uploader-Button] ',
        $ = Node.all;
    /**
     * @name Button
     * @class 文件上传按钮，ajax和iframe上传方式使用
     * @constructor
     * @extends Base
     * @param {String} target *，目标元素
     * @param {Object} config 配置对象
     * @param {String} config.name  *，隐藏的表单上传域的name值
     * @param {Boolean} config.disabled 是否禁用按钮
     * @param {Boolean} config.multiple 是否开启多选支持
     */
    function Button(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //超类初始化
        Button.superclass.constructor.call(self, config);
    }

    S.mix(Button, {
        //支持的事件
        event : {
            'beforeShow': 'beforeShow',
            'afterShow': 'afterShow',
            'beforeHide': 'beforeHide',
            'afterHide': 'afterHide',
            'beforeRender' : 'beforeRender',
            'afterRender' : 'afterRender',
            'CHANGE' : 'change'
        },
        /**
         * 获取文件名称（从表单域的值中提取）
         * @param {String} path 文件路径
         * @return {String}
         */
        getFileName : function(path) {
            return path.replace(/.*(\/|\\)/, "");
        }
    });

    S.extend(Button, Base, /** @lends Button.prototype*/{
        /**
         * 运行
         * @return {Button} Button的实例
         */
        render : function() {
            var self = this,
                target = self.get('target'),
                render = self.fire(Button.event.beforeRender);
            if (render === false) {
                S.log(LOG_PREFIX + 'button render was prevented.');
                return false;
            } else {
                if (target == null) {
                    S.log(LOG_PREFIX + 'Cannot find target!');
                    return false;
                }
                self._createInput();
                self.fire(Button.event.afterRender);
                return self;
            }
        },
        /**
         * 显示按钮
         * @return {Button} Button的实例
         */
        show : function() {
            var self = this, target = self.get('target');
            target.show();
            self.fire(Button.event.afterShow);
            return Button;
        },
        /**
         * 隐藏按钮
         * @return {Button} Button的实例
         */
        hide : function() {
            var self = this, target = self.get('target');
            target.hide();
            self.fire(Button.event.afterHide);
            return Button;
        },
        /**
         * 重置按钮
         * @return {Button} Button的实例
         */
        reset : function() {
            var self = this,
                inputContainer = self.get('inputContainer');
            //移除表单上传域容器
            $(inputContainer).remove();
            self.set('inputContainer', EMPTY);
            self.set('fileInput', EMPTY);
            //重新创建表单上传域
            self._createInput();
            return self;
        },
        /**
         * 创建隐藏的表单上传域
         * @return {HTMLElement} 文件上传域容器
         */
        _createInput : function() {
            var self = this,
                target = self.get('target'),
                name = self.get('name'),
                tpl = self.get('tpl'),
                html,
                inputContainer,
                fileInput;
            if (!S.isString(name) || !S.isString(tpl)) {
                S.log(LOG_PREFIX + 'No name or tpl specified.');
                return false;
            }
            html = S.substitute(tpl, {
                'name' : name
            });
            // TODO: inputContainer = DOM.create(html);
            inputContainer = $(html);
            //向body添加表单文件上传域
            $(inputContainer).appendTo(target);
            fileInput = $(inputContainer).children('input');
            //TODO:IE6下只有通过脚本和内联样式才能控制按钮大小
            if(S.UA.ie == 6) fileInput.css('fontSize','400px');
            //TODO:firefox的fontSize不占宽度，必须额外设置left
            //if(S.UA.firefox)  fileInput.css('left','-1200px');
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            //禁用按钮
            self._setDisabled(self.get('disabled'));
            //控制多选
            self._setMultiple(self.get('multiple'));
            return inputContainer;
        },
        /**
         * 文件上传域的值改变时触发
         * @param {Object} ev 事件对象
         */
        _changeHandler : function(ev) {
            var self = this,
                fileInput = self.get('fileInput'),
                value = $(fileInput).val(),
                //IE取不到files
                oFiles = ev.target.files,files = [];
            if (value == EMPTY) {
                S.log(LOG_PREFIX + 'No file selected.');
                return false;
            }
            if(oFiles){
                S.each(oFiles,function(v){
                    if(S.isObject(v)){
                        files.push({'name' : v.name,'type' : v.type,'size' : v.size,data:v});
                    }
                });
            }else{
                files.push({'name' : Button.getFileName(value)});
            }
            self.fire(Button.event.CHANGE, {
                files: files,
                input: fileInput.getDOMNode()
            });
            self.reset();
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} disabled 是否禁用
         * @return {Boolean}
         */
        _setDisabled : function(disabled){
            var self = this,
                cls = self.get('cls'),disabledCls = cls.disabled,
                $target = self.get('target'),
                input = self.get('fileInput');
            if(!$target.length || !S.isBoolean(disabled)) return false;
            if(!disabled){
                $target.removeClass(disabledCls);
                $(input).show();
            }else{
                $target.addClass(disabledCls);
                $(input).hide();
            }
            return disabled;
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} multiple 是否禁用
         * @return {Boolean}
         */
        _setMultiple : function(multiple){
            var self = this,fileInput = self.get('fileInput');
            if(!fileInput.length) return false;
            multiple && fileInput.attr('multiple','multiple') || fileInput.removeAttr('multiple');
            return multiple;
        }
    }, {
        ATTRS : /** @lends Button.prototype */{
            /**
             * 按钮目标元素
             * @type KISSY.Node
             * @default null
             */
            target: {
                value: null
            },
            /**
             * 对应的表单上传域
             * @type KISSY.Node
             * @default ""
             */
            fileInput: {
                value: EMPTY
            },
            /**
             * 文件上传域容器
             * @type KISSY.Node
             * @default ""
             */
            inputContainer: {
                value: EMPTY
            },
            /**
             * 隐藏的表单上传域的模板
             * @type String
             */
            tpl : {
                value : '<div class="file-input-wrapper" style="overflow: hidden;"><input type="file" name="{name}" hidefocus="true" class="file-input" /></div>'
            },
            /**
             * 隐藏的表单上传域的name值
             * @type String
             * @default "fileInput"
             */
            name : {
                value : 'fileInput',
                setter : function(v) {
                    if (this.get('fileInput')) {
                        $(this.get('fileInput')).attr('name', v);
                    }
                    return v;
                }
            },
            /**
             * 是否可用,false为可用
             * @type Boolean
             * @default false
             */
            disabled : {
                value : false,
                setter : function(v) {
                    this._setDisabled(v);
                    return v;
                }
            },
            /**
             * 是否开启多选支持，多选目前有兼容性问题，建议禁用
             * @type Boolean
             * @default true
             */
            multiple : {
                value : true,
                setter : function(v){
                    this._setMultiple(v);
                    return v;
                }
            },
            /**
             * 样式
             * @type Object
             * @default  { disabled : 'uploader-button-disabled' }
             */
            cls : {
                value : {
                    disabled : 'uploader-button-disabled'
                }
            }
        }
    });

    return Button;

}, {
    requires:[
        'node',
        'base'
    ]
});
/**
 * @fileoverview flash上传按钮
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/button/swfButton', function (S, Node, Base, SwfUploader) {
    var EMPTY = '', $ = Node.all,
        SWF_WRAPPER_ID_PREVFIX = 'swf-uploader-wrapper-';

    /**
     * @name SwfButton
     * @class flash上传按钮，基于龙藏的AJBrige。只有使用flash上传方式时候才会实例化这个类
     * @constructor
     * @extends Base
     */
    function SwfButton(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //调用父类构造函数
        SwfButton.superclass.constructor.call(self, config);
    }

    S.mix(SwfButton, /** @lends SwfButton*/{
        /**
         * 支持的事件
         */
        event:{
            //组件运行后事件
            RENDER : 'render',
            //选择文件后事件
            CHANGE:'change',
            //鼠标在swf中滑过事件
            MOUSE_OVER:'mouseOver',
            //鼠标在swf中按下事件
            MOUSE_DOWN:'mouseDown',
            //鼠标在swf中弹起事件
            MOUSE_UP:'mouseUp',
            //鼠标在swf中移开事件
            MOUSE_OUT:'mouseOut',
            //鼠标单击事件
            CLICK:'click'
        }
    });
    S.extend(SwfButton, Base, /** @lends SwfButton.prototype*/{
        /**
         *  运行，会实例化AJBrige的Uploader，存储为swfUploader属性
         */
        render:function () {
            var self = this,
                $target = self.get('target'),
                swfUploader,
                multiple = self.get('multiple'),
                fileFilters = self.get('fileFilters') ;
            $target.css('position', 'relative');
            self.set('swfWrapper',self._createSwfWrapper());
            self._setFlashSizeConfig();
            swfUploader = self._initSwfUploader();
            //SWF 内容准备就绪
            swfUploader.on('contentReady', function(ev){
                //防止多次触发
                if(swfUploader.isContent) return;
                swfUploader.isContent = true;
                //多选和文件过滤控制
                swfUploader.browse(multiple, fileFilters);
                //监听鼠标事件
                self._bindBtnEvent();
                //监听选择文件后事件
                swfUploader.on('fileSelect', self._changeHandler, self);
                self._setDisabled(self.get('disabled'));
                self.fire(SwfButton.event.RENDER);
            }, self);
        },
        /**
         * 创建flash容器
         */
        _createSwfWrapper:function () {
            var self = this,
                target = self.get('target'),
                tpl = self.get('tpl'),
                //容器id
                id = self.get('swfWrapperId') != EMPTY && self.get('swfWrapperId') || SWF_WRAPPER_ID_PREVFIX + S.guid(),
                //容器html
                html = S.substitute(tpl, {id:id});
            self.set('swfWrapperId', id);
            return $(html).appendTo(target);
        },
        /**
         * 初始化ajbridge的uploader
         * @return {SwfUploader}
         */
        _initSwfUploader:function () {
            var self = this, flash = self.get('flash'),
                id = self.get('swfWrapperId'),
                swfUploader;
            S.mix(flash,{id:'swfUploader'+S.guid()});
            try {
                //实例化AJBridge.Uploader
                swfUploader = new SwfUploader(id, flash);
                self.set('swfUploader', swfUploader);
            } catch (err) {

            }
            return swfUploader;
        },
        /**
         * 监听swf的各个鼠标事件
         * @return {SwfButton}
         */
        _bindBtnEvent:function () {
            var self = this, event = SwfButton.event,
                swfUploader = self.get('swfUploader');
            if (!swfUploader) return false;
            S.each(event, function (ev) {
                swfUploader.on(ev, function (e) {
                    self.fire(ev);
                }, self);
            });
            return self;
        },
        /**
         * 设置flash配置参数
         */
        _setFlashSizeConfig:function () {
            var self = this, flash = self.get('flash'),
                target = self.get('target'),
                size = self.get('size');
            if(!S.isEmptyObject(size)){
                S.mix(flash.attrs, size);
            }else{
                S.mix(flash.attrs, {
                    width:target.innerWidth(),
                    height:target.innerHeight()
                });
            }
            self.set('flash', flash);
        },
        /**
         * flash中选择完文件后触发的事件
         */
        _changeHandler:function (ev) {
            var self = this
            if(self.get('swfUploader').id != ev.id) return;
            var files = ev.fileList;
            self.fire(SwfButton.event.CHANGE, {files:files});
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} disabled 是否禁用
         * @return {Boolean}
         */
        _setDisabled : function(disabled){
            var self = this,
                swfUploader = self.get('swfUploader'),
                cls = self.get('cls'),disabledCls = cls.disabled,
                $target = self.get('target'),
                $swfWrapper = self.get('swfWrapper');
            if(!swfUploader || !S.isBoolean(disabled)) return false;
            if(!disabled){
                $target.removeClass(disabledCls);
                //显示swf容器
                $swfWrapper.css('top',0);
                //TODO:之所以不使用更简单的unlock()方法，因为这个方法应用无效，有可能是bug
                //swfUploader.unlock();
            }else{
                $target.addClass(disabledCls);
                //隐藏swf容器
                $swfWrapper.css('top','-3000px');
                //swfUploader.lock();
            }
            return disabled;
        },
        /**
         * 显示按钮
         */
        show:function(){
             var self = this,
                 $target = self.get('target');
             $target.show();
        },
        /**
         * 隐藏按钮
         */
        hide:function(){
            var self = this,
                $target = self.get('target');
            $target.hide();
        }
    }, {ATTRS:/** @lends SwfButton.prototype*/{
        /**
         * 按钮目标元素
         * @type KISSY.Node
         * @default ""
         */
        target:{value:EMPTY},
        /**
         * swf容器
         * @type KISSY.Node
         * @default ""
         */
        swfWrapper : {value : EMPTY},
        /**
         * swf容器的id，如果不指定将使用随机id
         * @type Number
         * @default ""
         */
        swfWrapperId:{value:EMPTY},
        /**
         * flash容器模板
         * @type String
         */
        tpl:{
            value:'<div id="{id}" class="uploader-button-swf" style="position: absolute;top:0;left:0;z-index:2000;"></div>'
        },
        /**
         * 是否开启多选支持
         * @type Boolean
         * @default true
         */
        multiple:{
            value:true,
            setter:function (v) {
                var self = this, swfUploader = self.get('swfUploader');
                if (swfUploader) {
                    swfUploader.multifile(v);
                }
                return v;
            }
        },
        /**
         * 文件过滤，格式类似[{desc:"JPG,JPEG,PNG,GIF,BMP",ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}]
         * @type Array
         * @default []
         */
        fileFilters:{
            value:[],
            setter:function (v) {
                var self = this, swfUploader = self.get('swfUploader');
                if(S.isObject(v)) v = [v];
                if (swfUploader && S.isArray(v)) {
                    S.later(function(){
                        swfUploader.filter(v);
                    },800);
                }
                return v;
            }
        },
        /**
         * 禁用按钮
         * @type Boolean
         * @default false
         */
        disabled : {
            value : false,
            setter : function(v){
                var self = this, swfUploader = self.get('swfUploader');
                if (swfUploader) {
                    self._setDisabled(v);
                }
                return v;
            }
        },
        /**
         * 样式
         * @type Object
         * @default  { disabled:'uploader-button-disabled' }
         */
        cls : {
            value : { disabled:'uploader-button-disabled' }
        },
        /**
         * 强制设置flash的尺寸，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        size : {value:{} },
        /**
         * flash配置，对于swf文件配路径配置非常关键，使用默认cdn上的路径就好
         * @type Object
         * @default { src:'http://a.tbcdn.cn/s/kissy/gallery/uploader/1.4/plugins/ajbridge/uploader.swf', id:'swfUploader', params:{ bgcolor:"#fff", wmode:"transparent" }, attrs:{ }, hand:true, btn:true }
             }
         */
        flash:{
            value:{
                src:'http://a.tbcdn.cn/s/kissy/gallery/uploader/1.4/plugins/ajbridge/uploader.swf',
                id:'swfUploader',
                params:{
                    bgcolor:"#fff",
                    wmode:"transparent"
                },
                //属性
                attrs:{ },
                //手型
                hand:true,
                //启用按钮模式,激发鼠标事件
                btn:true
            }
        },
        /**
         *  ajbridge的uploader的实例
         *  @type SwfUploader
         *  @default ""
         */
        swfUploader:{value:EMPTY}
    }});
    return SwfButton;
}, {requires:['node', 'base', '../plugins/ajbridge/uploader']});/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/index', function (S, Node, UploaderBase, RichBase,JSON) {
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

    var Uploader = RichBase.extend([UploaderBase], /** @lends Uploader.prototype*/{
        constructor:function (target, config) {
            var self = this;
            Uploader.superclass.constructor.call(self, config);
            self.set('target', target);
            self._init();
        },
        /**
         * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
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
            var text = $btn[0].defaultValue || '上传文件';
            var btnHtml = S.substitute(self.get('btnTpl'), {text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);
            //将按钮上name配置到属性上（Button实例必须用到）
            if(!self.get('name') && $btn.attr('name')){
                  self.set('name',$btn.attr('name'));
            }
            //用于tagConfig插件解析按钮上的组件配置
            self.set('_oldInput',$btn.clone());
            $btn.remove();
            self.set('target', $aBtn);
            return $aBtn;
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
                //触发uploader的监听器，给
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
         * 文件域
         * @type NodeList
         * @since 1.4
         * @default ""
         */
        fileInput:{
            value:EMPTY,
            getter:function(v){
                var self = this;
                var $target = self.get('target');
                return $target.all('.file-input');
            }
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
                if(uploadType) uploadType.set('action', v);
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
                    if(uploadType) uploadType.set('data', v);
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
                if (uploadType)uploadType.set('filter', v);
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
        hasRestore:{value:false}
    }}, 'Uploader');
    return Uploader;
}, {requires:['node', './base', 'rich-base','json']});
/**
 * changes:
 * 明河：1.4
 *           - 重构模块
 *           - 去掉urlsInputName参数
 *           - 新增add和remove事件
 *           - 去掉主题的自动异步加载
 *//**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/queue', function (S, Node, Base) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * 转换文件大小字节数
     * @param {Number} bytes 文件大小字节数
     * @return {String} 文件大小
     */
    function convertByteSize(bytes) {
        var i = -1;
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 99);
        return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
    }

    /**
     * @name Queue
     * @class 文件上传队列，用于存储文件数据
     * @constructor
     * @extends Base
     * @param {Object} config Queue没有必写的配置
     * @param {Uploader} config.uploader Uploader的实例
     * @example
     * S.use('gallery/uploader/1.4/queue/base,gallery/uploader/1.4/themes/default/style.css', function (S, Queue) {
     *    var queue = new Queue();
     *    queue.render();
     * })
     */
    function Queue(config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * 支持的事件
         */
        event:{
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'statusChange',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile'
        },
        /**
         * 文件的状态
         */
        status:{
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
        },
        //文件唯一id前缀
        FILE_ID_PREFIX:'file-'
    });
    /**
     * @name Queue#add
     * @desc  添加完文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#addFiles
     * @desc  批量添加文件后触发
     * @event
     * @param {Array} ev.files 添加后的文件数据集合
     */
    /**
     * @name Queue#remove
     * @desc  删除文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#clear
     * @desc  清理队列所有的文件后触发
     * @event
     */
    /**
     * @name Queue#statusChange
     * @desc  当改变文件状态后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {String} ev.status 文件状态
     */
    /**
     * @name Queue#updateFile
     * @desc  更新文件数据后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 向上传队列添加文件
         * @param {Object | Array} files 文件数据，传递数组时为批量添加
         * @example
         * //测试文件数据
 var testFile = {'name':'test.jpg',
     'size':2000,
     'input':{},
     'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
 };
 //向队列添加文件
 queue.add(testFile);
         */
        add:function (files, callback) {
            var self = this,fileData={};
            //如果存在多个文件，需要批量添加文件
            if (files.length > 0) {
                fileData=[];
                var uploader =self.get('uploader');
                var len = self.get('files').length;
                var hasMax = uploader.get('max') > 0;
                S.each(files,function(file, index){
                    if(!hasMax){
                        fileData.push(self._addFile(file));
                    }else{
                        //增加是否超过判断
                        //#128 https://github.com/kissyteam/kissy-gallery/issues/128 by 翰文
                        var max = uploader.get('max');
                        if (max >= len + index + 1) {
                            fileData.push(self._addFile(file));
                        }
                    }
                });
            } else {
                fileData = self._addFile(files);
            }
            callback && callback.call(self);
            return fileData;
        },
        /**
         * 向队列添加单个文件
         * @param {Object} file 文件数据
         * @param {Function} callback 添加完成后执行的回调函数
         * @return {Object} 文件数据对象
         */
        _addFile:function (file,callback) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFile()参数file不合法！');
                return false;
            }
            var self = this,
                //设置文件对象
                fileData = self._setAddFileData(file),
                //文件索引
                index = self.getFileIndex(fileData.id),
                fnAdd = self.get('fnAdd');
            //执行用户自定义的回调函数
            if(S.isFunction(fnAdd)){
                fileData = fnAdd(index,fileData);
            }
            self.fire(Queue.event.ADD, {index:index, file:fileData,uploader:self.get('uploader')});
            callback && callback.call(self, index, fileData);
            return fileData;
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         * @example
         * queue.remove(0);
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file;
            //参数是字符串，说明是文件id，先获取对应文件数组的索引
            if (S.isString(indexOrFileId)) {
                indexOrFileId = self.getFileIndex(indexOrFileId);
            }
            //文件数据对象
            file = files[indexOrFileId];
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + 'remove()不存在index为' + indexOrFileId + '的文件数据');
                return false;
            }
            //将该id的文件过滤掉
            files = S.filter(files, function (file, i) {
                return i !== indexOrFileId;
            });
            self.set('files', files);
            self.fire(Queue.event.REMOVE, {index:indexOrFileId, file:file});
            callback && callback.call(self,indexOrFileId, file);
            return file;
        },
        /**
         * 清理队列
         */
        clear:function () {
            var self = this, files;
            _remove();
            //移除元素
            function _remove() {
                files = self.get('files');
                if (!files.length) {
                    self.fire(Queue.event.CLEAR);
                    return false;
                }
                self.remove(0, function () {
                    _remove();
                });
            }
        },
        /**
         * 获取或设置文件状态，默认的主题共有以下文件状态：'waiting'、'start'、'progress'、'success'、'cancel'、'error' ,每种状态的dom情况都不同，刷新文件状态时候同时刷新状态容器类下的DOM节点内容。
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         * @example
         * queue.fileStatus(0, 'success');
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index)) return false;
            var self = this, file = self.getFile(index),
                theme = self.get('theme'),
                curStatus,statusMethod;
            if (!file) return false;
            //状态
            curStatus = file['status'];
            if(!status){
                return curStatus;
            }
            //状态一直直接返回
            if(curStatus == status) return self;
            //更新状态
            self.updateFile(index,{status:status});
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status,args:args,file:file});
            return  self;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} index 文件在队列中的索引
         * @return {Object}
         */
        getFile:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, files = self.get('files'),
                file = files[index];
            if (!S.isPlainObject(file)){
                file = {};
            }
            return file;
        },
        /**
         * 根据文件id来查找文件在队列中的索引
         * @param {String} fileId 文件id
         * @return {Number} index
         */
        getFileIndex:function (fileId) {
            var self = this, files = self.get('files'), index = -1;
            S.each(files, function (file, i) {
                if (file.id == fileId) {
                    index = i;
                    return true;
                }
            });
            return index;
        },
        /**
         * 更新文件数据对象，你可以追加数据
         * @param {Number} index 文件数组内的索引值
         * @param {Object} data 数据
         * @return {Object}
         */
        updateFile:function (index, data) {
            if (!S.isNumber(index)) return false;
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'updateFile()的data参数有误！');
                return false;
            }
            var self = this, files = self.get('files'),
                file = self.getFile(index);
            if (!file) return false;
            S.mix(file, data);
            files[index] = file;
            self.set('files', files);
            self.fire(Queue.event.UPDATE_FILE,{index : index, file : file});
            return file;
        },
        /**
         * 获取等指定状态的文件对应的文件数组index的数组
         * @param {String} type 状态类型
         * @return {Array}
         * @example
         * //getFiles()和getFileIds()的作用是不同的，getFiles()类似过滤数组，获取的是指定状态的文件数据，而getFileIds()只是获取指定状态下的文件对应的在文件数组内的索引值。
         * var indexs = queue.getFileIds('waiting');
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status == type) {
                        indexs.push(index);
                    }
                }
            });
            return indexs;
        },
        /**
         * 获取指定状态下的文件
         * @param {String} status 状态类型
         * @return {Array}
         * @example
         * //获取等待中的所有文件
         * var files = queue.getFiles('waiting');
         */
        getFiles:function (status) {
            var self = this, files = self.get('files'), statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file && file.status == status) statusFiles.push(file);
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = convertByteSize(file.size);
            //状态
            file.status = 'waiting';
            files.push(file);
            return file;
        }
    }, {ATTRS:/** @lends Queue.prototype*/{
        /**
         * 添加完文件数据后执行的回调函数，会在add事件前触发
         * @type Function
         * @default  ''
         */
        fnAdd:{value:EMPTY},
        /**
         * 队列内所有文件数据集合
         * @type Array
         * @default []
         * @example
         * var ids = [],
         files = queue.get('files');
         S.each(files, function (file) {
         ids.push(file.id);
         });
         alert('所有文件id：' + ids);
         */
        files:{value:[]},
        /**
         * 该队列对应的Uploader实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base']});
/**
 * changes:
 * 明河：1.4
 *           - 去掉与Theme的耦合
 *           - 去掉restore
 *//**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/type/ajax',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-AjaxType]:';

    /**
     * @name AjaxType
     * @class ajax方案上传
     * @constructor
     * @requires UploadType
     */
    function AjaxType(config) {
        var self = this;
        //调用父类构造函数
        AjaxType.superclass.constructor.call(self, config);
    }

    S.mix(AjaxType, /** @lends AjaxType.prototype*/{
        /**
         * 事件列表
         */
        event : S.merge(UploadType.event,{
            PROGRESS : 'progress'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(AjaxType, UploadType, /** @lends AjaxType.prototype*/{
        /**
         * 上传文件
         * @param {File} fileData 文件数据
         * @return {AjaxType}
         */
        upload : function(fileData) {
            //不存在文件信息集合直接退出
            if (!fileData) {
                S.log(LOG_PREFIX + 'upload()，fileData参数有误！');
                return false;
            }
            var self = this;
            self._setFormData();
            self._addFileData(fileData);
            self.send();
            return self;
        },
        /**
         * 停止上传
         * @return {AjaxType}
         */
        stop : function() {
            var self = this,xhr = self.get('xhr');
            if (!S.isObject(xhr)) {
                S.log(LOG_PREFIX + 'stop()，io值错误！');
                return false;
            }
            //中止ajax请求，会触发error事件
            xhr.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
        /**
         * 发送ajax请求
         * @return {AjaxType}
         */
        send : function() {
            var self = this,
                //服务器端处理文件上传的路径
                action = self.get('action'),
                data = self.get('formData');
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            //TODO:如果使用onProgress存在第二次上传不触发progress事件的问题
            xhr.upload.addEventListener('progress',function(ev){
                self.fire(AjaxType.event.PROGRESS, { 'loaded': ev.loaded, 'total': ev.total });
            });
            xhr.onload = function(ev){
                var result = self._processResponse(xhr.responseText);
                self.fire(AjaxType.event.SUCCESS, {result : result});
            };
            xhr.open("POST", action, true);
            data.append("type", "ajax");
            xhr.send(data);
            // 重置FormData
            self._setFormData();
            self.set('xhr',xhr);
            return self;
        },
        /**
         * 设置FormData数据
         */
        _setFormData:function(){
            var self = this;
            try{
            	self.set('formData', new FormData());
                self._processData();
            }catch(e){
            	S.log(LOG_PREFIX + 'something error when reset FormData.');
            	S.log(e, 'dir');
           }
        },
        /**
         * 处理传递给服务器端的参数
         */
        _processData : function() {
            var self = this,data = self.get('data'),
                formData = self.get('formData');
            //将参数添加到FormData的实例内
            S.each(data, function(val, key) {
                formData.append(key, val);
            });
            self.set('formData', formData);
        },
        /**
         * 将文件信息添加到FormData内
         * @param {Object} file 文件信息
         */
        _addFileData : function(file) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFileData()，file参数有误！');
                return false;
            }
            var self = this,
                formData = self.get('formData'),
                fileDataName = self.get('fileDataName');
            formData.append(fileDataName, file);
            self.set('formData', formData);
        }
    }, {ATTRS : /** @lends AjaxType*/{
        /**
         * 表单数据对象
         */
        formData : {value : EMPTY},
        /**
         * ajax配置
         */
        ajaxConfig : {value : {
            type : 'post',
            processData : false,
            cache : false,
            dataType : 'json',
            contentType: false,
            xhrFields: {
                withCredentials: true
            }
        }
        },
        xhr : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }
    });
    return AjaxType;
}, {requires:['node','./base']});/**
 * @fileoverview 上传方式类的基类
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/type/base',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name UploadType
     * @class 上传方式类的基类，定义通用的事件和方法，一般不直接监听此类的事件
     * @constructor
     * @extends Base
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {String} config.action *，服务器端路径
     * @param {Object} config.data 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
     *
     */
    function UploadType(config) {
        var self = this;
        //调用父类构造函数
        UploadType.superclass.constructor.call(self, config);
    }

    S.mix(UploadType, /** @lends UploadType*/{
        /**
         * 事件列表
         */
        event : {
            //开始上传后触发
            START : 'start',
            //停止上传后触发
            STOP : 'stop',
            //成功请求
            SUCCESS : 'success',
            //上传失败后触发
            ERROR : 'error'
        }
    });

    /**
     * @name UploadType#start
     * @desc  开始上传后触发
     * @event
     */
    /**
     * @name UploadType#stop
     * @desc  停止上传后触发
     * @event
     */
    /**
     * @name UploadType#success
     * @desc  上传成功后触发
     * @event
     */
    /**
     * @name UploadType#error
     * @desc  上传失败后触发
     * @event
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UploadType, Base, /** @lends UploadType.prototype*/{
        /**
         * 上传文件
         */
        upload : function() {

        },
        /** 
         * 停止上传
         */
        stop : function(){
            
        },
        /**
         * 处理服务器端返回的结果集
         * @private
         */
        _processResponse:function(responseText){
            var self = this;
            var filter = self.get('filter');
            var result = {};
            if(filter != EMPTY) responseText = filter.call(self,responseText);
            //格式化成json数据
            if(S.isString(responseText)){
                try{
                    result = S.JSON.parse(responseText);
                    result = self._fromUnicode(result);
                }catch(e){
                    var msg = responseText + '，返回结果集responseText格式不合法！';
                    S.log(msg);
                    self.fire('error',{status:-1, result:{msg:msg}});
                }
            }else if(S.isObject(responseText)){
                result = self._fromUnicode(responseText);
            }
            S.log('服务器端输出：' + S.JSON.stringify(result));
            return result;
        },
        /**
         * 将unicode的中文转换成正常显示的文字，（为了修复flash的中文乱码问题）
         * @private
         */
        _fromUnicode:function(data){
            if(!S.isObject(data)) return data;
            _each(data);
            function _each(data){
                S.each(data,function(v,k){
                    if(S.isObject(data[k])){
                        _each(data[k]);
                    }else{
                        data[k] = S.isString(v) && S.fromUnicode(v) || v;
                    }
                });
            }
            return data;
        }

    }, {ATTRS : /** @lends UploadType.prototype*/{
        /**
         * 服务器端路径
         * @type String
         * @default ""
         */
        action : {value : EMPTY},
        /**
         * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
         * @type Object
         * @default {}
         */
        data : {value : {}},
        /**
         * 服务器端返回的数据的过滤器
         * @type Function
         * @default ''
         */
        filter:{
            value:EMPTY
        }
    }});

    return UploadType;
}, {requires:['node','base']});/**
 * @fileoverview flash上传方案，基于龙藏写的ajbridge内的uploader
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/type/flash', function (S, Node, UploadType) {
    var EMPTY = '', LOG_PREFIX = '[uploader-FlashType]:';
    /**
     * @name FlashType
     * @class flash上传方案，基于龙藏写的ajbridge内的uploader
     * @constructor
     * @extends UploadType
     * @requires Node
     */
    function FlashType(config) {
        var self = this;
        //调用父类构造函数
        FlashType.superclass.constructor.call(self, config);
        self.isHasCrossdomain();
        self._init();
    }

    S.mix(FlashType, /** @lends FlashType.prototype*/{
        /**
         * 事件列表
         */
        event:S.merge(UploadType.event, {
            //swf文件已经准备就绪
            SWF_READY: 'swfReady',
            //正在上传
            PROGRESS:'progress'
        })
    });

    S.extend(FlashType, UploadType, /** @lends FlashType.prototype*/{
        /**
         * 初始化
         */
        _init:function () {
            var self = this, swfUploader = self.get('swfUploader');
            if(!swfUploader){
                S.log(LOG_PREFIX + 'swfUploader对象为空！');
                return false;
            }
            //SWF 内容准备就绪
            swfUploader.on('contentReady', function(ev){
                self.fire(FlashType.event.SWF_READY);
            }, self);
            //监听开始上传事件
            swfUploader.on('uploadStart', self._uploadStartHandler, self);
            //监听文件正在上传事件
            swfUploader.on('uploadProgress', self._uploadProgressHandler, self);
            //监听文件上传完成事件
            swfUploader.on('uploadCompleteData',self._uploadCompleteDataHandler,self);
            //监听文件失败事件
            swfUploader.on('uploadError',self._uploadErrorHandler,self);
        },
        /**
         * 上传文件
         * @param {String} id 文件id
         * @return {FlashType}
         */
        upload:function (id) {
            var self = this, swfUploader = self.get('swfUploader'),
                action = self.get('action'), method = 'POST',
                data = self.get('data'),
                name = self.get('fileDataName');
            if(!name) name = 'Filedata';
            self.set('uploadingId',id);
            S.mix(data,{"type":"flash"});
            swfUploader.upload(id, action, method, data,name);
            return self;
        },
        /**
         * 停止上传文件
         * @return {FlashType}
         */
        stop:function () {
            var self = this, swfUploader = self.get('swfUploader'),
                uploadingId = self.get('uploadingId');
            if(uploadingId != EMPTY){
                swfUploader.cancel(uploadingId);
                self.fire(FlashType.event.STOP, {id : uploadingId});
            }
            return self;
        },
        /**
         * 开始上传事件监听器
         * @param {Object} ev ev.file：文件数据
         */
        _uploadStartHandler : function(ev){
            var self = this;
            self.fire(FlashType.event.START, {'file' : ev.file });
        },
        /**
         * 上传中事件监听器
         * @param {Object} ev
         */
        _uploadProgressHandler:function (ev) {
            var self = this;
            S.mix(ev, {
                //已经读取的文件字节数
                loaded:ev.bytesLoaded,
                //文件总共字节数
                total : ev.bytesTotal
            });
            S.log(LOG_PREFIX + '已经上传字节数为：' + ev.bytesLoaded);
            self.fire(FlashType.event.PROGRESS, { 'loaded':ev.loaded, 'total':ev.total });
        },
        /**
         * 上传完成后事件监听器
         * @param {Object} ev
         */
        _uploadCompleteDataHandler : function(ev){
            var self = this;
            var result = self._processResponse(ev.data);
            self.set('uploadingId',EMPTY);
            self.fire(FlashType.event.SUCCESS, {result : result});
        },
        /**
         *文件上传失败后事件监听器
         */
        _uploadErrorHandler : function(ev){
            var self = this;
            self.set('uploadingId',EMPTY);
            self.fire(FlashType.event.ERROR, {msg : ev.msg});
        },
        /**
         * 应用是否有flash跨域策略文件
         */
        isHasCrossdomain:function(){
            var domain = location.hostname;
             S.io({
                 url:'http://' + domain + '/crossdomain.xml',
                 dataType:"xml",
                 error:function(){
                     S.log('缺少crossdomain.xml文件或该文件不合法！');
                 }
             })
        }
    }, {ATTRS:/** @lends FlashType*/{
        /**
         * 服务器端路径，留意flash必须是绝对路径
         */
        action:{
            value:EMPTY,
            getter:function(v){
                var reg = /^http/;
                //不是绝对路径拼接成绝对路径
                if(!reg.test(v)){
                     var href = location.href,uris = href.split('/'),newUris;
                    newUris  = S.filter(uris,function(item,i){
                        return i < uris.length - 1;
                    });
                    v = newUris.join('/') + '/' + v;
                }
                return v;
            }
        },
        /**
         * ajbridge的uploader组件的实例，必须参数
         */
        swfUploader:{value:EMPTY},
        /**
         * 正在上传的文件id
         */
        uploadingId : {value : EMPTY}
    }});
    return FlashType;
}, {requires:['node', './base']});/**
 * @fileoverview iframe方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.4/type/iframe',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeType]:',ID_PREFIX = 'ks-uploader-iframe-';

    /**
     * @name IframeType
     * @class iframe方案上传，全浏览器支持
     * @constructor
     * @extends UploadType
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     *
     */
    function IframeType(config) {
        var self = this;
        //调用父类构造函数
        IframeType.superclass.constructor.call(self, config);
    }

    S.mix(IframeType, /**@lends IframeType*/ {
        /**
         * 会用到的html模板
         */
        tpl : {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}" style="visibility: hidden;">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        },
        /**
         * 事件列表
         */
        event : S.mix(UploadType.event,{
            //创建iframe和form后触发
            CREATE : 'create',
            //删除form后触发
            REMOVE : 'remove'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(IframeType, UploadType, /** @lends IframeType.prototype*/{
        /**
         * 上传文件
         * @param {HTMLElement} fileInput 文件input
         */
        upload : function(fileInput) {
            var self = this,$input = $(fileInput),form;
            if (!$input.length) return false;
            self.fire(IframeType.event.START, {input : $input});
            self.set('fileInput', $input);
            //创建iframe和form
            self._create();
            form = self.get('form');
            if(!form){
                S.log(LOG_PREFIX + 'form节点不存在！');
                return false;
            }
            //提交表单到iframe内
            form.getDOMNode().submit();
        },
        /**
         * 停止上传
         * @return {IframeType}
         */
        stop : function() {
            var self = this,iframe = self.get('iframe');
            iframe.attr('src', 'javascript:"<html></html>";');
            self._remove();
            self.fire(IframeType.event.STOP);
            self.fire(IframeType.event.ERROR, {status : 'abort',msg : '上传失败，原因：abort'});
            return self;
        },
        /**
         * 将参数数据转换成hidden元素
         * @param {Object} data 对象数据
         * @return {String} hiddenInputHtml hidden元素html片段
         */
        dataToHidden : function(data) {
            if (!S.isObject(data) || S.isEmptyObject(data)) return '';
            var self = this,hiddenInputHtml = EMPTY,
                //hidden元素模板
                tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
            if (!S.isString(hiddenTpl)) return '';
            for (var k in data) {
                hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
            }
            return hiddenInputHtml;
        },
        /**
         * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
         * @return {NodeList}
         */
        _createIframe : function() {
            var self = this,
                //iframe的id
                id = ID_PREFIX + S.guid(),
                //iframe模板
                tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                existIframe = self.get('iframe'),
                iframe,$iframe;
            //先判断是否已经存在iframe，存在直接返回iframe
            if (!S.isEmptyObject(existIframe)) return existIframe;
            if (!S.isString(iframeTpl)) {
                S.log(LOG_PREFIX + 'iframe的模板不合法！');
                return false;
            }
            if (!S.isString(id)) {
                S.log(LOG_PREFIX + 'id必须存在且为字符串类型！');
                return false;
            }
            //创建处理上传的iframe
            iframe = S.substitute(tpl.IFRAME, { 'id' : id });
            $iframe = $(iframe);
            //监听iframe的load事件
            $iframe.on('load', self._iframeLoadHandler, self);
            $('body').append($iframe);
            self.set('id',id);
            self.set('iframe', $iframe);
            return $iframe;
        },
        /**
         * iframe加载完成后触发（文件上传结束后）
         */
        _iframeLoadHandler : function(ev) {
            var self = this,iframe = ev.target,
                errorEvent = IframeType.event.ERROR,
                doc = iframe.contentDocument || window.frames[iframe.id].document,
                result;
            if (!doc || !doc.body) {
                self.fire(errorEvent, {msg : '服务器端返回数据有问题！'});
                return false;
            }
            var response = doc.body.innerHTML;
            //输出为直接退出
            if(response == EMPTY) return false;
            result = self._processResponse(response);
            self.fire(IframeType.event.SUCCESS, {result : result});
            self._remove();
        },
        /**
         * 创建文件上传表单
         * @return {NodeList}
         */
        _createForm : function() {
            var self = this,
                //iframe的id
                id = self.get('id'),
                //form模板
                tpl = self.get('tpl'),formTpl = tpl.FORM,
                //想要传送给服务器端的数据
                data = self.get('data'),
                //服务器端处理文件上传的路径
                action = self.get('action'),
                fileInput = self.get('fileInput'),
                hiddens,$form,form;
            if (!S.isString(formTpl)) {
                S.log(LOG_PREFIX + 'form模板不合法！');
                return false;
            }
            if (!S.isString(action)) {
                S.log(LOG_PREFIX + 'action参数不合法！');
                return false;
            }
            hiddens = self.dataToHidden(data);
           hiddens += self.dataToHidden({"type":"iframe"});
            form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
            //克隆文件域，并添加到form中
            $form = $(form).append(fileInput);
            $('body').append($form);
            self.set('form', $form);
            return $form;
        },
        /**
         * 创建iframe和form
         */
        _create : function() {
            var self = this,
                iframe = self._createIframe(),
                form = self._createForm();
            self.fire(IframeType.event.CREATE, {iframe : iframe,form : form});
        },
        /**
         * 移除表单
         */
        _remove : function() {
            var self = this,form = self.get('form');
            if(!form)return false;
            //移除表单
            form.remove();
            //重置form属性
            self.reset('form');
            self.fire(IframeType.event.REMOVE, {form : form});
        }
    }, {ATTRS : /** @lends IframeType.prototype*/{
        /**
         * iframe方案会用到的html模板，一般不需要修改
         * @type {}
         * @default
         * {
         IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
         FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
         HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
         }
         */
        tpl : {value : IframeType.tpl},
        /**
         * 只读，创建的iframeid,id为组件自动创建
         * @type String
         * @default  'ks-uploader-iframe-' +随机id
         */
        id : {value : ID_PREFIX + S.guid()},
        /**
         * iframe
         */
        iframe : {value : {}},
        form : {value : EMPTY},
        fileInput : {value : EMPTY}
    }});

    return IframeType;
}, {requires:['node','./base']});
