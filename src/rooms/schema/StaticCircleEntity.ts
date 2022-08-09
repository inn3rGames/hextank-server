import { Schema, type } from "@colyseus/schema";
import CircleBody from "./CircleBody";

export default class StaticCircleEntity extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type(CircleBody) collisionBody: CircleBody;

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new CircleBody(this.x, this.z, 5, this);
    }
}
