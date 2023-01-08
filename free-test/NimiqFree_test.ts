import assert from "assert";

require("../common-test/WorldRoom_test");
require("../common-test/NimiqCommon_test");

describe("Testing free Nimiq logic", () => {
    it("Nimiq wallet seed empty", () => {
        const seed = process.env.NIMIQ_HOT_SEED as string;
        assert.strictEqual(seed === "", true);
    });

    it("Test network set properly", () => {
        assert.strictEqual("TEST" === process.env.NIMIQ_NETWORK_TYPE, true);
    });

    it("Room type FREE", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "FREE", true);
    });

    it("Max clients 35", () => {
        const maxClients = parseInt(process.env.MAX_CLIENTS as string);
        assert.strictEqual(maxClients === 35, true);
    });
});
