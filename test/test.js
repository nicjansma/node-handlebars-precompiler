(function(exports) {
    'use strict';

    //
    // Imports
    //
    var path = require('path');
    var fs = require('fs');
    var grunt = require('grunt');
    var precompiler = require('../handlebars-precompiler');

    //
    // Constants
    //
    var TEMP_OUTPUT_FILE = path.join(__dirname, 'output', 'output.js');
    var VIEWS_DIR = path.join(__dirname, 'views');
    var DEFAULT_EXTENSIONS = ['handlebars', 'hbs'];

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
     * SetUp for group
     */
    testcases.setUp = function(callback) {
        // remove any previous output
        if (fs.existsSync(TEMP_OUTPUT_FILE)) {
            fs.unlinkSync(TEMP_OUTPUT_FILE);
        }

        callback();
    };

    /**
     * Ensures all views are pre-compiled before running
     */
    testcases['precompilation'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true
        });

        validateOutput(test, 'simple');

        test.done();
    };

    /**
     * Ensures all views are pre-compiled before running
     */
    testcases['only hbs files'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: ['hbs'],
            silent: true
        });

        validateOutput(test, 'onlyhbs');

        test.done();
    };

    /**
     * Ensures non-minification works
     */
    testcases['non minification'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true,
            min: false
        });

        validateOutput(test, 'nonmin');

        test.done();
    };

    /**
     * AMD generation
     */
    testcases['amd'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true,
            min: false,
            amd: true
        });

        validateOutput(test, 'amd');

        test.done();
    };

    /**
     * AMD generation with handlebarPath
     */
    testcases['amd with handlebarPath'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true,
            min: false,
            amd: true,
            handlebarPath: 'handlebars/'
        });

        validateOutput(test, 'amdpath');

        test.done();
    };

    /**
     * AMD generation with partial set
     */
    testcases['amd with partial'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true,
            min: false,
            amd: true,
            partial: true
        });

        validateOutput(test, 'amdpartial');

        test.done();
    };

    /**
     * CommonJS generation
     */
    testcases['commonjs'] = function(test) {
        precompiler.watch(VIEWS_DIR, TEMP_OUTPUT_FILE, {
            extensions: DEFAULT_EXTENSIONS,
            silent: true,
            min: false,
            commonjs: 'handlebars'
        });

        validateOutput(test, 'commonjs');

        test.done();
    };
})(exports);