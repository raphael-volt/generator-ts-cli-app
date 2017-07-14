import * as fs from 'fs-extra';

export const mkdirSync = (dir: string): void => {
    if(! fs.existsSync(dir)) 
        fs.mkdirpSync(dir)
}

export const mkdir = (dir: string, callback: (error?: any) => void): void => {
    fs.exists(dir, exists => {
        if(! exists)
            fs.mkdirp(dir).then(callback).catch(callback)
        else
            callback()
    })
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