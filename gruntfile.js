'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        jshint : {
            files : [ '*.js', 'test/**/*.js' ],
            options : {
                bitwise : true,
                camelcase : true,
                curly : true,
                eqeqeq : true,
                forin : true,
                freeze : true,
                immed : true,
                indent : 4,
                latedef : true,
                maxcomplexity : 30,
                maxdepth : 5,
                maxlen : 80,
                maxparams : 7,
                maxstatements : 50,
                newcap : true,
                noarg : true,
                node : true,
                noempty : true,
                nonew : true,
                plusplus : true,
                quotmark : 'single',
                strict : true,
                trailing : true,
                undef : true,
                unused : true
            }
        }
    });

    grunt.registerTask('test', 'test', function () {
        var jasmineNode = require('jasmine-node'),
            done = this.async();

        jasmineNode.getEnv().addReporter({
            reportRunnerResults : function () { done(); }
        });

        // jasmineNode.getEnv().specFilter = function (spec) {
        //     var name = spec.suite.description + ' ' +
        //             spec.description;
        //     return -1 !== name.indexOf('add similar links twice');
        // };

        jasmineNode.executeSpecsInFolder({
            specFolders : [ 'test' ],
            showColors : true
        });
    });

    grunt.registerTask('default', [ 'jshint', 'test' ]);
};
