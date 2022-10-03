import { MapSchema, Schema, type } from "@colyseus/schema";
import RectangleBody from "./RectangleBody";

export default class StaticRectangleEntity extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type(RectangleBody) collisionBody: RectangleBody;

    @type("string") modelType: string;

    entityType: string = "StaticRectangle";

    constructor(
        x: number,
        z: number,
        width: number,
        height: number,
        id: string,
        modelType: string,
        map?: MapSchema<StaticRectangleEntity, string>
    ) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new RectangleBody(
            this.x,
            this.z,
            width,
            height,
            this
        );

        this.modelType = modelType;

        if (typeof map !== "undefined") {
            map.set(this.id, this);
        }
    }
}
