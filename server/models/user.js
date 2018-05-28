
class User {
    constructor(ws, counter) {
        this.ws = ws;
        this.name = `user ${counter}`;
        this.role = "none";
        this.status = "alive";
    }
    send(message) {
        console.log("user.send", message);
        let mes = typeof message === "object" ?
            JSON.stringify(message) :
            JSON.stringify({ type: "message", data: message });
        this.ws.send(mes);
    }
}


module.exports = User;
