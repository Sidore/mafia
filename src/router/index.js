import Vue from "vue";
import Router from "vue-router";
// import Home from "@components/Home";
// import Item from "@components/Item";

Vue.use(Router);

export function createRouter() {
    return new Router({
        mode: "history",
        routes: [
            { path: "/", component : () => import("@components/Home") , name: "Home" },
            { path: "/profile", component : () => import("@components/Item") , name : "Item" },
            { path: "/info", component : () => import("@components/Item") , name : "info" }
            
        ]
    });
}
