/*
combined files : 

gallery/uploader/1.5/token
gallery/uploader/1.5/plugins/miniLogin/miniLogin

*/
/**
 * �첽��ȡtokenֵ
 */
KISSY.add('gallery/uploader/1.5/token',function (S ,io) {
    var DAILY_TOKEN_API = 'http://aop.widgets.daily.taobao.net/block/getReqParam.htm';
    var LINE_TOKEN_API = 'http://aop.widgets.taobao.com/block/getReqParam.htm';
    /**
     * ��ȡdomain
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
     * �Ƿ���daily����
     * @return {boolean}
     */
    function isDaily(){
        var domain = getDomain(-1);
        return domain == 'net';
    }

    /**
     * ��ȡtoken����ͨ����ȫǩ��
     */
    function setToken(uploader,callback){
        if(!uploader) return false;
        var url = isDaily() && DAILY_TOKEN_API || LINE_TOKEN_API;
        io.jsonp(url,function(data){
            var token = data.value;
            if(token){
                var data = uploader.get('data');
                data['_tb_token_'] = token;
            }
            callback && callback(data);
        })
    }

    return setToken;
},{requires:['ajax']});
/**
 * @fileoverview mini登陆框（用于通用接口）
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.5/plugins/miniLogin/miniLogin',function(S, Node, Base,token,ML) {
    var EMPTY = '';
    var $ = Node.all;

    function MiniLogin(config) {
        var self = this;
        //调用父类构造函数
        MiniLogin.superclass.constructor.call(self, config);
    }
    S.extend(MiniLogin, Base, /** @lends MiniLogin.prototype*/{
        /**
         * 插件初始化
          * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            uploader.on('select',function(){
                var isLogin = ML.check();
                if(!isLogin){
                    var autoUpload = uploader.get('autoUpload');
                    var isSetUpload = false;
                    if(autoUpload){
                        uploader.set('autoUpload',false);
                        isSetUpload = true;
                    }
                    ML.show({}, function() {
                        token(uploader,function(){
                            uploader.uploadFiles();
                        });
                        if(isSetUpload) uploader.set('autoUpload',true)
                    });
                }
            })
        }
    }, {ATTRS : /** @lends MiniLogin*/{
        /**
         * 插件名称
         * @type String
         * @default urlsInput
         */
        pluginId:{
            value:'miniLogin'
        }
    }});
    return MiniLogin;
}, {requires : ['node','base','../../token','tbc/mini-login/1.4.0/']});
/**
 * changes:
 * 明河：1.4
 *           - 新增插件
 */
