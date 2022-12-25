import Nimiq from "@nimiq/core";

export default class NimiqAPI {
    private _seed: string;
    private _extendedPrivateKey: Nimiq.ExtendedPrivateKey;
    private _privateKey: Nimiq.PrivateKey;
    private _keyPair: Nimiq.KeyPair;
    private _wallet: Nimiq.Wallet;

    private _consensus: Nimiq.NanoConsensus;
    consensusEstablished: boolean = false;
    private _network: Nimiq.Network;

    private _blockchain: Nimiq.NanoChain;
    temporaryBalance: number = 0;
    private _lastBalance: number = 0;

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
        this._network.connect();

        this._consensus.on("established", () => {
            this.consensusEstablished = true;
        });
        this._consensus.on("lost", () => {
            this.consensusEstablished = false;
        });

        this._blockchain.on("head-changed", async () => {
            if (this.consensusEstablished === true) {
                const account = await this._consensus.getAccount(
                    this._wallet.address
                );

                if (this._lastBalance !== account.balance) {
                    this.temporaryBalance = account.balance;
                    this._lastBalance = account.balance;
                    console.log("Balance update", this.temporaryBalance);
                }
            }
        });
    }

    verify(options: any) {
        const transactionData = options.signedTransaction.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );
        return transaction.verify(options.signedTransaction.raw.networkId);
    }

    async payoutTo(
        userFriendlyAddress: string,
        amount: number,
        fee: number,
        message: string
    ) {
        const rawExtraData = `HexTank.io Prize ${message}`;
        const extraData = Nimiq.BufferUtils.fromAscii(rawExtraData);

        const transaction = new Nimiq.ExtendedTransaction(
            this._wallet.address,
            Nimiq.Account.Type.BASIC,
            Nimiq.Address.fromUserFriendlyAddress(userFriendlyAddress),
            Nimiq.Account.Type.BASIC,
            amount,
            fee,
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
            console.log(`Payment sent ${result} ${transaction.hash()}`);
        } else {
            console.log(`Payment failed ${result} ${transaction.hash()}`);
        }
    }
}
