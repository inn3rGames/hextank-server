import Nimiq from "@nimiq/core";
import { raw } from "express";

export default class NimiqAPI {
    private _seed: string;
    private _extendedPrivateKey: Nimiq.ExtendedPrivateKey;
    private _privateKey: Nimiq.PrivateKey;
    private _keyPair: Nimiq.KeyPair;
    private _wallet: Nimiq.Wallet;

    private _consensus: Nimiq.NanoConsensus;
    consensusEstablished: boolean = false;
    private _blockchain: Nimiq.NanoChain;
    private _network: Nimiq.Network;
    private _mempool: Nimiq.NanoMempool;

    loadWallet() {
        this._seed = process.env.SEED;
        this._extendedPrivateKey =
            Nimiq.MnemonicUtils.mnemonicToExtendedPrivateKey(this._seed);
        this._privateKey =
            this._extendedPrivateKey.derivePath("m/44'/242'/0'/0'").privateKey;
        this._keyPair = Nimiq.KeyPair.derive(this._privateKey);
        this._wallet = new Nimiq.Wallet(this._keyPair);
    }

    async connect() {
        Nimiq.GenesisConfig.test();

        this._consensus = await Nimiq.Consensus.nano();
        this._blockchain = this._consensus.blockchain;
        this._network = this._consensus.network;
        this._mempool = this._consensus.mempool;
        this._network.connect();

        this._consensus.on("established", () => {
            this.consensusEstablished = true;
        });
        this._consensus.on("lost", () => {
            this.consensusEstablished = false;
        });
    }

    verify(options: any) {
        const transactionData = options.signedTransaction.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );
        return transaction.verify(options.signedTransaction.raw.networkId);
    }

    async payoutTo(userFriendlyAddress: string, amount: number) {
        const rawExtraData = `HexTank.io prize for shooting a player ${Date.now()}`;
        const extraData = Nimiq.BufferUtils.fromAscii(rawExtraData);

        const transaction = new Nimiq.ExtendedTransaction(
            this._wallet.address,
            Nimiq.Account.Type.BASIC,
            Nimiq.Address.fromUserFriendlyAddress(userFriendlyAddress),
            Nimiq.Account.Type.BASIC,
            Nimiq.Policy.coinsToLunas(amount),
            500,
            await this._consensus.getHeadHeight(),
            Nimiq.Transaction.Flag.NONE,
            extraData
        );

        const signature = Nimiq.Signature.create(
            this._keyPair.privateKey,
            this._keyPair.publicKey,
            transaction.serializeContent()
        );

        const proof = Nimiq.SignatureProof.singleSig(
            this._keyPair.publicKey,
            signature
        );
        transaction.proof = proof.serialize();

        const result = await this._consensus.sendTransaction(transaction);
        if (result === 1) {
            console.log(`Payment sent ${result} ${transaction.hash}`);
        } else {
            console.log(`Payment failed ${result} ${transaction.hash}`);
        }
    }
}
