import { AppDescriptor } from "./app-descriptor";

export class ConfigForm {

    private _readline: any = require('readline')
    private user: GitUser = new GitUser()

    createInterface(config: AppDescriptor, callback: (config: AppDescriptor) => void) {
        this.user.init((success: boolean) => {
            config.author = this.user
        })
        const readline: any = this._readline
        const rl: any = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        let askCommand = (question: string, callback: (answer: string) => void, validate?: (value: string) => boolean): void => {
            rl.question(question, (answer: any) => {
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
            return /^[A-Za-z0-9\-_]{3,}$/.test(value)
        }

        askCommand("Name : ", (value: string) => {
            config.name = value
            askCommand("Command : ", (value: string) => {
                config.command = value
                rl.question(`User name : `, (answer: any) => {
                    config.author.name = answer
                    rl.question(`User email : `, (answer: any) => {
                        config.author.email = answer
                        rl.question(`Repository : `, (answer: any) => {
                            config.author.repository = answer
                            rl.close()
                            callback(config)
                        })
                        this.user.setProject(config.name)
                        rl.write(config.author.repository)
                    })
                    rl.write(config.author.email)
                })
                rl.write(config.author.name)
            }, validateName)
        }, validateName)
        rl.write(config.name)
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