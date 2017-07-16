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

        this.commander.parse(process.argv)
    }
}