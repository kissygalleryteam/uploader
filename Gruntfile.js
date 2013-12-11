module.exports = function(grunt) {
    var configs = grunt.file.readJSON('abc.json');
    var BUILD = 'build/';
    var versionPath = '1.5/';
    var kmcSrcs = ['index.js','theme.js','aliUploader.js'
        ,'plugins/plugins.js','plugins/auth/auth.js','plugins/ajbridge/uploader.js','plugins/coverPic/coverPic.js','plugins/filedrop/filedrop.js','plugins/imageZoom/imageZoom.js','plugins/imgcrop/imgcrop.js','plugins/preview/preview.js','plugins/proBars/proBars.js','plugins/tagConfig/tagConfig.js','plugins/urlsInput/urlsInput.js','plugins/miniLogin/miniLogin.js','plugins/mobileUploader/mobileUploader.js','plugins/paste/paste.js','plugins/cross/cross.js',
        ,'themes/cropUploader/index.js','themes/daogouUploader/index.js','themes/default/index.js','themes/editorMultipleUploader/index.js','themes/cropUploader/index.js','themes/ershouUploader/index.js','themes/imageUploader/index.js','themes/loveUploader/index.js','themes/mutilImageUploader/index.js','themes/refundUploader/index.js','themes/singleImageUploader/index.js','themes/wankeUploader/index.js','themes/grayUploader/index.js','themes/crossUploader/index.js'
    ];
    var kmcMain = [];
    for(var i = 0;i<kmcSrcs.length;i++){
        var buildPath = versionPath + BUILD + kmcSrcs[i];
        kmcMain.push({
            src: versionPath+kmcSrcs[i],
            dest: buildPath
        });
    }

    var themes = ['cropUploader','editorMultipleUploader','imageUploader','refundUploader','singleImageUploader','grayUploader','crossUploader','default'];
    var lessMain = {};
    for(var i = 0;i<themes.length;i++){
        var lessPath = versionPath + 'themes/' + themes[i] + '/style.less';
        var buildPath = versionPath + 'build/themes/'+themes[i];
        var cssPath = buildPath + '/style.css';
        lessMain[cssPath] = lessPath;
    }
    grunt.initConfig({
        // 配置文件，参考package.json配置方式，必须设置项是
        // name, version, author
        // name作为gallery发布后的模块名
        // version是版本，也是发布目录
        // author必须是{name: "xxx", email: "xxx"}格式
        pkg: configs,
        buildBase: '1.5/build',
        banner: '/*!build time : <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>*/\n',
        // kmc打包任务，默认情况，入口文件是index.js，可以自行添加入口文件，在files下面
        // 添加
        kmc: {
            options: {
                banner: '<%= banner %>',
                packages: [
                    {
                        name: '<%= pkg.name %>',
                        path: '../'
                    }
                ],
                map: [["<%= pkg.name %>/", "gallery/<%= pkg.name %>/"]]
            },
            main: {
                files: kmcMain
            }
        },
        copy: {
            main: {
                files: [
                    {src: ['path/**'], dest: 'dest/'}
                ]
            }
        },
        /**
         * 对JS文件进行压缩
         * @link https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                banner: '<%= banner %>',
                beautify: {
                    ascii_only: true
                }
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= buildBase %>',
                        src: ['**/*.js', '!**/*-min.js'],
                        dest: '<%= buildBase %>',
                        ext: '-min.js'
                    }
                ]
            }
        },
        less: {
            options: {
                banner: '<%= banner %>'
            },
            themes:{
                files: lessMain
            }
        },
        cssmin: {
            options: {
                banner: '<%= banner %>'
            },
            themes:{
                files: [
                    {
                        expand: true,
                        cwd: '<%= buildBase %>',
                        src: ['**/*.css', '!**/*-min.css'],
                        dest: '<%= buildBase %>',
                        ext: '-min.css'
                    }
                ]
            }
        }
    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-kmc');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    return grunt.registerTask('default', ['kmc', 'uglify','less','cssmin']);
};