export interface iDrive {
     uploadImage(childFolderID : string, nameFile : string, buff : Buffer) : Promise<string | null | undefined>;
     uploadVideo(childFolderID : string, nameFile : string, buff : Buffer) : any;
     searchIdFile() : any;
     createFolder(nameFolder : string ) : any;
     getArrayBuffer(parents : string, idFile : string) : any;
}