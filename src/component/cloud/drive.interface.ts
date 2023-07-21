import DataFileDrive from "./dtos/file.drive.dtos";

export interface iDrive {
     uploadFile(childFolderID : string, nameFile : string, buff : Buffer) : Promise<DataFileDrive | null>;
     createFolder(nameFolder : string ) : any;
     delete(nameFolder : string ) : Promise<void>;
}