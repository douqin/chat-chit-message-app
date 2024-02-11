require("dotenv").config();
import { drive_v3, google } from "googleapis";
import { Readable } from "stream";
import { iDrive } from "./drive.interface"
import DataFileDrive from "./dtos/file.drive.dtos";
import { injectable } from "tsyringe";
const CLIENT_ID = process.env.CLIENT_ID;
const SECRECT_ID = process.env.SECRECT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN_DRIVE = process.env.REFRESH_TOKEN_DRIVE;


@injectable()
export class CloudDrive implements iDrive {
    private drive: drive_v3.Drive;
    private static instance = new CloudDrive();
    public static gI() {
        return CloudDrive.instance
    }
    public constructor() {
        let auth = new google.auth.OAuth2(CLIENT_ID, SECRECT_ID, REDIRECT_URI);
        auth.setCredentials({
            refresh_token: REFRESH_TOKEN_DRIVE,
        });
        this.drive = google.drive({
            version: "v3",
            auth: auth,
        });
    }
    async copyFile(idFile: string): Promise<string | undefined | null> {
        let file = (await this.drive.files.copy(
            {
                fileId: idFile,
                fields: "webContentLink"
            }
        ));
        return file.data.webContentLink
    }
    async getUrlFile(idFile: string): Promise<string | null | undefined> {
        let file = (await this.drive.files.get(
            {
                fileId: idFile,
                fields: "webContentLink"
            }
        ));
        return file.data.webContentLink
    }

    async delete(id: string): Promise<void> {
        let data = (await this.drive.files.delete({
            fileId: id
        }))
        console.log(data)
    }
    async uploadFile(nameFile: string, buff: Buffer | Readable): Promise<DataFileDrive | null> {
        try {
            const createFile = await this.drive.files.create({
                requestBody: {
                    name: nameFile,
                    // mimeType: "image/png",
                },
                media: {
                    // mimeType: "image/png",
                    body: (buff instanceof Buffer) ? Readable.from(buff) : buff,
                },

            });
            if (createFile) {
                const permissionsResponse = await this.drive.permissions.create({
                    fileId: createFile.data.id!,
                    requestBody: {
                        role: 'writer',
                        type: 'anyone',

                        // emailAddress : ""
                    },
                });
            }
            return new DataFileDrive(createFile.data.id!, (await this.drive.files.get({
                fileId: createFile.data.id!,
                fields: "webViewLink"
            }
            )).data.webViewLink!)
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    // async uploadVideo(childFolderID: string, nameFile: string, buff: Buffer) {
    //     try {
    //         const createFile = await this.drive.files.create({
    //             requestBody: {
    //                 parents: [childFolderID],
    //                 name: nameFile,
    //                 mimeType: "video/mp4"
    //             },
    //             media: {
    //                 mimeType: "video/mp4",
    //                 body: Readable.from(buff),
    //             },
    //         });
    //         return createFile.data.id;
    //     } catch (err) {
    //         console.log(err);
    //         return null;
    //     }
    // }
    async createFolder(nameFolder: string): Promise<string | null | undefined> {
        const fileMetadata = {
            'name': nameFolder,
            'mimeType': 'application/vnd.google-apps.folder',
        };
        try {
            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            return file.data.id;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}