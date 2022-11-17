import Vue from 'vue'
import VueRouter from "vue-router"
import drawer from "@/components/drawer";
Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    name: 'drawer',
    component: drawer
  },

]

const router = new VueRouter({
  routes
})

export default router
