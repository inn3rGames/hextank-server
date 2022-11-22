import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import { matchMaker } from "colyseus";
import WorldRoom from "./rooms/WorldRoom";
import pkg from "../package.json";

export default Arena({
    getId: () => "HexTank Server",

    initializeGameServer: (gameServer) => {
        gameServer.define("world_room", WorldRoom);
        matchMaker.createRoom("world_room", {});
    },

    initializeExpress: (app) => {
        const packageName = pkg.name;
        const packageVersion = pkg.version;
        console.log(`${packageName} version: ${packageVersion}`);

        app.get("/", (req, res) => {
            res.send("HexTank Server ready!");
        });

        const name = process.env.NAME;
        const pass = process.env.PASS;
        function customAuthorizer(inputName: any, inputPass: any): boolean {
            const username = inputName.toString();
            const password = inputPass.toString();
            const isUser = basicAuth.safeCompare(username, name);
            const isPass = basicAuth.safeCompare(password, pass);
            return isUser && isPass;
        }
        const basicAuthMiddleware = basicAuth({
            authorizer: customAuthorizer,
            challenge: true,
        });
        app.use("/panel", basicAuthMiddleware, monitor());
    },

    beforeListen: () => {},
});
