const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 8081 });
const path = require("path");
const Vue = require("vue");
const express = require("express");
const server = express();
const fs = require("fs");
const serverBundle = require("../dist/vue-ssr-server-bundle.json");
const clientManifest = require("../dist/vue-ssr-client-manifest.json");
const serverRenderer = require("vue-server-renderer");
const errorCodes = {
    notFound : 404,
    intervalError : 500
};
const PORT = 8082;
const renderer = serverRenderer.createBundleRenderer(serverBundle, {
    runInNewContext: false,
    clientManifest,
    template: fs.readFileSync("static/html/index.template.html", "utf-8")
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
            if (err.code === errorCodes.notFound) {
                let notFound = fs.readFileSync("static/html/404.template.html", "utf-8");
                res.status(errorCodes.notFound).end(notFound);
            } else {
                let serverError = fs.readFileSync("static/html/500.template.html", "utf-8");
                res.status(errorCodes.intervalError).end(serverError);
            }
        } else {
            res.end(html);
        }
    });
});

server.listen(PORT);

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

let game = {
    states : { IDLE : "idle",
        START : "start",
        ROLES : "roles",
        SLEEP : "sleep",
        MAFIA : "mafia",
        DOCTOR : "doctor",
        POLICE : "police",
        BEFORE_VOTING : "beforevoting",
        VOTING : "voting",
        VOTED : "voted",
        FINNISH : "finnish" },
    state : "idle",
    roles : { CIVIL : "civil", POLICE : "police", MAFIA : "mafia", DOCTOR : "doctor" },
    clients,
    voting : {
        _length: 0
    },
    constats: {
        requiredToPlay : 4,
        requiredToContinue : 2
    },
    isFinnished : function() {
        return !(this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
        }) && this.clients.users.some((user) => {
            return user.status !== "dead" && user.role === "mafia";
        })) || this.clients.users.length === this.constats.requiredToContinue && this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor") &&
            this.clients.users.some((userIn) => {
                return userIn.status !== "dead" && userIn.role === "mafia";
            });
        });
    },
    whoWon : function() {
        return this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
        }) ? "civil" : "mafia";
    },
    checkRoles : function(role) {
        let user = this.clients.findUserByRole(role);
        return user.status !== "dead";
    },
    queue : [],
    events : {
        userAction: function(user, action) {
            console.log("game.state", game.state);
            console.log("action", action);
            switch (game.state) {
            case "idle" :
                if (action.type === "auth" && action.message) {
                    user.name = action.message;
                    game.clients.broadcast(`Новый игрок ${user.name}`);
                } else if (action.type === "gamestart" && game.clients.users.length >= game.constats.requiredToPlay) {
                    this.start();
                }
                break;
            case "start" :break;
            case "roles" :break;
            case "sleep" :break;
            case "mafia" :
                if (action.message && user.role === "mafia") {
                    this.mafia(action.message);
                }
                break;
            case "doctor" :
                if (action.message && user.role === "doctor") {
                    this.doctor(action.message);
                }
                break;
            case "police" :
                if (action.message && user.role === "police") {
                    this.police(action.message, user);
                }
                break;
            case "voting" :
                if (action.message) {
                    this.voting(action.message, user);
                }
                break;
            case "voted" :break;
            case "finnish" :break;
            default:
            }
        },

        start : function() {
            game.state = game.states.IDLE;

            game.clients.broadcast("Игра началась!");
            game.clients.broadcast({
                type : "gamestart",
                data: "Игра началась!"
            });

            game.clients.forEach((client) => {
                client.status = "alive";
            });

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

            game.state = game.states.SLEEP;

            this.sleep();
        },
        sleep: function() {
            let chooseList = clients.users.filter((user) => {
                return user.role !== "mafia" && user.status !== "dead";
            }).map((user) => {
                return user.name;
            });

            game.clients.broadcast("Город засыпает...");
            game.clients.broadcast("Просыпается мафия и делает свой выбор...");
            game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "mafia");
            game.clients.broadcast({
                type: "option",
                data : clients.users.filter((user) => {
                    return user.role !== "mafia" && user.status !== "dead";
                }).map((user) => {
                    return user.name;
                })
            }, "mafia");
            game.state = game.states.MAFIA;
        },
        setRoles : function() {
            console.log("setRoles");

            game.state = game.states.ROLES;

            let length = game.clients.users.length;
            let roles = [];

            if (length >= game.constats.requiredToPlay) {
                roles.push("police", "mafia", "doctor", "civil");
            } else {
                throw Error("игроков должно быть минимум 4");
            }
            if (length > game.constats.requiredToPlay) {
                for (let count = length - roles.length; count > 0; count--) {
                    roles.push("civil");
                }
            }

            console.log(roles);
            roles.sort(() => {
                return 0.5 - Math.random();
            });
            console.log(roles);

            game.clients.users.forEach((user) => {
                user.role = roles.pop();
            });

            console.log(game.clients.users.map((user) => {
                return { name : user.name, role : user.role }
                ;
            }));

            game.clients.users.forEach((user) => {
                user.send(`Ваша роль: ${user.role}`);
            });
        },
        mafia : function(message) {
            // console.log(message, )
            // game.state = game.states[4];
            let victim = clients.users.find((user) => {
                return user.name === message;
            });
            victim.status = "shooted";

            game.queue.push(`Ночью был убит ${victim.name}`);

            game.state = game.states.DOCTOR;

            if (game.checkRoles("doctor")) {
                let chooseList = clients.users.filter((user) => {
                    return user.status !== "dead";
                }).map((user) => {
                    return user.name;
                });

                game.clients.broadcast("Просыпается доктор и делает свой выбор...");
                game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "doctor");
                game.clients.broadcast({
                    type: "option",
                    data : clients.users.filter((user) => {
                        return user.status !== "dead";
                    }).map((user) => {
                        return user.name;
                    })
                }, "doctor");
            } else {
                game.state = game.states.POLICE;
                this.doctor();
            }
        },
        doctor : function(message) {
            // console.log(message, )
            // game.state = game.states[4];

            if (message) {
                let cured = game.clients.findUser(message);
                cured.status = "cured";
                game.queue.push(`Ночью был вылечен ${cured.name}`);
                game.state = game.states.POLICE;
            }

            if (game.checkRoles("police")) {
                let chooseList = game.clients.users.filter((user) => {
                    return user.status !== "dead" && user.role !== "police";
                }).map((user) => {
                    return user.name;
                });

                game.clients.broadcast("Просыпается шериф и делает свой выбор...");
                game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "police");
                game.clients.broadcast({
                    type: "option",
                    data : clients.users.filter((user) => {
                        return user.status !== "dead" && user.role !== "police";
                    }).map((user) => {
                        return user.name;
                    })
                }, "police");
            } else {
                game.state = game.states.BEFORE_VOTING;
                this.beforeVoting();
            }
        },
        police : function(message, user) {
            game.state = game.states.POLICE;
            let suspect = game.clients.findUser(message);
            let ans = suspect.role === "mafia" ? "мафия!" : "не мафия";
            user.send(`${suspect.name} - ${ans}`);

            this.beforeVoting();
        },
        beforeVoting : function() {
            game.queue.forEach((message) => {
                game.clients.broadcast(message);
            });

            game.clients.forEach((client) => {
                if (client.status === "shooted") {
                    client.status = "dead";
                }

                if (client.status === "cured") {
                    client.status = "alive";
                }
            });

            game.clients.broadcast({
                type : "info",
                data : clients.users.filter((user) => {
                    return user.status !== "dead";
                }).map((user) => {
                    return {
                        name : user.name,
                        role : user.role
                    };
                })
            });

            game.queue = [];

            let chooseList = game.clients.users.filter((user) => {
                return user.status !== "dead";
            }).map((user) => {
                return user.name;
            });

            game.clients.broadcast(`Голосуем за игрока кто может быть мафией: ${chooseList}`, "alive");
            game.clients.broadcast({
                type : "option",
                data : game.clients.users.filter((us) => {
                    return us.status !== "dead";
                }).map((us) => {
                    return us.name;
                })
            }, "alive");
            game.state = game.states.VOTING;
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

            if (game.voting._length === game.clients.users.filter((client) => {
                return client.status !== "dead";
            }).length) {
                game.state = game.states.VOTED;
                this.voted();
            }
        },

        voted : function() {
            let results = [];
            let dead = null;

            console.log(game.voting);

            game.clients.users.filter((user) => {
                return user.status !== "dead";
            }).forEach((user) => {
                let name = user.name;
                let vote = game.voting[name];

                let suspect = results.find((client) => {
                    return client.name === vote;
                });

                console.log(name, vote, suspect);

                if (suspect) {
                    suspect.count++;
                } else {
                    results.push({ name : vote, count: 1 });
                }
            });

            game.voting = {
                _length: 0
            };

            console.log(results);

            results.forEach((user) => {
                dead = !dead ? user : dead.count < user.count ? user : dead;
            });

            if (results.some((user) => {
                return user !== dead && user.count === dead.count;
            })) {
                game.clients.broadcast("На голосовании совпали голоса и никто не выбывает");
            } else {
                console.log(dead);

                dead = game.clients.findUser(dead.name);

                dead.status = "dead";

                game.clients.broadcast(`На голосовании был выбран и убит ${dead.name}`);
            }

            game.clients.broadcast({
                type : "info",
                data : clients.users.filter((user) => {
                    return user.status !== "dead";
                }).map((user) => {
                    return {
                        name : user.name,
                        role : user.role
                    };
                })
            });

            if (game.isFinnished()) {
                game.clients.broadcast(`Победили ${game.whoWon()}`);

                this.finnish();
            } else {
                this.sleep();
            }
        },

        finnish : function() {
            this.start();
        }


    }
};

console.log("server 8082");

wss.on("connection", (ws) => {
    let user = clients.addUser(ws);

    console.log(clients.users.map((client) => {
        return client.name;
    }));

    ws.on("message", (message) => {
        let action = JSON.parse(message);

        console.log(user.name, action);

        game.events.userAction(user, action);
    });
});

wss.on("close", (ws) => {
    // clients.removeUser(ws);
    clients.broadcast("кто то вышел");
});
