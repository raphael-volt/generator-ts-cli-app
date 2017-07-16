import { mkdirSync } from "../utils/rmdir-r";
import { AppDescriptor } from "./app-descriptor";
import {
    PACKAGE_JSON
} from "./filenames";
import * as fs from 'fs-extra'
import * as path from 'path'
import * as mustache from "mustache"

const tplDir: string = path.join(
    path.dirname(path.dirname(__dirname)),
    "templates")

const TPL_EXT: string = ".tpl"
const SRC: string = "src"
const BIN: string = "bin"
const TEST: string = "test"
const CMD: string = "cmd"

const FILES: [string, string[]][] = [
    ["main.ts", [SRC]],
    ["app.ts", [SRC]],
    ["app.spec.ts", [TEST]],
    ["tsconfig.json", []],
    ["nodemon.json", []]
]

const stringify = (json: any): string => {
    return JSON.stringify(json, null, 4)
}

export class AppGenerator {

    private cwd: string

    private local = (...args): string => {
        return path.join.apply(null, [this.cwd].concat(args))
    }

    private template = (...args): string => {
        return path.join.apply(null, [tplDir].concat(args))
    }

    private _depsChanged: boolean
    get dependenciesChanged(): boolean {
        return this._depsChanged
    }

    update(dir: string, override: boolean = false): Promise<PackageJSON> {
        this.cwd = dir
        return new Promise((resolve, reject) => {
            this._update(resolve, reject, override)
        })
    }

    updateSync = (dir: string, override: boolean = false) => {
        const local = this.local
        this.cwd = dir
        this._depsChanged = false
        const pkgSrc: string = local(PACKAGE_JSON)
        let pkg: PackageJSON = fs.readJSONSync(pkgSrc)
        let tpl: PackageJSON = fs.readJSONSync(this.template(PACKAGE_JSON + TPL_EXT))
        this._depsChanged = dependenciesDif(pkg, tpl)
        // create files
        for (const f of FILES) {
            let src = this.template(f[0] + TPL_EXT)
            let dst = this.local.apply(null, f[1].concat(f[0]))
            if (!override)
                if (fs.existsSync(dst))
                    continue
            fs.copySync(src, dst)
        }
        this.createCommandsSync(pkg)
        if (this._depsChanged)
            fs.writeFileSync(pkgSrc, stringify(pkg))
    }

    build(descriptor: AppDescriptor, dir: string): Promise<PackageJSON> {
        return new Promise((resolve, reject) => {
            this.cwd = dir
            const src: string = this.template(PACKAGE_JSON + TPL_EXT)
            const dst: string = this.local(PACKAGE_JSON)
            // create directories
            this.createDirs(dir).then(success => {
                // create package.json
                fs.readFile(src).then((data: Buffer) => {
                    const pkg: PackageJSON = JSON.parse(mustache.render(data.toString(), descriptor))
                    // save package.json
                    this.writeJSON(dst, pkg).then(() => {
                        // create commands
                        this.createCommands(pkg).then(success => {
                            // create files
                            this.copyFiles().then(files => {
                                resolve(pkg)
                            }).catch(reject)
                        }).catch(reject)
                    }).catch(reject)
                }).catch(reject)
            }).catch(reject)
        })
    }

    buildSync(descriptor: AppDescriptor, dir: string): void {
        this.cwd = dir
        // create directories
        this.createDirsSync(dir)

        let src: string = this.template(PACKAGE_JSON + TPL_EXT)
        let dst: string = this.local(PACKAGE_JSON)
        // create package.json
        const pkg = JSON.parse(
            mustache.render(
                fs.readFileSync(src).toString(),
                descriptor)
        )
        fs.writeFileSync(dst, stringify(pkg))
        // create commands
        this.createCommandsSync(pkg)
        // create files
        for (const f of FILES) {
            src = this.template(f[0] + TPL_EXT)
            dst = this.local.apply(null, f[1].concat(f[0]))
            fs.copySync(src, dst)
        }
    }

    private _update = (nextFn: (pkg: PackageJSON) => void, errorFn: (error?: any) => void, override: boolean) => {
        const local = this.local
        this._depsChanged = false
        const pkgSrc: string = local(PACKAGE_JSON)
        fs.readJSON(pkgSrc)
            .then(pkg => {
                fs.readJSON(this.template(PACKAGE_JSON + TPL_EXT))
                    .then((tpl: PackageJSON) => {
                        // is npm install required
                        this._depsChanged = dependenciesDif(pkg, tpl)
                        this.copyFiles(override).then(files => {
                            this.createCommands(pkg)
                                .then(success => {
                                    if (!this._depsChanged)
                                        nextFn(pkg)
                                    else
                                        this.writeJSON(pkgSrc, pkg).then(() => nextFn(pkg)).catch(errorFn)
                                }).catch(errorFn)
                        }).catch(errorFn)
                    }).catch(errorFn)
            }).catch(errorFn)
    }

    private createCommands(pkg: PackageJSON, clear: boolean = true): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const src: string = this.template(CMD + TPL_EXT)
            const commands: string[] = []
            for (const cmd in pkg.bin)
                commands.push(this.local(BIN, cmd))
            let nextCommand = () => {
                if (commands.length)
                    fs.copy(src, commands.shift()).then(nextCommand).catch(resolve)
                else
                    resolve(true)
            }
            if (clear) {
                let dir: string = this.local(BIN)
                fs.emptyDir(dir).then(() => {
                    nextCommand()
                }).catch(reject)
            }
            else
                nextCommand()
        })
    }

    private createCommandsSync(pkg: PackageJSON) {
        const cmdContent: Buffer = fs.readFileSync(this.template(CMD) + TPL_EXT)
        for (const cmd in pkg.bin) {
            fs.writeFileSync(
                this.local(BIN, cmd),
                cmdContent
            )
        }
    }

    private createDirs(dir: string): Promise<boolean> {
        return new Promise((resolve: (success: boolean) => void, error: (error?: any) => void) => {
            const dirs: string[] = [
                dir,
                path.join(dir, TEST),
                path.join(dir, SRC),
                path.join(dir, BIN)
            ]
            let next = () => {
                if (dirs.length)
                    fs.mkdirp(dirs.shift()).then(next).catch(error)
                else
                    resolve(true)
            }
            next()
        })
    }

    private createDirsSync(dir: string): void {
        for (const d of [
            dir,
            path.join(dir, TEST),
            path.join(dir, SRC),
            path.join(dir, BIN)
        ])
            mkdirSync(d)

    }

    private copyFiles(override: boolean = true, update: boolean = false): Promise<string[]> {
        return new Promise((nextFn: (files: string[]) => void, errorFn: (error?: any) => void) => {

            let i: number = 0
            const n: number = FILES.length
            const files: string[] = []
            let copy = (src: string, dst: string) => {
                fs.copy(src, dst, { overwrite: true }).then(() => {
                    files.push(path.relative(this.cwd, dst))
                    i++
                    nextFile()
                }).catch(errorFn)
            }
            let nextFile = () => {
                let src: string
                let dst: string
                if (i < n) {
                    if (update && FILES[i][0] == "app.ts") {
                        i++
                        return nextFile()
                    }
                    src = this.template(FILES[i][0] + TPL_EXT)
                    dst = this.local.apply(null, FILES[i][1].concat(FILES[i][0]))
                    if (!override) {
                        fs.pathExists(dst).then(exists => {
                            if (!exists)
                                copy(src, dst)
                            else {
                                i++
                                nextFile()
                            }
                        }).catch(errorFn)
                    }
                    else
                        copy(src, dst)
                }
                else
                    nextFn(files)
            }
            nextFile()
        })
    }

    private writeJSON(src: string, json: any): Promise<void> {
        return fs.writeFile(src, stringify(json))
    }
}

export interface PackageJSON {
    [name: string]: any
    name?: string
    version?: string
    description?: string
    repository?: {
        type?: string
        url?: string
    }
    scripts?: {
        [name: string]: string
    },
    bin?: {
        [name: string]: string
    }
    author?: {
        name?: string
        email?: string
    }
    main?: string
    typings?: string
    files?: string[]
    devDependencies?: {
        [name: string]: string
    }
    dependencies?: {
        [name: string]: string
    }
}

const dependenciesDif = (target: PackageJSON, src: PackageJSON): boolean => {

    const removed: [boolean, string, string | undefined][] = []
    const added: [boolean, string, string][] = []

    if (target.dependencies == undefined)
        target.dependencies = {}
    if (target.devDependencies == undefined)
        target.devDependencies = {}

    const asDep = (pkg: PackageJSON, dep: string): boolean => {
        return pkg.dependencies[dep] !== undefined
    }

    const asDevDep = (pkg: PackageJSON, dep: string): boolean => {
        return pkg.devDependencies[dep] !== undefined
    }

    const depEquals = (a: PackageJSON, b: PackageJSON, name: string): boolean | undefined => {
        if (asDep(a, name) && asDep(b, name))
            return a.dependencies[name] == b.dependencies[name]
        return undefined
    }

    const devDepEquals = (a: PackageJSON, b: PackageJSON, name: string): boolean | undefined => {
        if (asDevDep(a, name) && asDevDep(b, name))
            return a.devDependencies[name] == b.devDependencies[name]
        return undefined
    }

    let d: any

    for (d in src.dependencies) {
        if (asDevDep(target, d)) {
            removed.push([false, d, undefined])
            delete (target.devDependencies[d])
        }
    }

    for (d in src.devDependencies) {
        if (asDep(target, d)) {
            removed.push([true, d, undefined])
            delete (target.dependencies[d])
        }
    }

    for (d in src.dependencies) {
        if (depEquals(src, target, d) === true)
            continue
        target.dependencies[d] = src.dependencies[d]
        added.push([true, d, src.dependencies[d]])
    }

    for (d in src.devDependencies) {
        if (devDepEquals(src, target, d) === true)
            continue
        target.devDependencies[d] = src.devDependencies[d]
        added.push([true, d, src.devDependencies[d]])
    }

    return added.length > 0 || removed.length > 0
}
