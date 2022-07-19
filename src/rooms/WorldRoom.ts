import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";

export default class WorldRoom extends Room<WorldState> {
    maxClients: number = 25;
    autoDispose = false;

    private _worldSize: number = 200;
    private _speed: number = 0.5;
    private _rotationSpeed: number = 5 * (Math.PI / 180);

    private _fpsLimit: number = 60;
    private _fixedFrameDuration: number = 1000 / this._fpsLimit;
    private _elapsedTime: number = Math.round(this._fixedFrameDuration);
    private _resetElapsedTime: boolean = true;

    private _commandsLimits = 10;

    onCreate(options: any) {
        this.setState(new WorldState());

        this.onMessage("command", (client, command) => {
            let currentHexTank = this.state.hexTanks.get(client.sessionId);

            if (currentHexTank.commands.length < this._commandsLimits) {
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

    private _positiveAngle(angle: number): number {
        let computeAngle = angle;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    private _rotateHexTank(currentHexTank: HexTank, direction: number) {
        let computeAngle = currentHexTank.angle;
        computeAngle += this._rotationSpeed * direction;
        computeAngle = this._positiveAngle(computeAngle);
        currentHexTank.angle = computeAngle;
    }

    private _moveHexTank(currentHexTank: HexTank, direction: number) {
        currentHexTank.x +=
            this._speed * Math.cos(currentHexTank.angle) * direction;
        currentHexTank.z +=
            this._speed * -Math.sin(currentHexTank.angle) * direction;
    }

    private _fixedUpdate() {
        this.state.hexTanks.forEach((currentHexTank) => {
            let currentCommand;
            while (
                typeof (currentCommand = currentHexTank.commands.shift()) !==
                "undefined"
            ) {
                if (currentCommand === "up") {
                    this._moveHexTank(currentHexTank, -1);
                    this._logMovement(currentHexTank);
                }

                if (currentCommand === "down") {
                    this._moveHexTank(currentHexTank, 1);
                    this._logMovement(currentHexTank);
                }

                if (currentCommand === "left") {
                    this._rotateHexTank(currentHexTank, -1);
                    this._logMovement(currentHexTank);
                }

                if (currentCommand === "right") {
                    this._rotateHexTank(currentHexTank, 1);
                    this._logMovement(currentHexTank);
                }
            }
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

    private _logMovement(currentHexTank: HexTank) {
        console.log(`HexTank ${currentHexTank.id} moved to: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
            angle: currentHexTank.angle,
        });
    }
}
