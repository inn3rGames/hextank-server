import Nimiq from "@nimiq/core";

export default class NimiqAPI {
    private _seed: string;
    private _extendedPrivateKey: Nimiq.ExtendedPrivateKey;
    private _privateKey: Nimiq.PrivateKey;
    private _keyPair: Nimiq.KeyPair;
    private _wallet: Nimiq.Wallet;

    private _configBuilder: Nimiq.Client.ConfigurationBuilder;
    private _client: Nimiq.Client;

    consensusEstablished: boolean = false;
    temporaryBalance: number = 0;
    private _lastBalance: number = 0;
    private _processingTransactions: Map<
        string,
        Nimiq.Client.TransactionState
    > = new Map();

    loadWallet() {
        this._seed = process.env.NIMIQ_HOT_SEED;
        this._extendedPrivateKey =
            Nimiq.MnemonicUtils.mnemonicToExtendedPrivateKey(this._seed);
        this._privateKey =
            this._extendedPrivateKey.derivePath("m/44'/242'/0'/0'").privateKey;
        this._keyPair = Nimiq.KeyPair.derive(this._privateKey);
        this._wallet = new Nimiq.Wallet(this._keyPair);
    }

    async connect() {
        Nimiq.GenesisConfig.test();

        this._configBuilder = Nimiq.Client.Configuration.builder();
        this._client = this._configBuilder.instantiateClient();

        this._client.addConsensusChangedListener((consensus) => {
            if (consensus === Nimiq.Client.ConsensusState.ESTABLISHED) {
                this.consensusEstablished = true;
            }
            if (consensus === Nimiq.Client.ConsensusState.SYNCING) {
                this.consensusEstablished = false;
            }
            if (consensus === Nimiq.Client.ConsensusState.CONNECTING) {
                this.consensusEstablished = false;
            }
        });

        this._client.addHeadChangedListener(async () => {
            if (this.consensusEstablished === true) {
                const account = await this._client.getAccount(
                    this._wallet.address
                );

                if (this._lastBalance !== account.balance) {
                    this.temporaryBalance = account.balance;
                    this._lastBalance = account.balance;
                    console.log("Balance update", this.temporaryBalance);
                }
            }
        });

        this._client.addTransactionListener(
            (transactionDetails) => {
                this._processingTransactions.set(
                    transactionDetails.transactionHash.toHex(),
                    transactionDetails.state
                );

                while (this._processingTransactions.size > 1000) {
                    const oldTransactionKey = this._processingTransactions
                        .entries()
                        .next().value[0];
                    this._processingTransactions.delete(oldTransactionKey);
                }

                console.log(
                    "Latest 1000 transactions",
                    this._processingTransactions
                );
            },
            [this._wallet.address]
        );
    }

    verifyTransactionIntegrity(options: any) {
        const transactionData = options.signedTransaction.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );
        const transactionIntegrity = transaction.verify(
            options.signedTransaction.raw.networkId
        );

        let transactionAmountValid: boolean;
        if (
            options.signedTransaction.raw.value >=
                process.env.NIMIQ_LUNA_ENTRY_FEE &&
            options.signedTransaction.raw.fee >=
                process.env.NIMIQ_LUNA_TRANSACTION_FEE
        ) {
            transactionAmountValid = true;
        } else {
            transactionAmountValid = false;
        }

        return transactionIntegrity && transactionAmountValid;
    }

    private _delay(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async verifyTransactionState(options: any) {
        const transactionData = options.signedTransaction.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );

        let transactionHash = transaction.hash().toHex();
        let transactionState =
            this._processingTransactions.get(transactionHash);

        let count = 0;

        while (
            transactionState !== Nimiq.Client.TransactionState.MINED &&
            transactionState !== Nimiq.Client.TransactionState.CONFIRMED
        ) {
            await this._delay(1000);
            count += 1;

            transactionState =
                this._processingTransactions.get(transactionHash);

            if (count >= 300) {
                this._processingTransactions.delete(transactionHash);
                return false;
            }
        }

        this._processingTransactions.delete(transactionHash);
        return true;
    }

    async payoutTo(
        userFriendlyAddress: string,
        amount: number,
        fee: number,
        message: string
    ) {
        const rawExtraData = `HexTank.io prize ${message}`;
        const extraData = Nimiq.BufferUtils.fromAscii(rawExtraData);

        const transaction = new Nimiq.ExtendedTransaction(
            this._wallet.address,
            Nimiq.Account.Type.BASIC,
            Nimiq.Address.fromUserFriendlyAddress(userFriendlyAddress),
            Nimiq.Account.Type.BASIC,
            amount,
            fee,
            await this._client.getHeadHeight(),
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

        const result = await this._client.sendTransaction(transaction);
        console.log(
            `Payment sent ${JSON.stringify(result.state)} ${transaction.hash().toHex()}`
        );
    }
}
