import { MapSchema, Schema, type } from "@colyseus/schema";
import HexTank from "./HexTank";
import StaticEntity from "./StaticEntity";

export default class WorldState extends Schema {
    @type({ map: HexTank }) hexTanks = new MapSchema<HexTank>();
    @type({ map: StaticEntity }) staticEntities = new MapSchema<StaticEntity>();
}
