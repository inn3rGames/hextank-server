import { MapSchema, Schema, type } from "@colyseus/schema";
import CircleBody from "./CircleBody";

export default class StaticCircleEntity extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type(CircleBody) collisionBody: CircleBody;

    @type("string") modelType: string;

    entityType: string = "StaticCircle";

    constructor(
        x: number,
        z: number,
        radius: number,
        id: string,
        modelType: string,
        group?: MapSchema<StaticCircleEntity, string>
    ) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new CircleBody(this.x, this.z, radius, this);

        this.modelType = modelType;

        if (typeof group !== "undefined") {
            group.set(this.id, this);
        }
    }
}
