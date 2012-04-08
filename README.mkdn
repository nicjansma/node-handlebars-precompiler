# Death to Redundant View Templates!

Get the package: ```npm install handlebars-precompiler```

This is how you might use it in an Express project:

```javascript
app.configure('development', function(){
  hbsPrecompiler = require('handlebars-precompiler');
  hbsPrecompiler.watchDir(
    __dirname + "/views",
    __dirname + "/public/javascripts/templates.js",
    ['handlebars', 'hbs']
  );
});
```

In this example, we watch for changes to ```*.handlebars``` and ```*.hbs``` files in our views directory.
When changes are made, precompilation is run on all Handlebars templates and exported to a single minified
Javascript file.

On the browser side, you will need to deploy the Handlebars runtime-only release.
You could use the full release which includes a compiler, but your site will be faster if you don't.

Client-side versions of the templates will be named and stored in the ```Handlebars``` object according to their file paths,
e.g. ```Handlebars.templates['users/show']```