import { Schema, type } from "@colyseus/schema";
import Position from "./Interfaces";
import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";

export default class RectangleBody extends Schema {
    x: number;
    z: number;

    @type("number") width: number;
    @type("number") height: number;

    type: string = "rectangle";

    private _parent: StaticRectangleEntity;

    constructor(
        x: number,
        z: number,
        width: number,
        height: number,
        parent: StaticRectangleEntity
    ) {
        super();

        this.x = x;
        this.z = z;
        this.width = width;
        this.height = height;

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
        const width: number = Math.max(this.width, this.height);

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
        const keys = this.generateKeys();

        for (let i = 0; i < keys.length; i++) {
            if (typeof spatialHash.get(keys[i]) === "undefined") {
                spatialHash.set(keys[i], []);
            }
            const newSpatialHashList = spatialHash.get(keys[i]);
            newSpatialHashList.push(this._parent);
            spatialHash.set(keys[i], newSpatialHashList);
        }
    }
}
