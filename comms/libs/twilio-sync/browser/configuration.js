"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var SUBSCRIPTIONS_PATH = '/v4/Subscriptions';
var MAPS_PATH = '/v3/Maps';
var LISTS_PATH = '/v3/Lists';
var DOCUMENTS_PATH = '/v3/Documents';
var STREAMS_PATH = '/v3/Streams';
function getWithDefault(container, key, defaultValue) {
    if (container && typeof container[key] !== 'undefined') {
        return container[key];
    }
    return defaultValue;
}
/**
 * Settings container for Sync library
 */

var Configuration = function () {
    /**
     * @param {Object} options
     */
    function Configuration() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Configuration);

        var region = options.region || 'us1';
        var defaultCdsUrl = "https://cds." + region + ".twilio.com";
        var baseUri = options.cdsUri || defaultCdsUrl;
        this.settings = {
            subscriptionsUri: baseUri + SUBSCRIPTIONS_PATH,
            documentsUri: baseUri + DOCUMENTS_PATH,
            listsUri: baseUri + LISTS_PATH,
            mapsUri: baseUri + MAPS_PATH,
            streamsUri: baseUri + STREAMS_PATH,
            sessionStorageEnabled: getWithDefault(options.Sync, 'enableSessionStorage', true)
        };
    }

    (0, _createClass3.default)(Configuration, [{
        key: "subscriptionsUri",
        get: function get() {
            return this.settings.subscriptionsUri;
        }
    }, {
        key: "documentsUri",
        get: function get() {
            return this.settings.documentsUri;
        }
    }, {
        key: "listsUri",
        get: function get() {
            return this.settings.listsUri;
        }
    }, {
        key: "mapsUri",
        get: function get() {
            return this.settings.mapsUri;
        }
    }, {
        key: "streamsUri",
        get: function get() {
            return this.settings.streamsUri;
        }
    }, {
        key: "backoffConfig",
        get: function get() {
            return this.settings.backoffConfig || {};
        }
    }, {
        key: "sessionStorageEnabled",
        get: function get() {
            return this.settings.sessionStorageEnabled;
        }
    }]);
    return Configuration;
}();

exports.Configuration = Configuration;