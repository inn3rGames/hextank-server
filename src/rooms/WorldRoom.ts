import { Room, Client } from "colyseus";
import WorldState from "./schema/WorldState";
import HexTank from "./schema/HexTank";

export default class WorldRoom extends Room<WorldState> {
  maxClients: number = 3;
  autoDispose = false;
  worldSize: number = 200;

  onCreate(options: any) {
    this.setState(new WorldState());

    this.onMessage("moveHexTank", (client, data) => {
      const hexTank = this.state.hexTanks.get(client.sessionId);
      hexTank.x = data.x;
      hexTank.z = data.z;
      console.log(`HexTank ${hexTank.id} moved to: `, JSON.stringify(data));
    });

    console.log(`WorldRoom ${this.roomId} created.`);
  }

  onJoin(client: Client, options: any) {
    const hexTank = new HexTank(
      this.generateCoordinate(),
      this.generateCoordinate(),
      client.sessionId
    );

    this.state.hexTanks.set(client.sessionId, hexTank);

    console.log(`HexTank ${hexTank.id} `, hexTank.toJSON(), "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    this.state.hexTanks.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log(`WorldRoom ${this.roomId} disposed.`);
  }

  generateCoordinate(): number {
    let min = -this.worldSize * 0.5;
    let max = this.worldSize * 0.5;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
