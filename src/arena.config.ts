import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import { matchMaker } from "colyseus";
import WorldRoom from "./rooms/WorldRoom";

export default Arena({
    getId: () => "HexTank Server",

    initializeGameServer: (gameServer) => {
        gameServer.define("world_room", WorldRoom);
        matchMaker.createRoom("world_room", {});
    },

    initializeExpress: (app) => {
        const packageName = process.env.NAME;
        const packageVersion = process.env.VERSION;
        console.log(`${packageName} version: ${packageVersion}`);

        app.get("/", (req, res) => {
            res.send("HexTank Server ready!");
        });

        const name = process.env.PANEL_NAME;
        const pass = process.env.PANEL_PASS;
        const users: { [key: string]: string } = {};
        users[name] = pass;
        const basicAuthMiddleware = basicAuth({
            users,
            challenge: true,
        });
        app.use("/panel", basicAuthMiddleware, monitor());
    },

    beforeListen: () => {},
});
