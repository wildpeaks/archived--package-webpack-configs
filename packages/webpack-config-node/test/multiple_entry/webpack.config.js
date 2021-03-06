/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-multiple-1": "./src/application-1.ts",
			"app-multiple-2": "./src/application-2.ts",
			"app-multiple-3": "./src/application-3.ts"
		}
	});
};
