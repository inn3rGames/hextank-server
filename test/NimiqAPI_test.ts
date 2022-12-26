import assert from "assert";
import NimiqAPI from "../src/NimiqAPI";

describe("Testing Nimiq logic", () => {
    it("Nimiq wallet loaded properly", async () => {
        const nimiqAPI = new NimiqAPI();

        nimiqAPI.loadWallet();

        assert.strictEqual(
            nimiqAPI["_wallet"].address.toUserFriendlyAddress() ===
                process.env.NIMIQ_HOT_ADDRESS,
            true
        );
    });

    it("Test network set properly", () => {
        assert.strictEqual("TEST" === process.env.NIMIQ_NETWORK_TYPE, true);
    });
});
