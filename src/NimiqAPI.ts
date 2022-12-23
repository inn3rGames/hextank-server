import Nimiq from "@nimiq/core";

export default class NimiqAPI {
    private _seed: string;
    private _extendedPrivateKey: Nimiq.ExtendedPrivateKey;
    private _privateKey: Nimiq.PrivateKey;
    private _keyPair: Nimiq.KeyPair;
    private _wallet: Nimiq.Wallet;
    private _client: Nimiq.NanoConsensus;
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

    async init() {
        Nimiq.GenesisConfig.test();
        await this.enableNimiq();
    }

    async enableNimiq() {
        this._client = await Nimiq.Consensus.nano();
        this._blockchain = this._client.blockchain;
        this._network = this._client.network;
        this._mempool = this._client.mempool;
        this._network.connect();

        this._client.on("established", () => {
            this._client.subscribeAccounts([this._wallet.address]);
        });
    }

    async sendNimTo(userFriendlyAddress: string, amount: number) {
        const tx = this._wallet.createTransaction(
            Nimiq.Address.fromUserFriendlyAddress(userFriendlyAddress),
            Nimiq.Policy.coinsToLunas(amount),
            500,
            this._blockchain.height
        );

        let result = await this._client.sendTransaction(tx);
    }
}
