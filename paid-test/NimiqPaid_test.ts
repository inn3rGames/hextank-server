import assert from "assert";
import NimiqAPI from "../src/payments/NimiqAPI";

require("../common-test/WorldRoom_test");
require("../common-test/NimiqCommon_test");

describe("Testing paid Nimiq logic", () => {
    it("Nimiq wallet loaded properly", async () => {
        const nimiqAPI = new NimiqAPI();

        nimiqAPI.loadWallet();

        assert.strictEqual(
            nimiqAPI["_wallet"].address.toUserFriendlyAddress() ===
                process.env.NIMIQ_HOT_ADDRESS,
            true
        );
    });

    it("Main network set properly", () => {
        assert.strictEqual("MAIN" === process.env.NIMIQ_NETWORK_TYPE, true);
    });

    it("Room type PAID", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "PAID", true);
    });

    it("Max clients 105", () => {
        const maxClients = parseInt(process.env.MAX_CLIENTS as string);
        assert.strictEqual(maxClients === 105, true);
    });
});
