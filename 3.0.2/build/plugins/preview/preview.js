/*
combined files : 

kg/uploader/3.0.2/plugins/preview/preview

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
