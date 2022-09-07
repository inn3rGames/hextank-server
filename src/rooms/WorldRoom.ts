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

    private _commandsPerFrame: number = 10;

    private _spatialHash: Map<
        string,
        Array<HexTank | StaticCircleEntity | StaticRectangleEntity>
    > = new Map();

    private _generateCoordinate(): number {
        const min = -this._worldSize * 0.5;
        const max = this._worldSize * 0.5;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private _createMap() {
        const wallWidth = this._worldSize / 5;
        const wallHeight = 10;
        for (let i = 1; i <= 5; i++) {
            new StaticRectangleEntity(
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                -this._worldSize * 0.5 - wallHeight * 0.5,
                wallWidth,
                wallHeight,
                "wall1" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 + wallHeight * 0.5,
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                wallHeight,
                wallWidth,
                "wall2" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                this._worldSize * 0.5 + wallHeight * 0.5,
                wallWidth,
                wallHeight,
                "wall3" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                -this._worldSize * 0.5 - wallHeight * 0.5,
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                wallHeight,
                wallWidth,
                "wall4" + i,
                "wall",
                this.state.staticRectangleEntities
            );
        }

        new StaticRectangleEntity(
            0,
            Math.sqrt(3) * 32 * 0.5,
            50,
            50,
            "pyramid1",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            32,
            -Math.sqrt(3) * 32 * 0.5,
            50,
            50,
            "pyramid2",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -32,
            -Math.sqrt(3) * 32 * 0.5,
            50,
            50,
            "pyramid3",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticCircleEntity(
            -150,
            -150,
            45,
            "oasis1",
            "oasis",
            this.state.staticCircleEntities
        );

        new StaticRectangleEntity(
            150,
            150,
            16.5,
            8.5,
            "building1",
            "building1",
            this.state.staticRectangleEntities
        );
    }

    onCreate(options: any) {
        this.setState(new WorldState());

        this._createMap();

        this.onMessage("command", (client, command) => {
            const currentHexTank = this.state.hexTanks.get(client.sessionId);

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
        const currentHexTank = new HexTank(
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
        const currentHexTank = this.state.hexTanks.get(client.sessionId);

        console.log(`HexTank ${currentHexTank.id} left!`);

        this.state.hexTanks.delete(client.sessionId);
    }

    onDispose() {
        console.log(`WorldRoom ${this.roomId} disposed.`);
    }

    private _circleCircleCollision(
        circleA: HexTank,
        circleB: HexTank | StaticCircleEntity
    ) {
        const distanceX = circleB.x - circleA.x;
        const distanceZ = circleB.z - circleA.z;

        const distance = Math.sqrt(
            distanceX * distanceX + distanceZ * distanceZ
        );
        const radiiSum =
            circleA.collisionBody.radius + circleB.collisionBody.radius;

        const angle = Math.atan2(distanceZ, distanceX);

        if (distance <= radiiSum) {
            const aX = circleA.x;
            const aZ = circleA.z;

            circleA.x = circleB.x - (radiiSum + 0.01) * Math.cos(angle);
            circleA.z = circleB.z - (radiiSum + 0.01) * Math.sin(angle);

            if (circleB.entityType === "HexTank") {
                circleB.x = aX + (radiiSum + 0.01) * Math.cos(angle);
                circleB.z = aZ + (radiiSum + 0.01) * Math.sin(angle);
            }

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

        const angle = Math.atan2(distanceZ, distanceX);

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

            circle.x = circle.x - (depth + 0.01) * Math.cos(angle);
            circle.z = circle.z - (depth + 0.01) * Math.sin(angle);

            return true;
        } else {
            return false;
        }
    }

    private _updateEntities() {
        this.state.staticCircleEntities.forEach((staticCircleEntity) => {
            staticCircleEntity.collisionBody.setSpatialHash(this._spatialHash);
        });

        this.state.staticRectangleEntities.forEach((staticRectangleEntity) => {
            staticRectangleEntity.collisionBody.setSpatialHash(
                this._spatialHash
            );
        });

        this.state.hexTanks.forEach((currentHexTank) => {
            currentHexTank.update();
            currentHexTank.collisionBody.setSpatialHash(this._spatialHash);
        });
    }

    private _checkCollisions() {
        this.state.hexTanks.forEach((currentHexTank) => {
            const currentKeys = currentHexTank.collisionBody.keys;

            for (let i = 0; i < currentKeys.length; i++) {
                const currentEntitiesList = this._spatialHash.get(
                    currentKeys[i]
                );

                if (typeof currentEntitiesList !== "undefined") {
                    for (let j = 0; j < currentEntitiesList.length; j++) {
                        let currentEntity = currentEntitiesList[j];
                        if (currentEntity.id !== currentHexTank.id) {
                            if (currentEntity.collisionBody.type === "circle") {
                                currentEntity = currentEntity as
                                    | HexTank
                                    | StaticCircleEntity;
                                if (
                                    this._circleCircleCollision(
                                        currentHexTank,
                                        currentEntity
                                    )
                                ) {
                                    currentHexTank.collisionBody.collided =
                                        true;
                                    currentEntity.collisionBody.collided = true;
                                }
                            }

                            if (
                                currentEntity.collisionBody.type === "rectangle"
                            ) {
                                currentEntity =
                                    currentEntity as StaticRectangleEntity;
                                if (
                                    this._circleRectangleCollision(
                                        currentHexTank,
                                        currentEntity
                                    )
                                ) {
                                    currentHexTank.collisionBody.collided =
                                        true;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    private _fixedUpdate() {
        this._updateEntities();
        this._checkCollisions();
        this._spatialHash.clear();
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
