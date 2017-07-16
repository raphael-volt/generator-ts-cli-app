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
    describe('SYNC', () => {
        it("should join path", () => {
            const TPL_EXT: string = ".tpl"
            const SRC: string = "src"
            const BIN: string = "bin"
            const TEST: string = "test"

            const FILES: [string, string[]][] = [
                ["main.ts", [SRC]],
                ["app.ts", [SRC]],
                ["tsconfig.json", [SRC]],
                ["cmd", [BIN]],
                ["app.spec.ts", [TEST]],
                ["nodemon.json", []],
                ["package.json", []]
            ]

            let dir: string = "dir"
            let tplDir: string = "tpl"

            expectBe(path.join.apply(
                null,
                [dir].concat(FILES[0][1], FILES[0][0]
                ))).equals(path.join("dir", "src", "main.ts"))

            expectBe(path.join(
                tplDir, FILES[0][0] + TPL_EXT
            )).equals(path.join(tplDir, "main.ts.tpl"))

        })

        it("should create1 app if not", () => {
            if (fs.existsSync(appDir))
                return
            gen.buildSync(config, appDir)
            expectBe(fs.existsSync(appDir)).true
        })

        it("should update app", () => {
            gen.updateSync(appDir, true)
            expectBe(gen.dependenciesChanged).false
        })

    })

    describe("ASYNC", () => {
        
        before((done) => {
            fs.emptyDir(appDir).then(() => done()).catch(done)
        })

        after(done => {
            fs.remove(appDir).then(() => done()).catch(done)
        })

        it("should create app", done => {
            gen.build(config, appDir).then(() => done()).catch(done)
        })
        
        it("should update app", done => {
            gen.update(appDir).then(() => done()).catch(done)
        })

    })
})
