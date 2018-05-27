
let clients = {
    counter : 1,
    users : [],
    addUser : function(ws) {
        let user = {
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

        this.users.push(user);
        return user;
    },
    removeUser : function(ws) {
        this.users.find((user) => {

        });
    },
    findUser : function(message) {
        return clients.users.find((user) => {
            return user.name === message;
        });
    },
    findUserByRole : function(role) {
        return clients.users.find((user) => {
            return user.role === role;
        });
    },
    findUsers : function() {

    },
    broadcast : function(message, role = "*") {
        let mes = typeof message === "object" ? JSON.stringify(message) : JSON.stringify({ type : "message", data : message });

        if (role === "alive") {
            this.users.filter((user) => {
                return user.status !== "dead";
            }).map((user) => {
                return user.ws;
            }).forEach((user) => {
                return user.send(mes);
            });
        } else {
            this.users.filter((user) => {
                return role === "*" || user.role === role;
            }).map((user) => {
                return user.ws;
            }).forEach((user) => {
                return user.send(mes);
            });
        }
    },
    send : function() {},
    forEach : function(callback) {
        this.users.forEach(callback);
    }
};

export default clients;
