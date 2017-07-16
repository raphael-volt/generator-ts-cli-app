import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as du from "../src/utils/rmdir-r";
const tests: string = "tests-rmdir"
describe('rmdir', () => {
    const d: string = path.dirname(__dirname)

    let dirs: string[] = [
        path.join(d, tests),
        path.join(d, tests, "a"),
        path.join(d, tests, "b"),
        path.join(d, tests, "c"),
        path.join(d, tests, "b", "1"),
        path.join(d, tests, "b", "2")
    ]

    before(() => {
        for (let p of dirs) {
            if (!fs.existsSync(p))
                fs.mkdirSync(p)
        }
    })

    after(() => {
        dirs.reverse()
        
        for (let p of dirs) {
            if (fs.existsSync(p)) {
                fs.rmdirSync(p)
            }
        }
    })

    it("should delete sub dir", () => { 
        du.rmdirSync(dirs[2])
        chai.expect(fs.existsSync(dirs[4])).to.be.false
        chai.expect(fs.existsSync(dirs[5])).to.be.false
    })

    it("should delete dirs", () => {
        du.rmdirSync(dirs[0])
    })

    it("should dirs not exits", () => {
        for (let dir of dirs) {
            chai.expect(fs.existsSync(dir)).to.be.false
        }
    })

    it("should create dirs", () => {
        du.mkdirSync(dirs[5])
        chai.expect(fs.existsSync(dirs[0])).to.be.true
        chai.expect(fs.existsSync(dirs[1])).to.be.false
        chai.expect(fs.existsSync(dirs[2])).to.be.true
        chai.expect(fs.existsSync(dirs[3])).to.be.false
        chai.expect(fs.existsSync(dirs[4])).to.be.false
        chai.expect(fs.existsSync(dirs[5])).to.be.true
    })
})