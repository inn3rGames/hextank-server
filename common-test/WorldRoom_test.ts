import pkg from "../package.json";
import assert from "assert";
import WorldRoom from "../src/rooms/WorldRoom";
import HexTank from "../src/rooms/schema/HexTank";
import StaticRectangleEntity from "../src/rooms/schema/StaticRectangleEntity";
import NimiqAPI from "../src/payments/NimiqAPI";

export default  describe("Testing world room logic", () => {
    it("Server name is set properly", () => {
        const envName = process.env.NAME;
        const packageName = pkg.name;

        assert.strictEqual(envName === packageName, true);
    });

    it("Server version is set properly", () => {
        const envVersion = process.env.VERSION;
        const packageVersion = pkg.version;

        assert.strictEqual(envVersion === packageVersion, true);
    });

    it("Limit HexTank top speed", () => {
        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");

        hexTank1["_speed"] = 100;
        hexTank1["_updateMovement"]();

        assert.strictEqual(
            hexTank1["_speed"] === hexTank1["_speedLimit"],
            true
        );
    });

    it("Limit HexTank top rotation speed", () => {
        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");

        hexTank1["_rotationSpeed"] = 100;
        hexTank1["_rotate"](1);

        assert.strictEqual(
            hexTank1["_rotationSpeed"] === hexTank1["_rotationSpeedLimit"],
            true
        );
    });

    it("Circle bodies should collide", () => {
        const room = new WorldRoom();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        const hexTank2 = new HexTank(100, 100, 0, "2", "guest");

        assert.strictEqual(
            room["_circleCircleCollision"](hexTank1!, hexTank2!),
            true
        );
    });

    it("Circle bodies should not collide", async () => {
        const room = new WorldRoom();
        room["_nimiqAPI"] = new NimiqAPI();
        room["_fillState"]();
        room.state.staticCircleEntities.clear();
        room.state.staticRectangleEntities.clear();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        room.state.hexTanks.set(hexTank1.id, hexTank1);

        const hexTank2 = new HexTank(100, 100, 0, "2", "guest");
        room.state.hexTanks.set(hexTank2.id, hexTank2);

        room["_circleCircleCollision"](hexTank1!, hexTank2!);
        room["_fixedUpdate"]();

        assert.strictEqual(
            room["_circleCircleCollision"](hexTank1!, hexTank2!),
            false
        );
    });

    it("Circle and rectangle bodies should collide", () => {
        const room = new WorldRoom();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        const staticRectangleEntity = new StaticRectangleEntity(
            100,
            100,
            10,
            10,
            "2",
            "wall"
        );

        assert.strictEqual(
            room["_circleRectangleCollision"](
                hexTank1!,
                staticRectangleEntity!
            ),
            true
        );
    });

    it("Circle and rectangle bodies should not collide", () => {
        const room = new WorldRoom();
        room["_nimiqAPI"] = new NimiqAPI();
        room["_fillState"]();
        room.state.staticCircleEntities.clear();
        room.state.staticRectangleEntities.clear();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        room.state.hexTanks.set(hexTank1.id, hexTank1);

        const staticRectangleEntity = new StaticRectangleEntity(
            100,
            100,
            10,
            10,
            "2",
            "wall"
        );
        room.state.staticRectangleEntities.set(
            staticRectangleEntity.id,
            staticRectangleEntity
        );

        room["_circleRectangleCollision"](hexTank1!, staticRectangleEntity!);
        room["_fixedUpdate"]();

        assert.strictEqual(
            room["_circleRectangleCollision"](
                hexTank1!,
                staticRectangleEntity!
            ),
            false
        );
    });

    it("Spatial hash should find collision", () => {
        const room = new WorldRoom();
        room["_nimiqAPI"] = new NimiqAPI();
        room["_fillState"]();
        room.state.staticCircleEntities.clear();
        room.state.staticRectangleEntities.clear();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        hexTank1.invincibility = false;
        room.state.hexTanks.set(hexTank1.id, hexTank1);

        const hexTank2 = new HexTank(100, 100, 0, "2", "guest");
        hexTank2.invincibility = false;
        room.state.hexTanks.set(hexTank2.id, hexTank2);

        room["_fixedUpdate"]();

        assert.strictEqual(hexTank1.collisionBody.collided, true);
    });

    it("Spatial hash should not find collision", () => {
        const room = new WorldRoom();
        room["_nimiqAPI"] = new NimiqAPI();
        room["_fillState"]();
        room.state.staticCircleEntities.clear();
        room.state.staticRectangleEntities.clear();

        const hexTank1 = new HexTank(100, 100, 0, "1", "guest");
        room.state.hexTanks.set(hexTank1.id, hexTank1);

        const hexTank2 = new HexTank(100, 100, 0, "2", "guest");
        room.state.hexTanks.set(hexTank2.id, hexTank2);

        room["_fixedUpdate"]();
        room["_fixedUpdate"]();

        assert.strictEqual(hexTank1.collisionBody.collided, false);
    });
});
