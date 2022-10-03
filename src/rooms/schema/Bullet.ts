import { MapSchema, Schema, type } from "@colyseus/schema";
import CircleBody from "./CircleBody";

export default class Bullet extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("number") angle: number;
    @type("string") id: string;

    @type(CircleBody) collisionBody: CircleBody;

    entityType: string = "Bullet";

    private _speed: number = -0.5;

    constructor(
        x: number,
        z: number,
        radius: number,
        angle: number,
        id: string,
        map?: MapSchema<Bullet, string>
    ) {
        super();

        this.x = x;
        this.z = z;
        this.angle = angle;
        this.id = id;

        this.collisionBody = new CircleBody(this.x, this.z, radius, this);

        if (typeof map !== "undefined") {
            map.set(this.id, this);
        }
    }

    update() {
        this.x += this._speed * Math.cos(this.angle);
        this.z += this._speed * -Math.sin(this.angle);
        this.collisionBody.updateBody(this.x, this.z);
    }
}
