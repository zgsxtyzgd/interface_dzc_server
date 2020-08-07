# interface_dzc_server
电子厂接口，服务器端

注意 凡是由 (数值) 表示的是说明占位符

一 URL 约定：
    http://地址或ip/jsx_dzc.jsx?op=(1)&sid=(2)&arguments=(3)

    解释:
        (1) 相关功能调用的名称
        (2) sid  一个约定好的安全字符串，在服务器端的config.json配置文件里约定其内容（文档以后的sid同义）
        (3) 一个json格式描述的字符串
    注意：其url参数部分可以使用get,也可以使用post，也可以混合使用，建议使用post
二 执行SQL语句API：
    名称                SID         参数                    说明
    executeNonQuery     需要        sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个影响行数，如果无行数影响，返回-1
    executeRows         需要        sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个行集（json字符串）


    范例：
        方法 executeNonQuery 的参数arguments内容(json格式) {"sql":"insert into abc(a,b,c)values(@a,@b,@c)","args":{"a":1,"b":2,"c":3}}             
    注意：executeNonQuery，executeRows两个api相当危险，请谨慎使用
三 导入订单API:
    名称                SID         参数                    说明
    appendOrder         需要        head:{},body[]       导入一个订单

    参数说明:
        head(单据体):
            字段	        是否空	 说明	        可能值
            dpodate	        否	    单据日期	    2020-08-05
            cpoid	        是	    采购订单号	    20080001
            cvencode	    是	    供应商编码	    01004
            cdepcode	    是	    部门编码	    09
            cpersoncode	    是	    业务员编码	    null
            cptcode	        是	    采购类型编码	01
            carrivalplace	是	    到货地址	    null
            csccode	        是	    发运方式编码	null
            icost	        是	    运费	        0
            ibargain	    是	    订金	        0
            cmemo	        是	    备注	        7895
            cmaker	        是	    制单人	        demo
            cdefine1	    是	    自定义项1	    null
            cdefine2	    是	    自定义项2	    null
            cdefine3	    是	    自定义项3	    null
            cdefine4	    是	    自定义项4	    null
            cdefine5	    是	    自定义项5	    null
            cdefine6	    是	    自定义项6	    null
            cdefine7	    是	    自定义项7	    null
            cdefine8	    是	    自定义项8	    null
            cdefine9	    是	    自定义项9	    null
            cdefine10	    是	    自定义项10	    null
            cdefine11	    是	    自定义项11	    null
            cdefine12	    是	    自定义项12	    null
            cdefine13	    是	    自定义项13	    null
            cdefine14	    是	    自定义项14	    null
            cdefine15	    是	    自定义项15	    null
            cdefine16	    是	    自定义项16	    null
            ccontactcode	是	    供方联系人编码	null
            cvenperson	    是	    供方联系人	    null
            cvenbank	    是	    供方银行名称	null
            cvenaccount	    是	    供方银行账号	null
        body(单据体):

