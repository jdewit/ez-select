'use_strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        push: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json']
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        },
      },
      src: {
        options: {
          node: true,
          globals: {
            it: true,
            beforeEach: true,
            expect: true,
            element: true,
            browser: true,
            module: true,
            spyOn: true,
            inject: true,
            repeater: true,
            describe: true,
            angular: true,
            $: true,
            jQuery: true
          }
        },
        files: {
          src: ['src/**/*.js', 'test/**/*.js']
        },
      }
    },
    less: {
      dist: {
        options: {
          yuicompress: true
        },
        files: {
          "dist/ez-select.min.css": "src/ez-select.less"
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false
      },
      singleRun: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    ngtemplates: {
      ezSelect: {
        src:      'src/*.html',
        dest:     'dist/ez-select-tpl.js',
        options: {
          module: 'ez.select',
          url: function(url) { return url.replace('src/', ''); }
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: true
      },
      dist: {
        files: {
          'dist/ez-select.min.js': ['src/**/*.js']
        }
      }
    },
    watch: {
      dev: {
        files: ['Gruntfile.js', 'src/*', 'test/**/*Spec.js'],
        tasks: ['default', 'karma:unit:run'],
        options: {
          livereload: 9090,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['jshint', 'ngtemplates', 'uglify', 'less']);

  grunt.registerTask('dev', ['jshint', 'ngtemplates', 'uglify', 'less', 'karma:unit:start', 'watch']);

  grunt.registerTask('test', ['karma:singleRun']);

};
