import * as commander from 'commander'
export class App {

    private commander: commander.CommanderStatic
    constructor() {
        this.commander = commander
    }

    public initialize() {
        this.commander
            .version('0.0.1')
            .description('Basic cli tools.')
            .option('-u, --upper', 'Output message to upper case.')
                   
        this.commander.parse(process.argv)

        this._upper = commander.upper || false
        
        if(commander.args instanceof Array) {
            this.logMessage(commander.args[0])
        }
    }

    private _message: string
    
    get message(): string {
        return this._message
    }

    private _upper: string
    
    get upper(): string {
        return this._upper
    }

    private logMessage(message: string): void {
        this._message = message
        if(this.upper)
            message = message.toUpperCase()
        console.log(message)
    }
}

