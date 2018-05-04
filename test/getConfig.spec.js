/* eslint-env node, jasmine */
'use strict';
const {join, relative} = require('path');
const {readFileSync, mkdirSync} = require('fs');
const express = require('express');
const rimraf = require('rimraf');
const rreaddir = require('recursive-readdir');
const webpack = require('webpack');
const puppeteer = require('puppeteer');
const getConfig = require('..');
const rootFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out');
let app;
let server;


/**
 * @param {Number} duration
 */
function sleep(duration){
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}


/**
 * @param {webpack.Configuration} config
 */
function compile(config){
	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (err){
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}


/**
 * @param {Object} options
 * @returns {String[]}
 */
async function testFixture(options){
	const config = getConfig(options);
	expect(typeof options).toBe('object');

	const stats = await compile(config);
	expect(stats.compilation.errors).toEqual([]);

	let actualFiles = await rreaddir(outputFolder);
	actualFiles = actualFiles.map(filepath => relative(outputFolder, filepath).replace(/\\/g, '/'));
	return actualFiles;
}


beforeAll(() => {
	app = express();
	app.use(express.static(outputFolder));
	server = app.listen(8888);
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

afterAll(done => {
	server.close(() => {
		done();
	});
});

beforeEach(done => {
	rimraf(outputFolder, () => {
		mkdirSync(outputFolder);
		done();
	});
});


it('Basic', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './basic/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Multiple independant entries', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			app1: './multiple/app1.ts',
			app2: './multiple/app2.ts',
			app3: './multiple/app3.ts'
		}
	});
	const expectedFiles = [
		'app1.html',
		'app1.css',
		'app1.css.map',
		'app1.js',
		'app1.js.map',
		'app2.html',
		'app2.css',
		'app2.css.map',
		'app2.js',
		'app2.js.map',
		'app3.html',
		'app3.css',
		'app3.css.map',
		'app3.js',
		'app3.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	let browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app1.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 1`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app1`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app2.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 2`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app2`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app3.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 3`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app3`);
	} finally {
		await browser.close();
	}
});


it('Local Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './local-modules/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello 100123'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('CSS Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color';
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Assets', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './assets/myapp.ts'
		},
		embedLimit: 5000,
		embedExtensions: ['jpg', 'png'],
		copyExtensions: ['gif'],
		assetsRelativePath: 'myimages/'
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myimages/large.jpg',
		'myimages/large.png',
		'myimages/small.gif',
		'myimages/large.gif'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const container = document.getElementById('images');
			if (container === null){
				return '#images not found';
			}
			if (container.childNodes.length !== 6){
				return `Wrong #images.childNodes.length: ${container.childNodes.length}`;
			}
			for (let i = 0; i < 6; i++){
				const img = container.childNodes[i];
				if (img.nodeName !== 'IMG'){
					return `#images.childNodes[${i}] isn't an image: ${img.nodeName}`;
				}
			}

			const img0 = container.childNodes[0].getAttribute('src');
			const img1 = container.childNodes[1].getAttribute('src');
			const img2 = container.childNodes[2].getAttribute('src');
			const img3 = container.childNodes[3].getAttribute('src');
			const img4 = container.childNodes[4].getAttribute('src');
			const img5 = container.childNodes[5].getAttribute('src');

			if (!img0.startsWith('data:image/jpeg;base64')){
				return `#images.childNodes[0] is not a base64 embed: ${img0}`;
			}
			if (!img2.startsWith('data:image/png;base64')){
				return `#images.childNodes[2] is not a base64 embed: ${img2}`;
			}
			if (img1 !== '/myimages/large.jpg'){
				return `Wrong url for #images.childNodes[1]: ${img1}`;
			}
			if (img3 !== '/myimages/large.png'){
				return `Wrong url for #images.childNodes[3]: ${img3}`;
			}
			if (img4 !== '/myimages/small.gif'){
				return `Wrong url for #images.childNodes[4]: ${img4}`;
			}
			if (img5 !== '/myimages/large.gif'){
				return `Wrong url for #images.childNodes[5]: ${img5}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Chunks', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './chunks/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'chunk.0.js',
		'chunk.0.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Delayed 100123'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Minify', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'production',
		entry: {
			myapp: './css-modules/myapp.ts'
		}
	});

	let hash = '';
	for (const actualFile of actualFiles){
		const regex = /^([^.]+)\.myapp\.js$/;
		const matches = regex.exec(actualFile);
		if (matches){
			hash = matches[1];
			break;
		}
	}
	expect(hash).not.toBe('', 'Hash not found');

	const expectedFiles = [
		'index.html',
		`${hash}.myapp.css`,
		`${hash}.myapp.css.map`,
		`${hash}.myapp.js`,
		`${hash}.myapp.js.map`
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `${hash}.myapp.css`), 'utf8');
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null){
		throw new Error('CSS is not minified');
	}

	const jsRaw = readFileSync(join(outputFolder, `${hash}.myapp.js`), 'utf8');
	expect(jsRaw.startsWith('!function(e){'), true, 'JS not minified');

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector('script');
			if (el1 === null){
				return 'No script';
			}
			const jsCrossorigin = el1.getAttribute('crossorigin');
			const jsIntegrity = el1.getAttribute('integrity');
			if (jsCrossorigin !== 'anonymous'){
				return `Bad script.crossorigin: ${jsCrossorigin}`;
			}
			if (!jsIntegrity.includes('sha256-') && !jsIntegrity.includes('sha384-')){
				return `Bad script.integrity: ${jsIntegrity}`;
			}

			const el2 = document.querySelector('link[rel="stylesheet"]');
			if (el2 === null){
				return 'No stylesheet';
			}
			const cssCrossorigin = el2.getAttribute('crossorigin');
			const cssIntegrity = el2.getAttribute('integrity');
			if (cssCrossorigin !== 'anonymous'){
				return `Bad link.crossorigin: ${cssCrossorigin}`;
			}
			if (!cssIntegrity.includes('sha256-') && !cssIntegrity.includes('sha384-')){
				return `Bad link.integrity: ${cssIntegrity}`;
			}

			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Skip Postprocessing', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		mode: 'development',
		skipPostprocess: true
	});

	const expectedFiles = [
		'myapp.js',
		'myapp.js.map',
		'myapp.css',
		'myapp.css.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
});


it('Enable sourcemaps', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		sourcemaps: true
	});

	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myapp.css',
		'myapp.css.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, 'myapp.css'), 'utf8');
	expect(cssRaw.endsWith('/*# sourceMappingURL=myapp.css.map*/')).toBe(true, 'CSS has the sourcemap');

	const jsRaw = readFileSync(join(outputFolder, 'myapp.js'), 'utf8');
	expect(jsRaw.endsWith('//# sourceMappingURL=myapp.js.map')).toBe(true, 'JS has the sourcemap');
});


it('Disable sourcemaps', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		sourcemaps: false
	});

	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.css'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, 'myapp.css'), 'utf8');
	expect(cssRaw.endsWith('/*# sourceMappingURL=myapp.css.map*/')).toBe(false, 'CSS has no sourcemap');

	const jsRaw = readFileSync(join(outputFolder, 'myapp.js'), 'utf8');
	expect(jsRaw.endsWith('//# sourceMappingURL=myapp.js.map')).toBe(false, 'JS has no sourcemap');
});


it('Polyfills', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './polyfills/myapp.ts'
		},
		sourcemaps: false,
		polyfills: [
			'module-window-polyfill',
			'./polyfills/vanilla-polyfill.js',
			'./polyfills/typescript-polyfill.ts'
		]
	});

	const expectedFiles = [
		'index.html',
		'myapp.js'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			if (typeof window.EXAMPLE_FAKE_POLYFILL !== 'undefined'){
				return 'Fake polyfill exists';
			}
			if (window.EXAMPLE_VANILLA_POLYFILL !== 'ok once'){
				return 'Missing vanilla polyfill';
			}
			if (window.EXAMPLE_TYPESCRIPT_POLYFILL !== 'ok once'){
				return 'Missing typescript polyfill';
			}
			if (window.EXAMPLE_MODULE_POLYFILL !== 'ok once'){
				return 'Missing module polyfill';
			}
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Chunks & Polyfill', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './chunks-polyfills/myapp.ts'
		},
		polyfills: [
			'module-window-polyfill',
			'./polyfills/vanilla-polyfill.js',
			'./polyfills/typescript-polyfill.ts'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'chunk.0.js',
		'chunk.0.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			if (typeof window.EXAMPLE_FAKE_POLYFILL !== 'undefined'){
				return 'Fake polyfill exists';
			}
			if (window.EXAMPLE_VANILLA_POLYFILL !== 'ok once'){
				return 'Missing vanilla polyfill';
			}
			if (window.EXAMPLE_TYPESCRIPT_POLYFILL !== 'ok once'){
				return 'Missing typescript polyfill';
			}
			if (window.EXAMPLE_MODULE_POLYFILL !== 'ok once'){
				return 'Missing module polyfill';
			}
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Delayed 123 ok once ok once ok once'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Webworkers', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './webworkers/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'relative.webworker.js',
		'relative.webworker.js.map',
		'my-worker-module.webworker.js',
		'my-worker-module.webworker.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el1 = document.getElementById('hello1');
			if (el1 === null){
				return '#hello1 not found';
			}
			if (el1.innerText !== 'RELATIVE WORKER replies HELLO 1'){
				return `Bad #hello1.innerText: ${el1.innerText}`;
			}
			const el2 = document.getElementById('hello2');
			if (el2 === null){
				return '#hello2 not found';
			}
			if (el2.innerText !== 'MODULE WORKER replies HELLO 2'){
				return `Bad #hello2.innerText: ${el2.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Webworkers + Polyfills', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './webworkers-polyfills/myapp.ts'
		},
		polyfills: [
			'./webworkers-polyfills/both.polyfill.ts',
			'./webworkers-polyfills/only-main.polyfill.ts'
		],
		webworkerPolyfills: [
			'./both.polyfill',
			'./only-worker.polyfill',
			'module-self-polyfill'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myapp.webworker.js',
		'myapp.webworker.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el1 = document.getElementById('hello1');
			if (el1 === null){
				return '#hello1 not found';
			}
			if (el1.innerText !== 'BOTH once undefined MAIN once undefined'){
				return `Bad #hello1.innerText: ${el1.innerText}`;
			}

			const el2 = document.getElementById('hello2');
			if (el2 === null){
				return '#hello2 not found';
			}
			if (el2.innerText !== 'BOTH once WORKER once undefined MODULE once'){
				return `Bad #hello2.innerText: ${el2.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Copy Patterns', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './copy-patterns/myapp.ts'
		},
		copyPatterns: [
			// Without "**", "from" is the context:
			{from: 'copy-patterns/myfolder-1', to: 'copied-1'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-2/'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-3', toType: 'dir'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-4/subfolder'},

			// With "**", it copies using the whole path (hence creates a "copy-patterns/myfolder-2" folder in output).
			// Use "context" to make it use only the end of the path.
			{from: 'copy-patterns/myfolder-2/**/*.example-1', to: 'copied-5'},
			{from: '**/*.example-1', to: 'copied-6', context: 'copy-patterns/myfolder-2'},

			// File-looking folder name
			{from: 'copy-patterns/myfolder-3.ext', to: 'copied-7'},

			// Folder-looking filename
			{from: 'copy-patterns/file9', to: 'copied-8'}
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',

		'copied-1/file1.example-1',
		'copied-1/file2.example-1',
		'copied-2/file1.example-1',
		'copied-2/file2.example-1',
		'copied-3/file1.example-1',
		'copied-3/file2.example-1',
		'copied-4/subfolder/file1.example-1',
		'copied-4/subfolder/file2.example-1',

		'copied-5/copy-patterns/myfolder-2/hello/file3.example-1',
		'copied-5/copy-patterns/myfolder-2/hello/file5.example-1',
		'copied-6/hello/file3.example-1',
		'copied-6/hello/file5.example-1',

		'copied-7/file7.example',
		'copied-7/file8.example',

		'copied-8/file9'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
});


it('CSS Reset', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-reset/myapp.ts'
		},
		polyfills: [
			'./css-reset/reset.css'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.createElement('div');
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue('color') === 'rgb(0, 0, 128)'){
				return 'Unexpected color before appending';
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue('color') !== 'rgb(0, 0, 128)'){
				return 'Bad color';
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});
