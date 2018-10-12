"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class Paginator
 * @classdesc Pagination helper class.
 *
 * @property {Array} items Array of elements on current page.
 * @property {Boolean} hasNextPage Indicates the existence of next page.
 * @property {Boolean} hasPrevPage Indicates the existence of previous page.
 */

var Paginator = function () {
    /*
    * @constructor
    * @param {Array} items Array of element for current page.
    * @param {Object} params
    * @private
    */
    function Paginator(items, source, prevToken, nextToken) {
        (0, _classCallCheck3.default)(this, Paginator);

        this.prevToken = prevToken;
        this.nextToken = nextToken;
        this.items = items;
        this.source = source;
    }

    (0, _createClass3.default)(Paginator, [{
        key: "nextPage",

        /**
         * Request next page.
         * Does not modify existing object.
         * @return {Promise<Paginator>}
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.hasNextPage) {
                                    _context.next = 2;
                                    break;
                                }

                                throw new Error('No next page');

                            case 2:
                                return _context.abrupt("return", this.source(this.nextToken));

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function nextPage() {
                return _ref.apply(this, arguments);
            }

            return nextPage;
        }()
        /**
         * Request previous page.
         * Does not modify existing object.
         * @return {Promise<Paginator>}
         */

    }, {
        key: "prevPage",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (this.hasPrevPage) {
                                    _context2.next = 2;
                                    break;
                                }

                                throw new Error('No previous page');

                            case 2:
                                return _context2.abrupt("return", this.source(this.prevToken));

                            case 3:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function prevPage() {
                return _ref2.apply(this, arguments);
            }

            return prevPage;
        }()
    }, {
        key: "hasNextPage",
        get: function get() {
            return !!this.nextToken;
        }
    }, {
        key: "hasPrevPage",
        get: function get() {
            return !!this.prevToken;
        }
    }]);
    return Paginator;
}();

exports.Paginator = Paginator;