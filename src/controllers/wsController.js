export default {
    install : function(Vue, optinons) {
        Vue.$ws = new WebSocket("ws://localhost:8081");
        Vue.$ws.onopen = () => {
            Vue.$ws.send(JSON.stringify({
                type : "auth",
                message : prompt("Name")
            }));
        };

        Vue.$ws.onmessage = function(event) {
            let incomingMessage = JSON.parse(event.data);

            if (incomingMessage.type === "message") {
                Vue.$store.dispatch("mes", incomingMessage.data);
            } else if (incomingMessage.type === "info") {
                Vue.$store.dispatch("users", incomingMessage.data);
            }
        };
    }
};
