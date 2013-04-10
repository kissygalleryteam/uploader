/**
 * @fileoverview 本地图片预览组件
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-10
 * @requires KISSY 1.2+
 */

KISSY.add('gallery/uploader/1.4/plugins/preview/preview', function (S, D, E,Base) {
    var doc = document,
        LOG_PRE = '[Plugin: Preview] ',
        _mode = getPreviewMode(),
        _eventList = {
            check:'check',
            success:'success',
            showed:'showed',
            error:'error'
        },
        _transparentImg = S.UA.ie < 8 ? "http://a.tbcdn.cn/p/fp/2011a/assets/space.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

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
                imgElem.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = data;
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
        pluginInitializer:function(){

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
                S.log(LOG_PRE + 'One file selected. Getting data...');
                // get Image location path or data uri
                switch (_mode) {
                    case 'domfile':
                        self.data = fileInput.files[0].getAsDataURL();
                        break;
                    case 'filter':
                        // fileInput.focus();
                        fileInput.select();
                        try {
                            self.data = doc.selection.createRange().text;
                        } catch (e) {
                            S.log(LOG_PRE + 'Get image data error, the error is: ');
                            S.log(e, 'dir');
                        } finally {
                            doc.selection.empty();
                        }
                        if (!self.data) {
                            self.data = fileInput.value;
                        }
                        break;
                    case 'html5':
                        // TODO Mathon3
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
                        // alert(reader.readAsDataURL);
                        // S.log(reader, 'dir');
                        break;
                    case 'simple':
                    default:
                        self.data = fileInput.value;
                        break;
                }

                if (self.data) {
                    onsuccess();
                } else if (_mode != 'html5') {
                    S.log(LOG_PRE + 'Retrive Data error.');
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
        }
    }});

    return Preview;

}, {
    requires:[
        'dom',
        'event',
        'base'
    ]
});
/**
 * changes:
 * 明河：1.4
 *           - 去掉show方法
 */