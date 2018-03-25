<template lang="pug">
  div#app
    p root component
    button("v-on:click"='start') Start
    mm
    router-view
    control(:socket="socket")

</template>
<script>
import control from "@components/Control"
import mm from "@components/MainMenu"
export default {
  asyncData ({ store, route }) {
  },
  components : {
      control,
      mm
  },
  data() {
      return {
          socket : {},
        //   message : ""
      }
  },
  methods: {
    start : function(){
        console.log('gamestart')
        this.socket.send(JSON.stringify({
            type: "gamestart",
            // value: outgoingMessage
        }));
    }
  },
  computed: {
      counter : function () {
          return this.$store.state.count
      }
  },
  beforeMount(){
      let v = this;

       this.socket = new WebSocket("ws://localhost:8081");

       this.socket.onopen = () => {
            this.socket.send(JSON.stringify({
                type : "auth",
                message : prompt("Name")
            }));
        }

        this.socket.onmessage = function(event) {
            var incomingMessage = event.data;
            v.$store.dispatch("mes",incomingMessage); 
        };
  }
}
</script>

<style lang="stylus">

</style>


