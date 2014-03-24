module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [ 'handlebars-precompiler.js' ],
            options: {
                bitwise: true, 
                curly: true, 
                eqeqeq: true, 
                forin: true, 
                immed: true,
                indent: 2, 
                latedef: true, 
                newcap: true, 
                noempty: true, 
                nonew: true, 
                quotmark: true, 
                jquery: true,
                undef: true, 
                unused: true, 
                trailing: true, 
                browser: true, 
                node: true,
                white: false,
                globals: {
                    define: true,
                    window: true
                }
            }
        },
        nodeunit: {
            all: ['test/*.js']
        }
    });

    //
    // Plugins
    //
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    //
    // Tasks
    //
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', ['nodeunit']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('travis', ['nodeunit', 'jshint']);
    grunt.registerTask('all', ['nodeunit', 'jshint']);
};
