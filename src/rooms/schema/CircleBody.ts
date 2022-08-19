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

    type: string = "circle";

    keys: Array<string> = [];

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

    private _generateKey(x: number, z: number): string {
        const cellSize = 100;
        return `${Math.floor(x / cellSize) * cellSize},${
            Math.floor(z / cellSize) * cellSize
        }`;
    }

    generateKeys(): Array<string> {
        const width: number = this.radius;

        const topLeftCorner: Position = {
            x: this.x - width * 0.5,
            z: this.z - width * 0.5,
        };
        const topRightCorner: Position = {
            x: this.x + width * 0.5,
            z: this.z - width * 0.5,
        };
        const bottomRightCorner: Position = {
            x: this.x + width * 0.5,
            z: this.z + width * 0.5,
        };
        const bottomLeftCorner: Position = {
            x: this.x - width * 0.5,
            z: this.z + width * 0.5,
        };

        const rectangle: Array<Position> = [
            topLeftCorner,
            topRightCorner,
            bottomRightCorner,
            bottomLeftCorner,
        ];

        const keys: Array<string> = [];

        for (let i = 0; i < rectangle.length; i++) {
            const key = this._generateKey(rectangle[i].x, rectangle[i].z);

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
        this.keys = this.generateKeys();

        for (let i = 0; i < this.keys.length; i++) {
            if (typeof spatialHash.get(this.keys[i]) === "undefined") {
                spatialHash.set(this.keys[i], []);
            }
            const newSpatialHashList = spatialHash.get(this.keys[i]);
            newSpatialHashList.push(this._parent);
            spatialHash.set(this.keys[i], newSpatialHashList);
        }
    }

    updateBody(x: number, z: number) {
        this.updatePosition(x, z);
        this.collided = false;
    }
}
