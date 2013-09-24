## 通用接口说明

通用接口目前只适用于淘宝网应用： [demo](http://sell.ershou.daily.taobao.net/publish/uploaderSimple.htm)

demo来自淘宝二手系统，请先使用测试账号登陆下daily，没有的可以用测试账号：*yuntian31*。

接口开发：*今朝*

接口的地址：[http://aop.daily.taobao.net/json/uploadImg.htm](http://aop.daily.taobao.net/json/uploadImg.htm)

明河写了个AliUploader做了下接口包装，以简化用户的调用。

## AliUploader的使用

### HTML结构和Uploader保持一致

    <div class="uploader-wrapper">
        <div class="grid">
            <input type="file" class="g-u" id="J_UploaderBtn" value="上传图片" name="imgFile" >
            <input type="hidden" id="J_Urls" name="urls" value="" />
            <div class="g-u">还可以上传<span id="J_UploadCount">3</span>张图片</div>
        </div>
        <ul id="J_UploaderQueue" class="grid"></ul>
    </div>

### 初始化AliUploader

       KISSY.use('gallery/uploader/1.5/aliUploader,gallery/uploader/1.5/themes/imageUploader/index,gallery/uploader/1.5/themes/imageUploader/style.css', function (S, AliUploader,ImageUploader) {
            var plugins = AliUploader.plugins;
            var uploader = new AliUploader('#J_UploaderBtn');
            //使用主题
            uploader.theme(new ImageUploader({ queueTarget: '#J_UploaderQueue' }));
            //验证插件
            uploader.plug(new plugins.Auth({
                        //最多上传个数
                        max:3,
                        //图片最大允许大小
                        maxSize:2000
                    }))
                    //url保存插件
                    .plug(new plugins.UrlsInput({target:'#J_Urls'}))
                    //进度条集合
                    .plug(new plugins.ProBars())
                    //拖拽上传
                    .plug(new plugins.Filedrop())
                     //图片预览
                    .plug(new plugins.Preview())
            ;
        })

AliUploader的模块路径为：*gallery/uploader/1.5/aliUploader*

不需要像Uploader那样use多个插件，通过*AliUploader.plugins*可以获取到所有的插件类。

将代码copy到你的应用vm模版中，就可以直接使用了！！无需配置任何东西！！！

默认使用ajax上传，不支持ajax的情况下使用iframe上传。

### iframe上传

iframe上传会强制设置domain（截取域名后二段，比如ershou.daily.taobao.net，设置成taobao.net），如果不希望设置，请使用flash上传，设置*typ:["ajax","flash"]*。

iframe跨域目前只支持子域跨域，完全跨域，比如etao调用接口，就要使用flash。

前台post数据时会把*type*和*domain* post到接口。

### flash上传

flash存在bug，无法携带cookies，目前还在解决中。

## AliUploader的配置

可以手动修改AliUploader的配置

配置名 | 类型|只读|默认值|说明
------------ | -------------| -------------| -------------| -------------
action | String|Y|""| 强制设置接口地址
type | Array|Y|*["ajax","iframe"]*| 上传使用方案
ajaxSetDomain | Boolean|Y|""|ajax上传方案也强制设置domain
data | Object|Y|{}|post到服务器的数据




