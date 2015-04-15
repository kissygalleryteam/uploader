/*
combined files : 

kg/uploader/3.0.2/plugins/proBars/progressBar
kg/uploader/3.0.2/plugins/proBars/proBars

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
