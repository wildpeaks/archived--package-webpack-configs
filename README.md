# Webpack Config: Web

[![Greenkeeper badge](https://badges.greenkeeper.io/wildpeaks/package-webpack-config-web.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/wildpeaks/package-webpack-config-web.svg?branch=master)](https://travis-ci.org/wildpeaks/package-webpack-config-web)

Generates a **Webpack 4 config** for Web applications written in *Typescript*.


-------------------------------------------------------------------------------

## Example

package.json:
````json
{
	"scripts": {
		"build": "webpack --mode production",
		"watch": "webpack-dev-server --mode development"
	},
	"dependencies": {
		"@wildpeaks/webpack-config-web": "1.0.0-alpha13",
		"typescript": "...",
		"webpack": "...",
		"webpack-cli": "...",
		"webpack-dev-server": "...",
		"whatwg-fetch": "..."
	}
}
````

webpack.config.js:
````js
'use strict';
const {join} = require('path');
const getConfig = require('@wildpeaks/webpack-config-web');

module.exports = function(_env, {mode = 'production'} = {}) {
	return getConfig({
		mode,
		entry: {
			myapp: './src/myapp.ts'
		},
		rootFolder: __dirname,
		outputFolder: join(__dirname, 'dist'),
		polyfills: [
			'core-js/fn/promise',
			'whatwg-fetch'
		]
	});
};
````


-------------------------------------------------------------------------------

## Options


---
### `mode`: String

Default: `production`.

Use `production` to optimize the output (CSS and JS files are minified), and the HTML script tags
have [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hashes.

See [Mode](https://webpack.js.org/concepts/mode/) in the Webpack documentation.


---
### `entry`: Object

Webpack entries.

Default: `{}`

Example:

	{
		app1: './src/entry1.ts',
		app2: './src/entry2.ts',
		app3: './src/entry3.ts'
	}

See [Entry Points](https://webpack.js.org/concepts/entry-points/) in the Webpack documentation.

---
### `rootFolder`: String

Absolute path to the root context folder.
Defaults to the process current working directory.

Examples: `"C:/Example"` or `/usr/share/www/example`

See [context](https://webpack.js.org/configuration/entry-context/#context) in the Webpack documentation.

---
### `outputFolder`: String

Absolute path to the folder where files are emitted.

Defaults to subfolder `dist` in `rootFolder`.

Example: `"C:/Example/dist"` or `/usr/share/www/example/dist`

See [output.path](https://webpack.js.org/configuration/output/#output-path) in the Webpack documentation.


---
### `publicPath`: String

Path prepended to url references.

Default: `"/"`

Example: `"/mysite/"`

See [publicPath](https://webpack.js.org/guides/public-path/) in the Webpack documentation.


---
### `port`: Number

Port for Webpack Dev Server.

Default: `8000`.

See [devServer.port](https://webpack.js.org/configuration/dev-server/#devserver-port) in the Webpack documentation.


---
### `cssVariables`: Object

CSS Variables, e.g. `{themeBackground: 'rebeccapurple'}`.

Default: `{}`.

See [customProperties](http://cssnext.io/usage/#features) in the CSSNext documentation.


---
### `browsers`: String[]

Target browsers for CSS Autoprefixer.

Default: `[">0.25%", "ie >= 11"]`.

See [browsers](http://cssnext.io/usage/#browsers) in the CSSNext documentation.


---
### `embedLimit`: String[]

Filesize limit to embed assets.

Default: `5000`.

See [limit](https://github.com/webpack-contrib/url-loader#limit) in the `url-loader` documentation.


---
### `embedExtensions`: String[]

File extensions of files to embed as base64 (if small enough) or just copy as-is (if large),
for files referenced by `import` or `require`.

Default: `["jpg", "png", "gif", "svg"]`.


---
### `copyExtensions`: String[]

File extensions of files to just copy as-is, for files referenced by `import` or `require`.

Default: `["woff"]`.


---
### `copyPatterns`: CopyPattern[]

Files and folders to copy as-is, despite not being referenced by `import` or `require`.

Default: `[]`.

Examples:
````js
// Copy a directory:
// "models/example.ext" is copied to "assets/example.ext"
{from: 'models', to: 'assets'}

// Copy specific files:
// "extras/models/example.ext" is copied to "assets/extras/models/example.ext"
{from: 'extras/**/*.3d', to: 'assets'}

// Copy specific files:
// "extras/models/example.ext" is copied to "assets/models/example.ext"
{from: '**/*.3d', to: 'assets', context: 'extras'}

// Ignore some files
{from: 'textures', to: 'assets', ignore: ['Thumbs.db']}
````

See [patterns](https://github.com/webpack-contrib/copy-webpack-plugin#patterns) in the `copy-webpack-plugin` documentation.


---
### `assetsRelativePath`: String

Relative path to copy files to.
Note that it only applies to `copyExtensions` and large `embedExtensions` files;
`copyPatterns` specifies the output path in each pattern instead.

Default: `"assets/"`


---
### `sourcemaps`: Boolean

Use `true` to **generate sourcemaps** for scripts & stylesheets, `false` to skip them.

Default: `true`


---
### `skipPostprocess`: Boolean

Use `true` for the lightweight config (for tests), `false` for the whole config.

Default: `false`


---
### `polyfills`: String[]

List of modules or files to automatically prepend to every entry.
They are resolved from `rootFolder`.

Note: given this handle any filetype the loaders do, you could also have a **CSS Reset** stylesheet in this list for example.

Default: `['core-js/fn/promise']`


---
### `webworkerPolyfills`: String[]

List of modules or files to automatically prepend to every webworker.

If you're using relative filepaths for polyfills instead of
thirdparty modules or local modules, note that `webworkerPolyfills` references
are resolved from each webworker unlike `polyfills` (because `worker-loader` doesn't have
an option to have an array for its internal compilation, unlike main "entry" points,
so the `webworkerPolyfills` references are imported directly in the code).

Default: `['core-js/fn/promise']`


---
### `webworkerPattern`: RegExp

RegExp test for the Web Worker loader.

Default: `/\.webworker\.ts$/`


-------------------------------------------------------------------------------

## Babel

Note that it **intentionally doesn't use Babel** because Typescript itself can already take care of transpiling
to ES5 + ES Modules, and Webpack converts the ES Modules. This greatly **reduces the number of dependencies**
and avoids [limitations of the Typescript plugin for Babel](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-typescript/README.md#babelplugin-transform-typescript).

However it also means it doesn't automatically include `core-js` dependencies.
Therefore **you can pass a list of polyfills** to use (*including polyfills that Babel wouldn't include*
and that you would have to add manually anyway) in options.


-------------------------------------------------------------------------------

