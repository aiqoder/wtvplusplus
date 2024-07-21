import { net, ipcMain } from 'electron';

const ipv4Reg = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/;

function get(url: string): Promise<{ city: string }> {
  return new Promise((resolve, reject) => {
    const request = net.request({ url })

    try {
      request.on("response", (response) => {
        response.on('data', (chunk) => {
          resolve(JSON.parse(chunk.toString()))
        })
      })
      request.end()
    } catch (error) {
      reject(error)
    }
  })
}

export async function checkIpByUrl(url: string) {
  const u = new URL(url)
  if (ipv4Reg.test(u.hostname)) {
    const { city } = await get(`http://ip-api.com/json/${u.hostname}?lang=zh-CN`)
    return { city: 0, region: city }
  } else {
    return { city: 0, region: "-" }
  }
}

ipcMain.handle("get-ip-from-address", (rv, url) => {
  return checkIpByUrl(url)
})