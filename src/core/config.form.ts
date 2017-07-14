import { AppDescriptor } from "./app-descriptor"
import { TsLibStringUtils } from "ts-lib-string-utils";
import * as colors from 'colors'
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
})
export enum ThemeColors {
    none,
    silly,
    input,
    verbose,
    prompt,
    info,
    data,
    help,
    warn,
    debug,
    error,
    bold,
}

export function log(message: string, color: ThemeColors = ThemeColors.none) {
    console.log(logMessage(message, color))
}

export function logMessage(message: string, color: ThemeColors): string {
    if (color != ThemeColors.none) {
        const prop: string = ThemeColors[color]
        const fn: (message: string) => string = colors[prop]
        return fn(message)
    }
    return message
}
export class ConfigForm {

    private _readline: any = require('readline')
    private user: GitUser = new GitUser()

    createInterface(config: AppDescriptor): Promise<AppDescriptor> {
        return new Promise((resolve: (value: AppDescriptor) => void, reject: (error?: any) => void) => {

            this.user.init((success: boolean) => {
                config.author = this.user
            })
            const readline: any = this._readline
            const rl: any = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            let askCommand = (question: string, callback: (answer: string) => void, validate?: (value: string) => boolean): void => {
                rl.question(colors.help(question), (answer: any) => {
                    const value: string = String(answer).trim()
                    if (validate !== undefined)
                        if (validate(value))
                            callback(value)
                        else
                            askCommand(question, callback, validate)
                    else
                        callback(value)
                })
            }

            let validateName = (value: string) => {
                value = value.trim()
                const valid: boolean = TsLibStringUtils.kebab(value) == value
                if (!valid)
                    log("kebab-case only", ThemeColors.error)
                return valid
            }

            let validateCommand = (value: string) => {
                const valid: boolean = 
                    TsLibStringUtils.kebab(value) == value 
                    || TsLibStringUtils.pascal(value) == value
                    || TsLibStringUtils.camel(value) == value
                if (!valid)
                    log("kebab-case or cameCase or PascalCase", ThemeColors.error)
                return valid
            }

            askCommand("Name : ", (value: string) => {
                config.name = value
                askCommand("Command : ", (value: string) => {
                    config.command = value
                    askCommand(`User name : `, (answer: string) => {
                        config.author.name = answer
                        askCommand(`User email : `, (answer: string) => {
                            config.author.email = answer
                            askCommand(`Repository : `, (answer: string) => {
                                config.author.repository = answer
                                rl.close()
                                resolve(config)
                            })
                            this.user.setProject(config.name)
                            rl.write(config.author.repository)
                        })
                        rl.write(config.author.email)
                    })
                    rl.write(config.author.name)
                }, validateCommand)
                rl.write(TsLibStringUtils.camel(config.name))
            }, validateName)
            rl.write(config.name)
        })
    }
}
import * as child_process from 'child_process'

export class GitUser {
    name: string = ""
    email: string = ""
    repository: string = ""

    constructor() {

    }
    setProject(name: string): void {
        this.repository = `https://github.com/${this.name}/${name}.git`
    }
    init(callback: (exists: boolean) => void) {
        this.getGitConfig("name", (err: Error, stdout: any, stderr: any) => {
            if (err) {
                callback(false)
                return
            }
            this.name = stdout.toString().trim()
            this.getGitConfig("email", (err: Error, stdout: any, stderr: any) => {
                if (err) {
                    callback(false)
                    return
                }
                this.email = stdout.toString().trim()
                callback(true)
            })
        })
    }

    private getGitConfig(field: string, callback: (err: Error, stdout: any, stderr: any) => void) {
        this.exec(
            this.getGitConfigCommande(field),
            callback
        )
    }

    private exec(command: string, callback: (err: Error, stdout: any, stderr: any) => void): void {
        child_process.exec(command, callback)
    }

    private getGitConfigCommande(field: string): string {
        return `git config --get user.${field}`
    }
}