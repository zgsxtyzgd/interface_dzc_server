var DZC;
(function (DZC) {
    var JSXCall = (function () {
        function JSXCall() {
            this.methods = {};
        }
        JSXCall.prototype.addRPC = function (name, fun, checkSID) {
            if (checkSID === void 0) { checkSID = false; }
            this.methods[name.toLowerCase()] = { fun: fun, checkSID: checkSID };
        };
        JSXCall.prototype.CallRPC = function (querys) {
            var op = querys.op;
            if (op == undefined)
                throw new Error('调用丢失op标识');
            var m = this.methods[op.toString().toLowerCase()];
            if (m == undefined)
                throw new Error('远程方法"{0}"没有被定义'.format(op));
            var config = using('config.json');
            if (m.checkSID) {
                var sid = config.sid;
                if (querys.sid != sid)
                    throw new Error('sid错误');
            }
            var argument;
            if (querys.argument != undefined)
                argument = JSON.parse(querys.argument);
            return m.fun.call(this, querys, argument);
        };
        return JSXCall;
    }());
    DZC.JSXCall = JSXCall;
    exports = JSXCall;
})(DZC || (DZC = {}));
