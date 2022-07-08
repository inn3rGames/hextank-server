import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";

export default class WorldRoom extends Room<WorldState> {
    maxClients: number = 25;
    autoDispose = false;
    worldSize: number = 200;

    onCreate(options: any) {
        this.setState(new WorldState());

        this.onMessage("moveHexTank", (client, data) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);
            currentHexTank.x = data.x;
            currentHexTank.z = data.z;
            console.log(`HexTank ${currentHexTank.id} moved to: `, {
                x: currentHexTank.x,
                z: currentHexTank.z,
            });
        });

        console.log(`WorldRoom ${this.roomId} created.`);
    }

    onJoin(client: Client, options: any) {
        let currentHexTank = new HexTank(
            this.generateCoordinate(),
            this.generateCoordinate(),
            client.sessionId
        );

        this.state.hexTanks.set(client.sessionId, currentHexTank);

        console.log(`HexTank ${currentHexTank.id} joined at: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
        });
    }

    onLeave(client: Client, consented: boolean) {
        let currentHexTank = this.state.hexTanks.get(client.sessionId);

        console.log(`HexTank ${currentHexTank.id} left!`);

        this.state.hexTanks.delete(client.sessionId);
    }

    onDispose() {
        console.log(`WorldRoom ${this.roomId} disposed.`);
    }

    generateCoordinate(): number {
        let min = -this.worldSize * 0.5;
        let max = this.worldSize * 0.5;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
