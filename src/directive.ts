import { App } from "vue";

function directive(app: App) {
    app.directive('permission', {
        mounted(el: HTMLInputElement, binding, vnode: any) {
            
        }
    })
}

export default {
    install(app: App) {
        directive(app)
    }
}