import assert from "assert";

require("../common-test/WorldRoom_test");
require("../common-test/NimiqCommon_test");

describe("Testing paid Nimiq logic", () => {
    it("Main network set properly", () => {
        assert.strictEqual("MAIN" === process.env.NIMIQ_NETWORK_TYPE, true);
    });

    it("Room type PAID", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "PAID", true);
    });
});
