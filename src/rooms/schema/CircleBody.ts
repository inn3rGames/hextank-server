import { Schema, type } from "@colyseus/schema";
import Position from "./Interfaces";
import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";

export default class CircleBody extends Schema {
    x: number;
    z: number;

    @type("number") radius: number;
    @type("boolean") collided: boolean = false;

    collisionPositions: Array<Position> = [{ x: 0, z: 0 }];

    private _parent: HexTank | StaticCircleEntity;

    constructor(
        x: number,
        z: number,
        radius: number,
        parent: HexTank | StaticCircleEntity
    ) {
        super();

        this.x = x;
        this.z = z;
        this.radius = radius;

        this._parent = parent;
    }

    updatePosition(x: number, z: number) {
        this.x = x;
        this.z = z;
    }

    newCollisionResponse(response: Position) {
        this.collisionPositions.push(response);
    }

    getCollisionResponse(): Position {
        let distances = [];
        let positions = new Map<number, Position>();

        for (let i = 0; i < this.collisionPositions.length; i++) {
            let nextPosition = this.collisionPositions[i];

            let distanceX = nextPosition.x - this.x;
            let distanceZ = nextPosition.z - this.z;

            let distance = Math.sqrt(
                distanceX * distanceX + distanceZ * distanceZ
            );

            distances.push(distance);
            positions.set(distance, nextPosition);
        }

        let maxDistance = Math.max(...distances);
        let maxPosition = positions.get(maxDistance);

        return maxPosition;
    }

    private _generateKey(x: number, z: number): string {
        let cellSize = 100;
        return `${Math.floor(x / cellSize) * cellSize},${
            Math.floor(z / cellSize) * cellSize
        }`;
    }

    generateKeys(): Array<string> {
        let width: number = this.radius;

        let topLeftCorner: Position = {
            x: this.x - width * 0.5,
            z: this.z - width * 0.5,
        };
        let topRightCorner: Position = {
            x: this.x + width * 0.5,
            z: this.z - width * 0.5,
        };
        let bottomRightCorner: Position = {
            x: this.x + width * 0.5,
            z: this.z + width * 0.5,
        };
        let bottomLeftCorner: Position = {
            x: this.x - width * 0.5,
            z: this.z + width * 0.5,
        };

        let rectangle: Array<Position> = [
            topLeftCorner,
            topRightCorner,
            bottomRightCorner,
            bottomLeftCorner,
        ];

        let keys: Array<string> = [];

        for (let i = 0; i < rectangle.length; i++) {
            let key = this._generateKey(rectangle[i].x, rectangle[i].z);

            let duplicateKeys = 0;

            for (let j = 0; j < keys.length; j++) {
                if (key === keys[j]) {
                    duplicateKeys += 1;
                }
            }

            if (duplicateKeys === 0) {
                keys.push(key);
            }
        }

        return keys;
    }

    setSpatialHash(
        spatialHash: Map<
            string,
            Array<HexTank | StaticCircleEntity | StaticRectangleEntity>
        >
    ) {
        let keys = this.generateKeys();

        for (let i = 0; i < keys.length; i++) {
            let newSpatialHashList = spatialHash.get(keys[i]);
            newSpatialHashList.push(this._parent);
            spatialHash.set(keys[i], newSpatialHashList);
        }
    }

    updateBody(x: number, z: number) {
        this.updatePosition(x, z);
        this.collided = false;
        this.collisionPositions.length = 0;
    }
}