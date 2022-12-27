import Nimiq from "@nimiq/core";
import ProcessingTransaction from "./ProcessingTransaction";

export default class NimiqAPI {
    private _seed: string;
    private _extendedPrivateKey: Nimiq.ExtendedPrivateKey;
    private _privateKey: Nimiq.PrivateKey;
    private _keyPair: Nimiq.KeyPair;
    private _wallet: Nimiq.Wallet;

    private _networkType: string;

    private _clientConfiguration: Nimiq.Client.Configuration;
    private _client: Nimiq.Client;

    consensusEstablished: boolean = false;
    temporaryBalance: number = 0;
    private _lastBalance: number = 0;
    private _processTransactions: Map<string, ProcessingTransaction> =
        new Map();
    private _expiringTime: number = 300;

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
        this._networkType = process.env.NIMIQ_NETWORK_TYPE;
        if (this._networkType === "MAIN") {
            Nimiq.GenesisConfig.main();
        }
        if (this._networkType === "TEST") {
            Nimiq.GenesisConfig.test();
        }

        this._clientConfiguration = new Nimiq.Client.Configuration(
            Nimiq.NetworkConfig.getDefault(),
            [Nimiq.Client.Feature.MEMPOOL],
            false,
            10
        );
        this._client = new Nimiq.Client(this._clientConfiguration);

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
                this._processTransactions.set(
                    transactionDetails.transactionHash.toHex(),
                    new ProcessingTransaction(
                        transactionDetails.state,
                        performance.now()
                    )
                );

                console.log(
                    "Latest transactions",
                    this._processTransactions
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
        let transactionState: string;

        let processingTransaction =
            this._processTransactions.get(transactionHash);
        if (processingTransaction instanceof ProcessingTransaction === true) {
            transactionState = processingTransaction.state;
        } else {
            transactionState = "NONE";
        }

        let count = 0;

        while (
            transactionState !== Nimiq.Client.TransactionState.PENDING &&
            transactionState !== Nimiq.Client.TransactionState.MINED &&
            transactionState !== Nimiq.Client.TransactionState.CONFIRMED
        ) {
            await this._delay(1000);
            count += 1;

            processingTransaction =
                this._processTransactions.get(transactionHash);
            if (
                processingTransaction instanceof ProcessingTransaction ===
                true
            ) {
                transactionState = processingTransaction.state;
            } else {
                transactionState = "NONE";
            }

            if (count >= this._expiringTime) {
                this._processTransactions.delete(transactionHash);
                return false;
            }

            if (
                transactionState ===
                    Nimiq.Client.TransactionState.INVALIDATED ||
                transactionState === Nimiq.Client.TransactionState.EXPIRED
            ) {
                this._processTransactions.delete(transactionHash);
                return false;
            }
        }

        this._processTransactions.delete(transactionHash);
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
            `Payment sent ${JSON.stringify(result.state)} ${transaction
                .hash()
                .toHex()}`
        );
    }

    clearOldTransactions() {
        const currentTime = performance.now();
        this._processTransactions.forEach((transaction, key) => {
            if (
                currentTime - transaction.creationTime >=
                this._expiringTime * 1000
            ) {
                console.log(`Old transaction deleted ${key}`);
                this._processTransactions.delete(key);
            }
        });
    }
}
