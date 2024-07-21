import Store from 'electron-store'
Store.initRenderer()

const store = new Store({
    schema: {
        sn: {
            type: "object",
            default: {
                ip: "",
                country: "",
                province: "",
                city: "",
                county: "",
                region: "",
                isp: "",
            }
        },
        downloads: {
            type: "string",
            default: ""
        },
        bookmarks: {
            type: "array",
            default: []
        }
    }
})

export {
    store
}