import { Schema, type } from "@colyseus/schema";

interface position {
    x: number;
    z: number;
}

export default class CollisionBody extends Schema {
    x: number;
    z: number;
    @type("number") radius: number;
    @type("boolean") collided: boolean = false;

    collisionPositions: Array<position> = [{ x: 0, z: 0 }];

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

    getMaxCollisionPosition(): position {
        let distances = [];
        let positions = new Map<number, position>();

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
}
