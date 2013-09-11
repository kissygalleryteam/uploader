KISSY.add('gallery/uploader/1.4/aliUploader', function (S ,Uploader,Plugins) {
    var DAILY_API = 'http://aop.daily.taobao.net/json/uploadImg.htm';
    var LINE_API = 'http://aop.taobao.com/json/uploadImg.htm';
    /**
     * 获取domain
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
     * 获取API
     * @return {string}
     */
    function getUploaderApi(){
        var domain = getDomain(-1);
        var isDaily = domain == 'net';
        return isDaily && DAILY_API || LINE_API;
    }

    function AliUploader(target,config){
        if(!config) config = {};
        //配置默认接口
        if(!config.action){
            config.action = getUploaderApi();
        }
        if(!config.data) config.data = {};
        config.data[' _input_charset'] = 'utf-8';
        //实例化uploader
        var uploader = new Uploader(target,config);
        var type = uploader.get('type');
        var setDomain = type == 'iframe';
        //配置了ajaxSetDomain，ajax上传方式也设置domain
        if(config.ajaxSetDomain) setDomain = true;
        //iframe跨域需要强制设置domain
        if(setDomain){
            var domain = config.domain;
            //不存在域名设置，强制截取域名后二个段
            if(!config.domain){
                domain = getDomain(-2);
            }
            document.domain = domain;
            var data = uploader.get('data');
            data.domain = domain;
            uploader.set('data',data);
        }
        return uploader;
    }
    AliUploader.plugins = Plugins;
    return AliUploader;
},{requires:['./index','./plugins/plugins']});
