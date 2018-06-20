
const chalk = require("chalk");
class User {
    constructor(ws, counter, logger) {
        this.ws = ws;
        this.name = `user ${counter}`;
        this.role = "none";
        this.status = "alive";
        this.logger = logger;
    }
    send(message) {
        console
            .log(`${chalk.black.bgBlueBright(` User ${ this.name } `)}`, `got message: ${chalk.blueBright(message)}`);
        this.ws.send(message);
    }
    changeStatus(to) {
        console
            .log(`${chalk.black.bgBlueBright(` User ${ this.name } `)}`, `status: ${chalk.blueBright(this.status)} --> ${chalk.blueBright(to)}`);
        this.status = to;
    }
    changeName(to) {
        console
            .log(`${chalk.black.bgBlueBright(` User ${ this.name } `)}`, `name: ${chalk.blueBright(this.name)} --> ${chalk.blueBright(to)}`);
        this.name = to;
    }
    changeRole(to) {
        console
            .log(`${chalk.black.bgBlueBright(` User ${ this.name } `)}`, `role: ${chalk.blueBright(this.role)} --> ${chalk.blueBright(to)}`);
        this.role = to;
    }
}

module.exports = User;
