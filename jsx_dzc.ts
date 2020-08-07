namespace DZC {
    var Call: typeof JSXCall = using('jsx_call.js');
    class JSXDZC extends Call {
        constructor() {
            super();
            this.addRPC('executeNonQuery', this.executeNonQuery, true);
            this.addRPC('executeRows', this.executeRows, true);
            this.addRPC('importOrder', this.importOrder, true);
            this.addRPC('text', this.text, false);
        }

        text() {
            var config = using('config.json');
            var db = database.createScope(config.db, false, true);
            try {
                return db.executeRows("select ccode_name from code where ccode='xxxx'");

            }
            finally {
                db.dispose();
            }
        }

        executeNonQuery(querys: any, argument: any) {
            var config = using('config.json');
            var db = database.createScope(config.db, false, true);
            try {
                return db.executeNonQuery(argument.sql, argument.args);
            }
            finally {
                db.dispose();
            }
        }

        executeRows(querys: any, argument: any) {
            var config = using('config.json');
            var db = database.createScope(config.db, false, true);
            try {
                return db.executeRows(argument.sql, argument.args);

            }
            finally {
                db.dispose();
            }
        }
        private Round(x: number, length: number) {
            var pow = Math.pow(10, length);
            return Math.round(x * pow) / pow;
        }

        private check_code(db: DBScope, codeField: string, tbName: string, code: string, errMsg: string) {
            if (code != null) {
                if (db.executeScalar("select count(*) from {0} where {1}=@code".format(tbName, codeField), { code: code }) == 0)
                    throw new Error(errMsg);
            }
        }

        private checkInventory(db: DBScope, code: string): void {
            this.check_code(db, "cinvcode", "inventory", code, '商品代码"{0}"无效'.format(code));
        }

        private checkWarehouse(db: DBScope, code: string): void {
            this.check_code(db, "cwhcode", "warehouse", code, '仓库代码"{0}"无效'.format(code));
        }

        private checkDepartment(db: DBScope, code: string): void {
            this.check_code(db, "cdepcode", "department", code, '部门代码"{0}"无效'.format(code));
        }

        private checkVendor(db: DBScope, code: string): void {
            this.check_code(db, "cvencode", "vendor", code, '供货商代码"{0}"无效'.format(code));
        }

        private checkCustomer(db: DBScope, code: string): void {
            this.check_code(db, "ccuscode", "customer", code, '客户代码"{0}"无效'.format(code));
        }

        private checkPT(db: DBScope, code: string): void {
            this.check_code(db, "cPTCode", "purchasetype", code, '采购类型代码"{0}"无效'.format(code));
        }

        private checkPerson(db: DBScope, code: string): void {
            this.check_code(db, "cPersonCode", "Person", code, '职员类型代码"{0}"无效'.format(code));
        }

        private checkRd_Style(db: DBScope, code: string): void {
            this.check_code(db, "crdcode", "rd_style", code, '收发类别代码"{0}"无效'.format(code));
        }

        public GetVTID(db: DBScope, name: string) {
            return db.executeScalar("select def_id from vouchers where name=@name", { name: name });
        }


        public GetID(db: DBScope, acctid: string, voucherType: string, amount: number = 0): { fatherid: string, childid: string } {
            let rs = db.executeRows(`declare @iFatherId bigint,@iChildId bigint;
            exec sp_getid @cAcc_Id=@cacc_id,@cVouchType=@cVouchType,@iAmount=@iAmount ,@iFatherId=@iFatherId output,@iChildId=@iChildId output
            select cast(@ifatherid as nvarchar(20)) fatherid,cast(@ichildid as nvarchar(20)) childid`, { cacc_id: acctid, cvouchtype: voucherType, iamount: amount });
            return rs[0];
        }

        public check_current(db: DBScope, name: string) {
            if (db.executeScalar("select count(*) from foreigncurrency where cexch_name=@name", { name: name }) == 0)
                throw new Error('无效的币种"{0}"'.format(name));
        }

        private SetUnit(db: DBScope, cinvcode: string, unitcode: string, iquantity: number, inum: number): { cunitid?: string, iquantity?: number, inum?: number } {
            let r: { cunitid?: string, iquantity?: number, inum?: number } = {};
            let ug: { igrouptype: number, cgroupcode: string };
            {
                let rs = db.executeRows("select iGroupType,cGroupCode from Inventory where cInvCode=@invcode ", { invcode: cinvcode });
                if (rs.length == 0)
                    throw new Error('物料代码"{0}"不存在'.format(cinvcode));
                ug = rs[0];
            }
            if (ug.igrouptype == 0) {
                if (iquantity == null)
                    throw new Error('iquantity必须被设置')
                r.iquantity = iquantity;
                r.cunitid = null;
                r.inum = null;
            }
            else if (ug.igrouptype == 1) {
                if (unitcode == null)
                    throw new Error('根据相关计量单位设置,属性 cunitid(计量单位代码)必须被设置');
                var changeRate: number = db.executeScalar("select iChangRate from ComputationUnit where cGroupCode=@groupcode and cComunitCode=@unitcode",
                    { groupcode: ug.cgroupcode, unitcode: unitcode });
                if (typeof changeRate == 'undefined')
                    throw new Error('相关计量单位代码"{0}"无效'.format(unitcode));
                if (changeRate == null || changeRate == 0)
                    throw new Error('相关计量单位代码"{0}"的换算率的值为无效值（0或null）'.format(unitcode));
                r.cunitid = unitcode;
                if (iquantity != null) {
                    r.inum = this.Round(iquantity / changeRate, 2);
                    r.iquantity = iquantity;
                }
                else if (inum != null) {
                    r.iquantity = this.Round(inum * changeRate, 2);
                    r.inum = inum;
                }
                else
                    throw new Error('计量单位要求 iquantity或inum必须设置一个')
            }
            else if (ug.igrouptype == 2) {
                if (unitcode == null)
                    throw new Error('根据相关设置,属性 cunitid(计量单位代码)必须被设置');
                let unit: { ichangrate: number, bmainunit: boolean };
                {
                    let rs = db.executeRows("select iChangRate,bMainUnit from ComputationUnit where cGroupCode=@groupcode and cComunitCode=@unitcode",
                        { groupcode: ug.cgroupcode, unitcode: unitcode });
                    if (rs.length == 0)
                        throw new Error('相关计量单位代码"{0}"无效'.format(unitcode));
                    unit = rs[0];
                }
                if (unit.bmainunit)
                    throw new Error('cunitid属性不能被设置为主计量单位');
                r.cunitid = unitcode;
                if (iquantity != null) {
                    if (inum == null) {
                        if (unit.ichangrate == null)
                            throw Error('因计量单位限制inum属性必须被设置');
                        r.iquantity = iquantity;
                        r.inum = this.Round(iquantity / unit.ichangrate, 2);
                    }
                    else {
                        r.iquantity = iquantity;
                        r.inum = inum;
                    }
                }
                else {
                    if (unit.ichangrate == null)
                        throw new Error('因计量单位限制iquantity属性必须被设置');
                    if (inum == null)
                        throw new Error('iquantity属性和inum属性至少应该被设置一个');
                    r.iquantity = this.Round(inum * unit.ichangrate, 2);
                    r.inum = inum;
                }
            }
            else
                throw new Error('相关计量单位的属性 igrouptype 被设置为无效的值:{0}'.format(ug.igrouptype));
            return r;
        }

        private toNumber(value: any): number {
            switch (typeof value) {
                case 'number':
                    return value;
                case 'string':
                    return parseFloat(value);
                default:
                    return null;

            }
        }

        private setTaxPrice(db: DBScope, idiscounttaxtype: number, nFlat: number, cinvcode: string, ipertaxrate: number, headTaxRate: number, iunitprice: number, itaxprice: number, iquantity: number)
            : { iunitprice: number, imoney: number, itax: number, isum: number, itaxprice: number, nPrice: number, nMoney: number, nSum: number, nTax: number } {
            var taxRate = ipertaxrate;
            if (taxRate == null) {
                if (headTaxRate != null)
                    taxRate = headTaxRate;
                else {
                    taxRate = db.executeScalar("select iTaxRate from Inventory where cinvcode=@code", { code: cinvcode });
                    if(typeof taxRate=='undefined')
                        throw new Error('存货"{0}"无效'.format(cinvcode));
                    if (taxRate == null)
                        taxRate = 0;
                }
            }
            taxRate = this.toNumber(taxRate);
            if (taxRate == null || taxRate < 0)
                throw new Error('税率的值不合法');
            taxRate = taxRate / 100;
            var money: number, sum: number, tax: number;
            if (iunitprice != null) {
                if (idiscounttaxtype == 0) {
                    itaxprice = this.Round((1 + taxRate) * iunitprice, 4);
                }
                else if (idiscounttaxtype == 1) {
                    itaxprice = this.Round(iunitprice / (1 - taxRate), 4);
                }
            }
            else if (itaxprice != null) {
                if (idiscounttaxtype == 0)
                    iunitprice = this.Round(itaxprice / (1 + taxRate), 4);
                else if (idiscounttaxtype == 1)
                    iunitprice = this.Round(itaxprice * (1 - taxRate), 4);
            }
            money = this.Round(iunitprice * iquantity, 2);
            sum = this.Round(itaxprice * iquantity, 2);
            tax = this.Round(sum - money, 2);

            var nPrice = iunitprice * nFlat;
            var nMoney = this.Round(money * nFlat, 2);
            var nTax = this.Round(tax * nFlat, 2);
            var nSum = this.Round(sum * nFlat, 2);

            return { iunitprice: iunitprice, itaxprice: itaxprice, itax: tax, imoney: money, isum: sum, nPrice: nPrice, nMoney: nMoney, nSum: nSum, nTax: nTax };
        }

        private checkItem(db: DBScope, itemclass: string, item: string): string {
            if (itemclass == null)
                return;
            var className = db.executeScalar("select citem_name from fitemclass where citem_class=@class", { class: itemclass });
            if (className == undefined)
                throw new Error('citem_class的值"{0}"不存在'.format(itemclass));
            if (item == null)
                return className;
            let v = db.executeScalar("select citemname from fitemss{0} where citemcode=@code".format(itemclass), { code: item });
            if (v == null)
                throw new Error('无效的核算项目大类"{0}"不存在代码"{1}"'.format(className, item));
            return v;
        }

        /**获取当前单据号 */
        private GetNO(db: DBScope, tbname: string, field: string, date?: Date) {
            function DateOrder() {
                var syear = ('0000' + date.getFullYear().toString());
                syear = syear.substr(syear.length - 4, 4);
                var smonth = ('00' + (date.getMonth() + 1).toString());
                smonth = smonth.substr(smonth.length - 2, 2);
                var prifx = syear.substr(2, 2) + smonth;

                var mx = db.executeScalar("select max(substring({1},5,4)) from {0} where {1} like @prifx+'[0-9][0-9][0-9][0-9]'".format(tbname, field), { prifx: prifx });
                if (mx == null)
                    return prifx + '0001';
                var sx = '0000' + (parseFloat(mx) + 1).toString();
                return prifx + sx.substr(sx.length - 4, 4);
            }
            function BigOrder() {
                var mx = db.executeScalar("select max({1}) from {0} where {1} like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'".format(tbname, field));
                if (mx == null)
                    return '00000001';
                var sx = '00000000' + (parseFloat(mx) + 1).toString();
                return sx.substr(sx.length - 8, 8);
            }
            if (date)
                return DateOrder();
            else
                return BigOrder();
        }

        private str2Date(date: string): Date {
            var reg_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/i;
            if (!reg_date.test(date))
                return null;
            var ds = date.split('-');
            var year = parseFloat(ds[0]);
            var month = parseFloat(ds[1]);
            var day = parseFloat(ds[2]);
            if (month == 0 || day == 0)
                return null;
            switch (month) {
                case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                    if (day > 31)
                        return null;
                    break;
                case 2:
                    if (year % 4 == 0) {
                        if (day > 29)
                            return null;
                    }
                    else if (day > 28)
                        return null;
                    break;
                default:
                    if (day > 30)
                        return null;
                    break;
            }
            return new Date(year, month - 1, day);

        }

        private insert2DB(db: DBScope, table: string, obj: any): void {
            var fd = [];
            for (let k in obj) {
                fd.push(k);
            }
            var sfn = '';
            var sfd = '';
            for (let i = 0; i < fd.length; i++) {
                if (i > 0) {
                    sfn += ',';
                    sfd += ',';
                }
                sfn += fd[i];
                sfd += '@' + fd[i];
            }
            var sql = 'insert into ' + table + "(" + sfn + ")values(" + sfd + ")";
            db.executeNonQuery(sql, obj);
        }
        cloneObj(obj: any): any {
            var no = {};
            for (let k in obj) {
                no[k.toLowerCase()] = obj[k];
            }
            return no;
        }
        setObj(fields: string[], srcObj: any, destObj: any) {
            for (let i = 0; i < fields.length; i++) {
                var s = srcObj[fields[i]];
                if (typeof s != 'undefined')
                    destObj[fields[i]] = srcObj[fields[i]];
            }
        }

        _importOrder(argument: any) {
            
            var std_main = {
                cbustype: '普通采购',
                cexch_name: '人民币',
                nflat: 1,
                icost: 0,
                ibargain: 0,
                cstate: 0,
                idiscounttaxtype: 0,
            }

            var std_detail = {
                //此处放置要缺省的字段值                
            };

            var mfs = ['dpodate', 'cpoid', 'idiscounttaxtype', 'cvencode', 'cdepcode', 'cpersoncode', 'cptcode', 'carrivalplace', 'cexch_name', 'nflat',
                'itaxrate', 'icost', 'ibargain', 'cmemo', 'cmaker','cverifier', 'cdefine1', 'cdefine2', 'cdefine3', 'cdefine4', 'cdefine5', 'cdefine6',
                'cdefine7', 'cdefine8', 'cdefine9', 'cdefine10', 'cdefine11', 'cdefine12', 'cdefine13', 'cdefine14', 'cdefine15', 'cdefine16'
                , 'ccontactcode', 'cvenperson', 'cvenbank', 'cvenaccount',
            ];
            var dfs = ['cinvcode', 'iquantity', 'inum', 'iunitprice', 'itaxprice', 'ipertaxrate', 'bgsp', 'cunitid', 'btaxcost',
                'darrivedate', 'citemcode', 'citem_class', 'citemname', 'cbmemo', 'cfree1', 'cfree2', 'cfree3', 'cfree4', 'cfree5', 'cfree6',
                'cfree7', 'cfree8', 'cfree9', 'cfree10', 'cdefine22', 'cdefine23', 'cdefine24', 'cdefine25', 'cdefine26', 'cdefine27',
                'cdefine28', 'cdefine29', 'cdefine30', 'cdefine31', 'cdefine32', 'cdefine33', 'cdefine34', 'cdefine35', 'cdefine36', 'cdefine37',
            ]
            var head = argument.head;
            if (head.cexch_name != null) {
                if (head.nflat == null)
                    throw new Error('在设置了 cexch_name 属性时 nflat属性也必须被设置');
                if (head.nflat <= 0) {
                    throw new Error('在设置了 cexch_name 属性时 nflat属性必须大于零');
                }
            }
            var mainObj:U8.PO_POMain = this.cloneObj(std_main);
            this.setObj(mfs, head, mainObj);
            if (mainObj.dpodate == undefined)
                throw new Error('dpodate字段必须被设置');
            if (mainObj.cmaker == undefined)
                throw new Error('cmaker 字段必须被设置')
            var date = this.str2Date(mainObj.dpodate as string);
            if (date == null)
                throw new Error('dpodate字段格式错误,期待 类似于 2020-4-5 格式')
            mainObj.dpodate = date.date;
            if (mainObj.idiscounttaxtype < 0 && mainObj.idiscounttaxtype > 1)
                throw new Error('属性 idiscounttaxtype 值只能是 0,1');
            var config = using('config.json');
            var db = database.createScope(config.db, true, true);
            try {
                var acctid = db.executeScalar("select cacc_id from  ufsystem..UA_AccountDatabase where cdatabase=db_name()");

                this.check_current(db, mainObj.cexch_name);

                mainObj.ivtid = this.GetVTID(db, 'PO');
                this.checkVendor(db, mainObj.cvencode);
                this.checkDepartment(db, mainObj.cdepcode);
                this.checkPerson(db, mainObj.cpersoncode);
                this.checkPT(db, mainObj.cptcode);
                var body = argument.body;

                var entrys = [];
                for (let ir = 0; ir < body.length; ir++) {
                    let rd = body[ir];
                    let detailObj:U8.PO_PODetails = this.cloneObj(std_detail);
                    this.setObj(dfs, rd, detailObj);
                    this.checkInventory(db, detailObj.cinvcode);

                    detailObj.citemname = this.checkItem(db, detailObj.citem_class, detailObj.citemcode);
                    var uts = this.SetUnit(db, detailObj.cinvcode, detailObj.cunitid, detailObj.iquantity, detailObj.inum);
                    detailObj.ivouchrowno = ir + 1;
                    detailObj.cunitid = uts.cunitid;
                    detailObj.iquantity = uts.iquantity;
                    detailObj.inum = uts.inum;
                    var price = this.setTaxPrice(db, mainObj.idiscounttaxtype, mainObj.nflat, detailObj.cinvcode, detailObj.ipertaxrate, mainObj.itaxrate, detailObj.iunitprice,detailObj.itaxprice, detailObj.iquantity);
                    detailObj.iunitprice=price.iunitprice;
                    detailObj.itaxprice=price.itaxprice;
                    detailObj.imoney = price.imoney;
                    detailObj.itax = price.itax;
                    detailObj.isum = price.isum;
                    detailObj.itaxprice = price.itaxprice;

                    detailObj.inatunitprice = price.nPrice;
                    detailObj.inatmoney = price.nMoney;
                    detailObj.inattax = price.nTax;
                    detailObj.inatsum = price.nSum;
                    entrys.push(detailObj);
                }
                if (mainObj.cpoid == null)
                    mainObj.cpoid = this.GetNO(db, "po_pomain", "cpoid", mainObj.dpodate);
                var ids = this.GetID(db, acctid, 'POMain', entrys.length);
                var id_childs = parseFloat(ids.childid) - entrys.length + 1;
                mainObj.poid = ids.fatherid;
                mainObj.csysbarcode = '||pupo|{0}'.format(mainObj.cpoid);
                for (let i = 0; i < entrys.length; i++) {
                    entrys[i].id = id_childs++;
                    entrys[i].poid = ids.fatherid;
                    entrys[i].cbsysbarcode = '||pupo|{0}|{1}'.format(mainObj.cpoid, i + 1);
                    //entrys[i].cpoid=mainObj.cpoid;
                }
                if(mainObj.cverifier!=null){
                    mainObj.caudittime=new Date();
                    mainObj.cauditdate=(new Date()).toYMD(0);
                    mainObj.cstate=1;
                    mainObj.iverifystateex=2;
                }
                this.insert2DB(db, "po_pomain", mainObj);
                for (let i = 0; i < entrys.length; i++) {
                    this.insert2DB(db, "po_podetails", entrys[i]);
                }
                db.completeTrans();
                mainObj['entrys']=entrys;
                return mainObj;
            }
            finally {
                db.dispose();
            }

        }

        importOrder(querys: any, argument: any) {
            try {
                return this._importOrder(argument);
            }
            catch (ex) {
                console.log(ex.stack);
                throw ex;
            }
        }

        importMaterialApp(argument: any){
            var main_allow_fields=['ddate','ccode','crdcode','cdepcode','cpersoncode','citem_class','citemcode','chandler','cmemo',
            'cmaker','cdefine1','cdefine2','cdefine3','cdefine4','cdefine5','cdefine6','cdefine7','cdefine8','cdefine9','cdefine10',
            'cdefine11','cdefine12','cdefine13','cdefine14','cdefine15','cdefine16','csource','cvencode'];
            var std_main={id:null,vt_id:null,ddate:null,ccode:null,crdcode:null,cdepcode:null,cpersoncode:null,citem_class:null,
                citemcode:null,cname:null,citemcname:null,chandler:null,cmemo:null,ccloser:null,cmaker:null,
                cdefine1:null,cdefine2:null,cdefine3:null,cdefine4:null,cdefine5:null,cdefine6:null,cdefine7:null,
                cdefine8:null,cdefine9:null,cdefine10:null,cdefine11:null,cdefine12:null,cdefine13:null,cdefine14:null,cdefine15:null,
                cdefine16:null,dveridate:null,ireturncount:null,iverifystate:null,iswfcontrolled:null,cmodifyperson:null,
                dmodifydate:null,dnmaketime:null,dnmodifytime:null,dnverifytime:null,iprintcount:null,csource:null,cvencode:null,
                imquantity:null,csysbarcode:null,ccurrentauditor:null,cchanger:null};
            let head=argument.head;
            

        }

        
    }

    exports = function (querys: any) {
        var s = new JSXDZC();
        return s.CallRPC(querys);
    }
}