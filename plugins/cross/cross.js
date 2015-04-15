/**
 * @fileoverview 手机上传
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, Node, Base,QR) {
    var EMPTY = '';
    var $ = Node.all;
    var DAILY_API = '//img01.daily.taobaocdn.net/consult/';
    var LINE_API = '//img02.taobaocdn.com/consult/';

    /**
     * $获取domain
     * @return {String}
     */
    function getDomain(){
        var host = arguments[1] || location.hostname;
        var da = host.split('.'), len = da.length;
        var deep = arguments[0]|| (len<3?0:1);
        if (deep>=len || len-deep<2)
            deep = len-2;
        return da.slice(deep).join('.');
    }

    /**
     * $是否是daily
     * @return {boolean}
     */
    function isDaily(){
        var domain = getDomain(-1);
        return domain == 'net';
    }

    function MobileUploader(config) {
        var self = this;
        //调用父类构造函数
        MobileUploader.superclass.constructor.call(self, config);
        self.set('userConfig',config);
    }
    S.extend(MobileUploader, Base, /** @lends MobileUploader.prototype*/{
        /**
         * 插件初始化
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;
            self.set('uploader',uploader);
            var $target = self.get('target');
            if(!$target.length) return false;
            $target.on('click',self._clickHandler,self);
        },
        //单击“手机上传”
        _clickHandler:function(ev){
            var self = this;
            var qr = self._renderQR();
            if(!qr) return true;
            var $target = self.get('target');
            var xy = $target.offset();
            qr.show();
            qr.offset(xy.top,xy.left+$target.outerWidth()+10);
        },
        //初始化二维码实例
        _renderQR:function(){
            var self = this;
            var qr = self.get('qr');
            if(qr) return qr;
            var config = self._config();
            qr = new QR(config);
            self.set('qr',qr);
            return qr;
        },
        _config:function(){
            var self = this;
            var uploader = self.get('uploader');
            var auth = uploader.getPlugin('auth');
            var userConfig = self.get('userConfig');
            var config = userConfig;
            if(auth){
                var authConfig = {
                    //最大上传数
                    max: auth.get('max'),
                    //格式控制
                    type: auth.get('allowExts').replace(/,/g,'/')
                };
                config = S.merge(authConfig,userConfig);
            }
            var daily = isDaily();
            self.set('daily',daily);
            //图片地址路径
            var imageUrl = daily && DAILY_API || LINE_API;
            self.set('imageUrl',imageUrl);
            S.mix(config,{
                daily : daily,
                xmppcallback:function(ev){
                    self._xmppcallback(ev.data);
                }
            })
            return config;
        },
        //mpp消息推送出图片数据后执行的回调
        //data:{picUrls: Array[1], tfsUrls: Array[1], userId: 69738207}
        _xmppcallback:function(data){
            var self = this;
            if(!S.isObject(data)) return false;
            S.log('mpp返回的文件数据是：');
            S.log(data);
            var qr = self.get('qr');
            if(!qr) return false;
            qr.hide();
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var imageUrl = self.get('imageUrl');
            S.each(data.picUrls,function(url,i){
                var result = {
                    name:data.tfsUrls[i],
                    url:url
                };
                var file = queue.add(result);
                file.result = result;
                var index = queue.getFileIndex(file.id);
                queue.fileStatus(index,'success');
                uploader.fire('success',{index:index, file:file, result:result});
            });
        }
    }, {ATTRS : /** @lends MobileUploader*/{
        /**
         * 插件名称
         * @type String
         */
        pluginId:{
            value:'mobileUploader'
        },
        /**
         * 读取粘贴数据的节点元素，默认为document
         * @type NodeList
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        uploader:{value:EMPTY},
        //用户的配置
        userConfig:{value:{}},
        //图片的路径
        imageUrl:{value:EMPTY},
        //二维码实例
        qr:{value:EMPTY}
    }})
    return MobileUploader;
}, {requires : ['node','base','./qrcode']});
/**
 * changes:
 * 明河：1.5
 *           - 新增插件
 */