/*
combined files : 

kg/uploader/3.0.2/themes/wankeUploader/index

*/
/**
 * @fileoverview 图片上传主题
 * @author 灵吾
 **/
KISSY.add('kg/uploader/3.0.2/themes/wankeUploader/index',function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name WankeUploader
     * @class 图片上传主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 灵吾
     */
    function WankeUploader(config) {
        var self = this;
        //调用父类构造函数
        WankeUploader.superclass.constructor.call(self, config);
    }

    S.extend(WankeUploader, Theme, /** @lends WankeUploader.prototype*/{
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (e) {
            var d = e.result,
                htmlStr = '',
                uploadList = $('#J_UploadGoodsPicList'),
                lastUpload = $('.J_LastUpload', uploadList);

            htmlStr = '<li class="dib J_LastUpload">' +
                '<div class="img">' +
                '<img src="'+ d.url +'" />' +
                '</div>' +
                '</li>';

            // 如果之前有提交图片，替换
            if (lastUpload.length) {
                lastUpload.replaceWith(htmlStr);
            // 如果是第一次提交，插入到第一
            } else {
                uploadList.prepend(htmlStr);
            }

            // 成功反馈
            this.showTip('succ', '成功啦', 2000);
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (e) {
             this.showTip('error', e.msg || e.result.msg || '系统出错，请稍候再试', 2000);
        },
        showTip: function (status, text, time, callback, align) {
            if (!align) {
                align = {
                    node: null,
                    points: ['cc', 'cc'],
                    offset: [0, 0]
                };
            }
            var self = this;
            if (self.t) {
                clearTimeout(self.t);
            }
            var cls = '';
            var icon = '';
            if (status == 'succ') {
                cls = 'succ';
                icon = '&#379;';
            }
            var _time = time || 3000;
            var tmpl = '<p><span>' + text + '</span></p>';
            if (!self.dialog) {
                S.use('overlay', function () {
                    self.dialog = new S.Overlay({
                        prefixCls: 'wanke-',
                        align: align,
                        effect: {
                            effect: 'fade',
                            easing: '',
                            duration: .3
                        },
                        closable: false,
                        //mask:true,
                        zIndex: 10002,
                        content: tmpl
                    });

                    self.dialog.render();
                    self.dialog.show();

                    self.t = setTimeout(function () {
                        self.dialog.hide();
                        if (callback && S.isFunction(callback)) {
                            callback();
                        }
                    }, _time);
                });
            } else {
                self.dialog.hide();
                //var align = data.align;
                self.dialog.align(align.node, align.points, align.offset);
                self.dialog.get('contentEl')[0].innerHTML = tmpl;
                self.dialog.show();
                self.t = setTimeout(function () {
                    self.dialog.hide();
                    if (callback && S.isFunction(callback)) {
                        callback();
                    }
                }, _time);
            }
        }
    }, {ATTRS:/** @lends WankeUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "wankeUploader"
         */
        name:{value:'wankeUploader'},
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
            value:'jpg,png,gif,jpeg,bmp'
        },
        maxSize:{
            value:10000
        },
        widthHeight:{
            value: function (width, height) {
                return width > 170 && height > 170;
            }
        },
        /**
         * 验证消息
         * @type Object
         * @since 1.4
         * @default {}
         */
        authMsg:{
            value:{
                maxSize:'图片超过10M',
                allowExts:'不支持{ext}格式！',
                widthHeight:'请上传大于170*170大小的图片'
            }
        }
    }});
    return WankeUploader;
}, {requires:['node', 'kg/kg/uploader/3.0.2/2.0.1/theme']});
