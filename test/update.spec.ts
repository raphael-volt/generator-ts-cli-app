import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as path from 'path'
import * as fs from 'fs-extra'
import { existsSync } from 'fs'
import { rmdir, rmdirSync } from "../src/utils/rmdir-r";
import { AppGenerator } from "../src/core/app-generator";

const expect = (target: any, message?: string): Chai.Assertion => {
    return chai.expect(target, message)
}

const expectBe = (target: any, message?: string): Chai.Assertion => {
    return expect(target, message).to.be
}

const expectNot = (target: any, message?: string): Chai.Assertion => {
    return expect(target, message).not.to.be
}

const appDir: string = path.join(path.dirname(__dirname), "tests/test-app")

let gen: AppGenerator = new AppGenerator()
const config = {
    name: "test-app",
    author: {
        name: "test-app author",
        email: "testapp@gmail.com",
        repository: "https://github.com/test-app/test-app.git"
    },
    command: "testApp"
}

describe('Update', () => {

    it("should create app if not", function (done) {
        this.timeout(2000)
        if (fs.existsSync(appDir))
            return done()
        gen.build(config, appDir)
        expectBe(fs.existsSync(appDir)).true
        done()
    })

    it("should update app without changes", (done) => {

        gen.update(appDir).subscribe(
            (pkg: any) => {
                expectBe(pkg.name).equals(config.name)
            },
            done,
            done
        )
    })
})

