<template lang="pug">
  div#app
    main-menu
    users
    router-view
    control(:socket="socket")

</template>
<script>
import control from "@components/Control";
import mainMenu from "@components/MainMenu";
import users from "@components/Users";

export default {
    asyncData({ store, route }) {
    },
    components : {
        control,
        mainMenu,
        users
    },
    data() {
        return {
            socket : {},
        };
    },
    methods: {

    },
    computed: {
        counter : function() {
            return this.$store.state.count;
        }
    },
    beforeMount() {
        this.socket = new WebSocket("ws://localhost:8081");
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({
                type : "auth",
                message : prompt("Name")
            }));
        };

        this.socket.onmessage = function(event) {
            let incomingMessage = JSON.parse(event.data);
            console.log(incomingMessage);

            if (incomingMessage.type === "message") {
                this.$store.dispatch("mes", incomingMessage.data);
            } else if (incomingMessage.type === "info") {
                this.$store.dispatch("users", incomingMessage.data);
            } else if (incomingMessage.type === "gamestart") {
                this.$store.dispatch("startGame");
            }
        }.bind(this);
    }
};
</script>

<style lang="scss">
    #app {

    }
</style>


