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
const chalk = require("chalk");

const GameManager = require("./game");

let game = new GameManager();

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
        if (err) {
            console.warn(req.url, err);

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

console.log(chalk.black.bgGreen(` Server run on http://localhost:${PORT} `));

wss.on("connection", (ws) => {
    let user = game.clients.addUser(ws);

    // console.log("array of users:", game.clients.users.map((client) => {
    //     return client.name;
    // }));

    ws.on("message", (message) => {
        let action = JSON.parse(message);

        game.events.userAction(user, action);
    });
});

wss.on("close", (ws) => {
    // clients.removeUser(ws);
    game.clients.broadcast("кто то вышел");
});
