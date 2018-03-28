<template lang="pug">
  div#app
    p root component
    button("v-on:click"='start') Start
    main-menu
    router-view
    control(:socket="socket")

</template>
<script>
import control from "@components/Control";
import mainMenu from "@components/MainMenu";
export default {
    asyncData({ store, route }) {
    },
    components : {
        control,
        mainMenu
    },
    data() {
        return {
            socket : {},
        };
    },
    methods: {
        start : function() {
            this.socket.send(JSON.stringify({
                type: "gamestart",
            }));
        }
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
                message : "vlad"
            }));
        };

        this.socket.onmessage = function(event) {
            let incomingMessage = event.data;
            this.$store.dispatch("mes", incomingMessage);
        }.bind(this);
    }
};
</script>

<style lang="scss">

</style>


