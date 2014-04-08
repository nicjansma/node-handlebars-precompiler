// Modified version of https://github.com/wycats/handlebars.js/blob/master/bin/handlebars
// Changed from command-line compiler to node module

var fs = require('fs'),
    file = require('file'),
    handlebars = exports.handlebars = require('handlebars'),
    basename = require('path').basename,
    uglify = require('uglify-js'),
    _ = require('lodash');

/**
 * Compiles all of the Handlebars templates
 *
 * @param {object}   opts               Options
 * @param {boolean}  opts.min           Whether or not to minify the files
 * @param {RegExp}   opts.fileRegex     File regular expression to match
 * @param {string[]} opts.templates     Template directories to compile
 * @param {string}   opts.output        Output file name
 * @param {boolean}  opts.amd           Exports amd style (require.js)
 * @param {string}   opts.handlebarPath Path to handlebar.js (only valid for amd-style)
 * @param {boolean}  opts.partial       Compiling a partial template
 * @param {string}   opts.commonjs      Exports CommonJS style, path to Handlebars module
 */
exports.do = function(opts) {
  if (!opts.handlebarPath) {
    opts.handlebarPath = '';
  }

  (function(opts) {
    if (!opts.templates.length) {
      throw 'Must define at least one template or directory.';
    }

    opts.templates.forEach(function(template) {
      fs.statSync(template);
      try {
        fs.statSync(template);
      } catch (err) {
        throw 'Unable to open template file "' + template + '"';
      }
    });
  }(opts));

  // Convert the known list into a hash
  var known = {};
  if (opts.known && !Array.isArray(opts.known)) {
    opts.known = [opts.known];
  }
  if (opts.known) {
    for (var i = 0, len = opts.known.length; i < len; i++) {
      known[opts.known[i]] = true;
    }
  }

  var output = [];
  if (opts.amd) {
    output.push('define([\'' + opts.handlebarPath + 'handlebars\'], function(Handlebars) {\n');
  } else if (opts.commonjs) {
    output.push('var Handlebars = require("' + opts.commonjs + '");');
  } else {
    output.push('(function() {\n');
  }
  output.push('  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n');

  function processTemplate(template, root) {
    var path = template,
        stat = fs.statSync(path);

    // make the filename regex user-overridable
    var fileRegex = /\.handlebars$/;
    if (opts.fileRegex) {
      fileRegex = opts.fileRegex;
    }

    if (stat.isDirectory()) {
      fs.readdirSync(template).map(function(file) {
        var path = template + '/' + file;

        if (path.slice(-1) !== '~' && (fileRegex.test(path) || fs.statSync(path).isDirectory())) {
          processTemplate(path, root || template);
        }
      });
    } else {
      var data = fs.readFileSync(path, 'utf8');

      var options = {
        knownHelpers: known,
        knownHelpersOnly: opts.o
      };

      // Clean the template name
      if (!root) {
        template = basename(template);
      } else if (template.indexOf(root) === 0) {
        template = template.substring(root.length+1);
      }
      template = template.replace(fileRegex, '');

      if(opts.amd && (opts.templates.length === 1 && !fs.statSync(opts.templates[0]).isDirectory())) {
        output.push('return ');
      }
      output.push('templates[\'' + template + '\'] = template(' + handlebars.precompile(data, options) + ');\n');
    }
  }

  opts.templates.forEach(function(template) {
    processTemplate(template, opts.root);
  });

  // Output the content
  if (opts.amd) {
    if(opts.templates.length > 1 || (opts.templates.length === 1 && fs.statSync(opts.templates[0]).isDirectory())) {
      if(opts.partial){
        output.push('return Handlebars.partials;\n');
      } else {
        output.push('return templates;\n');
      }
    }
    output.push('});');
  } else if (!opts.commonjs) {
    output.push('})();');
  }
  output = output.join('');

  if (opts.min) {
    var ast = uglify.parser.parse(output);
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);
    output = uglify.uglify.gen_code(ast);
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, output, 'utf8');
  } else {
    return output;
  }
};

/**
 * Compiles all of the Handlebars templates in the specified directory and monitors for changes.
 *
 * @deprecated This function is deprecated in favor of watch(), which allows for more options.
 *
 * @param {string}   dir        Directory with Handlebars templates
 * @param {string}   outfile    Output file name
 * @param {string[]} extensions An array of extensions (eg 'hbs') of files to compile as Handlebars templates
 */
exports.watchDir = function(dir, outfile, extensions) {
  exports.watch(dir, outfile, {
    extensions: extensions
  });
};

/**
 * Compiles all of the Handlebars templates in the specified directory and monitors for changes.
 *
 * @param {string}   dir                Directory with Handlebars templates
 * @param {string}   outfile            Output file name
 * @param {object}   opts               Options
 * @param {string[]} opts.extensions    An array of extensions (eg 'hbs') of files to compile as Handlebars templates (takes precedence over fileRegex)
 * @param {RegExp}   opts.fileRegex     A regular expression of the files to compile as Handlebars templates (instead of using .extensions)
 * @param {boolean}  opts.min           Whether or not to minify the files (default: true)
 * @param {boolean}  opts.silent        Silence console output (default: false)
 * @param {boolean}  opts.amd           Exports amd style (require.js) (default: false)
 * @param {string}   opts.handlebarPath Path to handlebar.js (only valid for amd-style) (default: '')
 * @param {boolean}  opts.partial       Compiling a partial template (default: false)
 * @param {string}   opts.commonjs      Exports CommonJS style, path to Handlebars module (default: false)
 */
exports.watch = function(dir, outfile, opts) {
  // defaults to send to .do()
  var defaults = {
    extensions: null,
    fileRegex: /\.handlebars$/,
    min: true,
    silent: false,
    amd: false,
    handlebarPath: '',
    partial: false,
    commonjs: false
  };

  // merge arguments with defaults into options
  var options = {};
  _.merge(options, defaults, opts);

  // process passed-in arguments
  options.templates = [dir];
  options.output    = outfile;

  if (options.extensions) {
    options.fileRegex = new RegExp('\\.' + options.extensions.join('$|\\.') + '$');
  }

  /**
   * Compiles all of the Handlebars templates if one of the files changes.
   *
   * @private
   * @param {Event}  event    File change event
   * @param {string} filename File name that changed
   */
  function compileOnChange(event, filename) {
    if (!options.silent){
      console.log('[' + event + '] detected in ' + (filename ? filename : '[filename not supported]'));
      console.log('[compiling] ' + outfile);
    }

    // do a full compile
    exports.do(options);
  }

  // compile everything before we start watching
  exports.do(options);

  // find all matching files in the base directory and watch all of them for changes
  file.walk(dir, function(_, dirPath, dirs, files) {
    if (files) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (options.fileRegex.test(file)) {
          // watch this file for changes
          fs.watch(file, compileOnChange);

          if (!options.silent) {
            console.log('[watching] ' + file);
          }
        }
      }
    }
  });
};
