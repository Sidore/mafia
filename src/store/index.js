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
                started : false,
                conversationType : "text", // options || text
                options : []
            };
        },
        actions: {
            parseMessage: ({ dispatch, commit }, incomingMessage) => {
                console.log("parseMessage", incomingMessage);

                switch (incomingMessage.type) {
                case "message" : dispatch("mes", incomingMessage.data); break;
                case "info" : dispatch("users", incomingMessage.data); break;
                case "gamestart" : dispatch("startGame"); break;
                case "option" : dispatch("option", incomingMessage.data); break;
                default : dispatch("inc"); break;
                }
            },
            inc: ({ commit }) => {
                commit("inc");
            },
            mes: ({ commit }, message) => {
                commit("mes", message);
            },
            users : ({ commit }, data) => {
                commit("users", data);
            },
            startGame : ({ commit }) => {
                commit("start");
            },
            option : ({ commit }, data) => {
                commit("option", data);
            },
            choose : ({ commit }, data) => {
                commit("choose", data);
            },
        },
        mutations: {
            inc: (state) => {
                state.count++;
            },
            start: (state) => {
                state.started = true;
            },
            mes: (state, message) => {
                state.messages.push(message);
            },
            users: (state, users) => {
                state.users = users;
            },
            option : (state, message) => {
                console.log(message);
                state.conversationType = "options";
                state.options = message;
            },
            choose : (state) => {
                state.options = [];
                state.conversationType = "text";
            }
        },

        getters: {
            users: (state) => {
                return state.users;
            },

            started: (state) => {
                return state.started;
            },

            conversationType: (state) => {
                return state.conversationType;
            },

            options : (state) => {
                return state.options;
            },
        }
    });
}
