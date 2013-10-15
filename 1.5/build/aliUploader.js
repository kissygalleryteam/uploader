/*
combined files : 

gallery/uploader/1.5/type/base
gallery/uploader/1.5/type/iframe
gallery/uploader/1.5/type/ajax
gallery/uploader/1.5/type/flash
gallery/uploader/1.5/button/base
gallery/uploader/1.5/plugins/ajbridge/ajbridge
gallery/uploader/1.5/plugins/ajbridge/uploader
gallery/uploader/1.5/button/swfButton
gallery/uploader/1.5/queue
gallery/uploader/1.5/base
gallery/uploader/1.5/index
gallery/uploader/1.5/plugins/auth/auth
gallery/uploader/1.5/plugins/filedrop/filedrop
gallery/uploader/1.5/plugins/imageZoom/imageZoom
gallery/uploader/1.5/plugins/imgcrop/imgcrop
gallery/uploader/1.5/plugins/preview/preview
gallery/uploader/1.5/plugins/proBars/progressBar
gallery/uploader/1.5/plugins/proBars/proBars
gallery/uploader/1.5/plugins/tagConfig/tagConfig
gallery/uploader/1.5/plugins/urlsInput/urlsInput
gallery/uploader/1.5/plugins/paste/paste
gallery/uploader/1.5/plugins/plugins
gallery/uploader/1.5/aliUploader

*/
/**
 * @fileoverview 上传方式类的基类
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/type/base',function(S, Node, Base) {
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
}, {requires:['node','base']});
/**
 * @fileoverview iframe方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/type/iframe',function(S, Node, UploadType) {
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
/**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/type/ajax',function(S, Node, UploadType,io) {
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
        self._setWithCredentials();
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
            var self = this;
            //不存在文件信息集合直接退出
            if (!fileData) {
                S.log(LOG_PREFIX + 'upload()，fileData参数有误！');
                return self;
            }
            var blobSize = self.get('blobSize');
            if(blobSize > 0){
                //分段上传
                self._chunkedUpload(fileData);
            }else{
                self._fullUpload(fileData);
            }
            return self;
        },
        /**
         * 停止上传
         * @return {AjaxType}
         */
        stop : function() {
            debugger;
            var self = this,ajax = self.get('ajax');
            if (!S.isObject(ajax)) {
                S.log(LOG_PREFIX + 'stop()，io值错误！');
                return self;
            }
            //中止ajax请求，会触发error事件
            ajax.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
        /**
         * 获取传输给服务器端的FormData
         * @param formData
         * @return {*}
         * @private
         */
        _getFormData: function (formData) {
            if ($.isArray(formData)) {
                return formData;
            }
            //window.postMessage 无法直接发送 FormData
            //所以将其转成数组
            if (S.isObject(formData)) {
                formData = [];
                $.each(formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return formData;
        },
        /**
         * 跨域上传时，需要携带cookies
         * @private
         */
        _setWithCredentials:function(){
            var self = this;
            var CORS = self.get('CORS');
            var ajaxConfig = self.get('ajaxConfig');
            S.mix(ajaxConfig,{xhrFields: {
                withCredentials: true
            }});
            return ajaxConfig;
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
            }
        },
        /**
         * 重置FormData
         * @private
         */
        _resetFormData:function(){
            var self = this;
            self.set('formData', new FormData());
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
            var self = this;
            var formData = self.get('formData');
            var fileDataName = self.get('fileDataName');
            var fileName = file.name;
            formData.append(fileDataName, file,fileName);
            self.set('formData', formData);
            return formData;
        },
        /**
         * 分段上传
         * @param file
         * @return {boolean}
         * @private
         */
        _chunkedUpload:function(file){
            if(!S.isObject(file)) return false;
            var self = this;
            var ajaxConfig = self.get('ajaxConfig');
            var action = self.get('action');
            S.mix(ajaxConfig,{
                url:action
            });

            var size = file.size;
            //已经上传的字节数
            var uploadedBytes = 0;
            var maxChunkSize = self.get('blobSize') || size;
            //数据分块API（不同浏览器有不同实现）
            var slice = file.slice || file.webkitSlice || file.mozSlice;
            function upload(){
                //文件切块，每块的大小为maxChunkSize-uploadedBytes
                //http://dev.w3.org/2006/webapi/FileAPI/
                var blob = slice.call(
                    file,
                    uploadedBytes,
                    uploadedBytes + maxChunkSize,
                    file.type
                );
                //分块的文件大小
                var chunkSize = blob.size;

                //设置请求头
                self._setContentDisposition(file.name);
                self._setContentRange(uploadedBytes,chunkSize,size);

                //将用户自定义的data添加到FormData中
                self._setFormData();
                //向FormData添加文件数据
                self._addFileData(blob);
                S.mix(ajaxConfig,{
                    data:self.get('formData')
                });
                var ajax = io(ajaxConfig);
                ajax.then(function(data){
                    var result = data[0];
                    //upload success
                    //算出已经上传的文件大小
                    uploadedBytes = self._getUploadedBytes(ajax) || uploadedBytes + chunkSize;
                    //派发进度事件
                    self.fire(AjaxType.event.PROGRESS, { 'loaded': uploadedBytes, 'total': size });
                    //还有没有上传完的文件，继续上传
                    if(uploadedBytes< size){
                        upload();
                    }else{
                        //已经上传完成，派发success事件
                        self.fire(AjaxType.event.SUCCESS, {result : result});
                    }
                },function(data){
                    self._errorHandler(data,file);
                })
            }

            upload();
        },
        /**
         * 整个文件上传
         * @param file
         * @return {*}
         * @private
         */
        _fullUpload:function(file){
            var self = this;
            var ajaxConfig = self.get('ajaxConfig');
            //将用户自定义的data添加到FormData中
            self._setFormData();
            //向FormData添加文件数据
            self._addFileData(file);
            S.mix(ajaxConfig,{
                data:self.get('formData'),
                url:self.get('action')
            });
            var ajax = io(ajaxConfig);
            ajax.then(function(data){
                //upload success
                var result = data[0];
                //上传完成，派发success事件
                self.fire(AjaxType.event.SUCCESS, {result : result});
            },function(data){
                self._errorHandler(data,file);
            });
            self.set('ajax',ajax);
            return ajax;
        },
        /**
         * ajax请求出错时的处理
         * @private
         */
        _errorHandler:function(data,file){
            var self = this;
            var result = {};
            var status = data[1];
            if(status == 'timeout'){
                result.msg = '请求超时！';
                result.status = 'timeout';
            }
            self.fire(AjaxType.event.ERROR, {status:status,result : result,file:file});
        },
        /**
         * 解析ajax请求返回的响应头Range，获取已经上传的文件字节数
         * @param ajax
         * @return {String}
         * @private
         */
        _getUploadedBytes:function(ajax){
            //获取服务器端返回的响应头（Range）
            var range = ajax.getResponseHeader('Range');
            var parts = range && range.split('-');
            var upperBytesPos = parts && parts.length > 1 && parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },
        /**
         * 设置传输到服务器的内容范围，即Content-Range
         * @param uploadedBytes 已经上传的字节数
         * @param chunkSize 分块的大小
         * @param size 文件总大小
         * @return {string}
         * @private
         */
        _setContentRange:function(uploadedBytes,chunkSize,size){
            //用于指定整个实体中的一部分的插入位置，他也指示了整个实体的长度。在服务器向客户返回一个部分响应，它必须描述响应覆盖的范围和整个实体长度。一般格式： Content-Range: bytes (unitSPfirst byte pos) - [last byte pos]/[entity legth]
            //比如Content-Range: bytes 123-456/801 //文件是从0起算，所以必须-1
            //http://blog.chinaunix.net/uid-11959329-id-3088466.html
            var contentRange = 'bytes ' + uploadedBytes + '-' + (uploadedBytes + chunkSize - 1) + '/' + size;
            var self = this;
            var ajaxConfig = self.get('ajaxConfig');
            var headers= ajaxConfig.headers;
            headers['Content-Range'] = contentRange;
            return contentRange;
        },
        /**
         * 设置Content-Disposition（MIME 协议的扩展，MIME 协议指示 MIME 用户代理如何显示附加的文件）
         * http://hi.baidu.com/water_qq/item/e257762575a1f70b76272cde
         * @param fileName 文件名
         * @return {String}
         * @private
         */
        _setContentDisposition:function(fileName){
            return this._setRequestHeader('Content-Disposition','attachment; filename="' + encodeURI(fileName) + '"');
        },
        /**
         * 设置请求头
         * @param name 头名
         * @param value 头的值
         * @private
         */
        _setRequestHeader:function(name,value){
            var self = this;
            var ajaxConfig = self.get('ajaxConfig');
            ajaxConfig.headers[name] = value;
            self.set('ajaxConfig',ajaxConfig);
            return value;
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
            //传输的是FormData，无需序列化表单数据
            processData : false,
            cache : false,
            dataType : 'json',
            contentType: false,
            //默认超时时间10秒
            timeout:10,
            headers:{}
        }
        },
        /**
         * IO的实例
         */
        ajax : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY},
        /**
         * 块文件数据的大小
         * @type Number
         * @default 0
         */
        blobSize:{value:0},
        /**
         * 是否是跨域上传
         */
        CORS:{value:false},
        /**
         * 是否使用postMessage来跨域传输文件数据
         */
        isUsePostMessage:{value:false}
    }
    });
    return AjaxType;
}, {requires:['node','./base','ajax']});
/**
 * changes:
 * 明河：1.5
 *           - [+]重构模块
 *           - [+]增加分段上传支持
 *           - [+]增加blobSize配置
 *           - [+]增加isUsePostMessage配置
 *           - [+]增加uploadedBytes属性
 *           - [+]增加timeout
 *           - [!]xhr配置变成ajax
 */
/**
 * @fileoverview flash上传方案，基于龙藏写的ajbridge内的uploader
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/type/flash',function (S, Node, UploadType) {
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
}, {requires:['node', './base']});
/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/button/base',function(S, Node, Base) {
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
            var self = this;
            var srcFileInput = self.get('srcFileInput');
            if(!srcFileInput || !srcFileInput.length){
                S.log('[Button]file元素不存在！');
                return self;
            }
            var newSrcFileInput = srcFileInput.clone();
            newSrcFileInput.addClass('file-input');
            srcFileInput.remove();
            self.set('srcFileInput',newSrcFileInput);
            self._createInput();
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
            var self = this;
            var inputContainer = self.get('inputContainer');
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
            var self = this;
            var target = self.get('target');
            var name = self.get('name');
            var tpl = self.get('tpl');
            var inputContainer;
            if (!S.isString(tpl)) return false;
            var srcFileInput = self.get('srcFileInput');
            if(!srcFileInput.length) return false;
            //克隆并显示文件上传域
            var fileInput = srcFileInput.clone();
            self.set('fileInput',fileInput);

            var $inputContainer = $(tpl);
            $inputContainer.append(fileInput);
            //向body添加表单文件上传域
            $inputContainer.appendTo(target);
            //TODO:IE6下只有通过脚本和内联样式才能控制按钮大小
            if(S.UA.ie == 6) fileInput.css('fontSize','400px');
            //TODO:firefox的fontSize不占宽度，必须额外设置left
            //if(S.UA.firefox)  fileInput.css('left','-1200px');
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            self.set('inputContainer', $inputContainer);
            //禁用按钮
            self._setDisabled(self.get('disabled'));
            //控制多选
            self._setMultiple(self.get('multiple'));
            return $inputContainer;
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
             * 表单上传域的克隆元素
             */
            fileInput: {
                value: EMPTY
            },
            /**
             * 表单上传域
             */
            srcFileInput:{
                value:EMPTY
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
                value : '<div class="file-input-wrapper" style="overflow: hidden;"></div>'
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
 * changes:
 * 明河：1.5
 *      - [!]fileInput使用clone
 *      - [+]新增srcFileInput
 */

/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
/**
 * AJBridge Class
 * @author kingfo oicuicu@gmail.com
 */
KISSY.add('gallery/uploader/1.5/plugins/ajbridge/ajbridge',function(S,Flash) {

    var ID_PRE = '#',
        VERSION = '1.0.15',
		PREFIX = 'ks-ajb-',
		LAYOUT = 100,
        EVENT_HANDLER = 'KISSY.AJBridge.eventHandler'; // Flash 事件抛出接受通道

    /**
     * @constructor
     * @param {String} id       注册应用容器 id
     * @param {Object} config   基本配置同 S.Flash 的 config
     * @param {Boolean} manual  手动进行 init
     */
    function AJBridge(id, config,manual) {
        id = id.replace(ID_PRE, ''); // 健壮性考虑。出于 KISSY 习惯采用 id 选择器
        config = Flash._normalize(config||{}); // 标准化参数关键字

        var self = this,
            target = ID_PRE + id, // 之所以要求使用 id，是因为当使用 ajbridge 时，程序员自己应该能确切知道自己在做什么
            callback = function(data) {
                if (data.status < 1) {
                    self.fire('failed', { data: data });
                    return;
                }
				
                S.mix(self, data);

                // 执行激活 静态模式的 flash
                // 如果这 AJBridge 先于 DOMReady 前执行 则失效
                // 建议配合 S.ready();
                if (!data.dynamic || !config.src) {
						self.activate();
                }
            };
		
		// 自动产生 id	
		config.id = config.id || S.guid(PREFIX);

        // 注册应用实例
        AJBridge.instances[config.id] = self;

        //	动态方式
        if (config.src) {
            // 强制打开 JS 访问授权，AJBridge 的最基本要求
            config.params.allowscriptaccess = 'always';
            config.params.flashvars = S.merge(config.params.flashvars, {
                // 配置 JS 入口
                jsEntry: EVENT_HANDLER,
                // 虽然 Flash 通过 ExternalInterface 获得 obejctId
                // 但是依然存在兼容性问题, 因此需要直接告诉
                swfID: config.id
            });
        }

        // 支持静态方式，但是要求以上三个步骤已静态写入
        // 可以参考 test.html
		
        // 由于完全基于事件机制，因此需要通过监听之后进行初始化 Flash
		
        if(manual)self.__args = [target, config, callback];
		else S.later(Flash.add,LAYOUT,false,Flash,[target, config, callback]);
    }

    /**
     * 静态方法
     */
    S.mix(AJBridge, {

        version: VERSION,

        instances: { },

        /**
         * 处理来自 AJBridge 已定义的事件
         * @param {String} id            swf传出的自身ID
         * @param {Object} event        swf传出的事件
         */
        eventHandler: function(id, event) {
            var instance = AJBridge.instances[id];
            if (instance) {
                instance.__eventHandler(id, event);
            }
        },

        /**
         * 批量注册 SWF 公开的方法
         * @param {Class} C
         * @param {String|Array} methods
         */
        augment: function (C, methods) {
            if (S.isString(methods)) {
                methods = [methods];
            }
            if (!S.isArray(methods)) return;
			
			

            S.each(methods, function(methodName) {
                C.prototype[methodName] = function() {
                    try {
                        return this.callSWF(methodName, S.makeArray(arguments));
                    } catch(e) { // 当 swf 异常时，进一步捕获信息
                        this.fire('error', { message: e });
                    }
                }
            });
        }
    });

    S.augment(AJBridge, S.EventTarget, {

        init: function() {
			if(!this.__args)return;
            Flash.add.apply(Flash, this.__args);
			this.__args = null;
			delete this.__args; // 防止重复添加
        },

        __eventHandler: function(id, event) {
            var self = this,
                type = event.type;
			
            event.id = id;   //	弥补后期 id 使用
            switch(type){
				case "log":
					 S.log(event.message);
					break;
				default:
					self.fire(type, event);
			}
			
        },

        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {String} the name of the function to call
         * @param args {Array} the set of arguments to pass to the function.
         */
        callSWF: function (func, args) {
            var self = this;
            args = args || [];
            try {
                if (self.swf[func]) {
                    return self.swf[func].apply(self.swf, args);
                }
            }
            // some version flash function is odd in ie: property or method not supported by object
            catch(e) {
                var params = '';
                if (args.length !== 0) {
                    params = "'" + args.join("','") + "'";
                }
                //avoid eval for compressiong
                return (new Function('self', 'return self.swf.' + func + '(' + params + ');'))(self);
            }
        }
    });

    // 为静态方法动态注册
    // 注意，只有在 S.ready() 后进行 AJBridge 注册才有效。
    AJBridge.augment(AJBridge, ['activate', 'getReady','getCoreVersion']);

    window.AJBridge = S.AJBridge = AJBridge;

    return AJBridge;
}, { requires:["gallery/flash/1.0/index"] });
/**
 * NOTES:
 * 20120117 移植成kissy1.2.0的模块（明河修改）
 */

/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
/**
 * @author kingfo  oicuicu@gmail.com
 */
KISSY.add('gallery/uploader/1.5/plugins/ajbridge/uploader',function(S,flash,A) {

    /**
     * @constructor
     * @param {String} id                                    需要注册的SWF应用ID
     * @param {Object} config                                配置项
     * @param {String} config.ds                             default server 的缩写
     * @param {String} config.dsp                            default server parameters 的缩写
     * @param {Boolean} config.btn                           启用按钮模式，默认 false
     * @param {Boolean} config.hand                          显示手型，默认 false
     */
    function Uploader(id, config) {
        config = config || { };
        var flashvars = { };
		
		
		
		S.each(['ds', 'dsp', 'btn', 'hand'], function(key) {
			if(key in config) flashvars[key] = config[key];
		});
		

        config.params = config.params || { };
        config.params.flashvars = S.merge(config.params.flashvars, flashvars);

		Uploader.superclass.constructor.call(this, id, config);
    }

    S.extend(Uploader, A);

    A.augment(Uploader,
        [
            'setFileFilters',
            'filter',
            'setAllowMultipleFiles',
            'multifile',
            'browse',
            'upload',
            'uploadAll',
            'cancel',
            'getFile',
            'removeFile',
            'lock',
            'unlock',
            'setBtnMode',
            'useHand',
            'clear'
        ]
        );

    Uploader.version = '1.0.1';
    A.Uploader = Uploader;
    return A.Uploader;
},{ requires:["gallery/flash/1.0/index","./ajbridge"] });
/**
 * changes:
 * 明河：1.4
 *           - flash模块改成gallery/flash/1.0/，flash模块1.3不再存在
 */

/**
 * @fileoverview flash上传按钮
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/button/swfButton',function (S, Node, Base, SwfUploader) {
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
            var srcFileInput = self.get('srcFileInput');
            if(srcFileInput && srcFileInput.length){
                srcFileInput.remove();
            }
            return self;
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
         * @default { src:'http://a.tbcdn.cn/s/kissy/gallery/uploader/1.5/plugins/ajbridge/uploader.swf', id:'swfUploader', params:{ bgcolor:"#fff", wmode:"transparent" }, attrs:{ }, hand:true, btn:true }
             }
         */
        flash:{
            value:{
                src:'http://a.tbcdn.cn/s/kissy/gallery/uploader/1.5/plugins/ajbridge/uploader.swf',
                id:'swfUploader',
                params:{
                    bgcolor:"#fff",
                    wmode:"transparent"
                },
                //属性
                attrs:{
                    width:400,
                    height:400
                },
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
        swfUploader:{value:EMPTY},
        srcFileInput:{value:EMPTY}
    }});
    return SwfButton;
}, {requires:['node', 'base', '../plugins/ajbridge/uploader']});
/**
 * changes:
 * 明河：1.5
 *      - [+]新增srcFileInput
 */
/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/queue',function (S, Node, Base) {
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
     * S.use('gallery/uploader/1.5/queue/base,gallery/uploader/1.5/themes/default/style.css', function (S, Queue) {
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
         * @param  {Number} indexOrId 文件在队列中的索引或id
         * @return {Object}
         */
        getFile:function (indexOrId) {
            var self = this;
            var file;
            var files = self.get('files');
            if(S.isNumber(indexOrId)){
                file = files[indexOrId];
            }else{
                S.each(files, function (f) {
                    if (f.id == indexOrId) {
                        file = f;
                        return true;
                    }
                });
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
            if(!file.status) file.status = 'waiting';
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
 * 明河：1.5
 *      - [!] #72 getFile()方法优化
 * 明河：1.4
 *           - 去掉与Theme的耦合
 *           - 去掉restore
 */
/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/base',function (S, Base, Node,UA , IframeType, AjaxType, FlashType, HtmlButton, SwfButton, Queue) {
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
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '队列中索引值为' + index + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if (self.get('curUploadIndex') != EMPTY) {
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
            serverConfig.CORS = self.get('CORS');
            var uploadType = new UploadType(serverConfig);
            var uploaderTypeEvent = UploadType.event;
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
            uploadType.on(uploaderTypeEvent.ERROR, self._uploadCompleteHanlder, self);
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
                name = self.get('name');
            var config = {name:name, multiple:multiple, disabled:disabled,srcFileInput:self.get("fileInput")};
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
                result.msg = msg;
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, UploaderBase.status.ERROR, {msg:msg, result:result});
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
         * @type UploaderBaseType
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
        CORS:{value:false}
    }});
    return UploaderBase;
}, {requires:['base', 'node', 'ua','./type/iframe', './type/ajax', './type/flash', './button/base', './button/swfButton', './queue']});
/**
 * changes:
 * 明河：1.5
 *      - [+]新增curFile属性
 *      - [+]增加超时处理
 *      - [!]克隆input支持
 * 明河：1.4
 *           - Uploader上传组件的核心部分
 *           - 去掉 S.convertByteSize
 *           - 修正上传失败后无法继续上传其他文件的bug
 */
/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/index',function (S, Node, UploaderBase, RichBase,JSON) {
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
            self.set('fileInput',$btn);
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
 * 明河：1.5
 *          - [-] 删除_oldInput
 *          - [!] 将input append到容器，而不是重新创建一个
 * 明河：1.4
 *           - 重构模块
 *           - 去掉urlsInputName参数
 *           - 新增add和remove事件
 *           - 去掉主题的自动异步加载
 */
/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/auth/auth',function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    var ERROR_EVENT = 'error';
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
     * @name Auth
     * @class 文件上传验证，可以从按钮的data-auth伪属性抓取规则配置
     * @constructor
     * @extends Base
     * @param {Uploader} uploader *，上传组件实例
     * @param {Object} config 配置
     */
    function Auth(config) {
        var self = this;
        Auth.superclass.constructor.call(self, config);
    }
    /**
     * @name Auth#error
     * @desc  当验证出错时触发
     * @event
     * {rule:'require',msg : rule[1],value : isRequire}
     * @param {String} ev.rule 规则名
     * @param {String} ev.msg 出错消息
     * @param {Boolean|String} ev.value 规则值
     */
    S.extend(Auth, Base, /** @lends Auth.prototype*/{
        /**
         * 初始化
         */
        pluginInitializer:function (uploader) {
            if(!uploader) return false;
            var self = this;
            self.set('uploader',uploader);
            self._useThemeConfig();
            var queue = uploader.get('queue');
            self._setSwfButtonExt();
            queue.on('add',function(ev){
                var file = ev.file;
                //默认渲染的数据，不需要验证
                if(file.type == 'restore') return true;

                var isPass = self.testAllowExt(file);
                if(isPass) isPass = self.testMaxSize(file);
                if(isPass) self.testRepeat(file);
                if(isPass) self.testWidthHeight(file);
            });
            queue.on('remove',function(ev){
                var file = ev.file,status = file.status;
                //删除的是已经成功上传的文件，需要重新检验最大允许上传数
                if(status == 'success') self.testMax() && self.testRequired();
            });
            uploader.on('success',function(){
                self.testMax();
            });
            uploader.on('error', function (ev) {
                if(ev.status === -1 && ev.rule == 'max'){
                    self._maxStopUpload();
                }
                //允许继续上传文件
                uploader.set('isAllowUpload', true);
            });
        },
        /**
         * 使用主题的验证消息
         * @private
         */
        _useThemeConfig:function(){
            var self = this;
            var msg = self.get('msg');
            if(!S.isEmptyObject(msg)) return false;
            var uploader = self.get('uploader');
            var theme = uploader.get('theme');
            if(!theme) return false;
            var msg = theme.get('authMsg');
            if(msg) self.set('msg',msg);
            var allowExts = self.get('allowExts');
            if(!allowExts){
                self.set('allowExts',theme.get('allowExts'));
            }
            return self;
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         */
        setAllowExts:function(exts){
            if(!S.isString(exts)) return false;
            var ext = [];
            var desc = [];
            exts = exts.split(',');
            S.each(exts,function(e){
                ext.push('*.'+e);
                desc.push(e.toUpperCase());
            });
            ext = ext.join(';');
            desc = desc.join(',');
            return {desc:desc,ext:ext};
        },
        /**
         * 验证上传数、是否必须上传
         * @return {Boolean}
         */
        testAll : function(){
            var self = this;
            return self.testRequire() && self.testMax();
        },
        /**
         * 判断上传方式
         * @param type
         * @return {Boolean}
         */
        isUploaderType:function (type) {
            var self = this, uploader = self.get('uploader'),
                uploaderType = uploader.get('type');
            return type == uploaderType;
        },
        /**
         * 检验是否已经上传了至少一个文件
         * @return {Boolean}
         */
        testRequired:function(){
            var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var files = queue.getFiles('success');
            return files.length > 0;
        },
        /**
         * 测试是否是允许的文件上传类型
         * @param {Object} file 文件对象
         * @return {Boolean} 是否通过
         */
        testAllowExt:function (file) {
            if (!S.isObject(file)) return false;
            var self = this;
            var fileName = file.name;
            var allowExts = self.get('allowExts');
            if (!allowExts) return true;

            //扩展名数组
            var exts = allowExts.split(',');

            var isAllow = _isAllowUpload(exts,fileName);
            //如果不是支持的文件格式，出现错误
            if(!isAllow){
                var fileExt = _getFileExt(fileName);
                var msg = self.msg('allowExts');
                msg = S.substitute(msg,{ext : fileExt});
                self._fireUploaderError('allowExts',[allowExts,msg],file);
            }
            /**
             * 是否允许上传
             * @param {String} fileName 文件名
             * @return {Boolean}
             */
            function _isAllowUpload(exts,fileName) {
                var isAllow = false;
                var lowerCaseFileName = fileName.toLowerCase();
                var reg;
                S.each(exts, function (ext) {
                    reg = new RegExp('^.+\.' + ext + '$');
                    //存在该扩展名
                    if (reg.test(lowerCaseFileName))  return isAllow = true;
                });
                return isAllow;
            }
            /**
             * 获取文件扩展名
             * @param {String} file
             */
            function _getFileExt(file){
                var arr = file.split('.');
                return arr[arr.length -1];
            }
            return isAllow;
        },
        /**
         * 检验是否达到最大允许上传数
         * @return {Boolean}
         */
        testMax:function () {
            var self = this;
            var max = self.get('max');
            if(max == EMPTY) return true;

            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            //获取已经上传成功的文件
            var successFiles = queue.getFiles('success');
            var len = successFiles.length;
            var isPass = len < max;
            //达到最大允许上传数
            if(!isPass){
                //禁用按钮
                uploader.set('disabled',true);
                uploader.set('isAllowUpload', false);

                var msg = self.msg('max');
                msg = S.substitute(msg,{max : max});
                self._fireUploaderError('max',[max,msg]);
            }else{
                uploader.set('disabled',false);
                uploader.set('isAllowUpload', true);
            }
            return isPass;
        },
        /**
         * 检验是否超过允许最大文件大小，留意iframe上传方式此验证无效
         * @param {Object} file 文件对象
         * @return Boolean
         */
        testMaxSize : function(file){
            var self = this;
            var size = file.size;
            var maxSize = self.get('maxSize');
            if(maxSize == EMPTY || !size) return true;
            var uploader = self.get('uploader');
            maxSize = maxSize * 1024;
            var isAllow = size <= maxSize;
            if(!isAllow){
                var msg = self.msg('maxSize');
                msg = S.substitute(msg,{maxSize:convertByteSize(maxSize),size : file.textSize});
                self._fireUploaderError('maxSize',[maxSize,msg],file);
            }
            return isAllow;
        },
        /**
         * 检验文件是否重复（检验文件名，很有可能存在误差，比如不同目录下的相同文件名会被判定为同一文件）
         * @param {Object} file 文件对象
         * @return {Boolean}
         */
        testRepeat : function(file){
            if(!S.isObject(file)) return false;
            var self = this;
            var fileName = file.name;
            var allowRepeat = self.get('allowRepeat');
            if(allowRepeat === EMPTY) return false;

            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var files = queue.getFiles('success');
            var isRepeat = false ;
            //文件名相同，且文件大小相同
            S.each(files,function(f){
                if(f.name == fileName){
                    if(f.size){
                        if(f.size == file.size) self._fireUploaderError('allowRepeat',[allowRepeat,self.msg('allowRepeat')],file);
                    }else{
                        self._fireUploaderError('allowRepeat',[allowRepeat,self.msg('allowRepeat')],file);
                    }
                    return isRepeat = true;
                }
            });
            return isRepeat;
        },
        /**
         * 检验图片的宽度和高度是否符合要求，非常特殊的验证形式，传入的是函数数据，比如：
         * widthHeight:[function(width){
                return width >= 160;
            },function(height){
                return height >= 160;
            }]
         * @param {Object} file 文件对象
         * @return {Boolean}
         */
        testWidthHeight:function(file){
            var self = this;
            var fnWidthHeights = self.get('widthHeight');
            if(fnWidthHeights === EMPTY) return true;

            var uploader = self.get('uploader');
            //禁止图片上传（图片尺寸的验证过程是异步的）
            uploader.set('isAllowUpload',false);
            //文件数据，IE9下不存在
            var fileData = file.data;
            if(!S.isEmptyObject(fileData)){
                //读取图片数据
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //加载图片获取图片真实宽度和高度
                    var image = new Image();
                    image.onload=function(){
                        var width = image.width;
                        var height = image.height;
                        _test(width,height);
                    };
                    image.src= data;
                };
                reader.readAsDataURL(fileData);
            }else{
                //IE下使用滤镜来处理图片尺寸控制
                //文件name中IE下是完整的图片本地路径
                var input = uploader.get('target').all('input').getDOMNode();
                input.select();
                //确保IE9下，不会出现因为安全问题导致无法访问
                input.blur();
                var src = document.selection.createRange().text;
                var img = $('<img style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image);width:300px;visibility:hidden;"  />').appendTo('body').getDOMNode();
                img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
                var width = img.offsetWidth;
                var height = img.offsetHeight;
                _test(width,height);
                $(img).remove();
            }
            /**
             * 比对图片尺寸
             * @param width
             * @param height
             * @private
             */
            function _test(width,height){
                var isPass = fnWidthHeights.call(self,width,height);

                if(!isPass){
                    //触发错误消息
                    var msg = self.msg('widthHeight');
                    self._fireUploaderError('widthHeight',[fnWidthHeights,msg],file);
                }else{
                    //重新开始上传图片
                    uploader.set('isAllowUpload',true);
                    var index = uploader.get('queue').getFileIndex(file.id);
                    uploader.upload(index);
                }
            }
        },
        /**
         * 设置flash按钮的文件格式过滤
         * @return {Auth}
         */
        _setSwfButtonExt:function () {
            var self = this;
            var uploader = self.get('uploader');
            var allowExts = self.get('allowExts');
            var button = uploader.get('button');
            var isFlashType = self.isUploaderType('flash');
            if (!isFlashType || allowExts ===   EMPTY) return false;
            allowExts = self.setAllowExts(allowExts);
            //设置文件过滤
            if(button) button.set('fileFilters', allowExts[0]);
            return self;
        },
        /**
         * 获取扩展名，需额外添加大写扩展名
         * @param {String} sExt 扩展名字符串，类似*.jpg;*.jpeg;*.png;*.gif;*.bmp
         * @retunr {Array}
         */
        _getExts:function (sExt) {
            if (!S.isString(sExt)) return false;
            var exts = sExt.split(';'),
                uppercaseExts = [],
                reg = /^\*\./;
            S.each(exts, function (ext) {
                ext = ext.replace(reg, '');
                uppercaseExts.push(ext.toUpperCase());
            });
            S.each(uppercaseExts,function(ext){
                exts.push(ext);
            });
            return exts;
        },
        /**
         * 触发uploader的error事件
         * @param ruleName
         * @param rule
         * @param file
         */
        _fireUploaderError:function(ruleName,rule,file){
            var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var params = {status:-1,rule:ruleName};
            var index = -1;
            if(file){
                index = queue.getFileIndex(file.id);
                S.mix(params,{file:file,index:index});
            }
            //result是为了与uploader的error事件保持一致
            if(rule) S.mix(params,{msg : rule[1],value : rule[0],result:{}});
            queue.fileStatus(index, 'error', params);
            self.fire(ERROR_EVENT,params);
            uploader.fire('error',params);
        },
        /**
         * 如果达到最大上传数，阻止后面文件的上传，并予以移除
         * @private
         */
        _maxStopUpload:function(){
            var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var max = self.get('max');
            var curFileIndex = uploader.get('curUploadIndex');
            if(curFileIndex == EMPTY || curFileIndex < max) return false;
            var files = queue.get('files');
            uploader.stop();
            S.each(files,function(file,index){
                if(index >= curFileIndex){
                    queue.remove(file.id);
                }
            })
            uploader.set('curUploadIndex', EMPTY);
        },
        /**
         * 获取/设置指定规则的验证消息
         * @param {String} rule 规则名
         * @param {String} msg  消息
         * @return {String}
         */
        msg:function(rule,msg){
            var self = this;
            if(!S.isString(rule)) return self;
            var msgs = self.get('msg');
            if(!S.isString(msg)){
                return msgs[rule];
            }

            msgs[rule] = msg;
            return msg;
        },
        _processRuleConfig:function(rule,config){
            var self = this;
            if(!S.isString(rule)) return self;
            //demo max:[o,''达到最大上传数！]带有消息参数需要设置下消息
            if(S.isArray(config)){
                self.msg(rule,config[1]);
            }
            return self;
        }
    }, {ATTRS:/** @lends Auth.prototype*/{
        /**
         * 插件名称
         * @type String
         * @default auth
         */
        pluginId:{
            value:'auth'
        },
        /**
         * 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{ value:EMPTY },
        /**
         * 至少上传一个文件验证规则配置
         * @type Boolean
         * @default ''
         */
        required:{value:EMPTY},
        /**
         * 最大允许上传数验证规则配置
         * @type Boolean
         * @default ''
         */
        max:{value:EMPTY},
        /**
         *  文件格式验证规则配置
         * @type Boolean
         * @default ''
         */
        allowExts:{value:EMPTY},
        /**
         * 文件大小验证规则配置
         * @type Boolean
         * @default ''
         */
        maxSize:{value:EMPTY},
        /**
         *  文件重复性验证规则配置
         * @type Boolean
         * @default ''
         */
        allowRepeat:{value:EMPTY},
        /**
         *  限制文件宽度高度验证规则配置，比如['<=160',"<=160"]
         * @type Array
         * @default ''
         */
        widthHeight:{value:EMPTY},
        /**
         * 验证消息配置
         * @type Object
         * @default { }
         */
        msg:{value:{}
        }
    }});
    return Auth;
}, {requires:['node','base']});

/**
 * changes:
 * 明河：1.4
 *           - 更改模块路径，将auth移到plugins下
 *           - 重构验证类，以rich base插件的形式出现
 *           - 去掉testRequire方法，并通过queue的file进行验证
 *           - 重写allowExts
 *           - 去掉getAllowExts
 *           - 重写_setSwfButtonExt
 *           - 去掉getRule
 *           - 增加widthHeight限制
 * 明河：2012.11.22
 *          - 去掉重复的代码，敲自己脑袋
 *          - 修正必须存在max的bug
 */
/**
 * @fileoverview  文件拖拽上传插件
 *  @author 飞绿
 */
KISSY.add('gallery/uploader/1.5/plugins/filedrop/filedrop',function (S, Node, Base) {
    var EMPTY = '',
        $ = Node.all,
        UA = S.UA;
    /**
     * @name FileDrop
     * @class 文件拖拽上传插件
     * @constructor
     *  @author 飞绿
     * @extends Base
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {Button} config.button *，Button按钮的实例
     */
    var FileDrop = function (config) {
        var self = this;
        FileDrop.superclass.constructor.call(self, config);
        self.set('mode', getMode());
    };

    var getMode = function () {
        if (UA.webkit >= 7 || UA.firefox >= 3.6) {
            return 'supportDrop';
        }
        if (UA.ie) {
            return 'notSupportDropIe';
        }
        if (UA.webkit < 7 || UA.firefox < 3.6) {
            return 'notSupportDrop';
        }
    };

    S.mix(FileDrop, {
        event:{
            'AFTER_DROP':'afterdrop'
        }
    });

    S.extend(FileDrop, Base, /** @lends FileDrop.prototype*/ {
        /**
         * 插件初始化
         */
        pluginInitializer:function (uploader) {
            var self = this;
            var mode = self.get('mode');
            var $dropArea;
            if(!uploader) return false;
            self.set('uploader',uploader);
            if(uploader.get('type') == 'flash'){
                S.log('flash上传方式不支持拖拽！');
                self.set('isSupport',false);
                return false;
            }
            if(mode != 'supportDrop'){
                S.log('该浏览器不支持拖拽上传！');
                self.set('isSupport',false);
                return false;
            }
            var target = uploader.get('target');
            self.set('target',target);
            $dropArea = self._createDropArea();
            $dropArea.on('click',self._clickHandler,self);
            //当uploader的禁用状态发生改变后显隐拖拽区域
            uploader.on('afterDisabledChange',function(ev){
                self[ev.newVal && 'hide' || 'show']();
            });
            self.fire('render', {'buttonTarget':self.get('buttonWrap')});
        },
        /**
         * 显示拖拽区域
         */
        show:function () {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.show();
        },
        /**
         * 隐藏拖拽区域
         */
        hide:function () {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.hide();
        },
        /**
         * 创建拖拽区域
         */
        _createDropArea:function () {
            var self = this,
                target = $(self.get('target')),
                mode = self.get('mode'),
                html = S.substitute(self.get('tpl')[mode], {name:self.get('name')}),
                dropContainer = $(html),
                buttonWrap = dropContainer.all('.J_ButtonWrap');
            dropContainer.appendTo(target);
            dropContainer.on('dragover', function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
            });
            dropContainer.on('drop', function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                self._dropHandler(ev);
            });
            self.set('dropContainer', dropContainer);
            self.set('buttonWrap', buttonWrap);
            self._setStyle();
            return dropContainer;
        },
        /**
         * 设置拖拽层样式
         * @author 明河新增
         */
        _setStyle:function(){
             var self = this,$dropContainer = self.get('dropContainer');
            if(!$dropContainer.length) return false;
            $dropContainer.parent().css('position','relative');
            $dropContainer.css({'position':'absolute','top':'0','left':'0',width:'100%',height:'100%','zIndex':'1000'});
        },
        /**
         * 点击拖拽区域后触发
         * @author 明河新增
         * @param ev
         */
        _clickHandler:function(ev){
            var self = this,
                uploader = self.get('uploader'),
                button = uploader.get('button'),
                $input = button.get('fileInput');
            //触发input的选择文件
            $input.fire('click');
        },
        /**
         * 处理拖拽时间
         */
        _dropHandler:function (ev) {
            var self = this,
                event = FileDrop.event,
                fileList = ev.originalEvent.dataTransfer.files,
                files = [],
                uploader = self.get('uploader');

            if (!fileList.length || uploader == EMPTY)  return false;
            S.each(fileList, function (f) {
                if (S.isObject(f)) {
                    files.push({'name':f.name, 'type':f.type, 'size':f.size,'data':f});
                }
            });
            self.fire(event.AFTER_DROP, {files:files});
            uploader._select({files:files});
        }
    }, {
        ATTRS:/** @lends FileDrop.prototype*/{
            /**
             * 插件名称
             * @type String
             * @default 'filedrop'
             */
            pluginId:{
                value:'filedrop'
            },
            /**
             * 指向模拟按钮
             * @type NodeList
             * @default ''
             */
            target:{
                value:EMPTY,
                getter:function(v){
                    return $(v);
                }
            },
            uploader:{value:EMPTY},
            dropContainer:{
                value:EMPTY
            },
            /**
             * 是否支持拖拽
             */
            isSupport:{value:true},
            /**
             * 模板
             * @type Object
             * @default {}
             */
            tpl:{
                value:{
                    supportDrop:'<div class="drop-wrapper"></div>',
                    notSupportDropIe:'<div class="drop-wrapper">' +
                        '<p>您的浏览器只支持传统的图片上传，</p>' +
                        '<p class="suggest J_ButtonWrap">推荐使用chrome浏览器或firefox浏览器' +
                        '</p>' +
                        '</div>',
                    notSupportDrop:'<div class="drop-wrapper">' +
                        '<p>您的浏览器只支持传统的图片上传，</p>' +
                        '<p class="suggest J_ButtonWrap">推荐升级您的浏览器' +
                        '</p>' +
                        '</div>'
                }
            },
            name:{ value:'' }
        }
    });

    return FileDrop;
}, {requires:['node', 'base']});
/**
 * changes:
 * 明河：1.4
 *           - 重构成rich base的插件
 */
/**
 * @fileoverview 图片放大器
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/imageZoom/imageZoom',function(S, Node, Base,Albums) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name ImageZoom
     * @class 图片放大器
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function ImageZoom(config) {
        var self = this;
        //调用父类构造函数
        ImageZoom.superclass.constructor.call(self, config);
    }
    S.extend(ImageZoom, Base, /** @lends ImageZoom.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var theme = uploader.get('theme');
            if(!theme) return false;
            var imageHook = self.get('imageHook');
            var albums = new Albums({
                baseEl: theme.get('queueTarget'),
                img: imageHook
            });

            albums.get('baseEl').delegate('click', imageHook, function(e){
                var target = e.target;
                albums.show($(target));
            });
            self.set("albums",albums);
            uploader.on('success',self._successHandler,self);
        },
        /**
         * 上传成功了添加图片放大器
         * @param ev
         * @private
         */
        _successHandler:function(ev){
            var file = ev.file;
            var id = file.id;
            //服务器端返回的数据
            var result = file.result;
            var sUrl =  result.url;
            var $img = $('.J_Pic_'+id);
            $img.attr('data-original-url',sUrl);
        }
    }, {ATTRS : /** @lends ImageZoom*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'imageZoom'
        },
        /**
         * 图片放大器实例
         */
        albums:{
            value:EMPTY
        },
        /**
         * 图片元素的hook
         */
        imageHook:{
            value:'.preview-img'
        }
    }});
    return ImageZoom;
}, {requires : ['node','base','gallery/albums/1.0/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
/**
 * @fileoverview 图片裁剪
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/imgcrop/imgcrop',function(S, Node,Base,ImgCrop) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name ImgCropPlugin
     * @class 图片裁剪插件
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function ImgCropPlugin(config) {
        var self = this;
        //调用父类构造函数
        ImgCropPlugin.superclass.constructor.call(self, config);
        self.set('config',config);
    }
    S.extend(ImgCropPlugin, Base, /** @lends ImgCropPlugin.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var config = self.get('config');
            var crop = new ImgCrop(config);
            self.set('crop',crop);
            uploader.on('success',self._successHandler,self);
            uploader.on('select',self._selectHandler,self);
            crop.on('imgload',function(){
                self.set('isRender',true);
            })
        },
        _successHandler:function(ev){
            var self = this;
            var crop = self.get('crop');
            var file = ev.file;
            var id = file.id;
            var url = ev.result.url;
            crop.set('url',url);
            var target = '.J_CropArea_'+id;
            var $target = $(target);
            if(!$target.length) return false;
            crop.set('areaEl',target);
            crop.container = $target;
            crop.set('areaWidth',$target.width());
            crop.set('areaHeight',$target.height());
            crop.render();
        },
        _selectHandler:function(ev){
            var self = this;
            var isRender = self.get('isRender');
            var crop = self.get('crop');
            if(!isRender) return false;
            crop.destroy();
        }
    }, {ATTRS : /** @lends ImgCropPlugin*/{
        /**
         * 插件名称
         * @type String
         * @default imgcrop
         */
        pluginId:{
            value:'imgcrop'
        },
        /**
         * 是否已经初始化
         * @type Boolean
         * @default false
         */
        isRender:{value:false},
        config:{value:{}}
    }});
    return ImgCropPlugin;
}, {requires : ['node','base','gallery/imgcrop/2.1/index']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
/**
 * @fileoverview 本地图片预览组件
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-10
 * @requires KISSY 1.2+
 */

KISSY.add('gallery/uploader/1.5/plugins/preview/preview',function (S,Node, D, E,Base,ua) {
    var $ = Node.all;
    var doc = document,
        LOG_PRE = '[Plugin: Preview] ',
        _mode = getPreviewMode(),
        _eventList = {
            check:'check',
            success:'success',
            showed:'showed',
            error:'error'
        },
        _transparentImg = ua.ie < 8 ? "http://a.tbcdn.cn/p/fp/2011a/assets/space.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

    /**
     * Private 检测当前浏览器适应于哪种预览方式
     * @return {String} 检测出的预览方式
     */
    function getPreviewMode() {
        var previewMode = '';
        // prefer to use html5 file api
        if (typeof window.FileReader === "undefined") {
            switch (S.UA.shell) {
                case 'firefox':
                    previewMode = 'domfile';
                    break;
                case 'ie':
                    switch (S.UA.ie) {
                        case 6:
                            previewMode = 'simple';
                            break;
                        default:
                            previewMode = 'filter';
                            break;
                    }
                    break;
            }
        } else {
            previewMode = 'html5';
        }
        return previewMode;
    }

    /**
     * Private 将图片的本地路径写入img元素，展现给用户
     * @param {HTMLElement} imgElem img元素
     * @param {String} data  图片的本地路径
     * @param {Number} maxWidth 最大宽度
     * @param {Number} maxHeight 最大高度
     */
    function showPreviewImage(imgElem, data, width, height) {
        if (!imgElem) {
            return false;
        }
        if (_mode != 'filter') {
            imgElem.src = data || _transparentImg;
        } else {
            if (data) {
                data = data.replace(/[)'"%]/g, function (s) {
                    return escape(escape(s));
                });
                try{
                    imgElem.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = data;
                }catch (err){

                }
            }
        }
        return true;
    }

    /**
     * Constructor
     * @param {Object} config 配置
     */
    function Preview(config) {
        var self = this,
            _config = {
                maxWidth:40,
                maxHeight:40
            };

        self.config = S.mix(_config, config);

        Preview.superclass.constructor.call(self, config);
    }

    S.extend(Preview, Base, {
        /**
         * 插件初始化
         */
        pluginInitializer:function(uploader){
            if(!uploader) return false;
            var self = this;
            self.set('uploader',uploader);
            uploader.on('add',self._uploaderAddHandler,self);
        },
        /**
         * 队列添加文件后触发
         * @private
         */
        _uploaderAddHandler:function(ev){
            var self = this;
            var uploader = self.get('uploader');
            //默认渲染数据，不需要图片预览
            if(uploader.get('hasRestore')) return false;
            var fileInput = uploader.get('fileInput');
            var file = ev.file;
            var fileData = file.data;
            var id = file.id;
            var preHook = self.get('preHook');
            var $img = $(preHook+id);
            if(!$img.length){
                S.log('钩子为：'+preHook+id+'，找不到图片元素，无法预览图片')
                return false;
            }
            if(uploader.get('multiple') && uploader.get('type') == 'ajax'){
               self.show(fileData,$img,function(){
                   $img.show();
               });
            }else{
                self.preview(fileInput,$img);
                $img.show();
            }
        },
        /**
         * 显示预览图片，不支持IE
         * @author 明河
         * @since 1.3
         */
        show:function(file,$img,callback){
            if(!file || !$img || !$img.length) return false;
            var self = this;
            var reader = new FileReader();
            reader.onload = function(e){
                var data = self.data = e.target.result;
                self.fire(_eventList.getData, {
                    data: data,
                    mode: _mode
                });
                $img.attr('src',data);
                callback && callback.call(self,data);
                self.fire(_eventList.showed, {
                    img: data
                });
            };
            reader.onerror = function(e){
                S.log(LOG_PRE + 'File Reader Error. Your browser may not fully support html5 file api', 'warning');
                self.fire(_eventList.error);
            };
            reader.readAsDataURL(file);
        },
        /**
         * 预览函数
         * @param {HTMLElement} fileInput 文件上传的input
         * @param {HTMLElement} imgElem 需要显示预览图片的img元素，如果不设置的话，程序则不会执行显示操作，用户可以从该函数的返回值取得预览图片的地址自行写入
         * @return {String} 取得的图片地址
         */
        preview:function (fileInput, imgElem) {

            fileInput = D.get(fileInput);
            imgElem = D.get(imgElem);
            var self = this,
                onsuccess = function () {
                    self.fire(_eventList.getData, {
                        data:self.data,
                        mode:_mode
                    });
                    if (imgElem) {
                        showPreviewImage(imgElem, self.data);
                        self.fire(_eventList.showed, {
                            img:imgElem
                        });
                    }
                };

            self.data = undefined;
            if (fileInput) {
                //IE10无法使用FileReader读取文件流数据
                if(ua.ie == 10){
                    _mode =  'filter';
                }
                switch (_mode) {
                    case 'domfile':
                        self.data = fileInput.files[0].getAsDataURL();
                        break;
                    case 'filter':
                        fileInput.select();
                        //fileInput.blur();
                        try {
                            self.data = doc.selection.createRange().text;
                        } catch (e) {
                            S.log(LOG_PRE + 'IE下因为安全问题会抛出拒绝访问的错误，不妨碍预览: ');
                            S.log(e, 'dir');
                        } finally {
                            doc.selection.empty();
                        }
                        if (!self.data) {
                            self.data = fileInput.value;
                        }
                        break;
                    case 'html5':
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            self.data = e.target.result;
                            onsuccess();
                        };
                        reader.onerror = function (e) {
                            S.log(LOG_PRE + 'File Reader Error. Your browser may not fully support html5 file api', 'warning');
                            self.fire(_eventList.error);
                        };
                        if (fileInput.files) {
                            reader.readAsDataURL(fileInput.files[0]);
                        }
                        break;
                    case 'simple':
                    default:
                        self.data = fileInput.value;
                        break;
                }

                if (self.data) {
                    onsuccess();
                } else if (_mode != 'html5') {
                    showPreviewImage(imgElem);
                    self.fire(_eventList.error);
                }
            } else {
                S.log(LOG_PRE + 'File Input Element does not exists.');
            }

            return self.data;
        }
    },{ATTRS:{
        /**
         * 插件名称
         * @type String
         * @default preview
         */
        pluginId:{
            value:'preview'
        },
        uploader:{ value: '' },
        /**
         * 目标图片元素钩子的前缀
         */
        preHook:{ value: '.J_Pic_'  }
    }});

    return Preview;

}, {
    requires:['node', 'dom', 'event', 'base','ua' ]
});
/**
 * changes:
 * 明河：1.4
 *           - 去掉show方法
 */
/**
 * @fileoverview 进度条
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/proBars/progressBar',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,
        PROGRESS_BAR = 'progressbar',ROLE = 'role',
        ARIA_VALUEMIN = 'aria-valuemin',ARIA_VALUEMAX = 'aria-valuemax',ARIA_VALUENOW = 'aria-valuenow',
        DATA_VALUE = 'data-value';
    /**
     * @name ProgressBar
     * @class 进度条
     * @constructor
     * @extends Base
     * @requires Node
     */
    function ProgressBar(wrapper, config) {
        var self = this;
        config = S.merge({wrapper:$(wrapper)}, config);
        //调用父类构造函数
        ProgressBar.superclass.constructor.call(self, config);
    }
    S.mix(ProgressBar, /** @lends ProgressBar.prototype*/{
        /**
         * 模板
         */
        tpl : {
            DEFAULT:'<div class="ks-progress-bar-value" data-value="{value}"></div>'
        },
        /**
         * 组件用到的样式
         */
        cls : {
            PROGRESS_BAR : 'ks-progress-bar',
            VALUE : 'ks-progress-bar-value'
        },
        /**
         * 组件支持的事件
         */
        event : {
            RENDER : 'render',
            CHANGE : 'change',
            SHOW : 'show',
            HIDE : 'hide'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(ProgressBar, Base, /** @lends ProgressBar.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                width = self.get('width');
            if(!$wrapper.length) return false;
            if(width == 'auto') width = $wrapper.parent().width();
            $wrapper.width(width);
            //给容器添加ks-progress-bar样式名
            $wrapper.addClass(ProgressBar.cls.PROGRESS_BAR);
            self._addAttr();
            !self.get('visible') && self.hide();
            self.set('bar',self._create());
            self.fire(ProgressBar.event.RENDER);
        },
        /**
         * 显示进度条
         */
        show : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeIn(self.get('duration'),function(){
                self.set('visible',true);
                self.fire(ProgressBar.event.SHOW,{visible : true});
            });
        },
        /**
         * 隐藏进度条
         */
        hide : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeOut(self.get('duration'),function(){
                self.set('visible',false);
                self.fire(ProgressBar.event.HIDE,{visible : false});
            });
        },
        /**
         * 创建进度条
         * @return {NodeList}
         */
        _create : function(){
            var self = this,
                $wrapper = self.get('wrapper'),
                value = self.get('value'),tpl = self.get('tpl'),
                html = S.substitute(tpl, {value : value}) ;
            $wrapper.html('');
            return $(html).appendTo($wrapper);

        },
        /**
         * 给进度条容器添加一些属性
         * @return {Object} ProgressBar的实例
         */
        _addAttr : function() {
            var self = this,$wrapper = self.get('wrapper'),value = self.get('value');
            $wrapper.attr(ROLE, PROGRESS_BAR);
            $wrapper.attr(ARIA_VALUEMIN, 0);
            $wrapper.attr(ARIA_VALUEMAX, 100);
            $wrapper.attr(ARIA_VALUENOW, value);
            return self;
        }
    }, {ATTRS : /** @lends ProgressBar*/{
        /**
         * 容器
         */
        wrapper : {value : EMPTY},
        /**
         * 进度条元素
         */
        bar : {value : EMPTY},
        /**
         * 进度条宽度
         */
        width : { value:'auto' },
        /**
         * 当前进度
         */
        value : {
            value : 0,
            setter : function(v) {
                var self = this,$wrapper = self.get('wrapper'),$bar = self.get('bar'),
                    speed = self.get('speed'),
                    width;
                if (v > 100) v = 100;
                if (v < 0) v = 0;
                //将百分比宽度换算成像素值
                width = Math.ceil($wrapper.width() * (v / 100));
                $bar.stop().animate({'width':width + 'px'},speed,'none',function(){
                    $wrapper.attr(ARIA_VALUENOW,v);
                    $bar.attr(DATA_VALUE,v);
                    self.fire(ProgressBar.event.CHANGE,{value : v,width : width});
                });
                return v;
            }
        },
        /**
         * 控制进度条的可见性
         */
        visible : { value:true },
        /**
         * 显隐动画的速度
         */
        duration : {
          value : 0.3
        },
        /**
         * 模板
         */
        tpl : {
            value : ProgressBar.tpl.DEFAULT
        },
        speed : {value : 0.2}
    }});
    return ProgressBar;
}, {requires : ['node','base']});
/**
 * changes:
 * 明河：1.5
 *           - anim前增加stop()，防止动画bug
 */
/**
 * @fileoverview 进度条集合
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/proBars/proBars',function(S, Node, Base,ProgressBar) {
    var EMPTY = '';
    var $ = Node.all;
    var PRE = 'J_ProgressBar_';
    /**
     * @name ProBars
     * @class 进度条集合
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function ProBars(config) {
        var self = this;
        //调用父类构造函数
        ProBars.superclass.constructor.call(self, config);
    }
    S.mix(ProBars, /** @lends ProBars.prototype*/{
        /**
         * 组件支持的事件
         */
        event : {
            RENDER : 'render'
        }
    });
    S.extend(ProBars, Base, /** @lends ProBars.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            uploader.on('start',function(ev){
                self.add(ev.file.id);
            });

            uploader.on('progress',self._uploaderProgressHandler,self);
            uploader.on('success',self._uploaderSuccessHandler,self);

            self.fire(ProBars.event.RENDER);
        },
        /**
         * 上传中改变进度条的值
         * @param ev
         * @private
         */
        _uploaderProgressHandler:function(ev){
            var self = this;
            var file = ev.file;
            var id = file.id;
            //已加载字节数
            var loaded = ev.loaded;
            //总字节数
            var total = ev.total;
            var val = Math.ceil((loaded/total) * 100);
            var bar = self.get('bars')[id];
            //处理进度
            if(bar) bar.set('value',val);
        },
        /**
         * 上传成功后让进度达到100%
         * @param ev
         * @private
         */
        _uploaderSuccessHandler:function(ev){
            var self = this;
            var file = ev.file;
            var id = file.id;
            var bar = self.get('bars')[id];
            var isHide = self.get('isHide');
            //处理进度
            if(bar) bar.set('value',100);
            if(isHide){
                S.later(function(){
                    var $target = $('.'+PRE+ev.file.id);
                    $target.hide();
                },500);
            }
        },
        /**
         * 向集合添加一个进度条
         * @return ProgressBar
         */
        add:function(fileId){
            if(!S.isString(fileId)) return false;
            var self = this;
            var $target = $('.'+PRE+fileId);
            var $count = $('.J_ProgressCount_'+fileId);
            var speed = self.get('speed');
            var progressBar = new ProgressBar($target,{width:self.get('width'),speed:speed});
            if($count.length){
                progressBar.on('change',function(ev){
                    $count.text(ev.value+'%');
                })
            }
            progressBar.render();
            var bars = self.get('bars');
            return bars[fileId] = progressBar;
        }
    }, {ATTRS : /** @lends ProBars*/{
        /**
         * 插件名称
         * @type String
         * @default proBars
         */
        pluginId:{
            value:'proBars'
        },
        /**
        * 进度条实例集合
        * @type Object
        * @default {}
        */
        bars:{value:{}},
        /**
         * 进度条宽度
         * @type Number
         * @default 'auto'
         */
        width : { value:'auto' },
        /**
         * 进度走到100%时是否隐藏
         * @type Boolean
         * @default true
         */
        isHide : { value:true },
        /**
         * 进度条跑动速度控制
         * @type Number
         * @default 0.2
         */
        speed : {value : 0.2}
    }});
    return ProBars;
}, {requires : ['node','base','./progressBar']});
/**
 * changes:
 * 明河：1.4
 *           - 新增模块，配合rich base的插件机制使用
 *           - 新增iframe时隐藏进度条
 */
/**
 * @fileoverview 从input上拉取配置覆盖组件配置
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/tagConfig/tagConfig',function(S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    var UPLOADER_OPTIONS = ['autoUpload','postData','action','multiple','multipleLen','uploadType','disabled'];
    var AUTH_OPTIONS = ['max','maxSize','allowRepeat','allowExts','required','widthHeight'];
    /**
     * @name TagConfig
     * @class 从input上拉取配置覆盖组件配置
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function TagConfig(config) {
        var self = this;
        //调用父类构造函数
        TagConfig.superclass.constructor.call(self, config);
    }
    S.extend(TagConfig, Base, /** @lends TagConfig.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var input = uploader.get('_oldInput');
            if(!input) return false;
            self.set('uploader',uploader);
            self.set('input',input);
            self.cover();
        },
        /**
         * 覆盖组件配置
         */
        cover:function(){
            var self = this;
            self._setUploaderConfig();
            self._setAuthConfig();
            return self;
        },
        /**
         * 设置上传配置
         * @private
         */
        _setUploaderConfig:function(){
            var self = this;
            var $input = self.get('input');
            var value;
            var uploader = self.get('uploader');
            S.each(UPLOADER_OPTIONS,function(option){
                value = $input.attr(option);
                if(value){
                    switch (option){
                        case 'postData' :
                            option = 'data';
                            value = S.JSON.parse(value);
                            break;
                        case 'uploadType':
                            option = 'type';
                            break;
                        case 'autoUpload' || 'disabled' || 'multiple':
                            value = value == 'true';
                            break;
                    }
                    uploader.set(option,value);
                }
            })
        },
        /**
         * 设置验证配置
         * @private
         */
        _setAuthConfig:function(){
            var self = this;
            var $input = self.get('input');
            var uploader = self.get('uploader');
            var auth = uploader.getPlugin('auth');
            if(!auth) return false;
            var value;
            var msg;
            S.each(AUTH_OPTIONS,function(option){
                value = $input.attr(option);
                if(value){
                    //demo:max="3"
                    switch (option){
                        case 'allowRepeat' || 'required':
                            value = value == 'true';
                            break;
                        case 'maxSize' || 'max':
                            value = Number(value);
                            break;
                    }
                    auth.set(option,value);
                }
                //配置验证消息
                //demo:max-msg="每次最多上传{max}个文件！"
                msg = $input.attr(option + '-msg');
                if(msg){
                    auth.msg(option,msg);
                }
            })
        }
    }, {ATTRS : /** @lends TagConfig*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'tagConfig'
        },
        /**
         * 原生文件上传域
         * @type NodeList
         * @default ''
         */
        input:{
            value:EMPTY
        }
    }});
    return TagConfig;
}, {requires : ['node','base']});
/**
 * changes:
 * 明河：1.4
 *           - 新增模块，用于解析按钮标签上的配置
 *           - 修正auth的msg被主题覆盖的问题，该组件必须在加载组件时才触发
 */
/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/urlsInput/urlsInput',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class 存储文件路径信息的隐藏域
     * @constructor
     * @extends Base
     * @param {String} wrapper 容器钩子
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {String} config.name *，隐藏域名称，当此name的隐藏域不存在时组件会创建一个
     * @param {String} config.split  多个路径间的分隔符
     * @param {String} config.tpl   隐藏域模板
     *
     */
    function UrlsInput(config) {
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self, config);
    }
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * 初始化插件
         * @param {Uploader} uploader Uploader的实例
         */
        pluginInitializer:function(uploader){
            var self = this;
            if(!uploader) return false;
            self.set('uploader',uploader);
            uploader.on('success',self._uploadSuccessHandler,self);

            var queue = uploader.get('queue');
            queue.on('remove',self._fileRemoveHandler,self);
        },
        /**
         * 上传成功后向路径隐藏域添加路径
         * @private
         */
        _uploadSuccessHandler:function(ev){
            var self = this;
            var result = ev.result;
            if(!S.isObject(result)) return false;
            var url = result.url;
            if(self.get('useName')) url = result.name;
            self.add(url);
            return self;
        },
        /**
         * 从队列中删除文件后也从隐藏域中将路径删除
         * @private
         */
        _fileRemoveHandler:function(ev){
            var self = this;
            var file = ev.file;
            var result = file.result;
            if(!result) return true;
            var url = result.url;
            if(self.get('useName')) url = result.name;
            self.remove(url);
        },
        /**
         * 向路径隐藏域添加路径
         * @param {String} url 路径
         * @return {UrlsInput}
         */
        add : function(url){
            if(!S.isString(url)){
                S.log(LOG_PREFIX + 'add()的url参数不合法！');
                return false;
            }
            var self = this,urls = self.get('urls'),
            //判断路径是否已经存在
                isExist = self.isExist(url);
            //TODO:防止第一个路径会出现为空的情况
            if(urls[0] == EMPTY) urls = [];
            if(isExist){
                S.log(LOG_PREFIX + 'add()，文件路径已经存在！');
                return self;
            }
            urls.push(url);
            self.set('urls',urls);
            self._val();
            return self;
        },
        /**
         * 删除隐藏域内的指定路径
         * @param {String} url 路径
         * @return {Array} urls 删除后的路径
         */
        remove : function(url){
            //TODO:如果文件名中包含非法字符，正则无法匹配到
            if(!url) return false;
            var self = this,urls = self.get('urls'),
                isExist = self.isExist(url) ,
                reg = new RegExp(url);
            if(!isExist){
                S.log(LOG_PREFIX + 'remove()，不存在该文件路径！');
                return false;
            }
            urls = S.filter(urls,function(sUrl){
                return !reg.test(sUrl);
            });
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * 解析当前input的值，取得文件路径
         * @return {Array}
         */
        parse: function(){
            var self = this,
                input = self.get('target');
            if(input){
                var urls = $(input).val(),
                    split = self.get('split'),
                    files;
                if(urls == EMPTY) return [];
                files = urls.split(split);
                self.set('urls',files);
                return files;
            }else{
                S.log(LOG_PREFIX + 'cannot find urls input.');
                return [];
            }
        },
        /**
         * 设置隐藏域的值
         * @return {String}
         */
        _val : function(){
            var self = this,urls = self.get('urls'),
                $input = self.get('target'),
            //多个路径间的分隔符
                split = self.get('split'),
                sUrl = urls.join(split);
            $input.val(sUrl);
            return sUrl;
        },
        /**
         * 是否已经存在指定路径
         * @param {String} url 路径
         * @return {Boolean}
         */
        isExist : function(url){
            var self = this,b = false,urls = self.get('urls'),
                reg = new RegExp(url);
            if(!urls.length) return false;
            S.each(urls,function(val){
                if(reg.test(val)){
                    return b = true;
                }
            });
            return b;
        }
    }, {ATTRS : /** @lends UrlsInput.prototype*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'urlsInput'
        },
        /**
         * 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{ value:EMPTY },
        /**
         * 文件路径
         * @type Array
         * @default []
         */
        urls : { value : [] },
        /**
         * 多个路径间的分隔符
         * @type String
         * @default ","
         */
        split : {value : ',',
            setter : function(v){
                var self = this;
                self._val();
                return v;
            }
        },
        /**
         * 文件路径隐藏input
         * @type KISSY.Node
         * @default ""
         */
        target : {value : EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        /**
         * url使用name
         * @type KISSY.Node
         * @default ""
         */
        useName:{value:false}
    }});

    return UrlsInput;
}, {requires:['node','base']});
/**
 * changes:
 * 明河：1.5
 *          - [+]UrlsInput增加useName配置
 * 明河：1.4
 *           - 重构，去掉create方法，不会自动创建urlsInput
 *           - 移动到plugins目录下，作为插件出现
 *           - 去掉target参数的配置支持
 *           - rich base的插件形式出现，增加pluginInitializer方法
 *           - 监听uploader的success事件和queue的remove事件
 */
/**
 * @fileoverview 粘贴上传
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/paste/paste',function(S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @name Paste
     * @class 粘贴上传
     * @since 1.4
     * @constructor
     * @extends Base
     */
    function Paste(config) {
        var self = this;
        //调用父类构造函数
        Paste.superclass.constructor.call(self, config);
    }
    S.extend(Paste, Base, /** @lends Paste.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            $target.on('paste',function(e){
                //获取剪贴板数据
                var items = e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.items, data = {files: []};
                if (items && items.length) {
                    var queue = uploader.get('queue');
                    S.each(items, function (item) {
                        var file = item.getAsFile && item.getAsFile();
                        if(S.isObject(file)){
                            file.name = 'file-'+ S.guid()+'.png';
                            var file = {'name' : file.name,'type' : file.type,'size' : file.size,data:file};
                            file = queue.add(file);
                            var index = queue.getFileIndex(file.id);
                            uploader.upload(index);
                        }
                    });
                }
            })
        }
    }, {ATTRS : /** @lends Paste*/{
        /**
         * 插件名称
         * @type String
         */
        pluginId:{
            value:'paste'
        },
        /**
         * 读取粘贴数据的节点元素，默认为document
         * @type NodeList
         */
        target:{
            value:$(document)
        }
    }});
    return Paste;
}, {requires : ['node','base']});
/**
 * changes:
 * 明河：1.5
 *           - 新增插件
 */
KISSY.add('gallery/uploader/1.5/plugins/plugins',function(S,Auth,Filedrop,ImageZoom,Imgcrop,Preview,ProBars,TagConfig,UrlsInput,Paste) {
    /**
     * 所有的插件集合
     */
    return {
        Auth:Auth,
        Filedrop:Filedrop,
        ImageZoom:ImageZoom,
        Imgcrop:Imgcrop,
        Preview:Preview,
        ProBars:ProBars,
        TagConfig:TagConfig,
        UrlsInput:UrlsInput,
        Paste:Paste
    }
},{requires:['./auth/auth','./filedrop/filedrop','./imageZoom/imageZoom','./imgcrop/imgcrop','./preview/preview','./proBars/proBars','./tagConfig/tagConfig','./urlsInput/urlsInput','./paste/paste']})
/**
 * 阿里上传通用接口
 */
KISSY.add('gallery/uploader/1.5/aliUploader',function (S ,io,Uploader,Plugins) {
    var DAILY_API = 'http://aop.widgets.daily.taobao.net/json/uploadImg.htm';
    var LINE_API = 'http://aop.widgets.taobao.com/json/uploadImg.htm';
    var DAILY_TOKEN_API = 'http://sell.ershou.daily.taobao.net/publish/json/getReqParam.htm';
    var LINE_TOKEN_API = 'http://sell.ershou.taobao.com/publish/json/getReqParam.htm';
    /**
     * 获取domain
     * @return {String}
     */
    function getDomain(){
        var host = arguments[1] || location.hostname;
        var da = host.split('.'), len = da.length;
        var deep = arguments[0]|| (len<3?0:1);
        if (deep>=len || len-deep<2)
            deep = len-2;
        return da.slice(deep).join('.');
    }

    /**
     * 是否是daily环境
     * @return {boolean}
     */
    function isDaily(){
        var domain = getDomain(-1);
        return domain == 'net';
    }

    /**
     * 获取API
     * @return {string}
     */
    function getUploaderApi(){
        return isDaily() && DAILY_API || LINE_API;
    }

    /**
     * 获取token，来通过安全签名
     */
    function setToken(uploader){
        if(!uploader) return false;
        var url = isDaily() && DAILY_TOKEN_API || LINE_TOKEN_API;
        io.jsonp(url,function(data){
            var token = data.value;
            if(token){
                var data = uploader.get('data');
                data['_tb_token_'] = token;
            }
        })
    }

    /**
     * 因为flash的缺陷，无法携带cookies，手动将cookies post过去
     * http://code.google.com/p/swfupload/source/browse/swfupload/trunk/core/plugins/swfupload.cookies.js?r=849
     * @param uploader
     * @return {Object}
     */
    function flashCookiesHack(uploader){
        if(!uploader) return false;
        var type = uploader.get('type');
        if(type != 'flash') return false;
        var cookieArray = document.cookie.split(';');
        var eqIndex, name, value;
        var cookiesData = {};
        S.each(cookieArray,function(c){
            // Left Trim spaces
            while (c.charAt(0) === " ") {
                c = c.substring(1, c.length);
            }
            eqIndex = c.indexOf("=");
            if (eqIndex > 0) {
                name = c.substring(0, eqIndex);
                value = c.substring(eqIndex + 1);
                cookiesData[name] = value;
            }
        });
        var data = uploader.get('data');
        S.mix(data,cookiesData);
        return cookiesData;
    }

    /**
     * iframe强制设置domain
     * @param uploader
     */
    function iframeHack(uploader,domain){
        var type = uploader.get('type');
        var setDomain = type == 'iframe';
        if(!setDomain) return false;
        //不存在域名设置，强制截取域名后二个段
        if(!domain){
            domain = getDomain(-2);
        }
        document.domain = domain;
        var data = uploader.get('data');
        data.domain = domain;
        S.log('[AliUploader]跨域强制设置domain：'+domain);
        return data;
    }

    /**
     * 保存服务器返回的文件name而不是url
     * @param uploader
     */
    function urlUseName(uploader){
        var isSet = false;
        uploader.on('add',function(){
            if(!isSet){
                var urlsInput = uploader.getPlugin('urlsInput');
                if(urlsInput){
                    urlsInput.set('useName',true);
                    isSet = true;
                    S.log('[UrlsInput]useName设置为true：保存服务器端返回的图片名');
                }
            }
        })
    }

    function AliUploader(target,config){
        if(!config) config = {};
        config.CORS = true;
        //配置默认接口
        if(!config.action) config.action = getUploaderApi();

        if(!config.data) config.data = {};
        config.data['_input_charset'] = 'utf-8';
        //实例化uploader
        var uploader = new Uploader(target,config);
        flashCookiesHack(uploader);
        iframeHack(uploader,config.domain);
        setToken(uploader);
        //url使用文件名而不是完整路径
        if(config.useName) urlUseName(uploader);

        return uploader;
    }
    AliUploader.plugins = Plugins;
    AliUploader.Uploader = Uploader;
    return AliUploader;
},{requires:['ajax','./index','./plugins/plugins']});
