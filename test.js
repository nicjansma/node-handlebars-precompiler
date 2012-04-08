c = require('./handlebars-precompiler');
c.watchDir(__dirname + '/test_views', __dirname + '/test_output.js', ['handlebars', 'hbs']);