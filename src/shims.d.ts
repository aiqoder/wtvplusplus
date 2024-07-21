import "../../renderer"

declare module '*.vue' {
	import { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}


declare module '*.json' {
	const json: Record<string, any>
	export default json
}

declare module "*.png";