// Modified version of https://github.com/wycats/handlebars.js/blob/master/bin/handlebars
// Changed from command-line compiler to node module

var fs = require('fs'),
    handlebars = exports.handlebars = require('handlebars'),
    basename = require('path').basename,
    uglify = require('uglify-js');

exports.do = function(opts) {

  (function(opts) {
    var template = [0];
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
    if (opts.simple && opts.min) {
      throw 'Unable to minimze simple output';
    }
    if (opts.simple && (opts._.length !== 1 || fs.statSync(opts._[0]).isDirectory())) {
      throw 'Unable to output multiple templates in simple mode';
    }
  }(opts));

  var template = opts.templates[0];

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
  if (!opts.simple) {
    output.push('(function() {\n  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n');
  }
  function processTemplate(template, root) {
    var path = template,
        stat = fs.statSync(path);

    // make the filename regex user-overridable
    var fileRegex = /\.handlebars$/;
    if(opts.fileRegex) fileRegex = opts.fileRegex;
    
    if (stat.isDirectory()) {
      fs.readdirSync(template).map(function(file) {
        var path = template + '/' + file;

        if (fileRegex.test(path) || fs.statSync(path).isDirectory()) {
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

      if (opts.simple) {
        output.push(handlebars.precompile(data, options) + '\n');
      } else {
        output.push('templates[\'' + template + '\'] = template(' + handlebars.precompile(data, options) + ');\n');
      }
    }
  }

  opts.templates.forEach(function(template) {
    processTemplate(template, opts.root);
  });

  // Output the content
  if (!opts.simple) {
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
}

exports.watchDir = function(dir, outfile, extensions) {
  var fs = require('fs')
    , file = require('file');

  var regex = /\.handlebars$/;
  if(extensions) {
    regex = new RegExp('\.' + extensions.join('$|\.') + '$');
  }

  var compileOnChange = function(event, filename) {
    console.log('[' + event + '] detected in ' + (filename ? filename : '[filename not supported]'));
    console.log('[compiling] ' + outfile);
    exports.do({
      templates: [dir],
      output: outfile,
      fileRegex: regex,
      min: true
    });
  }

  file.walk(dir, function(_, dirPath, dirs, files) {
    if(files) {
      for(var i = 0; i < files.length; i++) {
        var file = files[i];
        if(regex.test(file)) {
          fs.watch(file, compileOnChange);
          console.log('[watching] ' + file);
        }
      }
    }
  });
}
