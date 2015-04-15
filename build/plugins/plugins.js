/*
combined files : 

kg/uploader/3.0.2/plugins/auth/auth
kg/uploader/3.0.2/plugins/filedrop/filedrop
kg/uploader/3.0.2/plugins/imageZoom/imageZoom
kg/uploader/3.0.2/plugins/imgcrop/imgcrop
kg/uploader/3.0.2/plugins/preview/preview
kg/uploader/3.0.2/plugins/proBars/progressBar
kg/uploader/3.0.2/plugins/proBars/proBars
kg/uploader/3.0.2/plugins/tagConfig/tagConfig
kg/uploader/3.0.2/plugins/urlsInput/urlsInput
kg/uploader/3.0.2/plugins/paste/paste
kg/uploader/3.0.2/plugins/miniLogin/miniLogin
kg/uploader/3.0.2/plugins/plugins

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
/**
 * @fileoverview  文件拖拽上传插件
 *  @author 飞绿
 */
KISSY.add('kg/uploader/3.0.2/plugins/filedrop/filedrop',function (S, Node, Base) {
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
KISSY.add('kg/uploader/3.0.2/plugins/imageZoom/imageZoom',function(S, Node, Base,Albums) {
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
}, {requires : ['node','base','gallery/albums/1.1/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
/**
 * @fileoverview 图片裁剪
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/imgcrop/imgcrop',function(S, Node,Base,ImgCrop) {
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

KISSY.add('kg/uploader/3.0.2/plugins/preview/preview',function (S,Node, D, E,Base,ua) {
    var $ = Node.all;
    var doc = document,
        LOG_PRE = '[Plugin: Preview] ',
        _mode = getPreviewMode(),
        _eventList = {
            check:'check',
            success:'success',
            showed:'showed',
            error:'error'
        };

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
            imgElem.src = data || "";
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
                        if (fileInput.files && fileInput.files.length) {
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
KISSY.add('kg/uploader/3.0.2/plugins/proBars/progressBar',function(S, Node, Base) {
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
KISSY.add('kg/uploader/3.0.2/plugins/proBars/proBars',function(S, Node, Base,ProgressBar) {
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
KISSY.add('kg/uploader/3.0.2/plugins/tagConfig/tagConfig',function(S, Node, Base) {
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
                            if(!S.isEmptyObject(value)){
                                value = S.merge(uploader.get('data'),value);
                            }
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
KISSY.add('kg/uploader/3.0.2/plugins/urlsInput/urlsInput',function(S, Node, Base) {
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
KISSY.add('kg/uploader/3.0.2/plugins/paste/paste',function(S, Node, Base) {
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
/**
 * @fileoverview mini登陆框（用于通用接口）
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('kg/uploader/3.0.2/plugins/miniLogin/miniLogin',function(S, Node, Base,token,ML) {
    var EMPTY = '';
    var $ = Node.all;

    function MiniLogin(config) {
        var self = this;
        //调用父类构造函数
        MiniLogin.superclass.constructor.call(self, config);
    }
    S.extend(MiniLogin, Base, /** @lends MiniLogin.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            uploader.on('select',function(){
                var isLogin = ML.check();
                if(!isLogin){
                    var autoUpload = uploader.get('autoUpload');
                    var isSetUpload = false;
                    if(autoUpload){
                        uploader.set('autoUpload',false);
                        isSetUpload = true;
                    }
                    ML.show({}, function() {
                        token(uploader,function(){
                            uploader.uploadFiles();
                        });
                        if(isSetUpload) uploader.set('autoUpload',true)
                    });
                }
            })
        }
    }, {ATTRS : /** @lends MiniLogin*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'miniLogin'
        }
    }});
    return MiniLogin;
}, {requires : ['node','base','../../token','tbc/mini-login/1.4.0/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
KISSY.add('kg/uploader/3.0.2/plugins/plugins',function(S,Auth,Filedrop,ImageZoom,Imgcrop,Preview,ProBars,TagConfig,UrlsInput,Paste,MiniLogin) {
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
        Paste:Paste,
        MiniLogin:MiniLogin
    }
},{requires:['./auth/auth','./filedrop/filedrop','./imageZoom/imageZoom','./imgcrop/imgcrop','./preview/preview','./proBars/proBars','./tagConfig/tagConfig','./urlsInput/urlsInput','./paste/paste','./miniLogin/miniLogin']})
