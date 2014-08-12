/*
combined files : 

kg/uploader/2.0.2/token

*/
/**
 * _获取tokenֵ
 */
KISSY.add('kg/uploader/2.0.2/token',function (S ,io) {
    var DAILY_TOKEN_API = 'http://aop.widgets.daily.taobao.net/block/getReqParam.htm';
    var LINE_TOKEN_API = 'http://aop.widgets.taobao.com/block/getReqParam.htm';
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

    /**
     * $设置token
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
