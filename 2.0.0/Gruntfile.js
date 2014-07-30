module.exports = function(grunt) {
	var task = grunt.task;
    var SRC = 'src/';
    grunt.initConfig({
        // 配置文件，参考package.json配置方式，必须设置项是
        // name, version, author
        // name作为gallery发布后的模块名
        // version是版本，也是发布目录
        // author必须是{name: "xxx", email: "xxx"}格式
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!build time : <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>*/\n',

        // 对build目录进行清理
        clean: {
            build: {
                src: './build/*'
			}
        },
        // kmc打包任务，默认情况，入口文件是index.js，可以自行添加入口文件，在files下面
        // 添加
        kmc: {
            options: {
                packages: [
                    {
                        name: '<%= pkg.name %>',
                        path: '../'
                    }
                ],
                depFilePath: 'mods.js',
                fixModuleName:true,
                map: [["<%= pkg.name %>/src/", "kg/<%= pkg.name %>/<%= pkg.version %>/"]]
            },
            main: {
                files: [
                    {
                        expand: true,
                        cwd: SRC,
                        src: [ './*.js' ],
                        dest: 'build/'
                    }
                ]
            }
        },
        /**
         * 对JS文件进行压缩
         * @link https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                compress:{
                    global_defs:{"DEBUG":false},
                    drop_console:true,
                    dead_code:true
                },
                banner: '<%= banner %>',
                beautify: {
                    ascii_only: true
                }
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: './build',
                        src: ['**/*.js', '!**/*-min.js'],
                        dest: './build',
                        ext: '-min.js'
                    }
                ]
            }
        },
        less: {
            options: {
                paths: './'
            },
            main: {
                files: [
                    {
                        expand: true,
						cwd:SRC,
                        src: ['**/*.less',
							'!build/**/*.less',   
							'!demo/**/*.less'],
                        dest: './build/',
                        ext: '.less.css'
                    }
                ]
            }
        },
		// 拷贝 CSS 文件
		copy : {
			main: {
				files:[
					{
						expand:true,
						cwd:SRC,
						src: [
							'**/*.css',
							'!build/**/*.css',
							'!demo/**/*.css'
						], 
						dest: './build/', 
						filter: 'isFile'
					}
				]
			}
		},
		// 监听JS、CSS、LESS文件的修改
        watch: {
            'all': {
                files: [
					'./src/**/*.css',
					'!./build/**/*'
				],
                tasks: [ 'build' ]
            }
		},
        cssmin: {
            scss: {
                files: [
                    {
                        expand: true,
                        cwd: './build',
                        src: ['**/*.scss.css', '!**/*.scss-min.css'],
                        dest: './build',
                        ext: '.scss-min.css'
                    }
                ]
            },
            less: {
                files: [
                    {
                        expand: true,
                        cwd: './build',
                        src: ['**/*.less.css', '!**/*.less-min.css'],
                        dest: './build',
                        ext: '.less-min.css'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        cwd: './build',
                        src: ['**/*.css', '!**/*-min.css','!**/*.less.css','!**/*.scss.css'],
                        dest: './build',
                        ext: '-min.css'
                    }
                ]
            }
        }
    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-kmc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');


	grunt.registerTask('build', '默认构建任务', function() {
		task.run(['clean:build', 'kmc','uglify', 'copy','less','cssmin']);
	});

    return grunt.registerTask('default', '',function(type){
		if (!type) {
			task.run(['build']);
		}
	});
};
