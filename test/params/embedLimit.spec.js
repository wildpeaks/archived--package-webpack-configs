/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {Number} embedLimit
 * @param {Boolean} expectThrows
 */
function testFixture(title, embedLimit, expectThrows) {
	it(title, () => {
		let actualThrowsWeb = false;
		try {
			getConfigWeb({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				embedLimit
			});
		} catch (e) {
			actualThrowsWeb = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
	});
}

describe("embedLimit", () => {
	testFixture("Valid: 123", 123, false);
	testFixture('Invalid: ""', "", true);
	testFixture('Invalid: "hello"', "hello", true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: Promise", Promise.resolve(), true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});
