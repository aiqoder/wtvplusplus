const ipv4Reg = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/;
self.addEventListener("message", (res) => {
    const u = new URL(res.data)
    if(!ipv4Reg.test(u.hostname)) return undefined
    fetch(`https://ip.yigechengzi.com/?ip=${u.hostname}`).then(res => {
        return res.json()
    }).then(response=>{
        self.postMessage(response.data)
    })
})