<template lang="pug">
    div#input
        div(v-if="!started")
            button("v-on:click"='start') Start
        div(v-else)
            //- div(v-if="conversationType == 'text'")
            //-     input(v-model="message")
            //-     button("@click"="send") Отправить
            div(v-if="conversationType == 'options'")
                button("v-for"="option in options" @click="choose(option)").card {{option}}
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
        },
        choose : function(option) {
            this.message = option;
            this.send();
            this.$store.dispatch("choose");
        }
    },

    computed : {
        started : function() {
            return this.$store.getters.started;
        },
        conversationType : function() {
            return this.$store.getters.conversationType;
        },
        options : function() {
            return this.$store.getters.options;
        },
    }
};
</script>
<style lang="scss">
#input {
    .card {
        background: white;
        padding: 20px;
        margin: 20px;
        font-size: 20px;
    }
}
</style>
