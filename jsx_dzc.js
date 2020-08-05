var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DZC;
(function (DZC) {
    var Call = using('jsx_call.js');
    var JSXDZC = (function (_super) {
        __extends(JSXDZC, _super);
        function JSXDZC() {
            var _this = _super.call(this) || this;
            _this.addRPC('executeNonQuery', _this.executeNonQuery, true);
            _this.addRPC('executeRows', _this.executeRows, true);
            return _this;
        }
        JSXDZC.prototype.executeNonQuery = function (querys, argument) {
            var config = using('config.json');
            var db = database.createScope(config.db, false, true);
            try {
                return db.executeNonQuery(argument.sql, argument.args);
            }
            finally {
                db.dispose();
            }
        };
        JSXDZC.prototype.executeRows = function (querys, argument) {
            var config = using('config.json');
            var db = database.createScope(config.db, false, true);
            try {
                return db.executeRows(argument.sql, argument.args);
            }
            finally {
                db.dispose();
            }
        };
        return JSXDZC;
    }(Call));
    exports = function (querys) {
        var s = new JSXDZC();
        return s.CallRPC(querys);
    };
})(DZC || (DZC = {}));
