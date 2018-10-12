"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("../entity");
const utils_1 = require("../utils");
/**
 * @class
 * @alias Stream
 * @classdesc A Sync primitive for pub-sub messaging. Stream Messages are not persisted, exist
 *     only in transit, and will be dropped if (due to congestion or network anomalies) they
 *     cannot be delivered promptly. Use the {@link Client#stream} method to obtain a reference to a Sync Message Stream.
 * @property {String} sid The immutable system-assigned identifier of this stream. Never null.
 * @property {String} [uniqueName=null] A unique identifier optionally assigned to the stream on creation.
 *
 * @fires Stream#messagePublished
 * @fires Stream#removed
 */
class SyncStream extends entity_1.SyncEntity {
    /**
     * @private
     */
    constructor(services, descriptor, removalHandler) {
        super(services, removalHandler);
        this.descriptor = descriptor;
    }
    // private props
    get uri() { return this.descriptor.url; }
    get links() { return this.descriptor.links; }
    static get type() { return 'stream'; }
    get dateExpires() { return this.descriptor.date_expires; }
    get type() { return 'stream'; }
    get lastEventId() { return null; }
    ;
    // public props, documented along with class description
    get sid() { return this.descriptor.sid; }
    get uniqueName() { return this.descriptor.unique_name || null; }
    /**
     * Publish a Message to the Stream. The system will attempt delivery to all online subscribers.
     * @param {Object} value The body of the dispatched message. Maximum size in serialized JSON: 4KB.
     * A rate limit applies to this operation, refer to the [Sync API documentation]{@link https://www.twilio.com/docs/api/sync} for details.
     * @return {Promise<StreamMessage>} A promise which resolves after the message is successfully published
     *   to the Sync service. Resolves irrespective of ultimate delivery to any subscribers.
     * @public
     * @example
     * stream.publishMessage({ x: 42, y: 123 })
     *   .then(function(message) {
     *     console.log('Stream publishMessage() successful, message SID:' + message.sid);
     *   })
     *   .catch(function(error) {
     *     console.error('Stream publishMessage() failed', error);
     *   });
     */
    async publishMessage(value) {
        const requestBody = { data: value };
        const response = await this.services.network.post(this.links.messages, requestBody);
        const responseBody = response.body;
        const event = this._handleMessagePublished(responseBody.sid, value, false);
        return event;
    }
    /**
     * Update the time-to-live of the stream.
     * @param {Number} ttl Specifies the TTL in seconds after which the stream is subject to automatic deletion. The value 0 means infinity.
     * @return {Promise<void>} A promise that resolves after the TTL update was successful.
     * @public
     * @example
     * stream.setTtl(3600)
     *   .then(function() {
     *     console.log('Stream setTtl() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Stream setTtl() failed', error);
     *   });
     */
    async setTtl(ttl) {
        utils_1.validateMandatoryTtl(ttl);
        try {
            const requestBody = { ttl: ttl };
            const response = await this.services.network.post(this.uri, requestBody);
            this.descriptor.date_expires = response.body.date_expires;
        }
        catch (error) {
            if (error.status === 404) {
                this.onRemoved(false);
            }
            throw error;
        }
    }
    /**
     * Permanently delete this Stream.
     * @return {Promise<void>} A promise which resolves after the Stream is successfully deleted.
     * @public
     * @example
     * stream.removeStream()
     *   .then(function() {
     *     console.log('Stream removeStream() successful');
     *   })
     *   .catch(function(error) {
     *     console.error('Stream removeStream() failed', error);
     *   });
     */
    async removeStream() {
        await this.services.network.delete(this.uri);
        this.onRemoved(true);
    }
    /**
     * Handle event from the server
     * @private
     */
    _update(update) {
        switch (update.type) {
            case 'stream_message_published': {
                this._handleMessagePublished(update.message_sid, update.message_data, true);
                break;
            }
            case 'stream_removed': {
                this.onRemoved(false);
                break;
            }
        }
    }
    _handleMessagePublished(sid, data, remote) {
        const event = {
            sid: sid,
            value: data
        };
        this.emit('messagePublished', { message: event, isLocal: !remote });
        return event;
    }
    onRemoved(isLocal) {
        this._unsubscribe();
        this.removalHandler(this.type, this.sid, this.uniqueName);
        this.emit('removed', { isLocal: isLocal });
    }
}
exports.SyncStream = SyncStream;
exports.default = SyncStream;
/**
 * @class StreamMessage
 * @classdesc Stream Message descriptor.
 * @property {String} sid Contains Stream Message SID.
 * @property {Object} value Contains Stream Message value.
 */
/**
 * Fired when a Message is published to the Stream either locally or by a remote actor.
 * @event Stream#messagePublished
 * @param {Object} args Arguments provided with the event.
 * @param {StreamMessage} args.message Published message.
 * @param {Boolean} args.isLocal Equals 'true' if message was published by local code, 'false' otherwise.
 * @example
 * stream.on('messagePublished', function(args) {
 *   console.log('Stream message published');
 *   console.log('Message SID: ' + args.message.sid);
 *   console.log('Message value: ', args.message.value);
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
/**
 * Fired when a stream is removed entirely, whether the remover was local or remote.
 * @event Stream#removed
 * @param {Object} args Arguments provided with the event.
 * @param {Boolean} args.isLocal Equals 'true' if stream was removed by local code, 'false' otherwise.
 * @example
 * stream.on('removed', function(args) {
 *   console.log('Stream ' + stream.sid + ' was removed');
 *   console.log('args.isLocal:', args.isLocal);
 * });
 */
