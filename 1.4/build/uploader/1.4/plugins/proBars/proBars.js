/**
 * @fileoverview 进度条集合
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/plugins/proBars/proBars',function(S, Node, Base,ProgressBar) {
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
            var uploadType = uploader.get('type');
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
            bar.set('value',val);
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
            var speed = self.get('speed');
            var progressBar = new ProgressBar($target,{width:self.get('width'),speed:speed});
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
}, {requires : ['node','base','gallery/uploader/1.4/plugins/proBars/progressBar']});
/**
 * changes:
 * 明河：1.4
 *           - 新增模块，配合rich base的插件机制使用
 *           - 新增iframe时隐藏进度条
 */