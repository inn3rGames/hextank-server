import assert from "assert";
import NimiqAPI from "../src/payments/NimiqAPI";

require("../common-test/WorldRoom_test");

describe("Testing earn Nimiq logic", () => {
    it("Max clients 100", () => {
        const maxClients = parseInt(process.env.MAX_CLIENTS as string);
        assert.strictEqual(maxClients === 100, true);
    });

    it("Room type EARN", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "EARN", true);
    });

    it("Main network set properly", () => {
        assert.strictEqual("MAIN" === process.env.NIMIQ_NETWORK_TYPE, true);
    });

    it("Nimiq wallet loaded properly", async () => {
        const nimiqAPI = new NimiqAPI();

        nimiqAPI.loadWallet();

        assert.strictEqual(
            nimiqAPI["_wallet"].address.toUserFriendlyAddress() ===
                process.env.NIMIQ_HOT_ADDRESS,
            true
        );
    });

    it("Nimiq cold wallet adress empty", () => {
        const coldAddress = process.env.NIMIQ_COLD_ADDRESS as string;
        assert.strictEqual(coldAddress === "", true);
    });

    it("Nimiq entry fee empty", () => {
        const entryFee = process.env.NIMIQ_LUNA_ENTRY_FEE as string;
        assert.strictEqual(entryFee === "", true);
    });

    it("Nimiq transaction fee", () => {
        const transactionFee = parseInt(
            process.env.NIMIQ_LUNA_TRANSACTION_FEE as string
        );
        assert.strictEqual(transactionFee === 500, true);
    });

    it("Nimiq prize", () => {
        const prize = parseInt(process.env.NIMIQ_LUNA_PRIZE as string);
        assert.strictEqual(prize === 9500, true);
    });

    it("Nimiq cold game fee empty", () => {
        const coldGameFee = process.env.NIMIQ_LUNA_COLD_GAME_FEE as string;
        assert.strictEqual(coldGameFee === "", true);
    });
});
