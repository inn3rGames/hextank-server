import Nimiq from "@nimiq/core";

export default class ProcessTransaction {
    state: Nimiq.Client.TransactionState | string;
    processed: boolean = false;

    constructor(state: Nimiq.Client.TransactionState | string) {
        this.state = state;
    }
}
