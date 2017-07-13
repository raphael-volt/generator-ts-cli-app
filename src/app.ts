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

    constructor() {
        this.commander = commander
        this.npmCommands = new NPMCommands()
    }

    public initialize() {
        this.commander
            .version('1.0.7')
            .description('Basic cli tools.')
            .option('-u, --upper', 'Output message to upper case.')

        this.commander.parse(process.argv)
        this.appDir = process.cwd()
        this.config.name = path.basename(this.appDir)
        
        this.createInterface()
    }

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

        process.exit(success ? 0 : 1)
    }
}