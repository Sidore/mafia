
let counter = 1;
class User {
    constructor(ws) {
        this.ws = ws;
        this.name = `user ${counter++}`;
        this.role = "none";
        this.status = "alive";
    }
    send(message) {
        let mes = typeof message === "object" ?
            JSON.stringify(message) :
            JSON.stringify({ type: "message", data: message });
        this.ws.send(mes);
    }
}


export default User;
