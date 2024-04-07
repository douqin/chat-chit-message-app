export class ConfigService {
    public get(key: string): string | undefined {
        return process.env[key];
    }    
}