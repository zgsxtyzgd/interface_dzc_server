namespace DZC{
    var Call: typeof JSXCall = using('jsx_call.js');
    class JSXDZC extends Call{
        constructor(){
            super();
            this.addRPC('executeNonQuery',this.executeNonQuery,true);
            this.addRPC('executeRows',this.executeRows,true)
        }

        executeNonQuery(querys:any,argument:any){
            var config=using('config.json');
            var db=database.createScope(config.db,false,true);
            try{
               return db.executeNonQuery(argument.sql,argument.args);
            }
            finally{
                db.dispose();
            }
        }

        executeRows(querys:any,argument:any){
            var config=using('config.json');
            var db=database.createScope(config.db,false,true);
            try{
               return db.executeRows(argument.sql,argument.args);
            }
            finally{
                db.dispose();
            }
        }
    }

    exports = function (querys: any) {
        var s = new JSXDZC();
        return s.CallRPC(querys);
    }
}