import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home.vue'
import Item from '../components/Item.vue'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      { path: '/', component : () => System.import("../components/Home.vue") , name: "Home" },
      { path: '/item', component : () => System.import("../components/Item.vue") , name : "Item"}
    ]
  })
}