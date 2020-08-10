function rpcall(url,args){
    var request=new XMLHttpRequest();
    request.open("POST",url,false);
    request.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=utf-8");
    request.send('argument='+encodeURIComponent(JSON.stringify(args)));
    if(request.status!=200)
        throw new Error(request.responseText);
    return JSON.parse(request.responseText);
}

function splitEx(ss,spliter,fun){

}



function format(vs){
    function space(len){
        var s='';
        for(let i=0;i<len;i++)
            s+=' '
        return s;
    }
    function strLen(vs){
        var r_hz=/^[\u4e00-\u9fa5]$/;
        var l=0;
        for(let z=0;z<vs.length;z++){
            if(r_hz.test(vs[z]))
                l+=2;
            else
                l++;
        }
        return l;
    }
    var vx=vs.split(/\r?\n/);
    var tb=[];
    var cs=[];
    
    for(let i=0;i<vx.length;i++){
        var r=vx[i].split('\t');
        for(let c=0;c<r.length;c++){
            var cx=r[c];
            var l=strLen(cx);
            let fx=cs[c]==undefined?0:cs[c];
            if(l>fx)
                cs[c]=l;
        }
        tb.push(r);
    };
    var ss='';
    for(let rx=0;rx<tb.length;rx++){
        let r=tb[rx];
        for(let cx=0;cx<r.length;cx++){
            let l=r[cx]+ space(cs[cx]-strLen(r[cx]))+' ';
            ss+=l+'\t'
        }
        ss+='\r\n';
    }
    return ss;    
}

var xx=`字段名	类型	是否空	默认值	格式要求	说明	参考值
cpoid	string	是			采购订单号 	'20200806001'
dpodate	string	否	YYMM+序号	yyyy-mm-dd或yyyy-m-d	单据日期	'2020-08-05'
cvencode	string	是			供应商编码	'01010'
cdepcode	string	是			部门编码	'0101'
cpersoncode	string	是			业务员编码	null
cptcode	string	是			采购类型编码	'02'
carrivalplace	string	是			到货地址	null
cexch_name	string	是	人名币		币种名称	美元'
nflat	number	是	1		汇率 本位币=原币*汇率	7
itaxrate	number	是	0		表头税率	13
icost	number	是	0		运费	0
ibargain	number	是	0		订金	0
idiscounttaxtype	number		0		扣税类别 (0应税外加,1应税内含)	
cmemo	string	是			备注	null
cmaker	string	是			制单人	'demo'
cverifier	null	是	如果被设置，则自动审核		审核人 	
cdefine1	string	是			自定义项1	null
cdefine2	string	是			自定义项2	null
cdefine3	string	是			自定义项3	null
cdefine4	Date	是			自定义项4	null
cdefine5	number	是			自定义项5	null
cdefine6	Date	是			自定义项6	null
cdefine7	number	是			自定义项7	null
cdefine8	string	是			自定义项8	null
cdefine9	string	是			自定义项9	null
cdefine10	string	是			自定义项10	null
cdefine11	string	是			自定义项11	null
cdefine12	string	是			自定义项12	null
cdefine13	string	是			自定义项13	null
cdefine14	string	是			自定义项14	null
cdefine15	number	是			自定义项15	null
cdefine16	number	是			自定义项16	null
ccontactcode	string	是			供方联系人编码	'0101000000001'
cvenperson	string	是			供方联系人	'张宏奎'
cvenbank	string	是			供方银行名称	'农行稷山县支行'
cvenaccount	string	是			供方银行账号	'531001040011211'
cappcode	string	是			请购单号	null
csysbarcode	string	是			单据条码	null
ccurrentauditor	string	是			当前审批人	null`;

console.log(format(xx));