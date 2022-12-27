import Nimiq from "@nimiq/core";

export default class ProcessingTransaction {
    state: Nimiq.Client.TransactionState;
    creationTime: number;

    constructor(state: Nimiq.Client.TransactionState, creationTime: number) {
        this.state = state;
        this.creationTime = creationTime;
    }
}
