require("dotenv").config();
import { drive_v3, google } from "googleapis";
import { Readable } from "stream";
import { iDrive } from "./drive.interface"
const CLIENT_ID = process.env.CLIENT_ID;
const SECRECT_ID = process.env.SECRECT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN_DRIVE = process.env.REFRESH_TOKEN_DRIVE;

export class ServiceDrive implements iDrive {
    public drive: drive_v3.Drive;
    constructor() {
        let auth = new google.auth.OAuth2(CLIENT_ID, SECRECT_ID, REDIRECT_URI);
        auth.setCredentials({
            refresh_token: REFRESH_TOKEN_DRIVE,
        });
        this.drive = google.drive({
            version: "v3",
            auth: auth,
        });
    }
    async getArrayBuffer(parents: string, idFile: string) {
        let fileId = idFile;
        try {
            const file = await this.drive.files.get({
                fileId: fileId,
                alt: "media"
            },
                {
                    responseType: 'arraybuffer'
                });
            return file.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async uploadImage(childFolderID: string, nameFile: string, buff: Buffer) {
        try {
            const createFile = await this.drive.files.create({
                requestBody: {
                    parents: [childFolderID],
                    name: nameFile,
                    mimeType: "image/png",
                },
                media: {
                    mimeType: "image/png",
                    body: Readable.from(buff),
                },
            });
            return createFile.data.id;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    async uploadVideo(childFolderID: string, nameFile: string, buff: Buffer) {
        try {
            const createFile = await this.drive.files.create({
                requestBody: {
                    parents: [childFolderID],
                    name: nameFile,
                    mimeType: "video/mp4"
                },
                media: {
                    mimeType: "video/mp4",
                    body: Readable.from(buff),
                },
            });
            return createFile.data.id;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    async searchIdFile() {
        const { GoogleAuth } = require('google-auth-library');
        const { google } = require('googleapis');

        // Get credentials and build service
        // TODO (developer) - Use appropriate auth mechanism for your app
        const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/drive' });
        const service = google.drive({ version: 'v3', auth });
        const files: Array<any> = [];
        try {
            const res = await service.files.list({
                q: 'mimeType=\'image/jpeg\'',
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive',
            });
            Array.prototype.push.apply(files, res.files);
            res.data.files.forEach(function (file: any) {
                console.log('Found file:', file.name, file.id);
            });
            return res.data.files;
        } catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
    }
    async createFolder(nameFolder: string) {
        const fileMetadata = {
            'name': nameFolder,
            'mimeType': 'application/vnd.google-apps.folder',
        };
        try {
            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            console.log('Folder Id:', file.data.id);
            return file.data.id;
        } catch (err) {
            // TODO(developer) - Handle error
            console.error(err);
            return null;
        }
    }
}