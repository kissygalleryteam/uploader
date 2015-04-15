/*
combined files : 

kg/uploader/3.0.2/plugins/filedrop/filedrop

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
