import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 25;

  onCreate(options: any) {
    console.log("MyRoom created.");
    this.setState(new MyRoomState());

    this.onMessage("updatePosition", (client, data) => {
      console.log("update received =>");
      console.debug(JSON.stringify(data));

      const player = this.state.players.get(client.sessionId);

      player.x = data["x"];
      player.z = data["z"];
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();

    const worldSize = 200;

    player.x = -(worldSize / 2) + Math.random() * worldSize;
    player.z = -(worldSize / 2) + Math.random() * worldSize;

    this.state.players.set(client.sessionId, player);

    console.log("new player =>", player.toJSON());
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
