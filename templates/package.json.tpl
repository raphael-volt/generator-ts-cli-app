{
	"name": "{{name}}",
	"version": "0.0.1",
	"description": "",
	"repository": {
		"type": "git",
		"url": "{{{author.repository}}}"
	},
	"license": "MIT",
	"scripts": {
		"clean": "rimraf dist",
		"build": "npm run clean && tsc --pretty",
		"test": "npm run build && mocha --compilers ts:ts-node/register --recursive test/**/*.spec.ts",
		"watch:build": "nodemon --config nodemon.json --exec npm run build",
		"watch:test": "nodemon --config nodemon.json --exec npm run test"
	},
	"author": {
		"name": "{{author.name}}",
		"email": "{{author.email}}"
	},
	"main": "dist/app.js",
	"typings": "dist/app.d.ts",
	"bin": {
		"{{command}}": "bin/{{command}}"
	},
	"files": [
		"bin",
		"dist"
	],
	"devDependencies": {
		"@types/chai": "^4.0.1",
		"@types/commander": "^2.3.31",
		"@types/mocha": "^2.2.39",
		"@types/mustache": "^0.8.29",
		"@types/node": "^7.0.33",
		"@types/sinon": "^2.3.0",
		"chai": "^4.0.2",
		"mocha": "^3.4.2",
		"nodemon": "^1.11.0",
		"rimraf": "^2.6.1",
		"sinon": "^2.3.6"
	},
	"dependencies": {
		"child_process": "^1.0.2",
		"colors": "^1.1.2",
		"commander": "^2.10.0",
		"core-js": "^2.4.1",
		"fs-extra": "^3.0.1",
		"mustache": "^2.3.0",
		"node": "0.0.0",
		"path": "^0.12.7",
		"readline": "^1.3.0",
		"rxjs": "^5.4.1",
		"ts-node": "^3.1.0",
		"typescript": "^2.4.1"
	}
}