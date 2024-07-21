import express from "express";
import { join } from "path";
import * as http from "http"
import fs from "fs"
import { tryUsePort } from "../preload/utils/util"
import { getDocumentPath } from "./utils/util";

export function getExistPath(_path) {
    if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path)
    }
    return _path
}



const app = express();
app.use(express.static(getDocumentPath("static-m3u8-cache")));

let usedPort = 0; // 保存当前使用的端口号或0表示无法使用可用的端口号

export function getServerPort(){
    return usedPort
}

export function createServer(port = 8000): any {
    tryUsePort(8000, function (port) {
        usedPort = port
        console.log(`端口：${port}可用\n`);

        app.get('/*', async (req, res, next) => {
            res.json({ result: "ok" })
        })
        const server = http.createServer(app)
        server.listen(port, "0.0.0.0")
    });
}