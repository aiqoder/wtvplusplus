import path, { join } from "path"
import { app } from "electron"
import fs from 'fs';
import iconv from "iconv-lite"
import chardet from "chardet"

import * as net from 'net' 	// for testing only
export const ROOT_DOCUMENTS = path.join(app.getPath("documents"), "yigechengzipro")

export function getExistPath(_path) {
  if (!fs.existsSync(_path)) {
    fs.mkdirSync(_path)
  }
  return _path
}

export function getDocumentPath(p = "") {
  const _path = path.join(ROOT_DOCUMENTS, p)
  return getExistPath(_path)
}

// 端口是否被占用
export function isPortTaken(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      // @ts-ignore
      .once('error', err => (err.code == 'EADDRINUSE' ? resolve(true) : reject(err)))
      .once('listening', () => tester.once('close', () => resolve(false)).close())
      .listen(port)
  })
}

// 清空文件夹
export const deleteFilesInFolder = function (folderPath) {
  // Reading all the files in the folder
  fs.readdirSync(folderPath).forEach(function (file, index) {
    // Creating the path to the file
    const curPath = join(folderPath, file);
    // Checking if the current path is a file or a folder
    if (fs.lstatSync(curPath).isDirectory()) { // Recursive call if it's a folder
      deleteFilesInFolder(curPath);
    } else { // Deleting the file
      fs.unlinkSync(curPath);
    }
  });
};



// 读取文件内容
export function readFileAsText(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        const coding = chardet.detect(buffer) || "UTF-8"
        resolve(iconv.decode(buffer, coding))
      }
      // console.log(err, iconv.decode(buffer, chardet.detect(buffer) || "UTF-8"))
    })
  })
}

// 写入文件内容
export function writeFileAsText(file: string, data: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve('')
      }
    })
  })
}