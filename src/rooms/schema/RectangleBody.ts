import { Schema, type } from "@colyseus/schema";

export default class RectangleBody extends Schema {
    x: number;
    z: number;

    @type("number") width: number;
    @type("number") height: number;
    @type("boolean") collided: boolean = false;
    @type("string") bodyType: string = "rectangle";

    constructor(x: number, z: number, width: number, height: number) {
        super();

        this.x = x;
        this.z = z;
        this.width = width;
        this.height = height;
    }

    updatePosition(x: number, z: number) {
        this.x = x;
        this.z = z;
    }
}
