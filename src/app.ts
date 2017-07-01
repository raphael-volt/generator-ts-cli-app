import * as commander from 'commander'
import { AppDescriptor } from "./core/app-descriptor";
import { AppGenerator } from "./core/app-generator";
import { ConfigForm, log, ThemeColors, logMessage } from "./core/config.form";
import { BusyMessage } from "./core/busy-message";
import * as path from "path";

import * as child_process from 'child_process'

export class App {

    private commander: commander.CommanderStatic
    private busyMessage: BusyMessage
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
        this.busyMessage = new BusyMessage()
    }

    public initialize(callback?: () => void) {
        this.commander
            .version('0.0.1')
            .description('Basic cli tools.')
            .option('-u, --upper', 'Output message to upper case.')
        this.callback = callback
        this.commander.parse(process.argv)
        this.appDir = process.cwd()
        this.config.name = path.basename(this.appDir)
        if (this.debug) {
            this.message = commander.args[0]
            this.upper = commander.upper || false
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

        this.updateNodeModules()
    }

    private updateNodeModules() {
        this.exec("npm install", this.buildApp, this.buildComplete)
    }

    private buildApp = () => {
        this.exec("npm run build", this.runTest, this.buildComplete)
    }

    private runTest = () => {
        this.exec("npm run test", this.buildComplete, this.buildComplete)
    }

    private buildComplete = () => {
        log("Installation complete", ThemeColors.info)
        if (this.callback !== undefined)
            this.callback()
        process.exit(0)
    }

    private exec(command: string, callback: () => void, error: () => void) {
        this.busyMessage.start(
            logMessage(`> ${command}`, ThemeColors.warn)
        )
        child_process.exec(command, (err: Error, strOut: string, stdErr: string) => {
            this.busyMessage.stop()
            if (err) {
                log(command, ThemeColors.warn)
                log(err.message, ThemeColors.error)
                return error()
            }
            log(strOut, ThemeColors.prompt)
            callback()
        })
    }
}