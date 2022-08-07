import { MapSchema, Schema, type } from "@colyseus/schema";
import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";

export default class WorldState extends Schema {
    @type({ map: HexTank }) hexTanks = new MapSchema<HexTank>();
    @type({ map: StaticCircleEntity }) staticCircleEntities =
        new MapSchema<StaticCircleEntity>();
    @type({ map: StaticRectangleEntity}) staticRectangleEntities =
        new MapSchema<StaticRectangleEntity>();
}
