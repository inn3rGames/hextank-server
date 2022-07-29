import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";
import CollisionBody from "./schema/CollisionBody";

export default class WorldRoom extends Room<WorldState> {
    maxClients: number = 25;
    autoDispose = false;

    private _worldSize: number = 500;

    private _fpsLimit: number = 60;
    private _fixedFrameDuration: number = 1000 / this._fpsLimit;
    private _elapsedTime: number = Math.round(this._fixedFrameDuration);
    private _resetElapsedTime: boolean = true;

    private _commandsPerFrame = 10;

    onCreate(options: any) {
        this.setState(new WorldState());

        this.onMessage("command", (client, command) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);

            if (
                currentHexTank.commands.length < this._commandsPerFrame &&
                typeof command === "string"
            ) {
                currentHexTank.commands.push(command);
            }
        });

        this.setSimulationInterval((delta) => {
            this._updateWorld(delta);
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

    private _fixedUpdate() {
        this.state.hexTanks.forEach((currentHexTank) => {
            currentHexTank.update();
            this.state.hexTanks.forEach((nextHexTank) => {
                if (currentHexTank.id !== nextHexTank.id) {
                    currentHexTank.collisionBody.collided =
                        this.circleCollision(currentHexTank, nextHexTank);
                }
            });
        });
    }

    private _updateWorld(delta: number) {
        this._elapsedTime += delta;

        if (
            Math.abs(this._elapsedTime) >= 200 ||
            this._resetElapsedTime === true
        ) {
            this._resetElapsedTime = false;
            this._elapsedTime = Math.round(this._fixedFrameDuration);
        }

        while (this._elapsedTime >= this._fixedFrameDuration) {
            this._elapsedTime -= this._fixedFrameDuration;
            this._fixedUpdate();
        }
    }

    circleCollision(a: HexTank, b: HexTank) {
        let distanceX =
            a.x + a.collisionBody.radius - (b.x + b.collisionBody.radius);
        let distanceZ =
            a.z + a.collisionBody.radius - (b.z + b.collisionBody.radius);

        let distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        let radiiSum = a.collisionBody.radius + b.collisionBody.radius;

        let unitX = distanceX / distance;
        let unitZ = distanceZ / distance;

        if (distance <= radiiSum) {
            a.x = b.x + radiiSum * unitX;
            a.z = b.z + radiiSum * unitZ;
            return true;
        } else {
            return false;
        }
    }

    private _logMovement(currentHexTank: HexTank) {
        console.log(`HexTank ${currentHexTank.id} moved to: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
            angle: currentHexTank.angle,
        });
    }
}
