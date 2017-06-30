import { mkdirSync } from "../utils/rmdir-r";
import { AppDescriptor } from "./app-descriptor";
import * as fs from 'fs'
import * as path from 'path'
import * as mustache from "mustache";

export class AppGenerator {

    build(descriptor: AppDescriptor, dir: string): void {
        this.createDirs(dir)
        const tplDir: string = path.join(
            path.dirname(path.dirname(__dirname)),
            "templates")
        let src: string
        let dst: string
        let f: string

        f = "main.ts"
        src = path.join(tplDir, f)
        dst = path.join(dir, "src", f)
        this.copy(src, dst)
        

        f = "app.ts"
        src = path.join(tplDir, f)
        dst = path.join(dir, "src", f)
        this.copy(src, dst)
        
        f = "tsconfig.json"

        src = path.join(tplDir, f)
        dst = path.join(dir, f)
        this.copy(src, dst)
        
        f = "cmd"
        src = path.join(tplDir, f)
        dst = path.join(dir, "bin", descriptor.command)
        this.copy(src, dst)

        f = "app.spec.ts"
        src = path.join(tplDir, f)
        dst = path.join(dir, "test", f)

        this.copy(src, dst)

        f = "nodemon.json"
        src = path.join(tplDir, f)
        dst = path.join(dir, f)
        this.copy(src, dst)

        f = "package.json"
        src = path.join(tplDir, f)
        dst = path.join(dir, f)
        this.template(src, dst, descriptor)
    }

    private copy(src: string, dst: string) {
        fs.writeFileSync(dst, fs.readFileSync(src))
    }
    
    private template(src: string, dst: string, templateData: any) {
        fs.writeFileSync(dst, mustache.render(fs.readFileSync(src).toString(), templateData))
    }


    private createDirs(dir: string): void {
        mkdirSync(dir)
        mkdirSync(path.join(dir, "test"))
        mkdirSync(path.join(dir, "src"))
        mkdirSync(path.join(dir, "bin"))
        
    }
}