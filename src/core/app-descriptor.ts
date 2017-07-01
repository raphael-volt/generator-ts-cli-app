export interface AppDescriptor {
    name: string
    author?: {
        name: string
        email: string
        repository: string
    }
    command: string
}