import { spawn } from "child_process"
import { join, dirname } from 'path'
import fs from "fs"

// 进程号存储
const processObj: Record<number, any> = {}
const mac = process.platform === 'darwin' // 判断系统是不是mac
let playerPid: number;
const playerPath = join(__dirname, "static/playlist.m3u8")

//移除进程号，一般执行完成移除
export function killPid(pid: number) {
  const processPid = Object.keys(processObj) as unknown as number[]
  const index = processPid.indexOf(pid)
  if (index === -1) return //不存在
  if (processObj[pid] && processObj[pid].killed) return //已经kill
  processObj[pid].kill()
  delete processObj[pid]
}

// 清空文件夹
const deleteFilesInFolder = function(folderPath) {
  // Reading all the files in the folder
  fs.readdirSync(folderPath).forEach(function(file, index) {
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

export function killVideo() {
  try {
    processObj[playerPid].kill()
    delete processObj[playerPid]
    deleteFilesInFolder(join(__dirname, "static")) //删除视频文件 （不可以删除终端文件） （终端文件可能在任务终端
  } catch (error) {
    // ignore errors
  }
}

export function killAll() {
  const processPid = Object.keys(processObj) as unknown as number[]
  processPid.forEach(pid => {
    killPid(pid)
  })
}

// 执行ffmpeg命令
const execPeg = (cmd: "ffmpeg" | "ffprobe" | "ffplay", timeout: number, ...args): Promise<string> => {
  let pid = 0
  return new Promise((resolve, reject) => {
    let exec_path = mac ? join(__dirname, `/ffmpeg/bin/${cmd}`) : join(__dirname, `/ffmpeg/${cmd}`)

    let resultData = ""

    if (mac) {
      spawn("chmod", ["777", exec_path])
    }
    
    const res = spawn(exec_path, [...args], { timeout: timeout, shell: mac })
    pid = res.pid as number
    processObj[pid] = res // 存储

    if (args.includes(playerPath)) {
      playerPid = pid
      console.log("playerPid", playerPid)
    }

    res.stderr.on('error', (data) => {
      console.error(data.toString())
      reject(data.toString())
    });

    res.stdout.on('data', (data) => {
      resultData += data.toString()
    });

    res.stdout.on('close', () => {
      resolve(resultData)
    });
  })
}

// 匹配一个
const matchOne = (str: string, pattern: RegExp) => str.match(pattern)?.[0] || ""


export function getVersion() {
  return new Promise((resolve, reject) => {
    execPeg("ffmpeg", 0, "-version").then(data =>
      resolve(matchOne(data, /version \d\.\d\.\d/g))
    ).catch(reject)
  })
}

export function getVideoInfo(url: string, timeout = 0) {
  return new Promise((resolve, reject) => {
    // "ffprobe -v quiet -show_format -show_streams -print_format json"
    // ffprobe -select_streams v -show_entries stream=width,height,pix_fmt  -v quiet -of json -i http://cclive2.aniu.tv/live/anzb.m3u8
    execPeg("ffprobe", timeout, "-select_streams", "v", "-show_format", "-show_streams", "-v", "quiet", "-of", "json", "-i", url).then(data => {
      return resolve(JSON.parse(data) || [])
    }).catch(reject)
  })
}


export function playVideo(url: string, timeout = 0) {
  return new Promise((resolve, reject) => {
    execPeg("ffmpeg", timeout, "-i", url, "-c:v", "copy", "-f", "hls", playerPath, "-y").then(data => {
      return resolve(JSON.parse(data) || [])
    }).catch(reject)
  })
}