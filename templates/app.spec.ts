import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';

import { App } from "../src/app";

describe('App', () => {
    it('should set process.argv', () => {
        process.argv.length = 2
        process.argv[2] = "-u"
        process.argv[3] = "message"
        chai.expect(process.argv.length).to.be.equals(4)
    })
    it('should create app', () => {
        let app: App = new App()
        app.initialize()
        chai.expect(app.upper).to.be.true
        chai.expect(app.message).to.be.equals("message")
    })
})