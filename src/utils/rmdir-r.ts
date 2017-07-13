import * as fs from 'fs-extra';

export const mkdirSync = (dir: string): void => {
    fs.mkdirpSync(dir)
}

export const rmdirSync = (dir: string, options: any = {}): boolean => {
    if(fs.existsSync(dir)) {
        fs.removeSync(dir)
        return true
    }
    return false
}

export const rmdir = (dir: string, callback: (error?: any) => void, options: any = {}): void => {
    fs.exists(dir, exists => {
        if(exists)
            fs.remove(dir).then(callback).catch(callback)
        else
            callback()
    })
}