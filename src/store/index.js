import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios);
Vue.use(Vuex);

Vue.mixin({
    beforeMount() {
        const { asyncData } = this.$options;
        if (asyncData) {
        // присваиваем операцию загрузки к Promise
        // чтобы в компонентах мы могли делать так `this.dataPromise.then(...)`
        // для выполнения других задач после готовности данных
            this.dataPromise = asyncData({
                store: this.$store,
                route: this.$route
            });
        }
    }
});

Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        const { asyncData } = this.$options;
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: to
            }).then(next).catch(next);
        } else {
            return next();
        }
    }
});

export function createStore() {
    return new Vuex.Store({
        namespaced: true,
        // ВАЖНО: state должен быть функцией, чтобы
        // модуль мог инстанцироваться несколько раз
        state: () => {
            return {
                count: 0,
                messages : [],
                users: [],
                started : false
            };
        },
        actions: {
            parseMessage: ({ dispatch, commit }, incomingMessage) => {
                console.log("parseMessage", incomingMessage);

                switch (incomingMessage.type) {
                case "message" : dispatch("mes", incomingMessage.data); break;
                case "info" : dispatch("users", incomingMessage.data); break;
                case "gamestart" : dispatch("startGame"); break;
                default : dispatch("inc"); break;
                }
            },
            inc: ({ commit }) => {
                return commit("inc");
            },
            mes: ({ commit }, message) => {
                return commit("mes", message);
            },
            users : ({ commit }, data) => {
                // return Vue.axios("https://jsonplaceholder.typicode.com/users").then((users) => {
                //     commit("users", users);
                // });
                console.log("action.users", data);
                commit("users", data);
            },
            startGame : ({ commit }) => {
                return commit("start");
            }
        },
        mutations: {
            inc: (state) => {
                return state.count++;
            },
            start: (state) => {
                state.started = true;
            },
            mes: (state, message) => {
                return state.messages.push(message);
            },
            users: (state, users) => {
                console.log("mutations.users", users);

                state.users = users;
                console.log("mutations.users state", state);


                return state.users;
            }
        },

        getters: {
            users: (state) => {
                return state.users;
            },

            started: (state) => {
                return state.started;
            }
        }
    });
}
