import assert from "assert";

require("../common-test/WorldRoom_test");
require("../common-test/NimiqCommon_test");

describe("Testing free Nimiq logic", () => {
    it("Test network set properly", () => {
        assert.strictEqual("TEST" === process.env.NIMIQ_NETWORK_TYPE, true);
    });

    it("Room type FREE", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "FREE", true);
    });
});
