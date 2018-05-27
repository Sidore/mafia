import clients from "./client";
import states from "./models/gameStates";
import roles from "./models/userStates";
import gameConfig from "./config/game.config";

let game = {
    states : states,
    state : states.IDLE,
    roles : roles,
    clients : clients,
    queue : [],
    voting : {
        _length: 0
    },
    constats: gameConfig,
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
    events : {
        userAction: function(user, action) {
            console.log("game.state", game.state);
            console.log("action", action);
            switch (game.state) {
            case "idle" :
                if (action.type === "auth" && action.message) {
                    user.name = action.message;
                    game.clients.broadcast(`Новый игрок ${user.name}`);
                } else if (action.type === "gamestart" && game.clients.users.length >= this.constats.requiredToPlay) {
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

            if (length >= this.constats.requiredToPlay) {
                roles.push("police", "mafia", "doctor", "civil");
            } else {
                throw Error("игроков должно быть минимум 4");
            }
            if (length > this.constats.requiredToPlay) {
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

            console.log(game.clients.users.map((u) => {
                return { name : u.name, role : u.role }
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
                game.state = game.states.BEFORE_VOTING;
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
            let suspect = game.clients.findUser(message);
            let ans = suspect.role === "mafia" ? "мафия!" : "не мафия";
            user.send(`${suspect.name} - ${ans}`);
            game.state = game.states.BEFORE_VOTING;

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

let Game = function(){

};

Game.prototype.isFinnished = function() {
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
};

Game.prototype.whoWon = function() {
    return this.clients.users.some((user) => {
        return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
    }) ? "civil" : "mafia";
};

Game.prototype.checkRoles = function(role) {
    let user = this.clients.findUserByRole(role);
    return user.status !== "dead";
};

export default Game;

