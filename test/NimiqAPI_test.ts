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

    it("The prize per killed HexTank is maximum 90% of the entry fee", () => {
        const entryFee = parseInt(process.env.NIMIQ_LUNA_ENTRY_FEE as string);
        const transactionFee = parseInt(
            process.env.NIMIQ_LUNA_TRANSACTION_FEE as string
        );
        const prize = parseInt(process.env.NIMIQ_LUNA_PRIZE as string);

        const totalPrize = 5 * prize + 7 * transactionFee;
        const totalEntryFee = entryFee + 7 * transactionFee;
        const percent = totalPrize / totalEntryFee;

        assert.strictEqual(percent <= 0.9, true);
    });
});
