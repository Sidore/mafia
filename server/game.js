const Clients = require("./client");
const states = require("./models/gameStates");
const roles = require("./models/userRoles");
const userStates = require("./models/userStates");
const gameConfig = require("./config/game.config");
const gameEvents = require("./models/gameEvents");
const messages = require("./models/messageStates");
const chalk = require("chalk");

let events = {
    userAction: function(user, action) {
        console.log(
            chalk.black.bgYellow(" Game state "),
            chalk.yellow(this.game.state),
            " from ",
            chalk.black.bgBlueBright(` ${ user.name } `),
            "action:",
            chalk.magenta(action.type),
            "message:",
            chalk.green(action.message)
        );

        switch (this.game.state) {
        case "idle" :
            if (action.type === messages.AUTH && action.message) {
                user.changeName(action.message);

                this.game.clients.broadcast(`Новый игрок ${user.name}`);
            } else if (action.type === messages.GAME_START && this.game.clients.users.length >= gameConfig.requiredToPlay) {
                this.start();
            }
            break;
        case "start" :break;
        case "roles" :break;
        case "sleep" :break;
        case "mafia" :
            if (action.message && user.role === roles.MAFIA) {
                this.mafia(action.message);
            }
            break;
        case "doctor" :
            if (action.message && user.role === roles.DOCTOR) {
                this.doctor(action.message);
            }
            break;
        case "police" :
            if (action.message && user.role === roles.POLICE) {
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
        this.game.changeState(this.game.states.IDLE);
        this.game.clients.broadcast("Игра началась!");
        this.game.clients.broadcast({
            type : messages.GAME_START,
            data: "Игра началась!"
        });

        this.game.clients.forEach((client) => {
            client.status = userStates.ALIVE;
        });

        this.setRoles();

        this.game.clients.broadcast({
            type : messages.INFO,
            data : this.game.clients.users.map((user) => {
                return {
                    name : user.name,
                    role : user.role
                };
            })
        });

        this.game.changeState(this.game.states.SLEEP);

        this.sleep();
    },
    sleep: function() {
        let chooseList = this.game.clients.users.filter((user) => {
            return user.role !== roles.MAFIA && user.status !== userStates.DEAD;
        }).map((user) => {
            return user.name;
        });

        this.game.clients.broadcast("Город засыпает...");
        this.game.clients.broadcast("Просыпается мафия и делает свой выбор...");
        this.game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, roles.MAFIA);
        this.game.clients.broadcast({
            type: messages.OPTION,
            data :  {
                options : this.game.clients.users.filter((user) => {
                    return user.role !== roles.MAFIA && user.status !== userStates.DEAD;
                }).map((user) => {
                    return user.name;
                }),
                optionType : "mafia"
            }
        }, roles.MAFIA);

        this.game.changeState(this.game.states.MAFIA);
    },
    setRoles : function() {
        this.game.changeState(this.game.states.ROLES);

        let length = this.game.clients.users.length;
        let rolesList = [];

        if (length >= gameConfig.requiredToPlay) {
            rolesList.push(roles.POLICE, roles.MAFIA, roles.DOCTOR, roles.CIVIL);
        } else {
            throw Error("игроков должно быть минимум 4");
        }
        if (length > gameConfig.requiredToPlay) {
            for (let count = length - rolesList.length; count; count--) {
                rolesList.push(roles.CIVIL);
            }
        }

        let seed = 0.5;

        console.log(rolesList);
        rolesList.sort(() => {
            return seed - Math.random();
        });
        console.log(rolesList);

        this.game.clients.users.forEach((user) => {
            user.changeRole(rolesList.pop());
        });

        // console.log(this.game.clients.users.map((user) => {
        //     return { name : user.name, role : user.role };
        // }));

        this.game.clients.users.forEach((user) => {
            let mes = JSON.stringify({ type: messages.MESSAGE, data: `Ваша роль: ${user.role}` });
            user.send(mes);
        });
    },
    mafia : function(message) {
        // console.log(message, )
        // this.game.state = this.game.states[4];
        let victim = this.game.clients.users.find((user) => {
            return user.name === message;
        });

        victim.changeStatus(userStates.SHOOTED);

        this.game.queue.push(`Ночью был убит ${victim.name}`);

        this.game.changeState(this.game.states.DOCTOR);

        if (this.game.checkRoles(roles.DOCTOR)) {
            let chooseList = this.game.clients.users.filter((user) => {
                return user.status !== states.DEAD;
            }).map((user) => {
                return user.name;
            });

            this.game.clients.broadcast("Просыпается доктор и делает свой выбор...");
            this.game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, roles.DOCTOR);
            this.game.clients.broadcast({
                type: messages.OPTION,
                data : {
                    options : this.game.clients.users.filter((user) => {
                        return user.status !== states.DEAD;
                    }).map((user) => {
                        return user.name;
                    }),
                    optionType : "doctor"
                }
            }, roles.DOCTOR);
        } else {
            this.game.changeState(this.game.states.POLICE);

            this.doctor();
        }
    },
    doctor : function(message) {
        if (message) {
            let cured = this.game.clients.findUser(message);
            cured.changeStatus(userStates.CURED);
            this.game.queue.push(`Ночью был вылечен ${cured.name}`);
            this.game.changeState(this.game.states.POLICE);
        }

        if (this.game.checkRoles(roles.POLICE)) {
            let chooseList = this.game.clients.users.filter((user) => {
                return user.status !== states.DEAD && user.role !== roles.POLICE;
            }).map((user) => {
                return user.name;
            });

            this.game.clients.broadcast("Просыпается шериф и делает свой выбор...");
            this.game.clients.broadcast(`Делайте свой выбор: ${chooseList}`, roles.POLICE);
            this.game.clients.broadcast({
                type: messages.OPTION,
                data : {
                    options : this.game.clients.users.filter((user) => {
                        return user.status !== states.DEAD && user.role !== roles.POLICE;
                    }).map((user) => {
                        return user.name;
                    }),
                    optionType : "police"
                }
            }, roles.POLICE);
        } else {
            this.game.changeState(this.game.states.BEFORE_VOTING);
            this.beforeVoting();
        }
    },
    police : function(message, user) {
        let suspect = this.game.clients.findUser(message);
        let ans = suspect.role === roles.MAFIA ? "мафия!" : "не мафия";
        let mes = JSON.stringify({ type: messages.MESSAGE, data: `${suspect.name} - ${ans}` });
        user.send(mes);
        this.game.changeState(this.game.states.BEFORE_VOTING);

        this.beforeVoting();
    },
    beforeVoting : function() {
        this.game.queue.forEach((message) => {
            this.game.clients.broadcast(message);
        });

        this.game.clients.forEach((client) => {
            if (client.status === userStates.SHOOTED) {
                client.changeStatus(userStates.DEAD);
            }

            if (client.status === userStates.CURED) {
                client.changeStatus(userStates.ALIVE);
            }
        });

        this.game.clients.broadcast({
            type : messages.INFO,
            data : this.game.clients.users.filter((user) => {
                return user.status !== userStates.DEAD;
            }).map((user) => {
                return {
                    name : user.name,
                    role : user.role
                };
            })
        });

        this.game.queue = [];

        let chooseList = this.game.clients.users.filter((user) => {
            return user.status !== userStates.DEAD;
        }).map((user) => {
            return user.name;
        });

        this.game.clients.broadcast(`Голосуем за игрока кто может быть мафией: ${chooseList}`, userStates.ALIVE);
        this.game.clients.broadcast({
            type : messages.OPTION,
            data : {
                options : this.game.clients.users.filter((us) => {
                    return us.status !== userStates.DEAD;
                }).map((us) => {
                    return us.name;
                }),
                optionType : "voting"
            }
        }, userStates.ALIVE);
        this.game.changeState(this.game.states.VOTING);
    },
    voting : function(message, user) {
        console.log(chalk.cyan(this.game.voting._length + 1) + " / " + chalk.cyanBright(this.game.clients.users.filter((client) => {
            return client.status !== userStates.DEAD;
        }).length));
        if (!this.game.voting[user.name]) {
            let goal = this.game.clients.findUser(message);
            if (goal) {
                this.game.voting[user.name] = message;
                this.game.voting._length++;
            } else {
                user.send("Такого игрока нет, повторите");
            }
        } else {
            user.send("Вы уже проголосовали, ожидайте");
        }

        if (this.game.voting._length === this.game.clients.users.filter((client) => {
            return client.status !== userStates.DEAD;
        }).length) {
            this.game.changeState(this.game.states.VOTED);
            this.voted();
        }
    },
    voted : function() {
        let results = [];
        let dead = null;

        // console.log(this.game.voting);

        this.game.clients.users.filter((user) => {
            return user.status !== userStates.DEAD;
        }).forEach((user) => {
            let name = user.name;
            let vote = this.game.voting[name];

            let suspect = results.find((client) => {
                return client.name === vote;
            });

            if (suspect) {
                suspect.count++;
            } else {
                results.push({ name : vote, count: 1 });
            }
        });

        this.game.voting = {
            _length: 0
        };

        results.forEach((user) => {
            dead = !dead ? user : dead.count < user.count ? user : dead;
        });

        if (results.some((user) => {
            return user !== dead && user.count === dead.count;
        })) {
            this.game.clients.broadcast("На голосовании совпали голоса и никто не выбывает");
        } else {
            // console.log(dead);

            dead = this.game.clients.findUser(dead.name);

            dead.changeStatus(userStates.DEAD);

            this.game.clients.broadcast(`На голосовании был выбран и убит ${dead.name}`);
        }

        this.game.clients.broadcast({
            type : messages.INFO,
            data : this.game.clients.users.filter((user) => {
                return user.status !== userStates.DEAD;
            }).map((user) => {
                return {
                    name : user.name,
                    role : user.role
                };
            })
        });

        if (this.game.isFinnished()) {
            this.game.clients.broadcast(`Победили ${this.game.whoWon()}`);
            this.game.changeState(this.game.states.FINNISH);
            this.finnish();
        } else {
            this.game.changeState(this.game.states.SLEEP);
            this.sleep();
        }
    },
    finnish : function() {
        setTimeout(this.start.bind(this), gameConfig.startGameDelay);
    }
};

class Game {
    constructor() {
        this.states = states;
        this.state = states.IDLE;
        this.roles = roles;
        this.clients = new Clients();
        this.queue = [];
        this.voting = {
            _length: 0
        };
        this.constats = gameConfig;
        this.events = events;
        this.events.game = this;
    }
    isFinnished() {
        let enoughPlayers = this.clients.users.filter((user) => {
            return user.status !== userStates.DEAD;
        }).length > gameConfig.requiredToContinue;

        let mafiaPresence = this.clients.users.some((user) => {
            return user.role === roles.MAFIA;
        });

        return !(enoughPlayers && mafiaPresence);
    }
    whoWon() {
        return this.clients.users.some((user) => {
            return user.status !== userStates.DEAD && user.role === roles.MAFIA;
        }) ? roles.MAFIA : roles.CIVIL;
    }
    checkRoles(role) {
        let user = this.clients.findUserByRole(role);
        return user.status !== userStates.DEAD;
    }

    changeState(to) {
        console.log(`${chalk.black.bgYellow(" Game state ")} : ${chalk.yellow(this.state)} --> ${chalk.yellow(to)}`);
        this.state = to;
    }
}

module.exports = Game;

