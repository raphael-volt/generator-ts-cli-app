import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as path from 'path'
import { existsSync } from 'fs'
import { rmdir, rmdirSync } from "../src/utils/rmdir-r";
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

describe('Update', () => {

    it("should delete test-app", (done) => {

        rmdir(appDir, done)
    })

    it("should test-app be deleted", () => {
        expectBe(existsSync(appDir)).false
    })
})

