/**
 * @fileoverview 在主客户端使用，调用native的上传组件实现图片上传功能
 * @author jianping.xwh<jianping.xwh@taobao.com>
 * @module native-uploader
 **/
KISSY.add(function (S, Node,JSON,Base,Queue) {
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
        _addFile:function(path){
            var self = this;
            var queue = self.get('queue');
            var file = {
                'name':path,
                'file':{'name':path, 'type':'image/jpeg'}
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
            var ev = {file:file,index:index,result:{url:url,name:file.name}};
            queue.fileStatus(index, status.SUCCESS, ev);
            self.fire(event.SUCCESS, ev);
            return self;
        },
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
            var queryInterval;
            var prevPaths = self.get('prevPaths');
            var tparm = {
                "path": prevPaths
            };
            var cparam = prevPaths ? tparm : '';
            var $srcNode = self.get('target');

            WindVane.call('MultiPhotoPicker','pick',cparam,function(result){
                //result demo : {"path":["path1","path2"]}
                var paths = result.path;
                S.log(paths);
                //将路径编码
                paths = S.filter(paths,function(item){
                    return decodeURIComponent(item);
                });
                var $path;
                var pathtext;
                S.each(paths,function(p,i){
                    if(prevPaths && prevPaths.indexOf(p) > -1){
                        return true;
                    }
                    self._addFile(p);
                })
                self.set('prevPaths',paths);
                //查询上传状态
                !queryInterval && (queryInterval = setInterval(function(){
                    self.updateStatus(paths,queryInterval);
                },2000));
            },function(result){

            });
        },
        //更新照片状态
        //paths demo: {"path":["path1","path2"]}
        //queryInterval 查询定时器
        updateStatus:function(paths,queryInterval){
            var self = this;
            if(!S.isArray(paths) || !paths.length) return false;
            //将路径参数传递给native
            var tparm = {};
            tparm['path'] = paths;
            var cparam = paths ? tparm : '';
            WindVane.call('MultiPhotoPicker','status_query',cparam,function(result){
                var $path;
                //demo :  {"path1":{"status":"1","remote":{"key":"value"},"percentage":"23"},"path2":{xxxx}}
                /*status= -1:失败 1:上传中   2:成功
                 remote：上传成功后mtop接口返回的data字段
                 percentage:上传百分比
                 */
                S.each(result,function(p,k){
                    if(p.status == 2){
                        self._success(p.remote.resourceUri,k);
                        clearInterval(queryInterval);
                        queryInterval = null;
                    }
                    else if(p.status == 1){
                        self._progress(p.percentage,k);
                    }
                    else if(p.status == -1){
                        self._error('上传失败',k);
                        clearInterval(queryInterval);
                    }
                })

            },function(result){

            });
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
            queue:{value:EMPTY}
        }
    });
}, {requires:['node','json','base','./queue']});

