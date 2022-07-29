import { Schema, type } from "@colyseus/schema";

export default class CollisionBody extends Schema {
    @type("boolean") collided: boolean = false;

    x: number;
    z: number;
    radius: number;

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
}
