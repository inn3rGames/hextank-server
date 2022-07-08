import { Schema, type } from "@colyseus/schema";

export default class HexTank extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;
    }
}
