import * as commander from 'commander'
import { AppDescriptor } from "./core/app-descriptor";
import { AppGenerator } from "./core/app-generator";
import { ConfigForm } from "./core/config.form";
import * as path from "path";
export class App {

    private commander: commander.CommanderStatic

    private config: AppDescriptor = {
        name: "",
        command: ""
    }

    private appDir: string

    private callback: () => void | undefined = undefined

    constructor() {
        this.commander = commander
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

        this.createInterface()
    }

    private createInterface() {
        let form: ConfigForm = new ConfigForm()
        form.createInterface(this.config, this.buildApp)
    }

    private buildApp = () => {
        let generator: AppGenerator = new AppGenerator()
        generator.build(this.config, this.appDir)
        if(this.callback !== undefined)
            this.callback()
    }
}