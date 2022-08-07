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

    private _circleCircleCollision(
        circleA: HexTank,
        circleB: HexTank | StaticCircleEntity
    ) {
        let distanceX = circleB.x - circleA.x;
        let distanceZ = circleB.z - circleA.z;

        let distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        let radiiSum =
            circleA.collisionBody.radius + circleB.collisionBody.radius;

        let angle = Math.atan2(distanceZ, distanceX);

        if (distance <= radiiSum) {
            let newPosition = {
                x: circleB.x - (radiiSum + 0.01) * Math.cos(angle),
                z: circleB.z - (radiiSum + 0.01) * Math.sin(angle),
            };
            circleA.addCollisionResponse(newPosition);

            return true;
        } else {
            return false;
        }
    }

    private _clamp(min: number, currentValue: number, max: number): number {
        return Math.min(Math.max(currentValue, min), max);
    }

    private _circleRectangleCollision(
        circle: HexTank,
        rectangle: StaticRectangleEntity
    ) {
        let closestPointX = this._clamp(
            rectangle.x - rectangle.collisionBody.width * 0.5,
            circle.x,
            rectangle.x + rectangle.collisionBody.width * 0.5
        );
        let closestPointZ = this._clamp(
            rectangle.z - rectangle.collisionBody.height * 0.5,
            circle.z,
            rectangle.z + rectangle.collisionBody.height * 0.5
        );

        let distanceX = closestPointX - circle.x;
        let distanceZ = closestPointZ - circle.z;

        let distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);

        let angle = Math.atan2(distanceZ, distanceX);

        let depth = circle.collisionBody.radius - distance;

        if (distance <= circle.collisionBody.radius) {
            if (closestPointX === circle.x && closestPointZ === circle.z) {
                if (circle.x > rectangle.x) {
                    closestPointX =
                        rectangle.x + rectangle.collisionBody.width * 0.5;
                } else {
                    closestPointX =
                        rectangle.x - rectangle.collisionBody.width * 0.5;
                }

                if (circle.z > rectangle.z) {
                    closestPointZ =
                        rectangle.z + rectangle.collisionBody.height * 0.5;
                } else {
                    closestPointZ =
                        rectangle.z - rectangle.collisionBody.height * 0.5;
                }

                distanceX = closestPointX - circle.x;
                distanceZ = closestPointZ - circle.z;
                distance = Math.sqrt(
                    distanceX * distanceX + distanceZ * distanceZ
                );
                depth = circle.collisionBody.radius - distance;
            }

            let newPosition = {
                x: circle.x - (depth + 0.01) * Math.cos(angle),
                z: circle.z - (depth + 0.01) * Math.sin(angle),
            };
            circle.addCollisionResponse(newPosition);

            return true;
        } else {
            return false;
        }
    }

    private _checkHexTanksCollisions(currentHexTank: HexTank) {
        this.state.hexTanks.forEach((nextHexTank) => {
            if (currentHexTank.id !== nextHexTank.id) {
                if (this._circleCircleCollision(currentHexTank, nextHexTank)) {
                    currentHexTank.collisionBody.collided = true;
                }
            }
        });
    }
    private _checkStaticCirclesCollisons(currentHexTank: HexTank) {
        this.state.staticCircleEntities.forEach((staticCircleEntity) => {
            if (
                this._circleCircleCollision(currentHexTank, staticCircleEntity)
            ) {
                currentHexTank.collisionBody.collided = true;
            }
        });
    }

    private _checkStaticRectanglesCollisons(currentHexTank: HexTank) {
        this.state.staticRectangleEntities.forEach((staticRectangleEntity) => {
            if (
                this._circleRectangleCollision(
                    currentHexTank,
                    staticRectangleEntity
                )
            ) {
                currentHexTank.collisionBody.collided = true;
            }
        });
    }

    private _fixedUpdate() {
        this.state.hexTanks.forEach((currentHexTank) => {
            currentHexTank.update();

            this._checkHexTanksCollisions(currentHexTank);
            this._checkStaticCirclesCollisons(currentHexTank);
            this._checkStaticRectanglesCollisons(currentHexTank);

            currentHexTank.collisionResponse();
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
