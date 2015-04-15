/*
combined files : 

kg/uploader/3.0.2/plugins/auth/auth

*/
/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/auth/auth',function (S, Node,Base) {
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
            //多选上传的情况下，超过max停止后面文件的上传
            var successFiles = queue.getFiles('success');
            if(successFiles.length > max) uploader.stop();

            S.each(files,function(file,index){
                if(index > curFileIndex){
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
