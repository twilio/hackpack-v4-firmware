export declare type RequestFunction<InputType, ReturnType> = (input: InputType) => Promise<ReturnType>;
export declare type InputReducer<InputType> = (acc: InputType, input: InputType) => InputType;
export interface QueuedRequest<InputType, ReturnType> {
    input: InputType;
    requestFunction: RequestFunction<InputType, ReturnType>;
    resolve: (result: ReturnType) => any;
    reject: (error: any) => any;
}
export declare class MergingQueue<InputType, ReturnType> {
    private queuedRequests;
    private inputMergingFunction;
    private isRequestInFlight;
    constructor(inputMergingFunction: InputReducer<InputType>);
    add(input: InputType, requestFunction: RequestFunction<InputType, ReturnType>): Promise<ReturnType>;
    squashAndAdd(input: InputType, requestFunction: RequestFunction<InputType, ReturnType>): Promise<ReturnType>;
    isEmpty(): boolean;
    private wakeupQueue;
}
export declare class NamespacedMergingQueue<K, InputType, ReturnType> {
    private inputReducer;
    private queueByNamespaceKey;
    constructor(inputReducer: InputReducer<InputType>);
    add(namespaceKey: K, input: InputType, requestFunction: RequestFunction<InputType, ReturnType>): Promise<ReturnType>;
    squashAndAdd(namespaceKey: K, input: InputType, requestFunction: RequestFunction<InputType, ReturnType>): Promise<ReturnType>;
    invokeQueueMethod(namespaceKey: K, queueMethodInvoker: (queue: MergingQueue<InputType, ReturnType>) => Promise<ReturnType>): Promise<ReturnType>;
}
