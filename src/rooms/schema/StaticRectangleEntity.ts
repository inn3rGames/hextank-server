import { Schema, type } from "@colyseus/schema";
import RectangleBody from "./RectangleBody";

export default class StaticRectangleEntity extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type(RectangleBody) collisionBody: RectangleBody;

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new RectangleBody(this.x, this.z, 10, 5);
    }
}
