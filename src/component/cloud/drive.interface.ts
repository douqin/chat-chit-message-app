import DataFileDrive from "./dtos/file.drive.dtos";

export interface iDrive {
     uploadImage(childFolderID : string, nameFile : string, buff : Buffer) : Promise<DataFileDrive | null>;
     uploadVideo(childFolderID : string, nameFile : string, buff : Buffer) : any;
     createFolder(nameFolder : string ) : any;
     uploadDocument(childFolderID: string, nameFile: string, buff: Buffer): Promise<DataFileDrive | null>
     delete(nameFolder : string ) : Promise<void>;
}