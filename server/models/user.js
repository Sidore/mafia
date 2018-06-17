
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
    changeStatus(to) {
        console.log(`User ${this.name} status: ${this.status} --> ${to}`);
        this.status = to;
    }
}

module.exports = User;
