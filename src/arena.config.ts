import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import WorldRoom from "./rooms/WorldRoom";

export default Arena({
    getId: () => "HexTank server",

    initializeGameServer: (gameServer) => {
        gameServer.define("world_room", WorldRoom);
    },

    initializeExpress: (app) => {
        app.get("/", (req, res) => {
            res.send("HexTank server ready!");
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
