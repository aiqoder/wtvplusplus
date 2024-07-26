import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from "@/components/Layout/Index.vue"
import DashBoard from "@/views/Dashbord/Index.vue"
import Create from "@/views/Create.vue"
import Tv from "@/views/Tv/Index.vue"
import Rule from "@/views/Rule/Index.vue"
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
          path: '/tv',
          name: 'tv',
          component: Tv,
          meta: {
            title: '超级电台'
          }
        },
        {
          path: '/rule',
          name: 'rule',
          component: Rule,
          meta: {
            title: '规则引擎'
          }
        },
      ]
    },
  ]
})

export default router
