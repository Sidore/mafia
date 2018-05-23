<template lang="pug">
    div#input
        div(v-if="!started")
            button("v-on:click"='start') Start
        div(v-else)
            input(v-model="message")
            button("@click"="send") Отправить
</template>
<script>
export default {
    props: [ "socket" ],
    data() {
        return {
            message: "",
        };
    },
    methods : {
        send : function() {
            this.socket.send(JSON.stringify({
                type: "message",
                message: this.message
            }));
            this.message = "";
        },
        start : function() {
            this.socket.send(JSON.stringify({
                type: "gamestart",
            }));
            this.$store.dispatch("startGame");
        }
    },

    computed : {
        started : function() {
            return this.$store.getters.started;
        }
    }
};
</script>
