"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var MergingQueue = function () {
    function MergingQueue(inputMergingFunction) {
        (0, _classCallCheck3.default)(this, MergingQueue);

        this.queuedRequests = [];
        this.isRequestInFlight = false;
        this.inputMergingFunction = inputMergingFunction;
    }

    (0, _createClass3.default)(MergingQueue, [{
        key: "add",
        value: function add(input, requestFunction) {
            var _this = this;

            var promise = new _promise2.default(function (resolve, reject) {
                return _this.queuedRequests.push({ input: input, requestFunction: requestFunction, resolve: resolve, reject: reject });
            });
            this.wakeupQueue();
            return promise;
        }
    }, {
        key: "squashAndAdd",
        value: function squashAndAdd(input, requestFunction) {
            var queueToSquash = this.queuedRequests;
            this.queuedRequests = [];
            var reducedInput = void 0;
            if (queueToSquash.length > 0) {
                reducedInput = queueToSquash.map(function (r) {
                    return r.input;
                }).reduce(this.inputMergingFunction);
                reducedInput = this.inputMergingFunction(reducedInput, input);
            } else {
                reducedInput = input;
            }
            var promise = this.add(reducedInput, requestFunction);
            queueToSquash.forEach(function (request) {
                return promise.then(request.resolve, request.reject);
            });
            return promise;
        }
    }, {
        key: "isEmpty",
        value: function isEmpty() {
            return this.queuedRequests.length === 0 && !this.isRequestInFlight;
        }
    }, {
        key: "wakeupQueue",
        value: function wakeupQueue() {
            var _this2 = this;

            if (this.queuedRequests.length === 0 || this.isRequestInFlight) {
                return;
            } else {
                var requestToExecute = this.queuedRequests.shift();
                this.isRequestInFlight = true;
                requestToExecute.requestFunction(requestToExecute.input).then(requestToExecute.resolve, requestToExecute.reject).then(function (__) {
                    _this2.isRequestInFlight = false;
                    _this2.wakeupQueue();
                });
            }
        }
    }]);
    return MergingQueue;
}();

exports.MergingQueue = MergingQueue;

var NamespacedMergingQueue = function () {
    function NamespacedMergingQueue(inputReducer) {
        (0, _classCallCheck3.default)(this, NamespacedMergingQueue);

        this.queueByNamespaceKey = new _map2.default();
        this.inputReducer = inputReducer;
    }

    (0, _createClass3.default)(NamespacedMergingQueue, [{
        key: "add",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(namespaceKey, input, requestFunction) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt("return", this.invokeQueueMethod(namespaceKey, function (queue) {
                                    return queue.add(input, requestFunction);
                                }));

                            case 1:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return add;
        }()
    }, {
        key: "squashAndAdd",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(namespaceKey, input, requestFunction) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", this.invokeQueueMethod(namespaceKey, function (queue) {
                                    return queue.squashAndAdd(input, requestFunction);
                                }));

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function squashAndAdd(_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return squashAndAdd;
        }()
    }, {
        key: "invokeQueueMethod",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(namespaceKey, queueMethodInvoker) {
                var queue, result;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!this.queueByNamespaceKey.has(namespaceKey)) {
                                    this.queueByNamespaceKey.set(namespaceKey, new MergingQueue(this.inputReducer));
                                }
                                queue = this.queueByNamespaceKey.get(namespaceKey);
                                result = queueMethodInvoker(queue);

                                if (this.queueByNamespaceKey.get(namespaceKey).isEmpty()) {
                                    this.queueByNamespaceKey.delete(namespaceKey);
                                }
                                return _context3.abrupt("return", result);

                            case 5:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function invokeQueueMethod(_x7, _x8) {
                return _ref3.apply(this, arguments);
            }

            return invokeQueueMethod;
        }()
    }]);
    return NamespacedMergingQueue;
}();

exports.NamespacedMergingQueue = NamespacedMergingQueue;