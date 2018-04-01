const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 8081 });
const path = require("path");
const Vue = require("vue");
const express = require("express");
const server = express();
// const createApp = require("../src/entry-server.js")
const serverBundle = require("../dist/vue-ssr-server-bundle.json");
const clientManifest = require("../dist/vue-ssr-client-manifest.json");

const renderer = require("vue-server-renderer").createBundleRenderer(serverBundle,{
    runInNewContext: false,
    clientManifest,
    template: require("fs").readFileSync("static/html/index.template.html", "utf-8")
});

server.use("/dist", express.static("dist"));

server.get("*", (req, res) => {
    const context = {
        title: "Mafia",
        url : req.url
    };

    //   createApp(context).then(app => {
    renderer.renderToString(context, (err, html) => {
        console.log(err);
        if (err) {
            if (err.code === 404) {
                let notFound = require("fs").readFileSync("static/html/404.template.html", "utf-8");
                res.status(404).end(notFound);
            } else {
                let serverError = require("fs").readFileSync("static/html/500.template.html", "utf-8")
                res.status(500).end(serverError);
            }
        } else {
            res.end(html);
        }
    });
    //   })
});

server.listen(8082);

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
    send : function() {}
};

let game = {
    states : [ "idle", "start", "roles", "sleep", "mafia", "doctor", "police", "beforevoting", "voting", "voted", "finnish" ],
    state : "idle",
    roles : [ "civil", "police", "mafia", "doctor" ],
    clients,
    voting : {
        _length: 0
    },
    isFinnished : function() {
        return !(this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
        }) && this.clients.users.some((user) => {
            return user.status !== "dead" && user.role === "mafia";
        })) || this.clients.users.length === 2 && this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor") && this.clients.users.some((user) => {
                return user.status !== "dead" && user.role === "mafia";
            });
        });
    },
    whoWon : function() {
        return this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
        }) ? "civil" : "mafia";
    },
    checkRoles : function() {
        if (game.state === "doctor") {
            if (this.clients.findUserByRole("doctor")) {
                return true;
            }
            game.state = game.states[6];
            return false;
        }
        if (game.state === "police") {
            if (this.clients.findUserByRole("police")) {
                return true;
            }
            game.state = game.states[7];
            return false;
        }
    },
    queue : [],
    events : {
        userAction: function(user, action) {
            console.log(game.state);

            switch (game.state) {
            case "idle" : 
                if (action.type == "auth" && action.message) {
                    user.name = action.message;
                    game.clients.broadcast(`Новый игрок ${user.name}`);
                } else if (action.type == "gamestart" && game.clients.users.length >= 4) {
                    this.start();
                }
                break;
            case "start" :break;
            case "roles" :break;
            case "sleep" :break;
            case "mafia" : {
                if (action.message && user.role == "mafia") {
                    this.mafia(action.message);
                }
            } break;
            case "doctor" : {
                if (action.message && user.role == "doctor") {
                    this.doctor(action.message);
                }
            } break;
            case "police" : {
                if (action.message && user.role == "police") {
                    this.police(action.message, user);
                }
            } break;
            case "voting" : {
                if (action.message) {
                    this.voting(action.message, user);
                }
            } break;
            case "voted" :break;
            case "finnish" :break;
            default:
                
            }
        },

        start : function() {
            game.state = game.states[1];

            game.clients.broadcast("Игра началась!");

            game.events.setRoles();

            game.clients.broadcast({
                type : "info",
                data : clients.users.map((user) => {
                    return {
                        name : user.name,
                        role : user.role
                    };
                })
            });

            game.state = game.states[3];

            this.sleep();
        },
        sleep: function() {
            game.clients.broadcast("Город засыпает...");
            game.clients.broadcast("Просыпается мафия и делает свой выбор...");
            game.clients.broadcast(`Делайте свой выбор: ${  clients.users.filter(u => u.role !== "mafia" && u.status != "dead").map(u => u.name).join(', ')}`, "mafia");

            game.state = game.states[4];
        },
        setRoles : function() {
            console.log("setRoles");

            game.state = game.states[2];

            let c = game.clients.users.length;
            let roles = [];

            if (c <= 4) {
                roles.push("police", "mafia", "doctor", "civil");
            } else {
                throw Error("игроков должно быть минимум 4");
            }
            if (c > 4) {
                for (let i = c - roles.length; i >= 0; i--) {
                    roles.push("civil");
                }
            }

            console.log(roles);
            roles.sort(() => { return 0.5 - Math.random() });
            console.log(roles);

            game.clients.users.forEach((user) => {
                user.role = roles.pop();
            });

            console.log(game.clients.users.map((u) => {
 return { name : u.name, role : u.role }
 ;}));

            game.clients.users.forEach((u) => {
                u.send(`Ваша роль: ${  u.role}`);
            });
        },
        mafia : function(message) {
            // console.log(message, )
            // game.state = game.states[4];
            let d = clients.users.find((u) => {return u.name == message});
            d.status = "dead";

            game.queue.push(`Ночью был убит ${  d.name}`);

            // game.clients.broadcast("Ночью был убит " + d.name);


            game.state = game.states[5];

            if (game.checkRoles()) {
                game.clients.broadcast("Просыпается доктор и делает свой выбор...");
                game.clients.broadcast(`Делайте свой выбор: ${  clients.users.filter(u => u.status != "dead").map(u => u.name).join(', ')}`, "doctor");
            } else {
                this.doctor();
            }
        },
        doctor : function(message) {
            // console.log(message, )
            // game.state = game.states[4];

            if (message) {
                let d = game.clients.findUser(message);
                d.status = "cured";
                game.queue.push(`Ночью был вылечен ${  d.name}`);
                game.state = game.states[6];
            }

            if (game.checkRoles()) {
                game.clients.broadcast("Просыпается шериф и делает свой выбор...");
                game.clients.broadcast(`Делайте свой выбор: ${  game.clients.users.filter(u => u.status != "dead").map(u => u.name).join(', ')}`, "police");
            } else {
                this.beforeVoting();
            }
        },
        police : function(message, user) {
            // console.log(message, )
            // game.state = game.states[4];
            let d = game.clients.findUser(message);
            // d.status = "";


            let ans = d.role == "mafia" ? "мафия!" : "не мафия";
            // game.clients.broadcast("Ночью был убит " + d.name);
            user.send(`${d.name  } - ${  ans}`);
            game.state = game.states[7];

            this.beforeVoting();
        },
        beforeVoting : function() {
            game.queue.forEach((m) => {
                game.clients.broadcast(m);
            });

            game.queue = [];

            game.clients.broadcast(`Голосуем за игрока кто может быть мафией: ${  game.clients.users.filter(u => u.status != "dead").map(u => u.name)}`, "alive");

            game.state = game.states[8];
        },

        voting : function(message, user) {
            if (!game.voting[user.name]) {
                let goal = game.clients.findUser(message);
                if (goal) {
                    game.voting[user.name] = message;
                    game.voting._length++;
                } else {
                    user.send("Такого игрока нет, повторите");
                }
            } else {
                user.send("Вы уже проголосовали, ожидайте");
            }

            if (game.voting._length === game.clients.users.filter((u) => {return u.status != "dead"}).length) {
                game.state = game.states[9];
                this.voted();
            }
        },

        voted : function() {
            let results = [];
            let dead = null;

            console.log(game.voting);

            game.clients.users.filter((u) => {return u.status != "dead"}).forEach((u) => {
                let name = u.name;
                let vote = game.voting[name];

                let user = results.find((u) => {return u.name == vote});

                console.log(name, vote, user);

                if (user) {
                    user.count++;
                } else {
                    results.push({ name : vote, count: 1 });
                }
            });

            game.voting = {
                _length: 0
            };

            console.log(results);

            results.forEach((u) => {
                dead = !dead ? u : dead.count < u.count ? u : dead;
            });

            if (results.some((u) => {
                return u != dead && u.count == dead.count;
            })) {
                game.clients.broadcast("На голосовании совпали голоса и никто не выбывает");
            } else {
                console.log(dead);

                dead = game.clients.findUser(dead.name);

                dead.status = "dead";

                game.clients.broadcast(`На голосовании был выбран и убит ${  dead.name}`);
            }


            if (game.isFinnished()) {
                game.clients.broadcast(`Победили ${  game.whoWon()}`);

                this.finnish();
            } else {
                this.sleep();
            }
        },

        finnish : function() {

        }


    }
};

console.log("server");

wss.on("connection", (ws) => {
    let u = clients.addUser(ws);

    console.log(clients.users.map((u) => {return u.name;}));

    ws.on("message", (message) => {
        let action = JSON.parse(message);

        console.log(u.name, action);

        game.events.userAction(u, action);
    });
});

wss.on("close", (ws) => {
    // clients.removeUser(ws);
    clients.broadcast("кто то вышел");
});
