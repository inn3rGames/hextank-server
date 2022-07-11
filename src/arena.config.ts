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
        app.get("/", (req, res) => {
            res.send("HexTank Server ready!");
        });

        const basicAuthMiddleware = basicAuth({
            users: {
                "hex" : "hex",
            },
            challenge: true,
        });
        app.use("/panel", basicAuthMiddleware, monitor());
    },

    beforeListen: () => { },
});
