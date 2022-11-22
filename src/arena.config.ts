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

        function customAuthorizer(inputName: any, inputPass: any): boolean {
            const envName = process.env.NAME;
            const envPass = process.env.PASS;
            const processedName = inputName.toString();
            const processedPass = inputPass.toString();
            let isUser = false;
            let isPass = false;
            if (
                envName.includes(processedName) &&
                envName.length === processedName.length
            ) {
                isUser = true;
            }
            if (
                envPass.includes(processedPass) &&
                envPass.length === processedPass.length
            ) {
                isPass = true;
            }
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
