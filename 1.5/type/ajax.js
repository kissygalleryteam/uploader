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
            self._chunkedUpload(fileData);
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
                return self;
            }
            //中止ajax请求，会触发error事件
            xhr.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
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
            var uploadedBytes = self.get('uploadedBytes');
            var maxChunkSize = self.get('blobSize') || size;
            //数据分块API（不同浏览器有不同实现）
            var slice = file.slice || file.webkitSlice || file.mozSlice;
            //已经上传的字节数超过文件大小，直接退出
            if(uploadedBytes > size) return true;
            function upload(){
                var uploadedBytes = self.get('uploadedBytes');
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
                })
                var ajax = io(ajaxConfig);
                ajax.then(function(data){
                    var result = data[0];
                    //upload success
                    //算出已经上传的文件大小
                    var uploadedBytes = self._getUploadedBytes(ajax) || uploadedBytes + chunkSize;
                    self.set('uploadedBytes',uploadedBytes);
                    //派发进度事件
                    self.fire(AjaxType.event.PROGRESS, { 'loaded': uploadedBytes, 'total': size });
                    //还有没有上传完的文件，继续上传
                    if(uploadedBytes< size){
                        upload();
                    }else{
                        //已经上传完成，派发success事件
                        self.fire(AjaxType.event.SUCCESS, {result : result});
                    }
                },function(){
                    //upload fail
                })
            }

            upload();
        },
        _fullUpload:function(file){
            var self = this;
            var ajaxConfig = self.get('ajaxConfig');
            var uploadedBytes = self.get('uploadedBytes');
            //将用户自定义的data添加到FormData中
            self._setFormData();
            //向FormData添加文件数据
            self._addFileData(file);
            S.mix(ajaxConfig,{
                data:self.get('formData')
            })
            var ajax = io(ajaxConfig);
            ajax.then(function(data){
                //upload success
                var result = data[0];
                var uploadedBytes = file.size;
                self.set('uploadedBytes',uploadedBytes);
                //上传完成，派发success事件
                self.fire(AjaxType.event.SUCCESS, {result : result});
            },function(){
                //upload fail
            })
            return ajax;
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
            headers:{}
        }
        },
        xhr : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY},
        /**
         * 已经上传的字节数
         * @type Number
         * @default 0
         */
        uploadedBytes:{value:0},
        /**
         * 块文件数据的大小
         * @type Number
         * @default 0
         */
        blobSize:{value:10000},
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
 *           - 重构模块
 *           - 增加分段上传支持
 *           - 增加blobSize配置
 *           - 增加isUsePostMessage配置
 *           - 增加uploadedBytes属性
 */