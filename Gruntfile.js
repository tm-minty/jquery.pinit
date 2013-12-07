/*jslint node: true*/
module.exports = function (grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        "jslint": {
            "source": {
                "src": ['src/*.js']
            }
        },
        "uglify": {
            "dist": {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */',
                    report: 'gzip'
                },
                "files": {
                    "dist/jquery.pinit.min.js": ['src/jquery.pinit.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jslint:source', 'uglify:dist']);
};