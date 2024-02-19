import { Readable } from "stream";
import DataFileDrive from "./dtos/file.drive.dtos";

export interface iDrive {
     uploadFile(nameFile: string, buff: Buffer | Readable): Promise<DataFileDrive | null>;
     delete(idFile: string): Promise<void>;
     getUrlFile(idFile: string): Promise<string | null | undefined>
     copyFile(idFile: string): Promise<string | undefined | null>;
}