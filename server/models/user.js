export let user = {
    ws,
    name : `user ${this.counter++}`,
    role : "none",
    status : "alive",
    send : function(message) {
        let mes = typeof message === "object" ?
            JSON.stringify(message) :
            JSON.stringify({ type : "message", data : message });
        this.ws.send(mes);
    }
};