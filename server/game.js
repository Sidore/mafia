import clients from "./client";
import states from "./models/gameStates";
import roles from "./models/userStates";
import gameConfig from "./config/game.config";
import gameEvents from "./models/gameEvents";

let events = {
    userAction: function(user, action) {
        console.log("game.state", this.state);
        console.log("action", action);
        switch (this.state) {
        case "idle" :
            if (action.type === "auth" && action.message) {
                user.name = action.message;
                this.clients.broadcast(`Новый игрок ${user.name}`);
            } else if (action.type === "gamestart" && this.clients.users.length >= this.constats.requiredToPlay) {
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
        this.state = this.states.IDLE;

        this.clients.broadcast("Игра началась!");
        this.clients.broadcast({
            type : "gamestart",
            data: "Игра началась!"
        });

        this.clients.forEach((client) => {
            client.status = "alive";
        });

        this.events.setRoles();

        this.clients.broadcast({
            type : "info",
            data : clients.users.map((user) => {
                return {
                    name : user.name,
                    role : user.role
                };
            })
        });

        this.state = this.states.SLEEP;

        this.sleep();
    },
    sleep: function() {
        let chooseList = clients.users.filter((user) => {
            return user.role !== "mafia" && user.status !== "dead";
        }).map((user) => {
            return user.name;
        });

        this.clients.broadcast("Город засыпает...");
        this.clients.broadcast("Просыпается мафия и делает свой выбор...");
        this.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "mafia");
        this.clients.broadcast({
            type: "option",
            data : clients.users.filter((user) => {
                return user.role !== "mafia" && user.status !== "dead";
            }).map((user) => {
                return user.name;
            })
        }, "mafia");
        this.state = this.states.MAFIA;
    },
    setRoles : function() {
        console.log("setRoles");

        this.state = this.states.ROLES;

        let length = this.clients.users.length;
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

        this.clients.users.forEach((user) => {
            user.role = roles.pop();
        });

        console.log(this.clients.users.map((u) => {
            return { name : u.name, role : u.role }
            ;
        }));

        this.clients.users.forEach((user) => {
            user.send(`Ваша роль: ${user.role}`);
        });
    },
    mafia : function(message) {
        // console.log(message, )
        // this.state = this.states[4];
        let victim = clients.users.find((user) => {
            return user.name === message;
        });
        victim.status = "shooted";

        this.queue.push(`Ночью был убит ${victim.name}`);

        this.state = this.states.DOCTOR;

        if (this.checkRoles("doctor")) {
            let chooseList = clients.users.filter((user) => {
                return user.status !== "dead";
            }).map((user) => {
                return user.name;
            });

            this.clients.broadcast("Просыпается доктор и делает свой выбор...");
            this.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "doctor");
            this.clients.broadcast({
                type: "option",
                data : clients.users.filter((user) => {
                    return user.status !== "dead";
                }).map((user) => {
                    return user.name;
                })
            }, "doctor");
        } else {
            this.state = this.states.POLICE;
            this.doctor();
        }
    },
    doctor : function(message) {
        // console.log(message, )
        // this.state = this.states[4];

        if (message) {
            let cured = this.clients.findUser(message);
            cured.status = "cured";
            this.queue.push(`Ночью был вылечен ${cured.name}`);
            this.state = this.states.BEFORE_VOTING;
        }

        if (this.checkRoles("police")) {
            let chooseList = this.clients.users.filter((user) => {
                return user.status !== "dead" && user.role !== "police";
            }).map((user) => {
                return user.name;
            });

            this.clients.broadcast("Просыпается шериф и делает свой выбор...");
            this.clients.broadcast(`Делайте свой выбор: ${chooseList}`, "police");
            this.clients.broadcast({
                type: "option",
                data : clients.users.filter((user) => {
                    return user.status !== "dead" && user.role !== "police";
                }).map((user) => {
                    return user.name;
                })
            }, "police");
        } else {
            this.state = this.states.BEFORE_VOTING;
            this.beforeVoting();
        }
    },
    police : function(message, user) {
        let suspect = this.clients.findUser(message);
        let ans = suspect.role === "mafia" ? "мафия!" : "не мафия";
        user.send(`${suspect.name} - ${ans}`);
        this.state = this.states.BEFORE_VOTING;

        this.beforeVoting();
    },
    beforeVoting : function() {
        this.queue.forEach((message) => {
            this.clients.broadcast(message);
        });

        this.clients.forEach((client) => {
            if (client.status === "shooted") {
                client.status = "dead";
            }

            if (client.status === "cured") {
                client.status = "alive";
            }
        });

        this.clients.broadcast({
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

        this.queue = [];

        let chooseList = this.clients.users.filter((user) => {
            return user.status !== "dead";
        }).map((user) => {
            return user.name;
        });

        this.clients.broadcast(`Голосуем за игрока кто может быть мафией: ${chooseList}`, "alive");
        this.clients.broadcast({
            type : "option",
            data : this.clients.users.filter((us) => {
                return us.status !== "dead";
            }).map((us) => {
                return us.name;
            })
        }, "alive");
        this.state = this.states.VOTING;
    },
    voting : function(message, user) {
        if (!this.voting[user.name]) {
            let goal = this.clients.findUser(message);
            if (goal) {
                this.voting[user.name] = message;
                this.voting._length++;
            } else {
                user.send("Такого игрока нет, повторите");
            }
        } else {
            user.send("Вы уже проголосовали, ожидайте");
        }

        if (this.voting._length === this.clients.users.filter((client) => {
            return client.status !== "dead";
        }).length) {
            this.state = this.states.VOTED;
            this.voted();
        }
    },
    voted : function() {
        let results = [];
        let dead = null;

        console.log(this.voting);

        this.clients.users.filter((user) => {
            return user.status !== "dead";
        }).forEach((user) => {
            let name = user.name;
            let vote = this.voting[name];

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

        this.voting = {
            _length: 0
        };

        console.log(results);

        results.forEach((user) => {
            dead = !dead ? user : dead.count < user.count ? user : dead;
        });

        if (results.some((user) => {
            return user !== dead && user.count === dead.count;
        })) {
            this.clients.broadcast("На голосовании совпали голоса и никто не выбывает");
        } else {
            console.log(dead);

            dead = this.clients.findUser(dead.name);

            dead.status = "dead";

            this.clients.broadcast(`На голосовании был выбран и убит ${dead.name}`);
        }

        this.clients.broadcast({
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

        if (this.isFinnished()) {
            this.clients.broadcast(`Победили ${this.whoWon()}`);

            this.finnish();
        } else {
            this.sleep();
        }
    },
    finnish : function() {
        this.start();
    }
};

class Game {
    constructor() {
        this.states = states;
        this.state = states.IDLE;
        this.roles = roles;
        this.clients = clients;
        this.queue = [];
        this.voting = {
            _length: 0
        };
        this.constats = gameConfig;
        this.events = events;
    }
    isFinnished() {
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
    }
    whoWon() {
        return this.clients.users.some((user) => {
            return user.status !== "dead" && (user.role === "civil" || user.role === "doctor");
        }) ? "civil" : "mafia";
    }
    checkRoles(role) {
        let user = this.clients.findUserByRole(role);
        return user.status !== "dead";
    }
}

export default Game;

