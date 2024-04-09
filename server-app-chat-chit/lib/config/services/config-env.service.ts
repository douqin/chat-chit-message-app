import "dotenv/config";
export class ConfigService {
  private constructor() {}
  private static instance: ConfigService;
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  public get(key: string): string {
    let data = process.env[key];
    if(data === undefined) throw new Error(`Key ${key} not found in .env`);
    return data;
  }
}
