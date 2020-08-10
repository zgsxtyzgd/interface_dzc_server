namespace DZC {
    var Call: typeof JSXCall = using('jsx_call.js');
    class JSXDZC extends Call {
        constructor() {
            super();
            this.addRPC('executeNonQuery', this.executeNonQuery, true);
            this.addRPC('executeRows', this.executeRows, true);
            this.addRPC('importOrder', this.importOrder, true);
            this.addRPC('importMaterialApp',this.importMaterialApp,true);
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

        private SetUnit(db: DBScope, cinvcode: string, unitcode: string, iquantity: number, inum: number)
            : { cunitid?: string, iquantity?: number, inum?: number, rate: number } {
            let r: { cunitid: string, iquantity: number, inum: number, rate: number } = {} as any;
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
                r.rate = null;
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
                r.rate = changeRate;
                if (iquantity != null) {
                    r.inum = this.Round(iquantity / changeRate, 2);
                    r.iquantity = iquantity;
                }
                else if (inum != null) {
                    r.iquantity = this.Round(inum * changeRate, 2);
                    r.inum = inum;
                }
                else
                    throw new Error('计量单位要求 iquantity或inum必须设置一个');
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
                        r.rate = unit.ichangrate;
                    }
                    else {
                        r.iquantity = iquantity;
                        r.inum = inum;
                        if (inum == 0)
                            r.rate = null;
                        else
                            r.rate = iquantity / inum;
                    }
                }
                else {
                    if (unit.ichangrate == null)
                        throw new Error('因计量单位限制iquantity属性必须被设置');
                    if (inum == null)
                        throw new Error('iquantity属性和inum属性至少应该被设置一个');
                    r.iquantity = this.Round(inum * unit.ichangrate, 2);
                    r.inum = inum;
                    r.rate = unit.ichangrate;
                }
            }
            else
                throw new Error('相关计量单位的属性 igrouptype 被设置为无效的值:{0}'.format(ug.igrouptype));
            return r;
        }

        private toNumber(value: any): number {
            switch (typeof value) {
                case 'undefined':
                    return undefined;
                case 'number':
                    return value;
                case 'string':
                    return parseFloat(value);
                default:
                    return null;

            }
        }

        private toDate(value: any): Date {
            function str2Date(date: string): Date {
                var reg_date = /^(\d{4})\-(\d{1,2})\-(\d{1,2})(\s+(\d{1,2}):(\d{1,2}):(\d{1,2})(\.(\d{3}))?)?$/i;
                if (!reg_date.test(date))
                    return null;
                var ds = reg_date.exec(date);
                var year = parseFloat(ds[1]);
                var month = parseFloat(ds[2]);
                var day = parseFloat(ds[3]);
                var hour = parseFloat(ds[5]);
                var min = parseFloat(ds[6]);
                var sec = parseFloat(ds[7]);
                var ms = parseFloat(ds[9]);

                try {
                    if (ds[4] == undefined)
                        return new Date(year, month - 1, day);
                    else if (ds[8] == null)
                        return new Date(year, month - 1, day, hour, min, sec);
                    return new Date(year, month - 1, day, hour, min, sec, ms);
                }
                catch{
                    return null;
                }
            }
            if (typeof value == 'undefined')
                return undefined;
            if (value == null)
                return null;
            if (typeof value == 'string')
                return str2Date(value);
            if (typeof value == 'object' && (value as Object).constructor == Date)
                return value;
            if (typeof value == 'number')
                return new Date(value);
        }

        private In(check: (v: any, idx?: number) => boolean, ...args: any[]): boolean {
            for (let i = 0; i < args.length; i++) {
                if (check(args[i], i) == true)
                    return true;
            }
            return false;
        }

        private Between(v: any, min: any, max: any): boolean {
            return v >= min && v <= max;
        }

        private setTaxPrice(db: DBScope, idiscounttaxtype: number, nFlat: number, cinvcode: string, ipertaxrate: number, headTaxRate: number, iunitprice: number, itaxprice: number, iquantity: number)
            : { iunitprice: number, imoney: number, itax: number, isum: number, itaxprice: number, nPrice: number, nMoney: number, nSum: number, nTax: number } {
            var taxRate = ipertaxrate;
            if (taxRate == null) {
                if (headTaxRate != null)
                    taxRate = headTaxRate;
                else {
                    taxRate = db.executeScalar("select iTaxRate from Inventory where cinvcode=@code", { code: cinvcode });
                    if (typeof taxRate == 'undefined')
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

        private checkItem(db: DBScope, itemclass: string, item: string):{ className: string, itemName: string } {
            var NULL={ className: null, itemName: null };
            if (itemclass == null)
                return NULL;
            var className = db.executeScalar("select citem_name from fitemclass where citem_class=@class", { class: itemclass });
            if (className == undefined)
                throw new Error('citem_class的值"{0}"不存在'.format(itemclass));
            if (item == null)
                return NULL;
            let v = db.executeScalar("select citemname from fitemss{0} where citemcode=@code".format(itemclass), { code: item });
            if (v == null)
                throw new Error('无效的核算项目大类"{0}"不存在代码"{1}"'.format(className, item));
            return { className: className, itemName: v };
            
                
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
                'itaxrate', 'icost', 'ibargain', 'cmemo', 'cmaker', 'cverifier', 'cdefine1', 'cdefine2', 'cdefine3', 'cdefine4', 'cdefine5', 'cdefine6',
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
            var mainObj: U8.PO_POMain = this.cloneObj(std_main);
            this.setObj(mfs, head, mainObj);
            if (mainObj.dpodate == undefined)
                throw new Error('dpodate字段必须被设置');
            if (mainObj.cmaker == undefined)
                throw new Error('cmaker 字段必须被设置')
            var date = this.toDate(mainObj.dpodate);
            if (date == null)
                throw new Error('dpodate字段格式错误,期待 类似于 2020-4-5 格式')
            mainObj.dpodate = date.date;

            if (!this.Between(mainObj.idiscounttaxtype, 0, 1))
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
                    let detailObj: U8.PO_PODetails = this.cloneObj(std_detail);
                    this.setObj(dfs, rd, detailObj);
                    this.checkInventory(db, detailObj.cinvcode);
                    if (detailObj.iunitprice != null && detailObj.iunitprice < 0)
                        throw new Error('iunitprice 属性不能小于零');
                    if (detailObj.itaxprice != null && detailObj.itaxprice < 0)
                        throw new Error('itaxprice 属性不能小于零');
                    detailObj.citemname = this.checkItem(db, detailObj.citem_class, detailObj.citemcode).itemName;
                    var uts = this.SetUnit(db, detailObj.cinvcode, detailObj.cunitid, detailObj.iquantity, detailObj.inum);
                    detailObj.ivouchrowno = ir + 1;
                    detailObj.cunitid = uts.cunitid;
                    detailObj.iquantity = uts.iquantity;
                    detailObj.inum = uts.inum;
                    var price = this.setTaxPrice(db, mainObj.idiscounttaxtype, mainObj.nflat, detailObj.cinvcode, detailObj.ipertaxrate, mainObj.itaxrate, detailObj.iunitprice, detailObj.itaxprice, detailObj.iquantity);
                    detailObj.iunitprice = price.iunitprice;
                    detailObj.itaxprice = price.itaxprice;
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
                var ids = this.GetID(db, acctid, 'POMain', entrys.length);
                var id_childs = parseFloat(ids.childid) - entrys.length + 1;
                if (mainObj.cpoid == null)
                    mainObj.cpoid = this.GetNO(db, "po_pomain", "cpoid", mainObj.dpodate);
                mainObj.poid = ids.fatherid;
                mainObj.csysbarcode = '||pupo|{0}'.format(mainObj.cpoid);
                for (let i = 0; i < entrys.length; i++) {
                    entrys[i].id = id_childs++;
                    entrys[i].poid = ids.fatherid;
                    entrys[i].cbsysbarcode = '||pupo|{0}|{1}'.format(mainObj.cpoid, i + 1);
                    //entrys[i].cpoid=mainObj.cpoid;
                }
                if (mainObj.cverifier != null) {
                    mainObj.caudittime = new Date();
                    mainObj.cauditdate = (new Date()).toYMD(0);
                    mainObj.cstate = 1;
                    mainObj.iverifystateex = 2;
                }
                this.insert2DB(db, "po_pomain", mainObj);
                for (let i = 0; i < entrys.length; i++) {
                    this.insert2DB(db, "po_podetails", entrys[i]);
                }
                db.completeTrans();
                mainObj['entrys'] = entrys;
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

        private SetBatch(db: DBScope, cinvcode: string,cbatch:string):string {
            let bInvBatch = db.executeScalar("select bInvBatch from inventory i left join Inventory_Sub isub on i.cInvCode=cInvSubCode where i.cinvcode=@code and i.bInvBatch=1"
                , { code: cinvcode });
            if (typeof bInvBatch == 'undefined')
                throw new Error('无效的存货代码"{0}"'.format(cinvcode));
            if(bInvBatch)
                return cbatch;
            return null;
        }

        // private getBarcode(db:DBScope){
        //     db.executeRows(`declare @p6 nvarchar(5),@p7 nvarchar(200)
        //     exec AA_GeneralBarCode N'005',N'0413',N'64',N'st1',N'0000038826',@p6 output,@p7 output
        //     select @p6, @p7`);
        // }

        private MassDate(db: DBScope,allow_null:boolean, cinvcode: string, pdate: any, vdate: any)
            : { pdate: Date, vdate: Date, imassdate: number, cmassunit: number, iexpiratdatecalcu: number, dexpirationdate: Date, cexpirationdate: string } {
            //iExpiratDateCalcu:  0-不推算,1-按月,2-按日
            //cmassunit:0：(空)1：年2：月3：日	
            //当iExpiratDateCalcu=0时 cmassunit应该等于0 切批号，生产日期，到期日，等等禁止录入
            //cexpirationdate 2020-12-07/2020-12/2020
            if(pdate!=null)
                pdate = this.toDate(pdate);
            if(vdate!=null)
                vdate = this.toDate(vdate);

            let rows = db.executeRows("select i.imassdate,isnull(i.cmassunit,0) cmassunit,isnull(isub.iexpiratdatecalcu,0) iexpiratdatecalcu,binvquality from inventory i left join Inventory_Sub isub on i.cInvCode=cInvSubCode where i.cinvcode=@code"
                , { code: cinvcode });
            if (rows.length == 0)
                throw new Error('无效的物料码:{0}'.format(cinvcode));
            
            let mass: { imassdate: number, cmassunit: number, iexpiratdatecalcu: number,binvquality:boolean } = rows[0];
            if(!mass.binvquality)
                return { pdate: null, vdate: null, imassdate: null, cmassunit: null, iexpiratdatecalcu: null, dexpirationdate: null, cexpirationdate: null };
            if (mass.iexpiratdatecalcu == 0)
                return { pdate: null, vdate: null, imassdate: null, cmassunit: null, iexpiratdatecalcu: 0, dexpirationdate: null, cexpirationdate: null };
            if (pdate == null){
                if(allow_null)
                    return { pdate: null, vdate: null, imassdate: null, cmassunit: null, iexpiratdatecalcu: null, dexpirationdate: null, cexpirationdate: null };
                throw new Error('生产日期必须被设置');
            }
                
            let imassdate: number;
            if (vdate == null) {
                imassdate = mass.imassdate;
                if (mass.cmassunit == 2)
                    vdate = (pdate as Date).add('m', imassdate);
                else if (mass.cmassunit == 3)
                    vdate = (pdate as Date).add('d', imassdate);
                else if (mass.cmassunit == 1)
                    vdate = (pdate as Date).add('y', imassdate);
                else
                    throw new Error('无效的 cmassuint 值"{0}"'.format(mass.cmassunit));
            }
            else {
                if (mass.cmassunit == 2)
                    imassdate = (pdate as Date).diff('m', vdate as Date);
                else if (mass.cmassunit == 3)
                    imassdate = (pdate as Date).diff('d', vdate as Date);
                else if (mass.cmassunit == 1)
                    imassdate = (pdate as Date).diff('y', vdate as Date);
                else
                    throw new Error('无效的 cmassuint 值"{0}"'.format(mass.cmassunit));
            }

            let dexpirationdate: Date;
            let cexpirationdate: string;
            if (mass.iexpiratdatecalcu == 2)
                dexpirationdate = (vdate as Date).add('d', -1);
            else if (mass.iexpiratdatecalcu == 1) {
                let y = (vdate as Date).getFullYear();
                let m = (vdate as Date).getMonth();
                let d = new Date(y, m, 1);
                dexpirationdate = d.add('d', -1);
            }
            else
                throw new Error('无效的 iexpiratdatecalcu 值"{0}"'.format(mass.iexpiratdatecalcu));
            if (mass.cmassunit == 1)
                cexpirationdate = dexpirationdate.toYMD(0).substr(0, 4);
            else if (mass.cmassunit == 2)
                cexpirationdate = dexpirationdate.toYMD(0).substr(0, 7);
            else if (mass.cmassunit == 3)
                cexpirationdate = dexpirationdate.toYMD(0);
            return {
                pdate: pdate, vdate: vdate, imassdate: imassdate, cmassunit: mass.cmassunit, iexpiratdatecalcu: mass.iexpiratdatecalcu
                , dexpirationdate: dexpirationdate, cexpirationdate: cexpirationdate
            };
        }

        importMaterialApp(querys:any,argument:any){
            try{
            return this._importMaterialApp(argument);
            }
            catch (ex) {
                console.log(ex.stack);
                throw ex;
            }
        }
        _importMaterialApp(argument: any) {
            var main_allow_fields = ['ddate', 'ccode', 'crdcode', 'cvencode', 'cdepcode', 'cpersoncode', 'citem_class', 'citemcode', 'chandler', 'cmemo',
                'cmaker', 'cdefine1', 'cdefine2', 'cdefine3', 'cdefine4', 'cdefine5', 'cdefine6', 'cdefine7', 'cdefine8', 'cdefine9', 'cdefine10',
                'cdefine11', 'cdefine12', 'cdefine13', 'cdefine14', 'cdefine15', 'cdefine16', 'csource'];
            var detail_allow_fields = ["cwhcode", "cinvcode", "inum", "iquantity", "cbatch", "foutquantity", "cassunit", "foutnum", "dvdate", "dmadedate",
                "imassdate", "iexpiratdatecalcu", "cmassunit", "cexpirationdate", "dexpirationdate", "dduedate", "citem_class", "citemcode", "cbmemo",
                "cfree1", "cfree2", "cfree3", "cfree4", "cfree5", "cfree6", "cfree7", "cfree8", "cfree9", "cfree10", "cdefine22", "cdefine23", "cdefine24",
                "cdefine25", "cdefine26", "cdefine27", "cdefine28", "cdefine29", "cdefine30", "cdefine31", "cdefine32", "cdefine33", "cdefine34", "cdefine35",
                "cdefine36", "cdefine37", "cbatchproperty1", "cbatchproperty2", "cbatchproperty3", "cbatchproperty4", "cbatchproperty5", "cbatchproperty6",
                "cbatchproperty7", "cbatchproperty8", "cbatchproperty9", "cbatchproperty10", "impoids", "cmolotcode", "cmworkcentercode", "cmocode", "imoseq",
                "iopseq", "copdesc", "iomodid", "iomomid", "comcode", "invcode", "cciqbookcode", "cservicecode", "iordertype", "iorderdid", "iordercode", "iorderseq",
                "isotype", "isodid", "csocode", "isoseq", "crejectcode", "ipesodid", "ipesotype", "cpesocode", "ipesoseq", "cbsysbarcode", "ipickedquantity", "ipickednum"];
            var std_main = {
                iprintcount: 0,
                iswfcontrolled: 0
            };
            var std_detail = {
                iordertype: 0, isotype: 0, ipesotype: 0
            };
            let head = argument.head;
            var mainObj: U8.MaterialApp = this.cloneObj(std_main);
            this.setObj(main_allow_fields, head, mainObj);
            if (mainObj.ddate == null)
                throw new Error('属性 ddate（制单日期）必须被设置')
            if (mainObj.cmaker == null)
                throw new Error('属性 cmarker（制单人）必须被设置');
            var date = this.toDate(mainObj.ddate);
            if (date == null)
                throw new Error('ddate字段格式错误,期待 类似于 2020-4-5 格式')
            mainObj.ddate = date.date;
            var config = using('config.json');
            var db = database.createScope(config.db, true, true);
            try {
                var acctid = db.executeScalar("select cacc_id from  ufsystem..UA_AccountDatabase where cdatabase=db_name()");
                mainObj.vt_id = this.GetVTID(db, 'kcmaterialappvouch');
                this.checkRd_Style(db, mainObj.crdcode);
                this.checkDepartment(db, mainObj.cdepcode);
                this.checkPerson(db, mainObj.cpersoncode);
                this.checkItem(db, mainObj.citem_class, mainObj.citemcode);
                this.checkVendor(db, mainObj.cvencode);
                var item = this.checkItem(db, mainObj.citem_class, mainObj.citemcode);
                mainObj.citemcname = item.className;
                mainObj.cname = item.itemName;
                if(mainObj.chandler!=null){
                    mainObj.dveriDate=mainObj.ddate;
                    mainObj.dnverifytime=new Date();
                }
                var body = argument.body;
                var entrys:U8.MaterialAppVouchs[] = [];
                for (let ir = 0; ir < body.length; ir++) {
                    let rd = body[ir];
                    let detailObj: U8.MaterialAppVouchs = this.cloneObj(std_detail);
                    this.setObj(detail_allow_fields, rd, detailObj);

                    this.checkInventory(db, detailObj.cinvcode);
                    this.checkWarehouse(db, detailObj.cwhcode)
                    var item = this.checkItem(db, detailObj.citem_class, detailObj.citemcode);
                    
                    detailObj.citemcname = item.className;
                    detailObj.cname = item.itemName;
                    var uts = this.SetUnit(db, detailObj.cinvcode, detailObj.cassunit, detailObj.iquantity, detailObj.inum);
                    detailObj.irowno = ir + 1;
                    detailObj.cassunit = uts.cunitid;
                    detailObj.iquantity = uts.iquantity;
                    detailObj.inum = uts.inum;

                    var mass = this.MassDate(db,true, detailObj.cinvcode, detailObj.dmadedate, detailObj.dvdate);
                    detailObj.dmadedate = mass.pdate;
                    detailObj.dvdate = mass.vdate;
                    detailObj.imassdate = mass.imassdate;
                    detailObj.cmassunit = mass.cmassunit;
                    detailObj.iexpiratdatecalcu = mass.iexpiratdatecalcu;
                    detailObj.cexpirationdate = mass.cexpirationdate;
                    detailObj.dexpirationdate = mass.dexpirationdate;
                    detailObj.cbatch=this.SetBatch(db,detailObj.cinvcode,detailObj.cbatch);
                    entrys.push(detailObj);
                }
                var ids=this.GetID(db,acctid,'mv',entrys.length);
                var id_childs = parseFloat(ids.childid) - entrys.length + 1;
                if(mainObj.ccode==null)
                    mainObj.ccode = this.GetNO(db, "MaterialAppVouch", "ccode", mainObj.ddate);
                mainObj.id=ids.fatherid as any;
                mainObj.csysbarcode='||st64|{0}'.format(mainObj.ccode);
                for (let i = 0; i < entrys.length; i++) {
                    entrys[i].id =ids.fatherid as any;
                    entrys[i].autoid = id_childs++;
                    entrys[i].cbsysbarcode = '||st64|{0}|{1}'.format(mainObj.ccode, i + 1);
                }
                this.insert2DB(db,"MaterialAppVouch",mainObj);
                for (let i = 0; i < entrys.length; i++) {
                    this.insert2DB(db, "MaterialAppVouchs", entrys[i]);
                }
                //Update MaterialAppVouch  WITH (UPDLOCK)  Set cHandler='demo', dVeriDate=N'2020-08-08',dNVerifyTime=getdate() Where Id=1000005207 And ufts=convert(timestamp,convert(money,'                     9554.6903'))
                db.completeTrans();
                mainObj['entrys'] = entrys;
                return mainObj;
            }
            finally {
                db.dispose();
            }
        }


    }

    exports = function (querys: any) {
        var s = new JSXDZC();
        return s.CallRPC(querys);
    }
}