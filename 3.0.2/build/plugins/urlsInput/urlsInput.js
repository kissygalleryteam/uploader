/*
combined files : 

kg/uploader/3.0.2/plugins/urlsInput/urlsInput

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
