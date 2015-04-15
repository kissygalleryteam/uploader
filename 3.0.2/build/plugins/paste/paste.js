/*
combined files : 

kg/uploader/3.0.2/plugins/paste/paste

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
