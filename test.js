var compiler = require('./handlebars-precompiler');
var output = compiler.do({
  templates: [__dirname + '/test_views'],
  output: 'test_output.js'
});