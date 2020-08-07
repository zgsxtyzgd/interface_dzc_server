function split(s: string) {
    var reg_go = /(\r?\n)?go\r?\n/i;
    var ss = s.split(reg_go);
    var reg_exe = /insert|update|delete|exec/i;
    var rs = [];
    for (let i = 0; i < ss.length; i++) {
        if (reg_exe.test(ss[i]))
            rs.push(ss[i]);
    }
    var r = '';
    for (let i = 0; i < rs.length; i++) {
        if (i > 0)
            r += 'go\r\n';
        r += rs[i] + '\r\n';
    }
    return r;
}

function tx(src: any, vs: string) {
    var vxs = vs.split(/\r?\n/);
    var vx = {};
    for (let i = 0; i < vxs.length; i++) {
        var r = vxs[i];
        var rx = r.split(/\t/);
        vx[rx[0].toLowerCase()] = { nullable: rx[1].toLowerCase() == 'yes', desc: rx[2] };
    }
    var s = '';
    var first = true;
    for (let k in src) {
        var v = vx[k];
        var r = k;
        r += '\t' + JSON.stringify(src[k]);
        if (v != undefined) {
            r += '\t' + (v.nullable ? '是' : '否');
            r += '\t' + v.desc;
        }
        else
            r += '\t相关信息未发现';
        if (first)
            first = false;
        else
            s += '\r\n';
        s += r;
    }
    return s;

}

function txx(src: string, desc: string) {
    function CastType(t: string) {
        switch (t.toLowerCase()) {
            case 'bigint ':
            case 'decimal':
            case 'exdecimal':
            case 'exexchrate':
            case 'exmoney':
            case 'exprice':
            case 'exrate':
            case 'int':
            case 'money':
            case 'float':
            case 'numeric':
            case 'ia_decimal':
            case 'real':
            case 'smallint':
            case 'udt_changerate':
            case 'tinyint':
            case 'udt_logisticquantity':
            case 'udt_qty':
            case 'udt_rate':
            case 'udt_rate100':
                return "number";
            case 'bit':
                return "boolean";
            case 'excode':
            case 'nchar':
            case 'ntext':
            case 'char':
            case 'nvarchar':
            case 'sysname':
            case 'text':
            case 'uftext':
            case 'ufemail':
            case 'ufuid':
            case 'varchar':
                return 'string';
            case 'ufdate':
            case 'ufdatetime':
            case 'smalldatetime':
            case 'uftime':
            case 'datetime':
                return "Date";
            case 'fd_udt_digest':
            case 'fd_udt_id':
            case 'fd_udt_username':
            case 'image':
            case 'timestamp':
            case 'udt_wkhr':
            case 'ufflag':
            case 'ufhyperlink':
            case 'ufmedia':
            case 'ufreference':
            case 'ufuid':
            case 'uniqueidentifier':
            case 'userdecimal':
            case 'varbinary':
            case 'binary':
            default:
                return t;

        }
    }

    var desc_ss = desc.split(/field\-\>/);
    var s = '';
    if(src!=null){
        var desc_dict = {};
        for (let i = 0; i < desc_ss.length; i++) {
            var r = desc_ss[i];
            r = r.trim();
            if (r == '')
                continue;
            r = r.replace('\r\n', '');
            var rx = r.split(/\t/);
            desc_dict[rx[0].toLowerCase()] = { type:CastType(rx[1]), nullable: rx[2].toLowerCase() == 'yes', desc: rx[3] };
        }
        var first = true;
        var src_ss = src.split(',');
        for (let i = 0; i < src_ss.length; i++) {
            var r = src_ss[i];
            r = r.replace('\r\n', '');
            r = r.trim();
            var rx = r.split('=');
            var rk = rx[0].trim().toLowerCase();
            var rv = rx[1].trim();

            var v = desc_dict[rk];
            var result = rk;
            if(rv=='NULL')
                rv='null';
            else
                rv=rv.replace("N'","'");
            
            result += '\t' + rv;
            if (v != undefined) {
                result +='\t'+ v.type;
                result += '\t' + (v.nullable ? '是' : '否');
                result += '\t' + v.desc;
            }
            else
                result += '\t相关信息未发现';
            if (first)
                first = false;
            else
                s += '\r\n';
            s += result;
        }
    }
    else{
        for (let i = 0; i < desc_ss.length; i++) {
            var r = desc_ss[i];
            r = r.trim();
            if (r == '')
                continue;
            r = r.replace(/\r?\n/g, '');
            
            var rx = r.split(/\t/);
            s+=rx[0]+':'+CastType(rx[1]);
            if(i<desc_ss.length-1)
                s+=',';
            s+=' //'+rx[3]+"\r\n";
        }
        s='{'+s+'}'
    }
    return s;

}

function splitEx(s:string,spliter:any,each:(v:string,idx:number)=>any):string{
    var ss=s.split(spliter);
    var vs='';
    for(let i=0;i<ss.length;i++){
        vs+=(each(ss[i].replace(/(\r?\n)|\t/g,''),i));
    }
    return vs;

}