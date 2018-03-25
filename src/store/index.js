import Vue from 'vue'
import Vuex from 'vuex'


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
      messages : []
    }),
    actions: {
      inc: ({ commit }) => commit('inc'),
      mes: ({commit}, message) => commit('mes', message)
    },
    mutations: {
      inc: state => state.count++,
      mes: (state, message) => state.messages.push(message)
    }
  })
}