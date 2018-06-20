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
            this.$store.dispatch("parseMessage", incomingMessage);
        }.bind(this);
    }
};
</script>

<style lang="scss">
    body {
        margin: 0;
    }

</style>


