import { Schema, type } from "@colyseus/schema";
import Position from "./Interfaces";

export default class CircleBody extends Schema {
    x: number;
    z: number;

    @type("number") radius: number;
    @type("boolean") collided: boolean = false;

    collisionPositions: Array<Position> = [{ x: 0, z: 0 }];

    constructor(x: number, z: number, radius: number) {
        super();

        this.x = x;
        this.z = z;
        this.radius = radius;
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

    updateBody(x: number, z: number) {
        this.updatePosition(x, z);
        this.collided = false;
        this.collisionPositions.length = 0;
    }
}
