import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';

import { App } from "../src/app";

describe('App', () => {
    
    it('should create app', () => {
        let app: App = new App()
        chai.expect(app).not.to.be.undefined
    })
})