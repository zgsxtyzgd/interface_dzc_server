var Balance;
(function (Balance) {
    var JSXCall = (function () {
        function JSXCall() {
            this.methods = {};
        }
        JSXCall.prototype.addRPC = function (name, fun) {
            this.methods[name.toLowerCase()] = { fun: fun };
        };
        JSXCall.prototype.CallRPC = function (querys) {
            var op = querys.op;
            if (op == undefined)
                throw new Error('调用丢失op标识');
            var m = this.methods[op.toString().toLowerCase()];
            if (m == undefined)
                throw new Error('远程方法"{0}"没有被定义'.format(op));
            var argument;
            if (querys.argument != undefined)
                argument = JSON.parse(querys.argument);
            return m.fun(querys, argument);
        };
        return JSXCall;
    }());
    Balance.JSXCall = JSXCall;
    exports = JSXCall;
})(Balance || (Balance = {}));
