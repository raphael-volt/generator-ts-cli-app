import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as intercept from 'intercept-stdout';

import { App } from "../src/app";

describe('App', () => {
    let app: App
    it('should set process.argv', () => {
        process.argv.length = 2
        process.argv[2] = "-u"
        process.argv[3] = "message"
        chai.expect(process.argv.length).to.be.equals(4)
    })
    it('should create app', () => {
        app = new App()
        chai.expect(app.message).to.be.undefined
    })
    it('should watch message', () => {
        let unhook_intercept: any;
        let outputs: string[] = []
        unhook_intercept = intercept((text: string) => {
            outputs.push(text.trim())
        })
        app.initialize()
        unhook_intercept()

        chai.expect(outputs.length).to.be.greaterThan(0)
        let found: boolean = false
        let message: string = app.upper ? app.message.toUpperCase() : app.message
        let i: number = -1
        for(let str of outputs) {
            i = str.search(message)
            if(i != -1)
                break
        }
        chai.expect(i).not.to.be.equals(-1)
    })
})