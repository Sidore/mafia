const User = require("./models/user");
const userStates = require("./models/userStates");
const messages = require("./models/messageStates");
class ClientManager {
    constructor() {
        this.counter = 1;
        this.users = [];
    }
    addUser(ws) {
        let user = new User(ws, this.counter);
        this.users.push(user);
        return user;
    }
    removeUser(ws) {
        this.users.find((user) => {
        });
    }
    findUser(message) {
        return this.users.find((user) => {
            return user.name === message;
        });
    }
    findUserByRole(role) {
        return this.users.find((user) => {
            return user.role === role;
        });
    }
    findUsers() {
    }
    broadcast(message, role = "*") {
        let mes = typeof message === "object" ? JSON.stringify(message) : JSON.stringify({ type: messages.MESSAGE, data: message });
        if (role === userStates.ALIVE) {
            this.users.filter((user) => {
                return user.status !== userStates.DEAD;
            }).forEach((user) => {
                return user.send(mes);
            });
        } else {
            this.users.filter((user) => {
                return role === "*" || user.role === role;
            }).forEach((user) => {
                return user.send(mes);
            });
        }
    }
    forEach(callback) {
        this.users.forEach(callback);
    }
}

module.exports = ClientManager;
