import DataFileDrive from "./dtos/file.drive.dtos";

export interface iDrive {
     uploadFile(nameFile: string, buff: Buffer): Promise<DataFileDrive | null>;
     delete(idFile: string): Promise<void>;
     getUrlFile(idFile: string): Promise<string | null | undefined>
     copyFile(idFile: string): Promise<string | undefined | null>;
}