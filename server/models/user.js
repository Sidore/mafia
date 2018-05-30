
class User {
    constructor(ws, counter) {
        this.ws = ws;
        this.name = `user ${counter}`;
        this.role = "none";
        this.status = "alive";
    }
    send(message) {
        this.ws.send(message);
    }
}


module.exports = User;
