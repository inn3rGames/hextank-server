import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";
import StaticCircleEntity from "./schema/StaticCircleEntity";
import StaticRectangleEntity from "./schema/StaticRectangleEntity";
import Bullet from "./schema/Bullet";
import NimiqAPI from "../NimiqAPI";

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

    private _nimiqAPI: NimiqAPI;
    private _nimiqPayments: Map<
        string,
        { userFriendlyAddress: string; amount: number; fee: number }
    > = new Map();

    private _generatePosition(): {
        x: number;
        z: number;
        angle: number;
    } {
        const possiblePositions: Array<{
            x: number;
            z: number;
            angle: number;
        }> = [
            {
                x: -240,
                z: 0,
                angle: Math.PI,
            },
            {
                x: -110,
                z: 140,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: -240,
                z: 240,
                angle: Math.PI,
            },
            {
                x: 0,
                z: -20,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: 60,
                z: -230,
                angle: 0,
            },
            {
                x: -220,
                z: 20,
                angle: Math.PI,
            },
            {
                x: -100,
                z: -230,
                angle: 0,
            },
            {
                x: 50,
                z: 230,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: -240,
                z: -240,
                angle: Math.PI,
            },
            {
                x: 240,
                z: -240,
                angle: Math.PI / 2,
            },
            {
                x: 240,
                z: 240,
                angle: 0,
            },
            {
                x: -240,
                z: 240,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: -40,
                z: 140,
                angle: Math.PI,
            },
            {
                x: 40,
                z: -60,
                angle: 0,
            },
            {
                x: 210,
                z: -50,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: 30,
                z: 50,
                angle: Math.PI / 2,
            },
            {
                x: 90,
                z: 120,
                angle: 0,
            },
            {
                x: 0,
                z: 180,
                angle: 0,
            },
            {
                x: -100,
                z: -130,
                angle: Math.PI,
            },
            {
                x: -180,
                z: -100,
                angle: Math.PI / 2,
            },
            {
                x: 230,
                z: 180,
                angle: Math.PI + Math.PI / 2,
            },
            {
                x: 190,
                z: -70,
                angle: 0,
            },
            {
                x: 50,
                z: 20,
                angle: 0,
            },
            {
                x: 0,
                z: -200,
                angle: Math.PI / 2,
            },
            {
                x: 180,
                z: -30,
                angle: 0,
            },
        ];

        return possiblePositions[
            Math.floor(Math.random() * possiblePositions.length)
        ];
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

    private _fillState() {
        this.setState(new WorldState());
    }

    async onCreate(options: any) {
        this._nimiqAPI = new NimiqAPI();
        this._nimiqAPI.loadWallet();
        await this._nimiqAPI.connect();

        this._fillState();

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

        console.log(`WorldRoom ${this.roomId} created.`);
    }

    private _isNotPresent(userFriendlyAddress: string) {
        let presenceCount = 0;
        this.state.hexTanks.forEach((currentHexTank) => {
            if (userFriendlyAddress === currentHexTank.userFriendlyAddress) {
                presenceCount += 1;
            }
        });
        if (presenceCount === 0) {
            return true;
        } else {
            return false;
        }
    }

    onAuth(client: Client, options: any) {
        return (
            this._nimiqAPI.verify(options) &&
            this._isNotPresent(options.signedTransaction.raw.sender)
        );
    }

    onJoin(client: Client, options: any) {
        const currentPosition = this._generatePosition();

        let clientName = options.name.toString().substring(0, 16);
        if (clientName.length > 0) {
            clientName = clientName.replace(/[^0-9a-z]/gi, "");
            if (clientName.length <= 0) {
                clientName = "guest";
            }
        } else {
            clientName = "guest";
        }

        const currentHexTank = new HexTank(
            currentPosition.x,
            currentPosition.z,
            currentPosition.angle,
            client.sessionId,
            clientName,
            options.signedTransaction.raw.sender,
            this.state.bullets
        );

        this.state.hexTanks.set(client.sessionId, currentHexTank);

        console.log(
            `${currentHexTank.id} ${currentHexTank.name} ${currentHexTank.userFriendlyAddress} joined at: `,
            {
                x: currentHexTank.x,
                z: currentHexTank.z,
            }
        );
    }

    onLeave(client: Client, consented: boolean) {
        const currentHexTank = this.state.hexTanks.get(client.sessionId);

        if (typeof currentHexTank !== "undefined") {
            console.log(
                `${currentHexTank.id} ${currentHexTank.name} ${currentHexTank.userFriendlyAddress} left!`
            );
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
            const alreadyCheckedList: Array<string> = [];

            const currentKeys = currentHexTank.collisionBody.keys;
            for (let i = 0; i < currentKeys.length; i++) {
                const currentEntitiesList = this._spatialHash.get(
                    currentKeys[i]
                );

                if (typeof currentEntitiesList !== "undefined") {
                    for (let j = 0; j < currentEntitiesList.length; j++) {
                        const currentEntity = currentEntitiesList[j];
                        if (
                            currentEntity.id !== currentHexTank.id &&
                            alreadyCheckedList.indexOf(currentEntity.id) === -1
                        ) {
                            alreadyCheckedList.push(currentEntity.id);

                            if (currentEntity.collisionBody.type === "circle") {
                                const circleEntity = currentEntity as
                                    | HexTank
                                    | StaticCircleEntity
                                    | Bullet;

                                if (circleEntity.entityType === "Bullet") {
                                    const currentBullet =
                                        circleEntity as Bullet;

                                    if (
                                        currentBullet.parentId !==
                                        currentHexTank.id
                                    ) {
                                        if (
                                            this._circleCircleCollision(
                                                currentHexTank,
                                                circleEntity,
                                                true
                                            )
                                        ) {
                                            const enemyHexTank =
                                                this.state.hexTanks.get(
                                                    currentBullet.parentId
                                                );

                                            if (
                                                typeof enemyHexTank !==
                                                "undefined"
                                            ) {
                                                if (
                                                    currentHexTank.invincibility ===
                                                        false &&
                                                    currentBullet.invincibility ===
                                                        false
                                                ) {
                                                    enemyHexTank.damage += 1;
                                                    currentHexTank.health -= 1;
                                                    currentHexTank.collisionBody.collided =
                                                        true;
                                                    console.log(
                                                        `${enemyHexTank.id} ${enemyHexTank.name} ${enemyHexTank.userFriendlyAddress} shot ${currentHexTank.id} ${currentHexTank.name} ${currentHexTank.userFriendlyAddress}!`
                                                    );

                                                    this._nimiqPayments.set(
                                                        enemyHexTank.id +
                                                            currentHexTank.id +
                                                            performance
                                                                .now()
                                                                .toString(),
                                                        {
                                                            userFriendlyAddress:
                                                                enemyHexTank.userFriendlyAddress,
                                                            amount: 90 * 1e5,
                                                            fee: 500,
                                                        }
                                                    );
                                                    console.log(
                                                        "Payment batch size",
                                                        this._nimiqPayments.size
                                                    );

                                                    if (
                                                        currentHexTank.health <=
                                                        0
                                                    ) {
                                                        enemyHexTank.kills += 1;
                                                        this.state.hexTanks.delete(
                                                            currentHexTank.id
                                                        );
                                                        console.log(
                                                            `${enemyHexTank.id} ${enemyHexTank.name} ${enemyHexTank.userFriendlyAddress} killed ${currentHexTank.id} ${currentHexTank.name} ${currentHexTank.userFriendlyAddress}!`
                                                        );

                                                        this.broadcast(
                                                            "hexTankExplosion",
                                                            {
                                                                x: currentHexTank.x,
                                                                z: currentHexTank.z,
                                                                angle: currentHexTank.angle,
                                                                id:
                                                                    "hexTankExplosion" +
                                                                    performance
                                                                        .now()
                                                                        .toString(),
                                                            }
                                                        );
                                                    }
                                                }
                                            } else {
                                                console.log("Enemy not found!");
                                            }

                                            if (
                                                currentBullet.invincibility ===
                                                    false &&
                                                currentHexTank.invincibility ===
                                                    false
                                            ) {
                                                this.broadcast(
                                                    "bulletExplosion",
                                                    {
                                                        x: currentBullet.x,
                                                        z: currentBullet.z,
                                                        angle: currentBullet.angle,
                                                        id:
                                                            "bulletExplosion" +
                                                            performance
                                                                .now()
                                                                .toString(),
                                                    }
                                                );
                                            }
                                            this.state.bullets.delete(
                                                currentBullet.id
                                            );
                                        }
                                    }
                                }

                                if (circleEntity.entityType === "HexTank") {
                                    const enemyHexTank = circleEntity as Bullet;

                                    if (
                                        currentHexTank.invincibility ===
                                            false &&
                                        enemyHexTank.invincibility === false
                                    ) {
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
                                    circleEntity.entityType === "StaticCircle"
                                ) {
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
                                        if (
                                            currentBullet.invincibility ===
                                            false
                                        ) {
                                            if (
                                                circleEntity.entityType ===
                                                "HexTank"
                                            ) {
                                                const currentHexTank =
                                                    circleEntity as HexTank;

                                                if (
                                                    currentHexTank.invincibility ===
                                                    false
                                                ) {
                                                    this.broadcast(
                                                        "bulletExplosion",
                                                        {
                                                            x: currentBullet.x,
                                                            z: currentBullet.z,
                                                            angle: currentBullet.angle,
                                                            id:
                                                                "bulletExplosion" +
                                                                performance
                                                                    .now()
                                                                    .toString(),
                                                        }
                                                    );
                                                }
                                            } else {
                                                this.broadcast(
                                                    "bulletExplosion",
                                                    {
                                                        x: currentBullet.x,
                                                        z: currentBullet.z,
                                                        angle: currentBullet.angle,
                                                        id:
                                                            "bulletExplosion" +
                                                            performance
                                                                .now()
                                                                .toString(),
                                                    }
                                                );
                                            }
                                        }
                                        this.state.bullets.delete(
                                            currentBullet.id
                                        );
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
                                    if (currentBullet.invincibility === false) {
                                        this.broadcast("bulletExplosion", {
                                            x: currentBullet.x,
                                            z: currentBullet.z,
                                            angle: currentBullet.angle,
                                            id:
                                                "bulletExplosion" +
                                                performance.now().toString(),
                                        });
                                    }
                                    this.state.bullets.delete(currentBullet.id);
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    private _updateNimiqPayments() {
        if (this._nimiqAPI.consensusEstablished === true) {
            this._nimiqPayments.forEach((payment, key) => {
                if (
                    this._nimiqAPI.temporaryBalance >
                    payment.amount + payment.fee
                ) {
                    this._nimiqAPI.payoutTo(
                        payment.userFriendlyAddress,
                        payment.amount,
                        payment.fee,
                        key
                    );

                    this._nimiqAPI.temporaryBalance =
                        this._nimiqAPI.temporaryBalance -
                        (payment.amount + payment.fee);
                    console.log(
                        "Temporary balance update",
                        this._nimiqAPI.temporaryBalance
                    );

                    this._nimiqPayments.delete(key);
                }
            });
        }
    }

    private _fixedUpdate() {
        this._updateEntities();
        this._checkCollisions();
        this._updateNimiqPayments();
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
}
