import { mkdirSync } from "../utils/rmdir-r";
import { AppDescriptor } from "./app-descriptor";
import {
    PACKAGE_JSON
} from "./filenames";
import * as fs from 'fs-extra'
import * as path from 'path'
import * as mustache from "mustache";
import { Observable, Observer } from "rxjs";

const tplDir: string = path.join(
    path.dirname(path.dirname(__dirname)),
    "templates")
const TPL_EXT: string = ".tpl"

export class AppGenerator {

    private cwd: string
    update(dir: string): Observable<any> {
        this.cwd = dir
        return Observable.create(this._update)
    }

    private local = (...args): string => {
        return path.join.apply(null, [this.cwd].concat(args))
    }

    private template = (...args): string => {
        return path.join.apply(null, [tplDir].concat(args))
    }

    private _update = (observer: Observer<any>) => {
        const local = this.local
        const errorFn = error => observer.error(error)
        const nextFn = pkg => {
            observer.next(pkg)
            observer.complete()
        }

        fs.readJSON(local(PACKAGE_JSON))
            .then(pkg => {
                fs.readJSON(this.template(PACKAGE_JSON + TPL_EXT))
                .then((tpl: PackageJSON) => {
                    const depsChange: boolean = dependenciesDif(pkg, tpl)
                    
                })
                nextFn(pkg)
            }).catch(errorFn)
    }

    build(descriptor: AppDescriptor, dir: string): void {
        this.createDirs(dir)

        let src: string
        let dst: string
        let f: string

        const tplExt: string = ".tpl"

        f = "main.ts"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, "src", f)
        this.copy(src, dst)


        f = "app.ts"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, "src", f)
        this.copy(src, dst)

        f = "tsconfig.json"

        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, f)
        this.copy(src, dst)

        f = "cmd"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, "bin", descriptor.command)
        this.copy(src, dst)

        f = "app.spec.ts"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, "test", f)

        this.copy(src, dst)

        f = "nodemon.json"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, f)
        this.copy(src, dst)

        f = "package.json"
        src = path.join(tplDir, f + tplExt)
        dst = path.join(dir, f)
        this.saveTemplate(src, dst, descriptor)
    }

    private copy(src: string, dst: string) {
        fs.writeFileSync(dst, fs.readFileSync(src))
    }

    private saveTemplate(src: string, dst: string, templateData: any) {
        fs.writeFileSync(dst, mustache.render(fs.readFileSync(src).toString(), templateData))
    }


    private createDirs(dir: string): void {
        mkdirSync(dir)
        mkdirSync(path.join(dir, "test"))
        mkdirSync(path.join(dir, "src"))
        mkdirSync(path.join(dir, "bin"))

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
