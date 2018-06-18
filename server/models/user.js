
class User {
    constructor(ws, counter) {
        this.ws = ws;
        this.name = `user ${counter}`;
        this.role = "none";
        this.status = "alive";
    }
    send(message) {
        console.log(`User ${this.name} got message: ${message}`);
        this.ws.send(message);
    }
    changeStatus(to) {
        console.log(`User ${this.name} status: ${this.status} --> ${to}`);
        this.status = to;
    }
    changeName(to) {
        console.log(`User ${this.name} name: ${this.name} --> ${to}`);
        this.name = to;
    }
    changeRole(to) {
        console.log(`User ${this.name} role: ${this.role} --> ${to}`);
        this.role = to;
    }
}

module.exports = User;
