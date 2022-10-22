import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";
import StaticCircleEntity from "./schema/StaticCircleEntity";
import StaticRectangleEntity from "./schema/StaticRectangleEntity";
import Bullet from "./schema/Bullet";

export default class WorldRoom extends Room<WorldState> {
    maxClients: number = 25;
    autoDispose = false;

    private _worldSize: number = 500;

    private _fpsLimit: number = 60;
    private _fixedFrameDuration: number = 1000 / this._fpsLimit;
    private _elapsedTime: number = Math.round(this._fixedFrameDuration);
    private _resetElapsedTime: boolean = true;

    private _commandsPerFrame: number = 100;

    private _spatialHash: Map<
        string,
        Array<HexTank | StaticCircleEntity | StaticRectangleEntity | Bullet>
    > = new Map();

    private _generateCoordinate(): number {
        const min = -this._worldSize * 0.5;
        const max = this._worldSize * 0.5;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private _createMap() {
        const collisionBodyOffset = 1.03;

        const wallWidth = this._worldSize / 5;
        const wallHeight = 10;
        for (let i = 1; i <= 5; i++) {
            new StaticRectangleEntity(
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                -this._worldSize * 0.5 - wallHeight * 0.5,
                wallWidth * collisionBodyOffset,
                wallHeight * collisionBodyOffset,
                "wall1" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 + wallHeight * 0.5,
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                wallHeight * collisionBodyOffset,
                wallWidth * collisionBodyOffset,
                "wall2" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                this._worldSize * 0.5 + wallHeight * 0.5,
                wallWidth * collisionBodyOffset,
                wallHeight * collisionBodyOffset,
                "wall3" + i,
                "wall",
                this.state.staticRectangleEntities
            );

            new StaticRectangleEntity(
                -this._worldSize * 0.5 - wallHeight * 0.5,
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                wallHeight * collisionBodyOffset,
                wallWidth * collisionBodyOffset,
                "wall4" + i,
                "wall",
                this.state.staticRectangleEntities
            );
        }

        new StaticRectangleEntity(
            0,
            Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid1",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            32,
            -Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid2",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -32,
            -Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid3",
            "pyramid",
            this.state.staticRectangleEntities
        );

        new StaticCircleEntity(
            0,
            -110,
            43.75 * collisionBodyOffset,
            "oasis1",
            "oasis",
            this.state.staticCircleEntities
        );

        new StaticRectangleEntity(
            0,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building1",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -25,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building2",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            25,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building3",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -50,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building4",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            50,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building5",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -75,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building6",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            75,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building7",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            0,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building8",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -25,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building9",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            25,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building10",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -50,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building11",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            50,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building12",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -75,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building13",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            75,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building14",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            0,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building15",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -25,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building16",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            25,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building17",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -50,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building18",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            50,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building19",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -75,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building20",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            75,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building21",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            0,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building22",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            0,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building23",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            50,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building24",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            50,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building25",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -50,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building26",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -50,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building27",
            "building2",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            75,
            130,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building28",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            75,
            170,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building29",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -75,
            130,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building30",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticRectangleEntity(
            -75,
            170,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building31",
            "building1",
            this.state.staticRectangleEntities
        );

        new StaticCircleEntity(
            -150,
            -100,
            12.25 * collisionBodyOffset,
            "rock1",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -140,
            -90,
            12.25 * collisionBodyOffset,
            "rock2",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -160,
            -100,
            12.25 * collisionBodyOffset,
            "rock3",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -100,
            -210,
            12.25 * collisionBodyOffset,
            "rock4",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -100,
            -190,
            12.25 * collisionBodyOffset,
            "rock5",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -100,
            -200,
            12.25 * collisionBodyOffset,
            "rock6",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -170,
            120,
            12.25 * collisionBodyOffset,
            "rock7",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -160,
            120,
            12.25 * collisionBodyOffset,
            "rock8",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -150,
            120,
            12.25 * collisionBodyOffset,
            "rock9",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            60,
            -210,
            12.25 * collisionBodyOffset,
            "rock10",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            50,
            -210,
            12.25 * collisionBodyOffset,
            "rock11",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            70,
            -210,
            12.25 * collisionBodyOffset,
            "rock12",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            190,
            170,
            12.25 * collisionBodyOffset,
            "rock13",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            200,
            180,
            12.25 * collisionBodyOffset,
            "rock14",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            210,
            170,
            12.25 * collisionBodyOffset,
            "rock15",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            190,
            -50,
            12.25 * collisionBodyOffset,
            "rock16",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            170,
            -50,
            12.25 * collisionBodyOffset,
            "rock17",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            180,
            -50,
            12.25 * collisionBodyOffset,
            "rock18",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            190,
            -200,
            12.25 * collisionBodyOffset,
            "rock19",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            200,
            -190,
            12.25 * collisionBodyOffset,
            "rock20",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            210,
            -200,
            12.25 * collisionBodyOffset,
            "rock21",
            "rock3",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -140,
            -20,
            12.25 * collisionBodyOffset,
            "rock22",
            "rock1",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -160,
            -20,
            12.25 * collisionBodyOffset,
            "rock23",
            "rock2",
            this.state.staticCircleEntities
        );

        new StaticCircleEntity(
            -150,
            -30,
            12.25 * collisionBodyOffset,
            "rock24",
            "rock3",
            this.state.staticCircleEntities
        );
    }

    onCreate(options: any) {
        this.setState(new WorldState());

        this._createMap();

        this.onMessage("command", (client, command) => {
            const currentHexTank = this.state.hexTanks.get(client.sessionId);

            if (typeof currentHexTank !== "undefined") {
                if (
                    currentHexTank.commands.length < this._commandsPerFrame &&
                    typeof command === "string"
                ) {
                    currentHexTank.commands.push(command);
                }
            } else {
                console.log("HexTank not found!");
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
            client.sessionId,
            this.state.bullets
        );

        this.state.hexTanks.set(client.sessionId, currentHexTank);

        console.log(`${currentHexTank.id} joined at: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
        });
    }

    onLeave(client: Client, consented: boolean) {
        const currentHexTank = this.state.hexTanks.get(client.sessionId);

        if (typeof currentHexTank !== "undefined") {
            console.log(`${currentHexTank.id} left!`);
            this.state.hexTanks.delete(client.sessionId);
        } else {
            console.log("Already left!");
        }
    }

    onDispose() {
        console.log(`WorldRoom ${this.roomId} disposed.`);
    }

    private _circleCircleCollision(
        circleA: HexTank | Bullet,
        circleB: HexTank | StaticCircleEntity | Bullet,
        disableResponse?: boolean
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
            if (disableResponse !== true) {
                const aX = circleA.x;
                const aZ = circleA.z;

                circleA.x = circleB.x - (radiiSum + 0.01) * Math.cos(angle);
                circleA.z = circleB.z - (radiiSum + 0.01) * Math.sin(angle);

                if (circleB.entityType === "HexTank") {
                    circleB.x = aX + (radiiSum + 0.01) * Math.cos(angle);
                    circleB.z = aZ + (radiiSum + 0.01) * Math.sin(angle);
                }
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
        circle: HexTank | Bullet,
        rectangle: StaticRectangleEntity,
        disableResponse?: boolean
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
            if (disableResponse !== true) {
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
            }

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

        this.state.bullets.forEach((bullet) => {
            bullet.update();
            bullet.collisionBody.setSpatialHash(this._spatialHash);
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
                        const currentEntity = currentEntitiesList[j];
                        if (currentEntity.id !== currentHexTank.id) {
                            if (currentEntity.collisionBody.type === "circle") {
                                const circleEntity = currentEntity as
                                    | HexTank
                                    | StaticCircleEntity
                                    | Bullet;

                                if (circleEntity.entityType === "Bullet") {
                                    if (
                                        this._circleCircleCollision(
                                            currentHexTank,
                                            circleEntity,
                                            true
                                        )
                                    ) {
                                        const currentBullet =
                                            circleEntity as Bullet;

                                        const enemyHexTank =
                                            this.state.hexTanks.get(
                                                currentBullet.parentId
                                            );

                                        if (
                                            typeof enemyHexTank !== "undefined"
                                        ) {
                                            enemyHexTank.damage += 1;
                                            currentHexTank.health -= 1;
                                            currentHexTank.collisionBody.collided =
                                                true;
                                            console.log(
                                                `${enemyHexTank.id} shot ${currentHexTank.id}!`
                                            );

                                            if (currentHexTank.health <= 0) {
                                                enemyHexTank.kills += 1;
                                                this.state.hexTanks.delete(
                                                    currentHexTank.id
                                                );
                                                console.log(
                                                    `${enemyHexTank.id} killed ${currentHexTank.id}!`
                                                );

                                                this.broadcast(
                                                    "hexTankExplosion",
                                                    {
                                                        x: currentHexTank.x,
                                                        z: currentHexTank.z,
                                                    }
                                                );
                                            }
                                        } else {
                                            console.log("Enemy not found!");
                                        }

                                        this.state.bullets.delete(
                                            currentBullet.id
                                        );

                                        this.broadcast("bulletExplosion", {
                                            x: currentBullet.x,
                                            z: currentBullet.z,
                                        });
                                    }
                                } else {
                                    if (
                                        this._circleCircleCollision(
                                            currentHexTank,
                                            circleEntity
                                        )
                                    ) {
                                        currentHexTank.collisionBody.collided =
                                            true;
                                        circleEntity.collisionBody.collided =
                                            true;
                                    }
                                }
                            }

                            if (
                                currentEntity.collisionBody.type === "rectangle"
                            ) {
                                const rectangleEntity =
                                    currentEntity as StaticRectangleEntity;

                                if (
                                    this._circleRectangleCollision(
                                        currentHexTank,
                                        rectangleEntity
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

        this.state.bullets.forEach((currentBullet) => {
            const currentKeys = currentBullet.collisionBody.keys;

            for (let i = 0; i < currentKeys.length; i++) {
                const currentEntitiesList = this._spatialHash.get(
                    currentKeys[i]
                );

                if (typeof currentEntitiesList !== "undefined") {
                    for (let j = 0; j < currentEntitiesList.length; j++) {
                        const currentEntity = currentEntitiesList[j];
                        if (
                            currentEntity.id !== currentBullet.id &&
                            currentEntity.id !== "oasis1"
                        ) {
                            if (currentEntity.collisionBody.type === "circle") {
                                const circleEntity = currentEntity as
                                    | HexTank
                                    | StaticCircleEntity
                                    | Bullet;

                                if (
                                    circleEntity.entityType !== "Bullet" &&
                                    circleEntity.id !== currentBullet.parentId
                                ) {
                                    if (
                                        this._circleCircleCollision(
                                            currentBullet,
                                            circleEntity,
                                            true
                                        )
                                    ) {
                                        this.state.bullets.delete(
                                            currentBullet.id
                                        );

                                        this.broadcast("bulletExplosion", {
                                            x: currentBullet.x,
                                            z: currentBullet.z,
                                        });
                                    }
                                }
                            }

                            if (
                                currentEntity.collisionBody.type === "rectangle"
                            ) {
                                const rectangleEntity =
                                    currentEntity as StaticRectangleEntity;

                                if (
                                    this._circleRectangleCollision(
                                        currentBullet,
                                        rectangleEntity,
                                        true
                                    )
                                ) {
                                    this.state.bullets.delete(currentBullet.id);

                                    this.broadcast("bulletExplosion", {
                                        x: currentBullet.x,
                                        z: currentBullet.z,
                                    });
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
        console.log(`${currentHexTank.id} moved to: `, {
            x: currentHexTank.x,
            z: currentHexTank.z,
            angle: currentHexTank.angle,
        });
    }
}
