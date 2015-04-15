/*
combined files : 

kg/uploader/3.0.2/queue
kg/uploader/3.0.2/nativeUploader

*/
/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('kg/uploader/3.0.2/queue',function (S, Node, Base) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * 转换文件大小字节数
     * @param {Number} bytes 文件大小字节数
     * @return {String} 文件大小
     */
    function convertByteSize(bytes) {
        var i = -1;
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 99);
        return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
    }

    /**
     * @name Queue
     * @class 文件上传队列，用于存储文件数据
     * @constructor
     * @extends Base
     * @param {Object} config Queue没有必写的配置
     * @param {Uploader} config.uploader Uploader的实例
     * @example
     * S.use('kg/uploader/2.0.1/queue/base,kg/uploader/2.0.1/themes/default/style.css', function (S, Queue) {
     *    var queue = new Queue();
     *    queue.render();
     * })
     */
    function Queue(config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * 支持的事件
         */
        event:{
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'statusChange',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile'
        },
        /**
         * 文件的状态
         */
        status:{
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
        },
        //文件唯一id前缀
        FILE_ID_PREFIX:'file-'
    });
    /**
     * @name Queue#add
     * @desc  添加完文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#addFiles
     * @desc  批量添加文件后触发
     * @event
     * @param {Array} ev.files 添加后的文件数据集合
     */
    /**
     * @name Queue#remove
     * @desc  删除文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#clear
     * @desc  清理队列所有的文件后触发
     * @event
     */
    /**
     * @name Queue#statusChange
     * @desc  当改变文件状态后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {String} ev.status 文件状态
     */
    /**
     * @name Queue#updateFile
     * @desc  更新文件数据后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 向上传队列添加文件
         * @param {Object | Array} files 文件数据，传递数组时为批量添加
         * @example
         * //测试文件数据
 var testFile = {'name':'test.jpg',
     'size':2000,
     'input':{},
     'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
 };
 //向队列添加文件
 queue.add(testFile);
         */
        add:function (files, callback) {
            var self = this,fileData={};
            //如果存在多个文件，需要批量添加文件
            if (files.length > 0) {
                fileData=[];
                var uploader =self.get('uploader');
                var len = self.get('files').length;
                var hasMax = uploader.get('max') > 0;
                S.each(files,function(file, index){
                    if(!hasMax){
                        fileData.push(self._addFile(file));
                    }else{
                        //增加是否超过判断
                        //#128 https://github.com/kissyteam/kissy-gallery/issues/128 by 翰文
                        var max = uploader.get('max');
                        if (max >= len + index + 1) {
                            fileData.push(self._addFile(file));
                        }
                    }
                });
            } else {
                fileData = self._addFile(files);
            }
            callback && callback.call(self);
            return fileData;
        },
        /**
         * 向队列添加单个文件
         * @param {Object} file 文件数据
         * @param {Function} callback 添加完成后执行的回调函数
         * @return {Object} 文件数据对象
         */
        _addFile:function (file,callback) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFile()参数file不合法！');
                return false;
            }
            var self = this,
                //设置文件对象
                fileData = self._setAddFileData(file),
                //文件索引
                index = self.getFileIndex(fileData.id),
                fnAdd = self.get('fnAdd');
            //执行用户自定义的回调函数
            if(S.isFunction(fnAdd)){
                fileData = fnAdd(index,fileData);
            }
            self.fire(Queue.event.ADD, {index:index, file:fileData,uploader:self.get('uploader')});
            callback && callback.call(self, index, fileData);
            return fileData;
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         * @example
         * queue.remove(0);
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file;
            //参数是字符串，说明是文件id，先获取对应文件数组的索引
            if (S.isString(indexOrFileId)) {
                indexOrFileId = self.getFileIndex(indexOrFileId);
            }
            //文件数据对象
            file = files[indexOrFileId];
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + 'remove()不存在index为' + indexOrFileId + '的文件数据');
                return false;
            }
            //将该id的文件过滤掉
            files = S.filter(files, function (file, i) {
                return i !== indexOrFileId;
            });
            self.set('files', files);
            self.fire(Queue.event.REMOVE, {index:indexOrFileId, file:file});
            callback && callback.call(self,indexOrFileId, file);
            return file;
        },
        /**
         * 清理队列
         */
        clear:function () {
            var self = this, files;
            _remove();
            //移除元素
            function _remove() {
                files = self.get('files');
                if (!files.length) {
                    self.fire(Queue.event.CLEAR);
                    return false;
                }
                self.remove(0, function () {
                    _remove();
                });
            }
        },
        /**
         * 获取或设置文件状态，默认的主题共有以下文件状态：'waiting'、'start'、'progress'、'success'、'cancel'、'error' ,每种状态的dom情况都不同，刷新文件状态时候同时刷新状态容器类下的DOM节点内容。
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         * @example
         * queue.fileStatus(0, 'success');
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index)) return false;
            var self = this, file = self.getFile(index),
                theme = self.get('theme'),
                curStatus,statusMethod;
            if (!file) return false;
            //状态
            curStatus = file['status'];
            if(!status){
                return curStatus;
            }
            //状态一直直接返回
            if(curStatus == status) return self;
            //更新状态
            self.updateFile(index,{status:status});
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status,args:args,file:file});
            return  self;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} indexOrId 文件在队列中的索引或id
         * @return {Object}
         */
        getFile:function (indexOrId) {
            var self = this;
            var file;
            var files = self.get('files');
            if(S.isNumber(indexOrId)){
                file = files[indexOrId];
            }else{
                S.each(files, function (f) {
                    if (f.id == indexOrId) {
                        file = f;
                        return true;
                    }
                });
            }
            return file;
        },
        /**
         * 根据文件id来查找文件在队列中的索引
         * @param {String} fileId 文件id
         * @return {Number} index
         */
        getFileIndex:function (fileId) {
            var self = this, files = self.get('files'), index = -1;
            S.each(files, function (file, i) {
                if (file.id == fileId) {
                    index = i;
                    return true;
                }
            });
            return index;
        },
        /**
         * 更新文件数据对象，你可以追加数据
         * @param {Number} index 文件数组内的索引值
         * @param {Object} data 数据
         * @return {Object}
         */
        updateFile:function (index, data) {
            if (!S.isNumber(index)) return false;
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'updateFile()的data参数有误！');
                return false;
            }
            var self = this, files = self.get('files'),
                file = self.getFile(index);
            if (!file) return false;
            S.mix(file, data);
            files[index] = file;
            self.set('files', files);
            self.fire(Queue.event.UPDATE_FILE,{index : index, file : file});
            return file;
        },
        /**
         * 获取等指定状态的文件对应的文件数组index的数组
         * @param {String} type 状态类型
         * @return {Array}
         * @example
         * //getFiles()和getFileIds()的作用是不同的，getFiles()类似过滤数组，获取的是指定状态的文件数据，而getFileIds()只是获取指定状态下的文件对应的在文件数组内的索引值。
         * var indexs = queue.getFileIds('waiting');
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status == type) {
                        indexs.push(index);
                    }
                }
            });
            return indexs;
        },
        /**
         * 获取指定状态下的文件
         * @param {String} status 状态类型
         * @return {Array}
         * @example
         * //获取等待中的所有文件
         * var files = queue.getFiles('waiting');
         */
        getFiles:function (status) {
            var self = this, files = self.get('files'), statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file && file.status == status) statusFiles.push(file);
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = convertByteSize(file.size);
            //状态
            if(!file.status) file.status = 'waiting';
            files.push(file);
            return file;
        }
    }, {ATTRS:/** @lends Queue.prototype*/{
        /**
         * 添加完文件数据后执行的回调函数，会在add事件前触发
         * @type Function
         * @default  ''
         */
        fnAdd:{value:EMPTY},
        /**
         * 队列内所有文件数据集合
         * @type Array
         * @default []
         * @example
         * var ids = [],
         files = queue.get('files');
         S.each(files, function (file) {
         ids.push(file.id);
         });
         alert('所有文件id：' + ids);
         */
        files:{value:[]},
        /**
         * 该队列对应的Uploader实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base']});
/**
 * changes:
 * 明河：1.5
 *      - [!] #72 getFile()方法优化
 * 明河：1.4
 *           - 去掉与Theme的耦合
 *           - 去掉restore
 */
/**
 * @fileoverview 在主客户端使用，调用native的上传组件实现图片上传功能
 * @author jianping.xwh<jianping.xwh@taobao.com>
 * @module native-uploader
 * @参考： //confluence.taobao.ali.com/pages/viewpage.action?pageId=200209347
 * 感谢玉门同学帮忙修正了几处严重bug
 **/
KISSY.add('kg/uploader/3.0.2/nativeUploader',function (S, Node,JSON,Base,Queue) {
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

    var queryInterval = null;// 保证一次交互只开一个轮询，1：保证性能；2：保证并发逻辑；  跟罗睺沟通过的结果
    //打印日志
    function Log(content, clear){
        var log = $('#Log');
        if( clear === true ){
            log.html('');
        }
        if( log.length == 0 ){
            return ;
        }
        if( typeof content != 'string' ){
            content = JSON.stringify(content);
        }

        log.html( log.html() + '<br>' + content)
    }

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
                if (window.navigator.userAgent.match(/WindVane/i)) {
                    self.select();
                }else{
                    self.fire('no-windVane');
                }
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
                var prevPaths = self.get('prevPaths');

                var deleteFileSrc = [prevPaths[ev.index]];
                self._deleteOneFile(deleteFileSrc);

                prevPaths.splice(ev.index, 1);
                self.set('prevPaths', prevPaths);
                self.fire(event.REMOVE,ev);
            });
            self.set('queue', queue);
            return queue;
        },

        _deleteOneFile: function(src){
            WindVane.call('MultiPhotoPicker', 'delete', src, function(){}, function(){});
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
            var uris = url.split('/');
            var name = uris[uris.length - 1];
            var ev = {file:file,index:index,result:{url:url,name:name}};
            file.result = ev.result;
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
            var queryInterval;
            var prevPaths = self.get('prevPaths');
            var tparm = {
                "path": prevPaths
            };
            var cparam = prevPaths ? tparm : '';
            self.fire('select');
            WindVane.call('MultiPhotoPicker','pick',cparam,function(result){
                //result demo : {"path":["path1","path2"]}
                var paths = result.path;
                S.log(paths);
                if( !S.isArray(paths) ){
                    paths = [paths];
                }
                // Log(paths);
                //将路径编码
                paths = S.filter(paths,function(item){
                    return decodeURIComponent(item);
                });
                S.each(paths,function(p,i){
                    if(prevPaths && prevPaths.indexOf(p) > -1){
                        return true;
                    }
                    self._addFile(p);
                })
                self.set('prevPaths',paths);
                //查询上传状态
                queryInterval && clearInterval(queryInterval);
                queryInterval = setInterval(function(){
                    self.updateStatus(paths, function(){
                        queryInterval && clearInterval(queryInterval);
                        queryInterval = null;
                    });
                },500);

                // 兜底
                setTimeout(function(){
                    if( queryInterval ){
                        // alert(queryInterval)
                        queryInterval && clearInterval(queryInterval);
                        queryInterval = null;
                    }
                }, 10000);
            },function(){});
        },
        //更新照片状态
        //paths demo: {"path":["path1","path2"]}
        //queryInterval 查询定时器
        updateStatus:function(paths,queryIntervalHandler){
            var self = this;
            if(!S.isArray(paths) || !paths.length) return false;
            //将路径参数传递给native
            var tparm = {};
            tparm['path'] = paths;
            var cparam = paths ? tparm : '';
            WindVane.call('MultiPhotoPicker','status_query',cparam,function(result){
                // Log(' ', true);
                // Log('===');
                // Log(result);
                // Log('===');
                var $path;
                //demo :  {"path1":{"status":"1","remote":{"key":"value"},"percentage":"23"},"path2":{xxxx}}
                /*status= -1:失败 1:上传中   2:成功
                 remote：上传成功后mtop接口返回的data字段
                 percentage:上传百分比
                 */
                // $('#J_Urls2').html('').css('background', '#' + parseInt(Math.random() * 1000000));
                //是否空队列
                var queue_len = 0;
                S.each(result,function(p,k){
                    ++queue_len;
                    if(p.status == 2 || p.status == 0){
                        // Log('uploader success:');
                        // Log(p);
                        p.remote.resourceUri && self._success(p.remote.resourceUri,k);
                        // $('#J_Urls2').html( $('#J_Urls2').html() + '<img src="'+ p.remote.resourceUri + '" width="100" height="100" data-path="' + k + '">');
                        --queue_len;
                    }
                    else if(p.status == 1){
                        self._progress(p.percentage,k);
                    }
                    else if(p.status == -1){
                        self._error('上传失败了,请删除下重试吧',k);
                        --queue_len;
                        self._deleteOneFile(k); //
                    }
                    else{
                        // 服务器问题
                        self._error('上传失败了,请删除下重试吧',k);
                        --queue_len;
                        self._deleteOneFile(k); //
                    }
                });

                //空队列
                if( queue_len == 0 ){
                    queryIntervalHandler && queryIntervalHandler();
                }

            },function(result){
                queryIntervalHandler && queryIntervalHandler();
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


