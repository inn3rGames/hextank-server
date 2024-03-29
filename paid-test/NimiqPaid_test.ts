import assert from "assert";
import Nimiq from "@nimiq/core";
import NimiqAPI from "../src/payments/NimiqAPI";

require("../common-test/WorldRoom_test");

describe("Testing paid Nimiq logic", () => {
    it("Max clients 105", () => {
        const maxClients = parseInt(process.env.MAX_CLIENTS as string);
        assert.strictEqual(maxClients === 105, true);
    });

    it("Room type PAID", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "PAID", true);
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

    it("The prize per killed HexTank is maximum 90% of the entry fee", () => {
        const entryFee = parseInt(process.env.NIMIQ_LUNA_ENTRY_FEE as string);
        const transactionFee = parseInt(
            process.env.NIMIQ_LUNA_TRANSACTION_FEE as string
        );
        const prize = parseInt(process.env.NIMIQ_LUNA_PRIZE as string);

        const totalPrize = 5 * prize + 6 * transactionFee;
        const totalEntryFee = entryFee + 7 * transactionFee;
        const percent = totalPrize / totalEntryFee;

        assert.strictEqual(percent <= 0.9, true);
    });

    it("Cold wallet game fee", () => {
        const coldGameFee = parseInt(
            process.env.NIMIQ_LUNA_COLD_GAME_FEE as string
        );
        const coldGameFeeNim = Nimiq.Policy.lunasToCoins(coldGameFee);

        assert.strictEqual(coldGameFeeNim === 5, true);
    });
});
