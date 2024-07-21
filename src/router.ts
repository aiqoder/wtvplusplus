import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from "@/components/Layout/Index.vue"
import DashBoard from "@/views/Dashbord/Index.vue"
import Create from "@/views/Create.vue"
import Settings from "@/views/Settings/Index.vue"
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: 'Layout',
      component: Layout,
      redirect: {
        name: "index"
      },
      children: [
        {
          path: '/index',
          name: 'index',
          component: DashBoard,
          meta: {
            title: '首页'
          }
        },
        {
          path: '/create',
          name: 'create',
          component: Create,
          meta: {
            title: '创建'
          }
        },
        {
          path: '/settings',
          name: 'Settings',
          component: Settings,
          meta: {
            title: '设置'
          }
        },
      ]
    },
  ]
})

export default router
