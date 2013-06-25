/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/uploader/1.5/index', function (S, Node, UploaderBase, RichBase,JSON) {
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
 */