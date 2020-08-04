namespace Balance {
    export class JSXCall {
        private methods: any;
        constructor() {
            this.methods = {};
        }
        protected addRPC(name: string, fun: (querys:any, argument: any) => any) {
            this.methods[name.toLowerCase()] = { fun: fun };
        }
        public CallRPC(querys: any): any {
            var op: string = querys.op;
            if (op == undefined)
                throw new Error('调用丢失op标识');
            var m: {fun: (args: any,argument:any) => any} = this.methods[op.toString().toLowerCase()];
            if (m == undefined)
                throw new Error('远程方法"{0}"没有被定义'.format(op));
            let argument;
            if(querys.argument!=undefined)
                argument=JSON.parse(querys.argument);
            return m.fun(querys,argument);
        }
    }
    exports = JSXCall;
}