"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MergingQueue {
    constructor(inputMergingFunction) {
        this.queuedRequests = [];
        this.isRequestInFlight = false;
        this.inputMergingFunction = inputMergingFunction;
    }
    add(input, requestFunction) {
        let promise = new Promise((resolve, reject) => this.queuedRequests.push({ input, requestFunction, resolve, reject }));
        this.wakeupQueue();
        return promise;
    }
    squashAndAdd(input, requestFunction) {
        let queueToSquash = this.queuedRequests;
        this.queuedRequests = [];
        let reducedInput;
        if (queueToSquash.length > 0) {
            reducedInput = queueToSquash.map(r => r.input).reduce(this.inputMergingFunction);
            reducedInput = this.inputMergingFunction(reducedInput, input);
        }
        else {
            reducedInput = input;
        }
        let promise = this.add(reducedInput, requestFunction);
        queueToSquash.forEach(request => promise.then(request.resolve, request.reject));
        return promise;
    }
    isEmpty() {
        return this.queuedRequests.length === 0 && !this.isRequestInFlight;
    }
    wakeupQueue() {
        if (this.queuedRequests.length === 0 || this.isRequestInFlight) {
            return;
        }
        else {
            let requestToExecute = this.queuedRequests.shift();
            this.isRequestInFlight = true;
            requestToExecute.requestFunction(requestToExecute.input)
                .then(requestToExecute.resolve, requestToExecute.reject)
                .then(__ => {
                this.isRequestInFlight = false;
                this.wakeupQueue();
            });
        }
    }
}
exports.MergingQueue = MergingQueue;
class NamespacedMergingQueue {
    constructor(inputReducer) {
        this.queueByNamespaceKey = new Map();
        this.inputReducer = inputReducer;
    }
    async add(namespaceKey, input, requestFunction) {
        return this.invokeQueueMethod(namespaceKey, queue => queue.add(input, requestFunction));
    }
    async squashAndAdd(namespaceKey, input, requestFunction) {
        return this.invokeQueueMethod(namespaceKey, queue => queue.squashAndAdd(input, requestFunction));
    }
    async invokeQueueMethod(namespaceKey, queueMethodInvoker) {
        if (!this.queueByNamespaceKey.has(namespaceKey)) {
            this.queueByNamespaceKey.set(namespaceKey, new MergingQueue(this.inputReducer));
        }
        const queue = this.queueByNamespaceKey.get(namespaceKey);
        const result = queueMethodInvoker(queue);
        if (this.queueByNamespaceKey.get(namespaceKey).isEmpty()) {
            this.queueByNamespaceKey.delete(namespaceKey);
        }
        return result;
    }
}
exports.NamespacedMergingQueue = NamespacedMergingQueue;
