import * as path from "path"
import * as child_process from 'child_process'
import * as readline from 'readline'
import * as fs from 'fs'
import * as os from 'os'
import { rmdirSync } from "../utils/rmdir-r"
import { log, ThemeColors, logMessage } from "./config.form";
import { BusyMessage } from "./busy-message";
import { PACKAGE_JSON, NODE_MODULES } from "./filenames";
import { Observable, Observer } from "rxjs";
export class NPMCommands {
    private busyMessage: BusyMessage = new BusyMessage()

    private cwd: string
    private package: any
    private buildCommand: string
    private testCommand: string

    constructor(projectDir?: string) {

    }

    setProjectDir(dir: string): boolean {
        const currentDir: string = process.cwd()
        if (currentDir != dir) {
            process.chdir(dir)
        }
        this.cwd = dir
        return this.loadPackage() !== undefined
    }

    private loadPackage() {
        let filename: string = path.join(this.cwd, PACKAGE_JSON)
        this.buildCommand = undefined
        this.testCommand = undefined
        if (fs.existsSync(filename)) {
            this.package = JSON.parse(fs.readFileSync(filename).toString())
            let scripts: any = this.package.scripts
            if (scripts != undefined) {
                this.buildCommand = scripts.build ? "npm run build" : undefined
                this.testCommand = scripts.test ? "npm run test" : undefined
            }
        }
        else
            this.package = undefined
        return this.package
    }

    clearModules(): boolean {
        if (this.package) {
            const filename: string = path.join(this.cwd, NODE_MODULES)
            if (fs.existsSync(filename)) {
                rmdirSync(filename)
                return true
            }
        }
        return false
    }

    private getObservableError(error: string): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            observer.error(new Error(error))
        })
    }

    private getMissingPackageObservabe(): Observable<boolean> {
        return this.getObservableError("Missing " + PACKAGE_JSON)
    }

    install(): Observable<boolean> {
        if (!this.package)
            return this.getMissingPackageObservabe()

        return this.exec("npm install")
    }

    test(): Observable<boolean> {
        if (!this.package)
            return this.getMissingPackageObservabe()
        if (!this.testCommand) {
            return this.getObservableError("Command 'test' not found in " + PACKAGE_JSON)
        }

        return this.exec(this.testCommand)
    }

    build(): Observable<boolean> {
        if (!this.package)
            return this.getMissingPackageObservabe()
        if (!this.buildCommand) {
            return this.getObservableError("Command 'build' not found in " + PACKAGE_JSON)
        }

        return this.exec(this.buildCommand)
    }

    private exec(command: string): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            this.busyMessage.start(
                logMessage(`> ${command}`, ThemeColors.warn)
            )
            let child: child_process.ChildProcess = child_process.exec(command, (err: Error, strOut: string, stdErr: string) => {
                let message: string = err ?
                    logMessage("[ERROR]", ThemeColors.error) :
                    logMessage("[DONE]", ThemeColors.info)
                this.busyMessage.close(message)
                if (err) {
                    return observer.error(err)
                }
                log(strOut, ThemeColors.prompt)
                observer.next(true)
                observer.complete()
                child.stdin.end()
            })
        })
    }
}