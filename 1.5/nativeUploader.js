/**
 * @fileoverview 在主客户端使用，调用native的上传组件实现图片上传功能
 * @author jianping.xwh<jianping.xwh@taobao.com>
 * @module native-uploader
 **/
KISSY.add(function (S, Node,JSON,Base,Queue,JSON) {
    var EMPTY = '';
    var $ = Node.all;
    var status = {
        WAITING:'waiting',
        START:'start',
        PROGRESS:'progress',
        SUCCESS:'success',
        CANCEL:'cancel',
        ERROR:'error'
    };
    var event = {
        //选择完文件后触发
        SELECT:'select',
        //向队列添加一个文件后触发
        ADD:'add',
        //开始上传后触发
        START:'start',
        //正在上传中时触发
        PROGRESS:'progress',
        //上传完成（在上传成功或上传失败后都会触发）
        COMPLETE:'complete',
        //上传成功后触发
        SUCCESS:'success',
        //批量上传结束后触发
        UPLOAD_FILES:'uploadFiles',
        //取消上传后触发
        CANCEL:'cancel',
        //上传失败后触发
        ERROR:'error',
        //移除队列中的一个文件后触发
        REMOVE:'remove'
    };

    return Base.extend({
        initializer:function(){
            var self = this;
            var $srcNode = self.get('target');
            if(WindVane && WindVane.api){
                self.set('camera',WindVane.api.camera);
            }
            if(!$srcNode.length){
                S.log('srcNode节点不存在');
                return false;
            }
            self._renderQueue();
            $srcNode.on('click',function(){
                self.select();
            })
        },
        /**
         * 运行Queue队列组件
         * @return {Queue} 队列实例
         */
        _renderQueue:function () {
            var self = this, queue = new Queue();
            //将上传组件实例传给队列，方便队列内部执行取消、重新上传的操作
            queue.set('uploader', self);
            queue.on('add',function(ev){
                self.fire(event.ADD,ev);
            });
            //监听队列的删除事件
            queue.on('remove', function (ev) {
                self.fire(event.REMOVE,ev);
            });
            self.set('queue', queue);
            return queue;
        },
        /**
         * 使用指定主题
         * @param {Theme} oTheme 主题类
         * @return  {Uploader|Boolean}
         */
        theme:function (oTheme) {
            var self = this;
            var theme = self.get('theme');
            if(!oTheme)return false;
            if (theme) {
                S.log('不支持重新渲染主题！');
                return self;
            }
            oTheme.set('uploader',self);
            oTheme.set('queue',self.get('queue'));
            oTheme.render && oTheme.render();
            self.fire('themeRender', {theme:theme, uploader:self});
            self.set('theme', oTheme);
            return self;
        },
        //向队列添加文件
        //path为图片在手机的本地路径
        //url为在主客路径，用于图片预览
        _addFile:function(path,url){
            var self = this;
            var queue = self.get('queue');
            var file = {
                "name":path,
                "file":{"name":path,"url":"url", "type":"image/jpeg"}
            };
            queue.add(file);
            return self;
        },
        //上传中时的处理
        //percentage为百分比
        //name为文件路径
        _progress:function(percentage,name){
            if(percentage <= 1) return false;
            var self = this;
            var queue = self.get('queue');
            var file = self._getFile(name);
            var index = queue.getFileIndex(file.id);
            var ev = {file:file,index:index,percentage:percentage};
            queue.fileStatus(index, status.PROGRESS, ev);
            self.fire(event.PROGRESS, ev);
            return self;
        },
        //上传成功后
        //服务器返回的路径
        _success:function(url,name){
            var self = this;
            var queue = self.get('queue');
            var file = self._getFile(name);
            var index = queue.getFileIndex(file.id);
            var uris = url.split('/');
            var name = uris[uris.length - 1];
            var ev = {file:file,index:index,result:{url:url,name:name}};
            queue.fileStatus(index, status.SUCCESS, ev);
            self.fire(event.SUCCESS, ev);
            return self;
        },
        //上传失败后
        _error:function(msg,name){
            var self = this;
            var queue = self.get('queue');
            var file = self._getFile(name);
            var index = queue.getFileIndex(file.id);
            var ev = {file:file,index:index,msg:msg};
            queue.fileStatus(index, status.ERROR, ev);
            self.fire(event.ERROR, ev);
            return self;
        },
        //通过name获取file
        _getFile:function(name){
            var self = this;
            var queue = self.get('queue');
            var files = queue.get('files');
            var newFiles = S.filter(files,function(file){
                return file.name == name;
            });
            return newFiles[0];
        },
        //选择照片
        select:function(){
            var self = this;
            var camera = self.get('camera');
            var queryInterval;
            //处理是否自动上传
            var autoUpload = self.get('autoUpload');
            var type = autoUpload && 1 || 0;
            var localPath;
            camera.takePhoto(function(e){
                //demo:{url:"",localPath:"",resourceURL:""}
                //url: 访问URL，页面将此URL填写给img的src属性，用于进行页面的预览，该URL非真实的CDN URL，浏览器无法访问
                var url = e.url;
                //localPath: 本地文件路径，该路径可以用于后续的上传过程
                localPath = e.localPath;
                //resourceURL: 上传到TFS后的回传CDN地址，该地址可以在浏览器里真实访问
                var resourceURL = e.resourceURL;
                //添加文件
                self._addFile(localPath,url);
                self._success(resourceURL,localPath);
            },function(e){
                S.log(JSON.stringify(e));
                self._error('上传失败',localPath);
            },{type:type});
        }
    },{
        ATTRS:{
            target:{
                value:EMPTY,
                getter:function(v){
                    return $(v);
                }
            },
            upNode:{value:'.J_UploaderUp'},
            successPaths:{value:[]},
            prevPaths:{value:[]},
            //主题实例
            theme:{ value:EMPTY },
            //队列实例
            queue:{value:EMPTY},
            //lib-windvane api的对象
            camera:{value:EMPTY},
            //自动上传
            autoUpload:{value:true}
        }
    });
}, {requires:['node','json','base','./queue','json']});

