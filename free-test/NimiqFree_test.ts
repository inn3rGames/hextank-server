import assert from "assert";

require("../common-test/WorldRoom_test");

describe("Testing free Nimiq logic", () => {
    it("Max clients 35", () => {
        const maxClients = parseInt(process.env.MAX_CLIENTS as string);
        assert.strictEqual(maxClients === 35, true);
    });

    it("Room type FREE", () => {
        const roomType = process.env.ROOM_TYPE as string;
        assert.strictEqual(roomType === "FREE", true);
    });

    it("Nimiq network empty", () => {
        const network = process.env.NIMIQ_NETWORK_TYPE as string;
        assert.strictEqual(network === "", true);
    });

    it("Nimiq wallet seed empty", () => {
        const seed = process.env.NIMIQ_HOT_SEED as string;
        assert.strictEqual(seed === "", true);
    });

    it("Nimiq hot address empty", () => {
        const hotAddress = process.env.NIMIQ_HOT_ADDRESS as string;
        assert.strictEqual(hotAddress === "", true);
    });

    it("Nimiq cold address empty", () => {
        const coldAddress = process.env.NIMIQ_COLD_ADDRESS as string;
        assert.strictEqual(coldAddress === "", true);
    });

    it("Nimiq entry fee empty", () => {
        const entryFee = process.env.NIMIQ_LUNA_ENTRY_FEE as string;
        assert.strictEqual(entryFee === "", true);
    });

    it("Nimiq transaction fee empty", () => {
        const transactionFee = process.env.NIMIQ_LUNA_TRANSACTION_FEE as string;
        assert.strictEqual(transactionFee === "", true);
    });

    it("Nimiq prize", () => {
        const prize = parseInt(process.env.NIMIQ_LUNA_PRIZE as string);
        assert.strictEqual(prize === 900000, true);
    });

    it("Nimiq cold game fee empty", () => {
        const coldGameFee = process.env.NIMIQ_LUNA_COLD_GAME_FEE as string;
        assert.strictEqual(coldGameFee === "", true);
    });
});
