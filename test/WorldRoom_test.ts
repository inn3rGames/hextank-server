import assert from "assert";
import WorldRoom from "../src/rooms/WorldRoom";
import HexTank from "../src/rooms/schema/HexTank";

describe("Testing backend logic", () => {
    it("Limit HexTank top speed", () => {
        let hexTank1 = new HexTank(100, 100, "1");

        hexTank1["speed"] = 100;
        hexTank1["_updateMovement"]();

        assert.strictEqual(hexTank1["speed"] === hexTank1["_speedLimit"], true);
    });

    it("Limit HexTank top rotation speed", () => {
        let hexTank1 = new HexTank(100, 100, "1");

        hexTank1["_rotationSpeed"] = 100;
        hexTank1["_rotate"](1);

        assert.strictEqual(
            hexTank1["_rotationSpeed"] === hexTank1["_rotationSpeedLimit"],
            true
        );
    });

    it("Circle bodies should collide", () => {
        let room = new WorldRoom();

        let hexTank1 = new HexTank(100, 100, "1");
        let hexTank2 = new HexTank(100, 100, "2");

        assert.strictEqual(
            room.circleCircleCollision(hexTank1!, hexTank2!),
            true
        );
    });

    it("Circle bodies should not collide", async () => {
        let room = new WorldRoom();
        room.onCreate({test: true});

        let hexTank1 = new HexTank(100, 100, "1");
        room.state.hexTanks.set(hexTank1.id, hexTank1);

        let hexTank2 = new HexTank(100, 100, "2");
        room.state.hexTanks.set(hexTank2.id, hexTank2);

        room.circleCircleCollision(hexTank1!, hexTank2!);
        room["_fixedUpdate"]();

        assert.strictEqual(
            room.circleCircleCollision(hexTank1!, hexTank2!),
            false
        );
    });
});
