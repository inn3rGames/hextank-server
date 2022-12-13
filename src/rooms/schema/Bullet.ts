import { MapSchema, Schema, type } from "@colyseus/schema";
import CircleBody from "./CircleBody";

export default class Bullet extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("number") angle: number;
    @type("string") id: string;

    @type(CircleBody) collisionBody: CircleBody;

    @type("boolean") invincibility: boolean;

    entityType: string = "Bullet";
    parentId: string;

    private _map: MapSchema<Bullet, string>;

    private _count: number = 0;
    private _lifeTime: number = 720;

    private _speed: number = -1;

    constructor(
        x: number,
        z: number,
        radius: number,
        angle: number,
        id: string,
        parentId: string,
        invincibility: boolean,
        map: MapSchema<Bullet, string>
    ) {
        super();

        this.x = x;
        this.z = z;
        this.angle = angle;
        this.id = id;

        this.parentId = parentId;

        this.collisionBody = new CircleBody(this.x, this.z, radius, this);

        this.invincibility = invincibility;

        this._map = map;
        this._map.set(this.id, this);
    }

    update() {
        this.x += this._speed * Math.cos(this.angle);
        this.z += this._speed * -Math.sin(this.angle);
        this.collisionBody.updateBody(this.x, this.z);

        this._count += 1;
        if (this._count >= this._lifeTime) {
            this._map.delete(this.id);
        }
    }
}
