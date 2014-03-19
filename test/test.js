(function(exports) {
    'use strict';

    //
    // Imports
    //
    var path = require('path');
    var grunt = require('grunt');
    var precompiler = require('../handlebars-precompiler');

    //
    // Constants
    //
    var TEMP_OUTPUT_FILE = path.join(__dirname, 'output', 'output.js');
    var VIEWS_DIR = path.join(__dirname, 'views');
    
    //
    // Utility functions
    //
    function validateOutput(test, testCaseName) {
        // output from this run
        var output = grunt.util.normalizelf(grunt.file.read(TEMP_OUTPUT_FILE));
        
        // expected output
        var expected = grunt.util.normalizelf(grunt.file.read(path.join(__dirname, 'expected', testCaseName + '.js')));
        
        test.equals(expected, output);
    }
    
    //
    // Test group
    //
    var testcases = exports.precompiler = {};

    /**
     * Ensures all views are pre-compiled before running
     */
    testcases.precompilation = function(test) {
        precompiler.watchDir(VIEWS_DIR, TEMP_OUTPUT_FILE, ['handlebars', 'hbs'], true);
        
        validateOutput(test, 'simple');
        
        test.done();
    };

    /**
     * Ensures all views are pre-compiled before running
     */
    testcases.onlyHbs = function(test) {
        precompiler.watchDir(VIEWS_DIR, TEMP_OUTPUT_FILE, ['hbs'], true);
        
        validateOutput(test, 'onlyhbs');
        
        test.done();
    };
})(exports);