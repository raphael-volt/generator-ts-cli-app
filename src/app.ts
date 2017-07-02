import * as commander from 'commander'
import * as path from 'path'
import * as os from "os"
import { AppDescriptor } from "./core/app-descriptor";
import { AppGenerator } from "./core/app-generator";
import { ConfigForm, log, ThemeColors, logMessage } from "./core/config.form";
import { NPMCommands } from "./core/npm-commands";
export class App {

    private commander: commander.CommanderStatic
    private npmCommands: NPMCommands
    private config: AppDescriptor = {
        name: "",
        command: ""
    }

    private appDir: string

    private callback: () => void | undefined = undefined

    constructor(
        private readonly debug?: boolean
    ) {
        this.commander = commander
        this.npmCommands = new NPMCommands()
    }

    public initialize(callback?: () => void) {
        this.commander
            .version('1.0.7')
            .description('Basic cli tools.')
            .option('-u, --upper', 'Output message to upper case.')
        this.callback = callback
        this.commander.parse(process.argv)
        this.appDir = process.cwd()
        this.config.name = path.basename(this.appDir)
        if (this.debug) {
            this.message = commander.args[0]
            this.upper = commander.upper || false
            this.config.author = {
                name: "debug-user",
                email: "debug-user@gmail.com",
                repository: `https://github.com/debug-user/${this.config.name}.git`
            }
            this.config.command = this.config.name.replace("-", "")
            console.log(this.commander.upper ?
                this.message.toUpperCase()
                : this.message)
        }
        else
            this.createInterface()
    }

    message: string
    upper: boolean
    private createInterface() {
        let form: ConfigForm = new ConfigForm()
        form.createInterface(this.config, this.generateApp)
    }

    private generateApp = () => {
        let generator: AppGenerator = new AppGenerator()
        generator.build(this.config, this.appDir)
        this.npmCommands.setProjectDir(this.appDir)
        this.npmCommands.install().subscribe(this.buildApp, this.errorHandler)
    }

    private errorHandler = (error: Error) => {
        log(
            logMessage(`An error as occured : [${error.name}] `, ThemeColors.warn) +
            logMessage(error.message, ThemeColors.error) + os.EOL + error.stack
        )
        this.buildComplete(false)
    }

    private buildApp = (success?: boolean) => {
        this.npmCommands.build().subscribe(this.runTest, this.errorHandler)
    }

    private runTest = (success?: boolean) => {
        this.npmCommands.test().subscribe(this.buildComplete, this.errorHandler)
    }

    private buildComplete = (success: boolean) => {
        if (success) 
            log("Installation complete", ThemeColors.info)
        
        if (this.callback !== undefined)
            this.callback()
        process.exit(success ? 0 : 1)
    }
}