import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import { matchMaker } from "colyseus";
import WorldRoom from "./rooms/WorldRoom";

const packageName = process.env.NAME;
const packageVersion = process.env.VERSION;
const roomType = process.env.ROOM_TYPE;

export default Arena({
    getId: () => "HexTank Server",

    initializeGameServer: (gameServer) => {
        console.log(`${packageName} version: ${packageVersion}`);

        gameServer.define("world_room", WorldRoom);
        matchMaker.createRoom("world_room", {});
    },

    initializeExpress: (app) => {
        app.get("/", (req, res) => {
            res.send(
                `${packageName} version: ${packageVersion} room type: ${roomType} ready!`
            );
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
