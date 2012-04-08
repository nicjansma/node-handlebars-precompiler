c = require('./handlebars-precompiler');
c.watchDir(__dirname + '/test_views', 'test_output.js', ['handlebars', 'hbs']);