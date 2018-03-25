import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(VueAxios, axios)
Vue.use(Vuex)

Vue.mixin({
    beforeMount () {
      const { asyncData } = this.$options
      if (asyncData) {
        // присваиваем операцию загрузки к Promise
        // чтобы в компонентах мы могли делать так `this.dataPromise.then(...)`
        // для выполнения других задач после готовности данных
        this.dataPromise = asyncData({
          store: this.$store,
          route: this.$route
        })
      }
    }
   })

Vue.mixin({
    beforeRouteUpdate (to, from, next) {
      const { asyncData } = this.$options
      if (asyncData) {
        asyncData({
          store: this.$store,
          route: to
        }).then(next).catch(next)
      } else {
        next()
      }
    }
  })

export function createStore () {
  return new Vuex.Store({
    namespaced: true,
    // ВАЖНО: state должен быть функцией, чтобы
    // модуль мог инстанцироваться несколько раз
    state: () => ({
      count: 0,
      messages : [],
      users: []
    }),
    actions: {
      inc: ({ commit }) => commit('inc'),
      mes: ({commit}, message) => commit('mes', message),
      users : ({commit}) => Vue.axios('https://jsonplaceholder.typicode.com/users').then((users) => {
        commit("users", users)
      })
    },
    mutations: {
      inc: state => state.count++,
      mes: (state, message) => state.messages.push(message),
      users: (state, users) => state.users = users.data
    }
  })
}