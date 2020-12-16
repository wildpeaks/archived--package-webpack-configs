/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-node-url": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-node-url"]
			}
		]
	});
};
