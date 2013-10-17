KISSY.add(function(S,Auth,Filedrop,ImageZoom,Imgcrop,Preview,ProBars,TagConfig,UrlsInput,Paste,MiniLogin) {
    /**
     * 所有的插件集合
     */
    return {
        Auth:Auth,
        Filedrop:Filedrop,
        ImageZoom:ImageZoom,
        Imgcrop:Imgcrop,
        Preview:Preview,
        ProBars:ProBars,
        TagConfig:TagConfig,
        UrlsInput:UrlsInput,
        Paste:Paste,
        MiniLogin:MiniLogin
    }
},{requires:['./auth/auth','./filedrop/filedrop','./imageZoom/imageZoom','./imgcrop/imgcrop','./preview/preview','./proBars/proBars','./tagConfig/tagConfig','./urlsInput/urlsInput','./paste/paste','./miniLogin/miniLogin']})