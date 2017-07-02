require("./rmdir.spec.ts")
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import * as dirUtil from "../src/utils/rmdir-r";
import { AppDescriptor } from "../src/core/app-descriptor";
import { AppGenerator } from "../src/core/app-generator";
import { NPMCommands } from '../src/core/npm-commands'
import { GitUser } from "../src/core/config.form";
import { App } from "../src/app";

const intercept = require("intercept-stdout");
const inputs: AppDescriptor = {
    name: "test-app",
    author: {
        name: "test-app author",
        email: "testapp@gmail.com",
        repository: "https://github.com/test-app/test-app.git"
    },
    command: "testApp"
}

const appDir: string = path.join(path.dirname(__dirname), "tests/test-app");
describe('RegExp', () => {

    it("should be a valide name", () => {
        let re: RegExp = /^[A-Za-z0-9\-_]{3,}$/
        chai.expect(re.test("")).to.be.false
        chai.expect(re.test("my-lib")).to.be.true
        chai.expect(re.test("my_lib")).to.be.true
        chai.expect(re.test(" my_lib ")).to.be.false
        chai.expect(re.test("My Lib")).to.be.false
        chai.expect(re.test("My_Lib")).to.be.true
        chai.expect(re.test("My4_Lib2")).to.be.true

    })

    it("should be camel-case formated", () => {
        let re: RegExp = /^[a-z0-9\-]{3,}$/
        chai.expect(re.test("")).to.be.false
        chai.expect(re.test("my-lib")).to.be.true
        chai.expect(re.test("mylib")).to.be.true
        chai.expect(re.test("myLib")).to.be.false
        chai.expect(re.test("my_lib")).to.be.false

        chai.expect(re.test("my-lib-1")).to.be.true
        chai.expect(re.test("my-lib-a")).to.be.true
        chai.expect(re.test("my-lib_a")).to.be.false
        chai.expect(re.test("my_lib-a")).to.be.false

        chai.expect(re.test(" my_lib ")).to.be.false
        chai.expect(re.test("My Lib")).to.be.false
        chai.expect(re.test("My_Lib")).to.be.false
        chai.expect(re.test("My4_Lib-2")).to.be.false

    })
})
describe('WatchOutput', () => {
    let app: App
    it('should set process.argv', () => {
        process.argv.length = 2
        process.argv[2] = "-u"
        process.argv[3] = "message"
        chai.expect(process.argv.length).to.be.equals(4)
    })
    it('should create app', () => {
        app = new App(true)
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
        for (let str of outputs) {
            i = str.search(message)
            if (i != -1)
                break
        }
        chai.expect(i).not.to.be.equals(-1)
    })
})
describe('Generate', () => {

    let npmCommands: NPMCommands = new NPMCommands()

    after(() => {
        if (fs.existsSync(appDir)) {
            //dirUtil.rmdirSync(appDir)
        }
    })

    it("should clean tests directory", () => {
        if (fs.existsSync(appDir)) {
            dirUtil.rmdirSync(appDir)
        }
        chai.expect(fs.existsSync(appDir)).to.be.false
    })
    
    it("should get git user name and email", (done) => {
        let user: GitUser = new GitUser()
        user.init((success: boolean) => {
            chai.expect(success).to.be.true
            chai.expect(user.name).to.be.equal("raphael_volt")
            user.setProject(inputs.name)
            inputs.author = user
            done()
        })
    })

    it("should create an app", () => {
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

    it("should initialize npmCommands", () => {
        chai.expect(npmCommands.setProjectDir(appDir)).to.be.true
    })

    it("should install app dependencies", function(done) {
        this.timeout(30000)
        npmCommands.install().subscribe(success => {
            chai.expect(success).to.be.true
            done()
        },
            error => done(error)
        )
    })

    it("should build app", function(done) {
        this.timeout(10000)
        npmCommands.build().subscribe(success => {
            chai.expect(success).to.be.true
            done()
        },
            error => done(error)
        )
    })

    it("should test the App", function(done) {
        this.timeout(10000)
        npmCommands.test().subscribe(success => {
            done()
        },
            error => done(error))
    })
})