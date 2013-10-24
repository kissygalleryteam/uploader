/**
 * 阿里上传通用接口
 */
KISSY.add(function (S ,UA,Uploader,token) {
    var DAILY_API = 'http://aop.widgets.daily.taobao.net/block/uploadImg.htm';
    var LINE_API = 'http://aop.widgets.taobao.com/block/uploadImg.htm';
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
     * 是否是daily环境
     * @return {boolean}
     */
    function isDaily(){
        var domain = getDomain(-1);
        return domain == 'net';
    }

    /**
     * 获取API
     * @return {string}
     */
    function getUploaderApi(){
        return isDaily() && DAILY_API || LINE_API;
    }

    /**
     * 因为flash的缺陷，无法携带cookies，手动将cookies post过去
     * http://code.google.com/p/swfupload/source/browse/swfupload/trunk/core/plugins/swfupload.cookies.js?r=849
     * @param uploader
     * @return {Object}
     */
    function flashCookiesHack(uploader){
        if(!uploader) return false;
        var type = uploader.get('type');
        if(type != 'flash') return false;
        var cookieArray = document.cookie.split(';');
        var eqIndex, name, value;
        var cookiesData = {};
        S.each(cookieArray,function(c){
            // Left Trim spaces
            while (c.charAt(0) === " ") {
                c = c.substring(1, c.length);
            }
            eqIndex = c.indexOf("=");
            if (eqIndex > 0) {
                name = c.substring(0, eqIndex);
                value = c.substring(eqIndex + 1);
                cookiesData[name] = value;
            }
        });
        var data = uploader.get('data');
        S.mix(data,cookiesData);
        return cookiesData;
    }

    /**
     * iframe强制设置domain
     * @param uploader
     */
    function iframeHack(uploader,domain,redirect){
        var type = uploader.get('type');
        var setDomain = type == 'iframe';
        if(!setDomain) return false;
        var data = uploader.get('data');
        if(redirect){

        }else{
            //不存在域名设置，强制截取域名后二个段
            if(!domain){
                domain = getDomain(-2);
            }
            document.domain = domain;
            data.domain = domain;
            S.log('[AliUploader]跨域强制设置domain：'+domain);
        }
        if(data.type){
            delete data.type;
            S.log('type是关键字，请勿设置成post参数');
        }
        var uploadType = uploader.get('uploadType');
        uploadType.set('domain',domain);
        return data;
    }

    /**
     * 保存服务器返回的文件name而不是url
     * @param uploader
     */
    function urlUseName(uploader){
        var isSet = false;
        uploader.on('add',function(){
            if(!isSet){
                var urlsInput = uploader.getPlugin('urlsInput');
                if(urlsInput){
                    urlsInput.set('useName',true);
                    isSet = true;
                    S.log('[UrlsInput]useName设置为true：保存服务器端返回的图片名');
                }
            }
        })
    }

    function AliUploader(target,config){
        if(!config) config = {};
        config.CORS = true;
        //配置默认接口
        if(!config.action) config.action = getUploaderApi();
        if(!config.data) config.data = {};
        config.data['_input_charset'] = 'utf-8';
        //实例化uploader
        var uploader = new Uploader(target,config);
        flashCookiesHack(uploader);
        iframeHack(uploader,config.domain);
        token(uploader);
        //url使用文件名而不是完整路径
        if(config.useName) urlUseName(uploader);

        return uploader;
    }
    AliUploader.Uploader = Uploader;
    return AliUploader;
},{requires:['ua','./index','./token']});