import Nimiq from "@nimiq/core";
import CryptoJS from "crypto-js";
import ProcessTransaction from "./ProcessTransaction";

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
    private _pendingTransactions: Map<string, ProcessTransaction> = new Map();
    private _followTransactions: Map<string, ProcessTransaction> = new Map();
    private _processTransactions: Map<string, ProcessTransaction> = new Map();
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

    connect() {
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
                const transactionHash =
                    transactionDetails.transactionHash.toHex();

                this._pendingTransactions.set(
                    transactionHash,
                    new ProcessTransaction(transactionDetails.state)
                );

                const followTransaction =
                    this._followTransactions.get(transactionHash);

                if (followTransaction instanceof ProcessTransaction === true) {
                    this._processTransactions.set(
                        transactionHash,
                        new ProcessTransaction(transactionDetails.state)
                    );
                }

                while (this._pendingTransactions.size > 1000) {
                    const oldTransactionKey = this._pendingTransactions
                        .entries()
                        .next().value[0];
                    this._pendingTransactions.delete(oldTransactionKey);
                }
            },
            [this._wallet.address]
        );
    }

    verifyTransactionIntegrity(options: any): boolean {
        const transactionData = options.signedObject.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );
        const transactionIntegrity = transaction.verify(
            options.signedObject.raw.networkId
        );

        let transactionAmountValid: boolean;
        if (
            options.signedObject.raw.value >=
                process.env.NIMIQ_LUNA_ENTRY_FEE &&
            options.signedObject.raw.fee >=
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

    async verifyTransactionState(options: any): Promise<boolean> {
        const transactionData = options.signedObject.serializedTx;
        const transaction = Nimiq.ExtendedTransaction.unserialize(
            Nimiq.BufferUtils.fromAny(transactionData)
        );

        let transactionHash = transaction.hash().toHex();
        let transactionState: string;

        let pendingTransaction = this._pendingTransactions.get(transactionHash);
        if (pendingTransaction instanceof ProcessTransaction === true) {
            transactionState = pendingTransaction.state;
            if (
                transactionState === Nimiq.Client.TransactionState.PENDING ||
                transactionState === Nimiq.Client.TransactionState.MINED ||
                transactionState === Nimiq.Client.TransactionState.CONFIRMED
            ) {
                console.log("Auth via pending transaction");
                return true;
            }
        }

        this._followTransactions.set(
            transactionHash,
            new ProcessTransaction(transactionState)
        );

        let processTransaction = this._processTransactions.get(transactionHash);
        if (processTransaction instanceof ProcessTransaction === true) {
            transactionState = processTransaction.state;
        } else {
            transactionState = "NONE";
        }

        let count = 0;

        while (
            transactionState !== Nimiq.Client.TransactionState.PENDING &&
            transactionState !== Nimiq.Client.TransactionState.MINED &&
            transactionState !== Nimiq.Client.TransactionState.CONFIRMED
        ) {
            processTransaction = this._processTransactions.get(transactionHash);
            if (processTransaction instanceof ProcessTransaction === true) {
                transactionState = processTransaction.state;
            } else {
                transactionState = "NONE";
            }

            if (count >= this._expiringTime) {
                if (processTransaction instanceof ProcessTransaction === true) {
                    processTransaction.processed = true;
                }
                return false;
            }

            if (
                transactionState ===
                    Nimiq.Client.TransactionState.INVALIDATED ||
                transactionState === Nimiq.Client.TransactionState.EXPIRED
            ) {
                processTransaction.processed = true;
                return false;
            }

            count += 1;
            await this._delay(1000);
        }

        if (processTransaction instanceof ProcessTransaction === true) {
            processTransaction.processed = true;
        }
        return true;
    }

    _convertToUint8Array(object: any): Uint8Array {
        const keys = Object.keys(object);
        let convertedArray: any = [];
        let convertedUint8Array: Uint8Array;

        keys.forEach((key) => {
            convertedArray.push(object[key]);
        });
        convertedUint8Array = Uint8Array.from(convertedArray);

        return convertedUint8Array;
    }

    verifySignedMessage(options: any): boolean {
        const adMessage = options.adMessage;
        const decryptedAdMessage = CryptoJS.AES.decrypt(
            adMessage,
            "DELIVERED"
        ).toString(CryptoJS.enc.Utf8);
        const adState = decryptedAdMessage.slice(40, decryptedAdMessage.length);

        if (adState !== "DELIVERED") {
            return false;
        } else {
            const signature = new Nimiq.Signature(
                this._convertToUint8Array(options.signedObject.signature)
            );
            const publicKey = new Nimiq.PublicKey(
                this._convertToUint8Array(options.signedObject.signerPublicKey)
            );

            const prefix = "\x16Nimiq Signed Message:\n";
            const message = "HexTank.io earn mode entry " + adMessage;
            const messageLength = message.length.toString();

            const data = prefix + messageLength + message;
            const dataBytes = Nimiq.BufferUtils.fromUtf8(data);
            const hash = Nimiq.Hash.computeSha256(dataBytes);

            const isValid = signature.verify(publicKey, hash);

            if (isValid === true) {
                return true;
            } else {
                return false;
            }
        }
    }

    async payoutTo(
        userFriendlyAddress: string,
        amount: number,
        fee: number,
        type: string,
        id: string
    ) {
        const rawExtraData = `HexTank.io ${type} ${id}`;
        const extraData = Nimiq.BufferUtils.fromAscii(rawExtraData);

        this._client.getHeadHeight().then((height) => {
            const transaction = new Nimiq.ExtendedTransaction(
                this._wallet.address,
                Nimiq.Account.Type.BASIC,
                Nimiq.Address.fromUserFriendlyAddress(userFriendlyAddress),
                Nimiq.Account.Type.BASIC,
                amount,
                fee,
                height,
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

            this._sendAndRetryTransaction(transaction);
        });
    }

    private async _sendAndRetryTransaction(
        transaction: Nimiq.ExtendedTransaction
    ) {
        let count = 0;

        function retry(
            client: Nimiq.Client,
            transaction: Nimiq.ExtendedTransaction,
            details: Nimiq.ClientTransactionDetails,
            expiringTime: number
        ) {
            count += 1;

            let transactionHash = transaction.hash().toHex();
            let transactionState = details.state;

            if (
                transactionState !== Nimiq.Client.TransactionState.PENDING &&
                transactionState !== Nimiq.Client.TransactionState.MINED &&
                transactionState !== Nimiq.Client.TransactionState.CONFIRMED
            ) {
                if (count >= expiringTime) {
                    return;
                }

                console.log(
                    `Payment sent again ${count} time(s) ${transactionHash}`
                );
                client.sendTransaction(transaction).then((details) => {
                    retry(client, transaction, details, expiringTime);
                });
            } else {
                console.log(`Payment sent first time ${transactionHash}`);
                return;
            }
        }

        this._client.sendTransaction(transaction).then((details) => {
            retry(this._client, transaction, details, this._expiringTime);
        });
    }

    clearOldTransactions() {
        this._processTransactions.forEach((transaction, key) => {
            if (transaction.processed === true) {
                this._followTransactions.delete(key);
                this._processTransactions.delete(key);
            }
        });
    }
}
