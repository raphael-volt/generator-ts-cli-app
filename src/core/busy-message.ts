var readline = require('readline');
var os = require("os");

export class BusyMessage {

    public chars: string[] = ["", ".", "..", "..."]

    private timer: any | undefined
    private index: number = 0
    private length: number = 0
    private message: string
    start(message, timeout: number = 300) {
        this.index = 0
        this.length = this.chars.length
        this.message = message
        if(this.timer == undefined) {
            this.output()
            this.timer = setInterval(this.update, timeout)
        }
    }

    stop() {
        if (this.timer !== undefined) {
            clearInterval(this.timer)
            this.timer = undefined
            this.index = 0
            this.output()
            process.stdout.write(os.EOL)
        }
    }

    private clear() {
        readline.cursorTo(process.stdout, 0)
        readline.clearLine(process.stdout, 1)
    }

    private update = () => {
        this.index = (this.index + 1) % this.length
        this.output()
    }

    private output(): void {
        this.clear()
        process.stdout.write(`${this.message} ${this.chars[this.index]}`)
    }
}