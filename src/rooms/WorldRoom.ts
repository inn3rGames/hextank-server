import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";

export default class WorldRoom extends Room<WorldState> {
    maxClients: number = 25;
    autoDispose = false;

    private _worldSize: number = 200;
    private _speed: number = 0.5;
    private _rotationSpeed: number = 5 * (Math.PI / 180);

    onCreate(options: any) {
        this.setState(new WorldState());

        this.onMessage("moveHexTank", (client, data) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);
            currentHexTank.x = data.x;
            currentHexTank.z = data.z;
            this._logMovement(currentHexTank);
        });

        this.onMessage("up", (client) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);
            currentHexTank.x -= this._speed * Math.cos(currentHexTank.angle);
            currentHexTank.z -= this._speed * -Math.sin(currentHexTank.angle);
            this._logMovement(currentHexTank);
        });

        this.onMessage("down", (client) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);
            currentHexTank.x += this._speed * Math.cos(currentHexTank.angle);
            currentHexTank.z += this._speed * -Math.sin(currentHexTank.angle);
            this._logMovement(currentHexTank);
        });

        this.onMessage("left", (client) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);

            currentHexTank.angle = this._positiveAngle(
                currentHexTank.angle,
                -1
            );

            this._logMovement(currentHexTank);
        });

        this.onMessage("right", (client) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);

            currentHexTank.angle = this._positiveAngle(currentHexTank.angle, 1);

            this._logMovement(currentHexTank);
        });

        console.log(`WorldRoom ${this.roomId} created.`);
    }

    onJoin(client: Client, options: any) {
        let currentHexTank = new HexTank(
            this._generateCoordinate(),
            this._generateCoordinate(),
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

    private _generateCoordinate(): number {
        let min = -this._worldSize * 0.5;
        let max = this._worldSize * 0.5;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private _positiveAngle(angle: number, direction: number): number {
        let computeAngle = angle;
        computeAngle += this._rotationSpeed * direction;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    private _logMovement(currentHexTank: HexTank) {
        console.log(`HexTank ${currentHexTank.id} moved to: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
            angle: currentHexTank.angle,
        });
    }
}
