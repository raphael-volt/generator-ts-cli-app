import * as commander from 'commander'
import * as path from 'path'
import * as os from "os"
import * as fs from "fs-extra";
import { AppDescriptor } from "./core/app-descriptor";
import { AppGenerator, PackageJSON } from "./core/app-generator";
import { ConfigForm, log, ThemeColors, logMessage } from "./core/config.form";
import { NPMCommands } from "./core/npm-commands";
import { PACKAGE_JSON } from "./core/filenames";

export class App {

    private commander: commander.CommanderStatic
    private npmCommands: NPMCommands
    private explicitPath: string
    private update: boolean = false
    private override: boolean = false
    private skipScripts: boolean = false
    private cwd: string
    private config: AppDescriptor = {
        name: "",
        command: ""
    }

    constructor() {
        this.commander = commander
        this.npmCommands = new NPMCommands()
    }

    private parseArgs(args: any[]): undefined | string {
        if (!args || !args.length)
            return undefined
        let cmd: any = args.pop()
        if (args.length) {
            let p: string = args[0]
            if (p != undefined)
                if (path.isAbsolute(p))
                    this.explicitPath = p
                else
                    this.explicitPath = path.resolve(this.cwd, p)
            else
                return undefined
        }
        return this.explicitPath
    }
    public initialize() {
        let pkg: PackageJSON = fs.readJsonSync(path.resolve(__dirname, "..", PACKAGE_JSON))
        this.cwd = process.cwd()

        this.commander
            .version(pkg.version)
            .description('CLI TypeScript application generator.')
            .option(
            '-o, --override', 'Always replace existing content (update command only)',
            () => this.override = true)
            .option(
            '-s, --skipscripts', 'Exit without run build and test',
            () => this.skipScripts = true)

        this.commander.command("new [directory]")
            .action(this.createApp)
        this.commander.command("n [directory]")
            .action(this.createApp)

        this.commander.command("update [directory]")
            .action(this.updateApp)
        this.commander.command("u [directory]")
            .action(this.updateApp)

        this.commander.command("spec <file>")
            .action(this.createSpec)
        this.commander.command("s <file>")
            .action(this.createSpec)

        this.commander.parse(process.argv)
    }

    private createSpec = (...args) => {
        this.parseArgs(args)
        const dir: string = path.dirname(this.explicitPath)
        let basename: string = path.basename(this.explicitPath)
        const ext: string = path.extname(basename)
        console.log("ext", ext)
        switch(true) {
            case /.spec.ts$/.test(basename): 
                break
                
            case /.ts$/.test(basename): 
                basename = basename.slice(0, -3)

            case ext == "":
                basename += ".spec.ts"
                break
        }
        this.explicitPath = path.join(dir, basename)
        const done = () => {
            this.generateSpec(basename)
        } 
        fs.pathExists(dir).then(exists => {
            if(! exists)
                fs.mkdirp(dir).then(done)
            else
                done()
        }).catch(this.errorHandler)
    }

    generateSpec(filename: string) {
        const tpl: string = `import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';

const expect = (target: any, message?: string): Chai.Assertion => {
    return chai.expect(target, message)
}

const expectBe = (target: any, message?: string): Chai.Assertion => {
    return expect(target, message).to.be
}

const expectNot = (target: any, message?: string): Chai.Assertion => {
    return expect(target, message).not.to.be
}

describe('${filename}', () => {
    it("should be true", () => {
        expectBe(true).true
    })
})`
        fs.writeFile(this.explicitPath, tpl).then(() => {
            log("Created " + path.relative(process.cwd(), this.explicitPath), ThemeColors.info)
            process.exit(0)
        }).catch(this.errorHandler)
    }

    private validateAppDir() {
        let appDir: string = this.cwd
        if (this.explicitPath != undefined) {
            appDir = this.explicitPath
        }
        fs.pathExists(appDir).then(exists => {
            this.createInterface(exists, appDir)
        }).catch(this.errorHandler)
    }

    private createInterface = (exists: boolean, appDir: string) => {
        this.config.name = path.basename(appDir)
        let form: ConfigForm = new ConfigForm()
        form.createInterface(this.config).then((desc: AppDescriptor) => {
            let done = () => {
                if (appDir != process.cwd()) {
                    process.chdir(appDir)
                }
                this.cwd = appDir
                console.log("")
                this.generateApp()
            }
            if (!exists)
                fs.mkdirp(appDir).then(done).catch(this.errorHandler)
            else
                done()
        }).catch(this.errorHandler)
    }

    private createApp = (...args) => {
        this.parseArgs(args)
        this.validateAppDir()
    }

    private updateApp = (...args) => {
        this.update = true
        this.parseArgs(args)
        let libDir: string = this.cwd
        if (this.explicitPath != undefined) {
            libDir = this.explicitPath
            process.chdir(libDir)
            this.cwd = libDir
        }
        fs.pathExists(libDir).then(exists => {
            if (!exists) {
                log(`Directory does not exists : ${libDir}`, ThemeColors.error)
                return this.buildComplete(false)
            }
            let generator: AppGenerator = new AppGenerator()
            generator.update(this.cwd, this.override).then((pkg: PackageJSON) => {
                this.npmCommands.setProjectDir(this.cwd)
                if (this.skipScripts && !generator.dependenciesChanged)
                    return this.updateComplete()
                console.log("")
                if (generator.dependenciesChanged)
                    this.npmCommands.install(true).subscribe(this.buildApp, this.errorHandler)
                else
                    this.buildApp(true)
            }).catch(this.errorHandler)
        })
    }

    private generateApp = () => {
        let generator: AppGenerator = new AppGenerator()
        generator.build(this.config, this.cwd).then(() => {
            this.npmCommands.setProjectDir(this.cwd)
            this.npmCommands.install().subscribe(this.buildApp, this.errorHandler)
        }).catch(this.errorHandler)
    }

    private errorHandler = (error: Error) => {
        log(
            logMessage(`An error as occured : [${error.name}] `, ThemeColors.warn) +
            logMessage(error.message + os.EOL + error.stack, ThemeColors.error)
        )
        this.buildComplete(false)
    }

    private buildApp = (success?: boolean) => {
        if (this.skipScripts) 
            return this.update ? this.updateComplete() : this.buildComplete()
        
        this.npmCommands.build().subscribe(this.runTest, this.errorHandler)
    }

    private runTest = (success?: boolean) => {
        this.npmCommands.test().subscribe(this.update ? this.updateComplete : this.buildComplete, this.errorHandler)
    }

    private buildComplete = (success: boolean = true) => {
        this.notifyComplete("Installation", success)
    }

    private updateComplete = (success: boolean = true) => {
        this.notifyComplete("Update", success)
    }

    private notifyComplete(mode: string, success: boolean) {
        if (success)
            log(`${mode} complete`, ThemeColors.info)
        process.exit(success ? 0 : 1)
    }
}