import express from "express"
import fs from "fs"
import { join, dirname } from 'path';
import * as http from 'http';

const stateSync = (path) => {
  try {
    return fs.statSync(path)
  } catch (error) {
    return {
      isDirectory: () => false,
      isFile: () => false
    }
  }
}
const isDir = (path) => stateSync(path).isDirectory() // 是否为文件夹
const isFile = (path) => stateSync(path).isFile() // 是否为文件

const app = express();
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, 'views/css')));
export function createFileServer(filePath: string, port = 8000): any {
  // 静态文件夹
  // app.use("/cz", express.static(filePath));

  // 文件请求服务
  app.get('/*', async (req, res, next) => {
    const retFiles: { type: string, name: string }[] = []
    let _filePath = "" // 当前文件夹
    let _onlyFile = "" // 当选择单个文件文件，表示只分享这个文件
    // console.log(process.platform)
    if (isDir(filePath)) { _filePath = filePath } else if (isFile(filePath)) {
      const index = process.platform == "darwin" ? filePath.lastIndexOf("/") : filePath.lastIndexOf("\\")
      _filePath = filePath.slice(0, index)
      _onlyFile = filePath.slice(index + 1)
    }

    const requestPath = join(_filePath, decodeURI(req.path)) // 根据请求，读取实际文件路径
    // console.log(decodeURI(req.path), _filePath);

    // 检测请求是否包含一个文件, 是文件直接下载
    try {
      if (isFile(requestPath)) {
        res.download(requestPath)
        return
      }
    } catch (error) {
      console.log(error);

    }

    // 非文件读取下级文件夹
    const files = fs.readdirSync(requestPath)
    files.forEach(item => {
      if (isDir(join(requestPath, item))) {
        if (!_onlyFile) {
          retFiles.push({ type: "dir", name: item })
        }
      } else {
        if (_onlyFile) {
          _onlyFile === item && retFiles.push({ type: "file", name: item })
        } else {
          retFiles.push({ type: "file", name: item })
        }
      }
    })

    res.render("file", { files: retFiles })
  })

  const server = http.createServer(app)
  server.listen(port)

  return { close, server }
}