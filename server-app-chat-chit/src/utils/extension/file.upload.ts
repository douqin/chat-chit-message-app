import path from "path";
import fs from 'node:fs/promises';
import multer from "multer";

export function getUriUpload() {
    return `${process.cwd()}/uploads`;
}
export function deleteFile(name: string) {
    fs.unlink(path.join(getUriUpload(), name)).then(() => {
        console.log("🚀 ~ deleteFile ~ OKKK")
    }).catch((e) => {
        console.log("🚀 ~ deleteFile ~ e:", e)
    })
}
export function getOptionForMulter(type: string) {
    return {
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, getUriUpload())
            },
            filename: function (req, file, cb) {
                let filename = type + "-" + crypto.randomUUID() + Date.now() + "-" + file.originalname
                cb(null, filename)
            }
        })
    }
}