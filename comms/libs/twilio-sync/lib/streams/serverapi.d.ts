export interface StreamDescriptor {
    sid: string;
    unique_name: string;
    url: string;
    date_expires: string;
    links: StreamLinks;
}
export interface StreamLinks {
    messages: string;
}
export interface PublishMessageRequest {
    data: object;
}
export interface PublishMessageResponse {
    sid: string;
}
