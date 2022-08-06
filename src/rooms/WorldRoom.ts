import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";
import StaticCircleEntity from "./schema/StaticCircleEntity";
import StaticRectangleEntity from "./schema/StaticRectangleEntity";

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

        for (let i = 0; i < 50; i++) {
            if (Math.random() >= 0.5) {
                let staticCircleEntity = new StaticCircleEntity(
                    this._generateCoordinate(),
                    this._generateCoordinate(),
                    "jkl" + i
                );
                this.state.staticCircleEntities.set(
                    staticCircleEntity.id,
                    staticCircleEntity
                );
            } else {
                let staticRectangleEntity = new StaticRectangleEntity(
                    this._generateCoordinate(),
                    this._generateCoordinate(),
                    "jkl" + i
                );
                this.state.staticRectangleEntities.set(
                    staticRectangleEntity.id,
                    staticRectangleEntity
                );
            }
        }

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

        if (options.test !== true) {
            console.log(`WorldRoom ${this.roomId} created.`);
        }
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
                    if (
                        this.circleCircleCollision(currentHexTank, nextHexTank)
                    ) {
                        currentHexTank.collisionBody.collided = true;
                    }
                }
            });

            this.state.staticCircleEntities.forEach((staticCircleEntity) => {
                if (
                    this.circleCircleCollision(
                        currentHexTank,
                        staticCircleEntity
                    )
                ) {
                    currentHexTank.collisionBody.collided = true;
                }
            });
            if (currentHexTank.collisionBody.collisionPositions.length > 0) {
                let newPosition =
                    currentHexTank.collisionBody.getMaxCollisionPosition();
                currentHexTank.x = newPosition.x;
                currentHexTank.z = newPosition.z;
            }

            this.state.staticRectangleEntities.forEach(
                (staticRectangleEntity) => {
                    if (
                        this.circleRectangleCollision(
                            currentHexTank,
                            staticRectangleEntity
                        )
                    ) {
                        //currentHexTank.collisionBody.collided = true;
                    }
                }
            );
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

    circleCircleCollision(a: HexTank, b: HexTank | StaticCircleEntity) {
        let distanceX = b.x - a.x;
        let distanceZ = b.z - a.z;

        let distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        let radiiSum = a.collisionBody.radius + b.collisionBody.radius;

        let angle = Math.atan2(distanceZ, distanceX);

        if (distance <= radiiSum) {
            let newPosition = {
                x: b.x - (radiiSum + 0.01) * Math.cos(angle),
                z: b.z - (radiiSum + 0.01) * Math.sin(angle),
            };
            a.collisionBody.collisionPositions.push(newPosition);

            return true;
        } else {
            return false;
        }
    }

    circleRectangleCollision(a: HexTank, b: StaticRectangleEntity) {
        let distanceX = b.x - a.x;
        let distanceZ = b.z - a.z;

        let distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        let radiiSum = a.collisionBody.radius + b.collisionBody.width;

        let angle = Math.atan2(distanceZ, distanceX);

        if (distance <= radiiSum) {
            /* let newPosition = {
                x: b.x - (radiiSum + 0.01) * Math.cos(angle),
                z: b.z - (radiiSum + 0.01) * Math.sin(angle),
            };
            a.collisionBody.collisionPositions.push(newPosition); */

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
