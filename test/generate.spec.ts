require("./rmdir.spec.ts")
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as fs from 'fs';
import * as path from 'path';

import * as dirUtil from "../src/utils/rmdir-r";
import { AppDescriptor } from "../src/core/app-descriptor";
import { AppGenerator } from "../src/core/app-generator";
import { App } from "../src/app";

const inputs: AppDescriptor = {
    name: "test-app",
    author: {
        name: "test-app author",
        email: "testapp@gmail.com"
    },
    command: "testApp"
}

const appDir: string = path.join(path.dirname(__dirname), "tests/test-app");
describe('Generate', () => {
     
     before(() => {
        if(fs.existsSync(appDir)) {
            dirUtil.rmdirSync(appDir)
        }
     })
    
    after(() => {
        if(fs.existsSync(appDir)) {
            //dirUtil.rmdirSync(appDir)
        }
    })
    it("should create app", () => {
        let gen: AppGenerator = new AppGenerator()
        gen.build(inputs, appDir)
    })
    it('should files exits', () => {
        chai.expect(
            fs.existsSync(path.join(appDir, "package.json"))
        ).to.be.true
        chai.expect(
            fs.existsSync(path.join(appDir, "tsconfig.json"))
        ).to.be.true
        chai.expect(
            fs.existsSync(path.join(appDir, "src", "app.ts"))
        ).to.be.true
        chai.expect(
            fs.existsSync(path.join(appDir, "src", "main.ts"))
        ).to.be.true
        chai.expect(
            fs.existsSync(path.join(appDir, "bin", inputs.command))
        ).to.be.true
        chai.expect(
            fs.existsSync(path.join(appDir, "test", "app.spec.ts"))
        ).to.be.true
    })
    it('should set process', () => {
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