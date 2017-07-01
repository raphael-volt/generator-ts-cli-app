import * as fs from 'fs';
import * as path from 'path';
export function mkdirSync(dir: string): void {

    let dirs: string[] = []
    let parent: string = dir
    while(! fs.existsSync(parent)) {
        dirs.unshift(parent)
        parent = path.dirname(parent)
    }
    while(dirs.length) {
        fs.mkdirSync(dirs.shift())
    }
}
export function rmdirSync(dir: string): void {
    if (!fs.existsSync(dir)) {
        return;
    }
    let currentDirToRead: string
    let directoriesFound: string[]
    let nextDirToReadIndex: number
    let stat: { isDirectory: () => boolean }
    let p: string

    currentDirToRead = dir;
    directoriesFound = [dir]
    while (true) {
        fs.readdirSync(currentDirToRead).forEach((name: string) => {
            p = path.join(currentDirToRead, name)
            stat = fs.lstatSync(p)
            if (stat.isDirectory())
                directoriesFound.push(p)
            else
                fs.unlinkSync(p)
        })
        nextDirToReadIndex = directoriesFound.indexOf(currentDirToRead) + 1
        if (nextDirToReadIndex >= directoriesFound.length) {
            break
        }
        currentDirToRead = directoriesFound[nextDirToReadIndex]
    }

    directoriesFound.reverse()
    directoriesFound.forEach((path: string) => {
        fs.rmdirSync(path)
    })
}
/*~ This example shows how to have multiple overloads for your function */
// declare function rmdirSync(name: string): void

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block. Often you will want to describe the
 *~ shape of the return type of the function; that type should
 *~ be declared in here, as this example shows.
declare namespace rmdirSync {

}
 */