1.5beta测试中，欢迎反馈bug，预计在10月10号前正式发布，用来不及的同学可以使用[1.5版](http://gallery.kissyui.com/uploader/1.5/guide/index.html)

阿里的应用，直接使用通用接口即可，直接复制代码可用，详细请看[AliUploader](./ali.html)。

1.5的changelog请看[github](https://github.com/kissygalleryteam/uploader)。

## 综述

Uploader是非常强大的异步文件上传组件，支持ajax、iframe、flash三套方案，实现浏览器的全兼容，调用非常简单，内置多套主题支持和常用插件，比如验证、图片预览、进度条等。

广泛应用于淘宝网，比如退款系统、爱逛街、二手、拍卖、我的淘宝、卖家中心、导购中心等。

拥有非常不错的扩展性，可以自己定制主题和插件。

* 版本：1.5
* 基于：kissy1.3.1（不兼容1.3以下版本）
* 作者：明河（剑平）、紫英、飞绿，感谢苏河、溪夏、正豪等主题和插件作者

flash上传感谢龙藏的<code>ajbridge</code>组件。

#### Uploader的特性

* 支持ajax、flash、iframe三种方案，兼容所有浏览器。
* 多主题支持，可以自己定制主题
* 支持多选批量上传
* 支持上传进度显示
* 支持取消上传
* 支持图片预览（使用flash上传不支持）
* 支持上传验证
* 多种配置方式

## demo汇总

* [简单demo：js配置上传组件](http://butterfly.36ria.com/uploader/1.5/demo/js-config-use.html)
* [简单demo：属性配置上传组件](http://butterfly.36ria.com/uploader/1.5/demo/tag-config-use.html)
* [combo请求](http://butterfly.36ria.com/uploader/1.5/demo/combo.html)
* [上传验证控制的demo](http://butterfly.36ria.com/uploader/1.5/demo/auth.html)
* [组件全部事件演示](http://butterfly.36ria.com/uploader/1.5/demo/events.html)
* [渲染默认队列数据的demo](http://butterfly.36ria.com/uploader/1.5/demo/default-data-show.html)
* [队列全部方法演示](http://butterfly.36ria.com/uploader/1.5/demo/queue.html)
* [只使用flash上传的demo](http://butterfly.36ria.com/uploader/1.5/demo/flash-upload-type.html)
* [只使用iframe上传的demo](http://butterfly.36ria.com/uploader/1.5/demo/iframe-upload-type.html)
* [常用方法控制](http://butterfly.36ria.com/uploader/1.5/demo/method-uploader.html)

## 组件内置的主题

###图片上传主题

主题 | 作者|源码|截图
------------ | -------------| -------------| -------------
[imageUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-imageUploader.html)| 明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/imageUploader)|![imageUploader](http://www.36ria.com/wp-content/uploads/2012/08/imageUploader.png)
[refundUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-refundUploader.html)| 明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/refundUploader)|![refundUploader](http://www.36ria.com/wp-content/uploads/2012/08/refundUploader.png)
[loveUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-loveUploader.html)| 苏河/明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/loveUploader)|![loveUploader](http://www.36ria.com/wp-content/uploads/2012/05/uploader.png)
[singleImageUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-singleImageUploader.html)| 溪夏/明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/singleImageUploader)|![singleImageUploader](http://www.36ria.com/wp-content/uploads/2012/11/singleImageUploader.png)
[cropUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-cropUploader.html)| 明河、元泉|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/cropUploader)|![cropUploader](http://s3.36ria.com/201305/4922/35687_o.png)
[editorMultipleUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-editorMultipleUploader.html)| 明河、承玉|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/editorMultipleUploader)|![editorMultipleUploader](http://s3.36ria.com/201305/4922/35687_o.png)

###文件上传主题

主题 | 作者|源码|截图
------------ | -------------| -------------| -------------
[default](http://butterfly.36ria.com/uploader/1.5/demo/js-config-use.html)| 明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/default)|![default](http://s2.36ria.com/201304/4922/34955_o.png)
[daogouUploader](http://butterfly.36ria.com/uploader/1.5/demo/theme-daogouUploader.html)| 溪夏/明河|[源码](https://github.com/kissygalleryteam/uploader/tree/master/1.5/themes/daogouUploader)|![daogouUploader](http://s3.36ria.com/201304/4922/34956_o.png)

## 组件快速上手

### 1.组件依赖的html结构

```xml
    <input type="file" class="g-u" id="J_UploaderBtn" value="上传文件" name="Filedata" >
```

组件的核心只依赖原生的文件上传域，<code>value</code>属性值为上传按钮的文案，<code>name</code>属性非常重要：服务器端获取文件数据的字段。

### 2.加载Uploader模块

```javascript
    KISSY.use('gallery/uploader/1.5/index', function (S, Uploader) {

    })
```
**提醒**：use()的回调，第一个参数是KISSY，第二个参数才是组件实例。

### 3.初始化Uploader

```javascript
    KISSY.use('gallery/uploader/1.5/index', function (S, Uploader) {
        var uploader = new Uploader('#J_UploaderBtn',{
          //处理上传的服务器端脚本路径
          action:"upload.php"
        });
    })
```

Uploader类接受二个参数：

* 第一个参数指向目标元素（指向原生文件上传域元素即可）
* 第二个参数为组件配置，<code>action</code>必须配置，为服务器端处理文件上传的路径。

**提醒**：如果是使用flash上传，action必须是绝对路径。

打开页面就会发现文件上传域部分的结构发生了变化，html结构如下：

```xml
    <a href="javascript:void(0)" class="g-u ks-uploader-button">
        <span class="btn-text">上传文件</span>
        <div class="file-input-wrapper" style="overflow: hidden;">
            <input type="file" name="Filedata" hidefocus="true" class="file-input" style="">
        </div>
    </a>
```

但缺少样式，也没办法处理上传行为，接下来我们加载一个默认主题。

### 4. 主题的使用

```javascript
S.use('gallery/uploader/1.5/index,gallery/uploader/1.5/themes/default/index,gallery/uploader/1.5/themes/default/style.css', function (S, Uploader,DefaultTheme) {
        var uploader = new Uploader('#J_UploaderBtn',{
                        //处理上传的服务器端脚本路径
                        action:"upload.php"
                    });
        //使用主题
        var defaultTheme = new DefaultTheme({ queueTarget:'#J_UploaderQueue' });
        uploader.theme(defaultTheme);
    })
```

第一步先要<code>use()</code>主题js和css，模块路径为<code>gallery/uploader/1.5/themes/default/index</code>和<code>gallery/uploader/1.5/themes/default/index</code>。

第二步实例化主题：

```javascript
var defaultTheme = new DefaultTheme({ queueTarget:'#J_UploaderQueue' });
```

<code>queueTarget</code>是必须配置的，指向队列容器：

```xml
    <ul id="J_JsUploaderQueue">

    </ul>
```

第三步使用<code>uploader.theme()</code>方法，将主题实例加入到uploader中。

```javascript
uploader.theme(defaultTheme);
```

再刷新下页面看看，就会发现已经有样式，并可以处理上传了（action指向的服务器路径可用的情况下）。

html结构上也发生了变化，模拟按钮上增加了<code>defaultTheme-button</code>样式，而ul队列容器上增加了<code>defaultTheme-queue</code>。

你可以通过这二个样式，来改变主题样式。

当然你也可以自定义自己的主题，后面会讲解到。

我们还需要加载一些uploader插件，才能让功能更完整，比如验证、预览等，继续往下看。

### 4. 服务器端返回的数据格式

建议服务端返回的数据格式如下：

```javascript
   {"status":1,"type":"ajax","name":"[1343736002.749366]0.png","url":".\/files\/[1343736002.749366]0.png"}
```

**提醒**：去掉了Uploader1.3的<code>data</code>字段

留意引号！！！特别是键名要加<code>""</code>，不然json会解析失败。

<code>"status":1</code>，才是上传成功的标识，其他任何状态码都认定为失败。

<code>"url":"xxx"</code>，一般是必须的，为文件上传到服务器后的路径。

 <code>"type":"ajax"</code>和<code>"name":"[1343736002.749366]0.png"</code>并非必须的。

 **服务器出错时返回的信息**

```javascript
   {"status":0,message":"图片过大！"}
```

**如果服务器返回的格式不是这样，你需要使用filter属性，格式化数据**

```javascript
    uploader.set('filter',function(data){
        var result = S.JSON.parse(data);
        if(result.message) result.msg = '上传失败！';
        return result;
    });
```

### 5. 给上传组件增加验证

验证功能是作为uploader的插件出现的，需要用户手动加载并初始化。

第一步加载插件js：

```javascript
    S.use('gallery/uploader/1.5/plugins/auth/auth',function(S,Auth){

    })
```

第二步初始化插件：

```javascript
    var auth = new Auth({
       //最多上传个数
       max:3,
       //图片最大允许大小
       maxSize:100
   });
```

auth插件的配置，请看文章的插件部分。

第三步使用<code>plug()</code>将插件插入uploader：

```javascript
    uploader.plug(auth);
```

### 6.存储服务器上传成功后返回的url

上传成功后服务器会返回文件的url，供开发者后续操作，比如将url存储到数据库中，这个过程不需要用户自己写额外代码，加载Uploader的urlsInput插件即可。

插件的使用跟auth是一样的：

```javascript
    S.use('gallery/uploader/1.5/plugins/urlsInput/urlsInput',function(S,UrlsInput){
        var urlsInput = new UrlsInput({target:'#J_Urls'});
        uploader.plug(urlsInput);
    })
```

<code>target</code>指向用于存储的元素目标，一般是个隐藏域，比如：

```xml
    <input type="hidden" id="J_Urls" name="urls">
```

### 7.合并插件调用

uploader的plug方法和theme方法是支持链式调用的。

```javascript
    S.use('gallery/uploader/1.5/index,gallery/uploader/1.5/themes/default/index,gallery/uploader/1.5/themes/default/style.css', function (S, Uploader,DefaultTheme) {
            //上传组件插件
            var plugins = 'gallery/uploader/1.5/plugins/auth/auth,' +
                    'gallery/uploader/1.5/plugins/urlsInput/urlsInput,' +
                    'gallery/uploader/1.5/plugins/proBars/proBars';

            S.use(plugins,function(S,Auth,UrlsInput,ProBars){
                var uploader = new Uploader('#J_UploaderBtn',{
                    //处理上传的服务器端脚本路径
                    action:"upload.php"
                });
                //使用主题
                uploader.theme(new DefaultTheme({
                    queueTarget:'#J_UploaderQueue'
                }))
                        //验证插件
                uploader.plug(new Auth({
                            //最多上传个数
                            max:3,
                            //图片最大允许大小
                            maxSize:100
                        }))
                         //url保存插件
                        .plug(new UrlsInput({target:'#J_Urls'}))
                        //进度条集合
                        .plug(new ProBars())
                ;
            });
        })
```

uploader拥有非常丰富的插件，用户可以根据自己的需要加载和初始化指定的插件，详细内容请看下面的插件部分。

## 组件事件说明

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">事件名</th>
        <th>描述</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>select </td>
        <td>选择完文件后触发</td>
    </tr>
    <tr>
        <td>add </td>
        <td>向队列添加完文件后触发</td>
    </tr>
    <tr>
        <td>start </td>
        <td>开始上传后触发</td>
    </tr>
    <tr>
        <td>progress </td>
        <td>正在上传中时触发，这个事件在iframe上传方式中不存在</td>
    </tr>
    <tr>
        <td>success  </td>
        <td>上传成功后触发</td>
    </tr>
    <tr>
        <td>error </td>
        <td>上传失败后触发</td>
    </tr>
    <tr>
        <td>cancel </td>
        <td>取消上传后触发</td>
    </tr>
    <tr>
        <td>remove </td>
        <td>删除队列中的图片后触发</td>
    </tr>
    </tbody>
</table>

**提醒**：如果你需要操作队列容器中的dom结构，需要监听<code>add</code>事件，比如：

```javascript
    uploader.on('add',function(ev){
        var file = ev.file;
        var target = file.target;
        target.addClass('test');
    });
```

所有的事件参数都包含<code>ev.file</code>对象存储着文件数据。

<code>ev.file.target</code>指向队列容器中的每一个文件对应的DOM节点。

<code>ev.index</code>为文件在队列中的索引值，经常会用到。

#### success事件和error事件

这二个事件也经常用到，事件参数都包含服务器返回的结果集。

```javascript
    uploader.on('success', function (ev) {
        var index = ev.index, file = ev.file;
        //服务器端返回的结果集
        var result = ev.result;
        S.log('上传成功,服务器端返回url：' + result.url);
    });
```

```javascript
    uploader.on('error', function (ev) {
        var index = ev.index, file = ev.file;
        //服务器端返回的结果集
        var result = ev.result;
        S.log( '上传失败,错误消息为：' +result.msg);
    });
```

**提醒**：如果是前端验证触发的error事件，不会有result数据

##组件属性说明

####获取/设置属性

使用get()/set()来获取设置属性，举例：

```javascript
    uploader.on('themeRender', function (ev) {
        var queue = uploader.get('queue');
        //队列中所有的文件数据
        S.log(queue.get('files'));
       //禁用按钮
        uploader.set('disabled',true);
    });
```


####常用指数：*****

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">参数名</th>
        <th style="width: 50px;">类型</th>
        <th style="width: 130px;">默认值</th>
        <th style="width: 200px;">是否只读</th>
        <th>描述</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>action</td>
        <td>String</td>
        <td>''</td>
        <td>读/写</td>
        <td>服务器端处理上传的路径（v1.3.0+）
        </td>
    </tr>
    <tr>
        <td>data</td>
        <td>Object</td>
        <td>{}</td>
        <td>读/写</td>
        <td>此配置用于动态修改post给服务器的数据（v1.3.0+）
        </td>
    </tr>
    <tr>
        <td>name</td>
        <td>String</td>
        <td>Filedata</td>
        <td>只读</td>
        <td>文件上传域name名
        </td>
    </tr>
    <tr>
        <td>autoUpload</td>
        <td>Boolean</td>
        <td>true</td>
        <td>读/写</td>
        <td>是否自动上传，当为<code>false</code>时，可以通过uploader的<code>upload()</code>和<code>uploadFiles()</code>手动上传队列中的文件。</td>
    </tr>
    <tr>
        <td>multiple</td>
        <td>Boolean</td>
        <td>false</td>
        <td>读/写</td>
        <td>是否开启多选支持
            <div class="alert alert-info">如果采用iframe上传，请设置为<code>false</code></div>
        </td>
    </tr>
    <tr>
        <td>disabled</td>
        <td>Boolean</td>
        <td>false</td>
        <td>读/写</td>
        <td>是否可用,false为按钮可用</td>
    </tr>
    <tr>
        <td>filter</td>
        <td>Function</td>
        <td>""</td>
        <td>写</td>
        <td>用于格式化服务器端返回的数据
        </td>
    </tr>

    </tbody>
    </table>

####常用指数：****

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>target</td>
                 <td>NodeList</td>
                 <td>''</td>
                 <td>只读</td>
                 <td>
                     上传组件的目标元素，当组件初始化成功后会指向模拟按钮
                 </td>
             </tr>
             <tr>
                 <td>fileInput</td>
                 <td>NodeList</td>
                 <td>''</td>
                 <td>只读</td>
                 <td>
                     模拟按钮内的文件上传input(type="file")，如果是flash上传此项不存在
                 </td>
             </tr>
             <tr>
                 <td>queue</td>
                 <td>Queue</td>
                 <td>''</td>
                 <td>只读</td>
                 <td>
                     队列的实例，对队列的操作都集中在这个实例上
                 </td>
             </tr>
             <tr>
                  <td>type</td>
                  <td>Queue</td>
                  <td>''</td>
                  <td>只读</td>
                  <td>
                      采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","iframe"]。
                  </td>
              </tr>
             <tr>
                 <td>isAllowUpload</td>
                 <td>Boolean</td>
                 <td>true</td>
                 <td>只读</td>
                 <td>
                     是否允许上传文件
                 </td>
             </tr>
             <tr>
                 <td>curUploadIndex</td>
                 <td>Number</td>
                 <td>""</td>
                 <td>只读</td>
                 <td>
                     当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
                 </td>
             </tr>
             <tr>
                 <td>multipleLen</td>
                 <td>Number</td>
                 <td>-1</td>
                 <td>只读</td>
                 <td>
                     用于限制多选文件个数，值为负时不设置多选限制
                 </td>
             </tr>

        </tbody>
</table>

####常用指数：***

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>theme</td>
                 <td>Theme</td>
                 <td>''</td>
                 <td>只读</td>
                 <td>
                     主题类实例
                 </td>
             </tr>
             <tr>
                 <td>btnTpl</td>
                 <td>Theme</td>
                 <td></td>
                 <td>只读</td>
                 <td>
                      模拟按钮模版
                 </td>
             </tr>
             <tr>
                  <td>swfSize</td>
                  <td>Object</td>
                  <td>{}</td>
                  <td>只读</td>
                  <td>
                  强制设置flash的尺寸，只有在flash上传方式中有效，比如{width:100,height:100}，默认为自适应按钮容器尺寸
                  </td>
              </tr>
        </tbody>
</table>

##Uploader方法说明

####upload (index)：上传指定队列索引的文件

```javascript
//上传队列中的第一个文件
uploader.upload(0)
```

####uploadFiles (status)：批量上传队列中的指定状态下的文件

```javascript
//上传队列中所有等待的文件
uploader.uploadFiles("waiting")
```

####cancel  (index)：取消文件上传

当index参数不存在时取消当前正在上传的文件的上传。cancel并不会停止其他文件的上传（对应方法是stop）。

```javascript
//取消当前正在上传的文件的上传
uploader.cancel();
```

####stop()：停止上传动作

```javascript
//停止上传
uploader.stop();
```

####theme():运行主题实例

```javascript
uploader.theme(new DefaultTheme({
    queueTarget:'#J_UploaderQueue'
}))
```

####plug():将插件插入到uploader中

```javascript
//验证插件
uploader.plug(new Auth({
        //最多上传个数
        max:3,
        //图片最大允许大小
        maxSize:100
    }))
     //url保存插件
    .plug(new UrlsInput({target:'#J_Urls'}))
```

####getPlugin(pluginName):获取插件

```javascript
//验证插件
uploader.getPlugin('auth');
```

插件名称可以对照插件的模块路径上的名称<code>gallery/uploader/1.5/plugins/auth/auth</code>。



##Queue的控制说明

Queue用于控制队列的文件，非常常用，实例存储在Uploader中。


```javascript
var queue = uploader.get('queue');
```



####Queue的files属性

queue的属性只有<code>files</code>，可以获取到所有上传的文件数据，为一个数组。

```javascript
var queue = uploader.get('queue');
var files = queue.get('files');
S.log(files.length);
```

####add():向队列添加文件

```javascript
//测试文件数据
var testFile = {'name':'test.jpg',
    'size':2000,
    'input':{},
    'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
};
//向队列添加文件
var file = queue.add(testFile);
S.log('添加的文件数据为：'+file);
```

当组件向队列添加文件时，会自动生成一个唯一id，比如'file-10'，'file-'前缀是一样的，可以通过id来获取指定的文件。


####remove():删除队列中的文件

```javascript
var removeFile = queue.remove(0);
S.log('删除的文件数据为：'+removeFile);
```

**提醒**：remove()的参数可以是队列数组的索引，比如上面代码的0，是取队列第一个文件数据；也可以是文件的id（唯一），比如remove('file-26')。

####clear():删除队列内的所有文件

```javascript
    queue.clear();
```
####getFiles(status):获取指定状态下的文件

```javascript
var files = queue.getFiles('waiting'),
        ids = [];
S.each(files, function (file) {
    ids.push(file.id);
});
alert('所有等待中的文件id为：' + ids);
```
####getIndexs(type):获取等指定状态的文件对应的文件数组索引值组成的数组

```javascript
var indexs = queue.getIndexs('waiting');
alert('所有等待中的文件index为：' + indexs);
```

getFiles()和getIndexs()的作用是不同的，getFiles()类似过滤数组，获取的是指定状态的文件数据，而getIndexs()只是获取指定状态下的文件对应的在文件数组内的索引值。

##Theme说明

####Theme的使用

使用<code>theme()</code>方法初始化主题逻辑，代码如下：

```javascript
    uploader.theme(new DefaultTheme({
        queueTarget:'#J_UploaderQueue'
    }))
```

####如何理解主题的概念

Uploader的主题包含二个部分：脚本（index.js）和样式（style.css）。

主题的脚本可以理解为uploader事件监听器集合，主题脚本的模版如下：

```javascript
KISSY.add(function (S, Node, ImageUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name RefundUploader
     * @class 退款凭证上传主题，继承于imageUploader主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 明河
     */
    function RefundUploader(config) {
        var self = this;
        //调用父类构造函数
        RefundUploader.superclass.constructor.call(self, config);
    }

    S.extend(RefundUploader, ImageUploader, /** @lends RefundUploader.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        render:function () {
            var self = this;
            var uploader = self.get('uploader');
        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addHandler:function(ev){

        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {

        }
    }, {ATTRS:/** @lends RefundUploader.prototype*/{
        name:{value:'refundUploader'}
    }});
    return RefundUploader;
}, {requires:['node', 'gallery/uploader/1.5/themes/imageUploader/index']});
```

主题中的<code>_errorHandler</code>，在上传失败时会自动触发，当然像"_addHandler"或"_successHandler"也是一样的道理。

####Theme的属性

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>name</td>
                 <td>String</td>
                 <td>''</td>
                 <td>只读</td>
                 <td>
                    主题名，是主题对应的模拟按钮和队列容器的样式名的前缀
                 </td>
             </tr>
              <tr>
                  <td>fileTpl</td>
                  <td>String</td>
                  <td>''</td>
                  <td>只读</td>
                  <td>
                  主题模版，用于定制主题的DOM样式
                  </td>
              </tr>
              <tr>
                  <td>authMsg</td>
                  <td>Object</td>
                  <td>{}</td>
                  <td>只读</td>
                  <td>
                  验证插件的消息文案
                  </td>
              </tr>
              <tr>
                  <td>allowExts</td>
                  <td>String</td>
                  <td>''</td>
                  <td>只读</td>
                  <td>
                    文件格式限制
                  </td>
              </tr>
              <tr>
                  <td>queueTarget</td>
                  <td>NodeList</td>
                  <td>''</td>
                  <td>只读</td>
                  <td>
                    队列容器目标元素
                  </td>
              </tr>
              <tr>
                  <td>uploader</td>
                  <td>Uploader</td>
                  <td>''</td>
                  <td>只读</td>
                  <td>
                    Uploader的实例
                  </td>
              </tr>
        </tbody>
</table>

####在html页面直接写主题模版

这是1.5新增功能，用于用户可以更直观的控制主题模版。

```javascript
<ul id="J_JsUploaderQueue">
      <script type="text/uploader-theme">
                  <li id="queue-file-{id}" class="g-u" data-name="{name}">
                      <div class="pic-wrapper">
                         <div class="pic">
                             <span><img class="J_Pic_{id} preview-img" src="" /></span>
                         </div>
                         <div class=" J_Mask_{id} pic-mask"></div>
                         <div class="status-wrapper J_FileStatus">
                             <div class="status waiting-status"><p>等待上传</p></div>
                             <div class="status start-status progress-status success-status">
                                 <div class="J_ProgressBar_{id}">上传中...</div>
                             </div>
                             <div class="status error-status">
                                 <p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>
                         </div>
                     </div>'+
                     <div>
                         <a class="J_Del_{id} del-pic" href="#">删除</a>
                     </div>
                 </li>'
      </script>
</ul>
```

模版代码必须包含在<code>script</code>标签内

```javascript
<script type="text/uploader-theme">
</script>
```


####如何自己写一套主题？

//TODO:日后补充

##插件说明

**如何获取插件呢？**

```javascript
    var auth = uploader.getPlugin('auth');
    //只允许上传一个文件
    auth.set('max',1);
```

**如何自己写一个uploader的插件呢？**

//TODO:日后补充

###auth：表单验证

####配置项（属性）

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>allowExts</td>
                 <td>String</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td> 图片格式验证控制 </td>
             </tr>
             <tr>
                 <td>required</td>
                 <td>Boolean</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td> 必须至少上传一个文件 <div class="alert alert-info">组件默认不触发，可以使用uploader的testRequired()方法手动验证。</div></td>
             </tr>
             <tr>
                 <td>max</td>
                 <td>Number</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td>最多上传N个图片，当达到N个图片后按钮会增加禁用样式<code>uploader-button-disabled</code>，用户可以通过这个样式名定制需要的置灰样式。 </td>
             </tr>
             <tr>
                 <td>maxSize</td>
                 <td>Number</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td>单图片最大允许上传的文件大小，单位是<code>KB</code> <div class="alert alert-info">如果是iframe上传方式，此验证无效。</div></td>
             </tr>
             <tr>
                 <td>allowRepeat</td>
                 <td>Boolean</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td>是否允许多次上传同一个文件</td>
             </tr>
             <tr>
                 <td>widthHeight</td>
                 <td>Array</td>
                 <td>''</td>
                 <td>读/写</td>
                 <td>v1.5新增的验证规则，用于限制图片尺寸，非常特殊的验证方式：1.异步验证；2.值为一个函数数组[fnWidth,fnHeight]，比如限制宽度大于60，高度大于160，代码如下：

                        widthHeight:function(width,height){
                            return width > 160 && height > 160;
                        }
                 </td>
             </tr>
             <tr>
                 <td>msg</td>
                 <td>Object</td>
                 <td>{}</td>
                 <td>读/写</td>
                 <td>验证的消息集合，请使用msg()方法来设置消息</td>
             </tr>
        </tbody>
</table>

####auth的方法

**msg(rule,msg)**：获取/设置验证消息

```javascript
    var auth = uploader.getPlugin('auth');
    //设置max规则消息
    auth.msg('max','每次最多上传{max}个文件！');
    //获取max消息
    S.log(auth.msg('max'));
```

**testRequired()**：检验是否已经上传了至少一个文件

```javascript
    var auth = uploader.getPlugin('auth');
    var isPass = auth.testRequired();
    S.log(isPass);
```

其他的规则一样拥有test方法（"test+规则名()"）。

####auth的事件

当校验不通过是auth会触发uploader的error事件：

```javascript
uploader.on('error',function(ev){
    S.log(ev.rule);
})
```

###urlsInput：存储服务器返回的url并可以渲染默认数据

使用<code>urlsInput</code>插件，uploader会自动将服务器返回的url插入到一个input上。

需要有个目标容器：

```javascript
    <input type="hidden" id="J_Urls" name="refundImageUrls">
```


```javascript
    uploader.use('urlsInput',{target:'.J_Urls'});
```

####配置项（属性）

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>target</td>
                 <td>String</td>
                 <td>''</td>
                 <td>读</td>
                 <td>用于存储文件路径的目标容器</td>
             </tr>
             <tr>
                 <td>urls</td>
                 <td>Array</td>
                 <td>[]</td>
                 <td>读</td>
                 <td>容器内的所有路径</td>
             </tr>
             <tr>
                 <td>autoRestore</td>
                 <td>Boolean</td>
                 <td>true</td>
                 <td>读</td>
                 <td>是否自动渲染默认数据</td>
             </tr>
             <tr>
                 <td>split</td>
                 <td>String</td>
                 <td>","</td>
                 <td>读/写</td>
                 <td>多个路径间的分隔符</td>
             </tr>
        </tbody>
</table>

####urlsInput的方法


**add(url)**：向input添加路径

```javascript
    var urlsInput = uploader.getPlugin('urlsInput');
    urlsInput.add('http://www.36ria.com/test.jpg');
```

**remove(url)**：删除input内的指定路径

**isExist(url)**：是否已经存在指定路径

**restore()**：添加默认数据到队列

###tagConfig：从input上拉取配置覆盖组件配置

如果你希望可以在html配置组件属性，需要use("tagConfig")。

demo可以[猛击这里](http://butterfly.36ria.com/uploader/1.5/demo/tag-config-use.html)。

```xml
    <input class="g-u" id="J_UploaderBtn" name="Filedata" type="file" value="上传图片"
           action="upload.php" postData='{"author":"minghe"}' max="3" maxSize="500">
```

**提醒**：html中的配置会覆盖js的配置，这跟1.5前的逻辑相反。

**提醒**：postData等价于js配置中的data。

tagConfig的配置覆盖会在主题初始化成功后才执行，如果你的uploader不使用主题，请手动调用覆盖方法：

```javascript
    var tagConfig = uploader.getPlugin('tagConfig');
    tagConfig.cover();
```

###proBars：进度条集合

**提醒**：proBars是队列中所有的进度条集合，插件还有个ProgressBar子类，对应每个文件的进度条。

进度条插件依赖主题模版中的进度条容器：

```xml
<div class="J_ProgressBar_{id}">上传中...</div>
```

####ProBars的配置项

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>width</td>
                 <td>Number</td>
                 <td>'auto'</td>
                 <td>读/写</td>
                 <td>进度条的宽度</td>
             </tr>
              <tr>
                  <td>bars</td>
                  <td>Object</td>
                  <td>{}</td>
                  <td>读</td>
                  <td>进度条实例集合</td>
              </tr>
             <tr>
                 <td>isHide</td>
                 <td>Boolean</td>
                 <td>true</td>
                 <td>读/写</td>
                 <td>进度走到100%时是否隐藏</td>
             </tr>
             <tr>
                 <td>speed</td>
                 <td>String</td>
                 <td>0.2</td>
                 <td>读/写</td>
                 <td>进度条跑动速度控制</td>
             </tr>
        </tbody>
</table>

####ProBars的方法

**add(fileId)** ：向集合添加一个进度条

###preview：图片预览插件

**提醒**：该插件在IE10下无效，无效的情况下，主题会使用服务器返回的路径来渲染出图片。

**preview(fileInput, imgElem)**：preview只有这个方法，用于渲染本地图片。

```javascript
    var preview = uploader.getPlugin('preview');
    var fileInput = uploader.get('fileInput');
    preview.preview(fileInput,$img);
```

###filedrop：文件拖拽上传插件

####Filedrop的配置项

<table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th style="width: 100px;">属性名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 130px;">默认值</th>
            <th style="width: 200px;">是否只读</th>
            <th>描述</th>
        </tr>
        </thead>
        <tbody>
             <tr>
                 <td>target</td>
                 <td>NodeList</td>
                 <td>''</td>
                 <td>读</td>
                 <td>指向模拟按钮</td>
             </tr>
        </tbody>
</table>

####Filedrop的方法

**show()/hide()**：显示和隐藏拖拽区域

###imageZoom：图片放大插件

利用image-dd组件来实现图片放大。

##Q&A

####如何处理跨域上传？

目前跨域处理只支持iframe和flash方式，如果遇到需要跨域的情况，推荐设置<code>type:"iframe"</code>。

假设你表单页面的域是：refund.taobao.com，而处理上传的服务器端路径却是upload.taobao.com。

那么将二个页面使用js将域设置为taobao.com：

```xml
<script>document.domain="taobao.com";</script>
```

处理上传的服务器返回的内容可以如下：

```xml
<script>document.domain="taobao.com";</script>
{"status":1,"type":"ajax","name":"54.png","url":".\/files\/54.png"}
```

脚本部分不用做任何处理，组件会自动处理，只取需要的结果集。

####flash上传进度条不走，上传失败

在url后面加上ks-debug，看下调试工具控制台输出是否有个“缺少crossdomain.xml”的提示。

crossdomain.xml是flash的安全策略文件，需要放在在域名根目录下，比如应用域名为refund.taobao.com，那么就应该有http://www.refund.taobao.com/crossdomain.xml，在调试时可以将这个文件代理到本地。

crossdomain.xml的内容可以如下：

```xml
<?xml version="1.0"?>
<cross-domain-policy>
    <allow-access-from domain="*"/>
    <!--下面这行代码必须有-->
    <allow-access-from domain="*.tbcdn.cn"/>
</cross-domain-policy>
```

tbcdn.cn为swf文件所在的位置，安全策略文件需要加上。

####flash上传时，隐藏上传按钮后再显示，上传组件不可用

flash对象不能设置<code>display:none;</code>，父容器隐藏也是不行的！这点特别留意。

你可以设置<code>position:absolute;top:-2000px</code>，这样的位移方式来处理。







