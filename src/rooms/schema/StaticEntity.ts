import { Schema, type } from "@colyseus/schema";
import CollisionBody from "./CollisionBody";

export default class StaticEntity extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type(CollisionBody) collisionBody: CollisionBody;

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new CollisionBody(this.x, this.z, 5);
    }
}
