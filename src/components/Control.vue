<template lang="pug">
    div#input
        input(v-model="message")
        button("@click"="send") Отправить
</template>
<script>
export default {
    props: [ "socket" ],
    data() {
        return {
            message: ""
        };
    },
    methods : {
        send : function() {
            this.socket.send(JSON.stringify({
                type:"message",
                message: this.message
            }));
            this.message = "";
        }
    }
};
</script>
