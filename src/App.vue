<template lang="pug">
  div#app
    h3 new template with pug
    div
        p root component
        button("v-on:click"='start') Start
        router-link(to="/item") item
        router-link(to="/") home   
    router-view
    div
        input(v-model="message")
        button("v-on:click"="send")
</template>
<script>
export default {
  asyncData ({ store, route }) {
  },
  data() {
      return {
          socket : {},
          message : ""
      }
  },
  methods: {
    start : function(){
        console.log('gamestart')
        this.socket.send(JSON.stringify({
            type: "gamestart",
            // value: outgoingMessage
        }));
    },
    send : function(){
        console.log('send')
        
        this.socket.send(JSON.stringify({
            type:"message",
            message: this.message
        }));
        this.message = "";
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


