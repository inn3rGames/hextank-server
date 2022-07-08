import { MapSchema, Schema, type } from "@colyseus/schema";
import HexTank from "./HexTank";

export default class WorldState extends Schema {
  @type({ map: HexTank }) hexTanks = new MapSchema<HexTank>();
}
