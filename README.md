# interface_dzc_server
电子厂接口，服务器端  last modify in 20-08-10 17:45

注意 凡是由 (数值) 表示的是说明占位符

一 URL 约定：
    http://地址或ip/jsx_dzc.jsx?op=(1)&sid=(2)&arguments=(3)

    解释:
        (1) 相关功能调用的名称
        (2) sid  一个约定好的安全字符串，在服务器端的config.json配置文件里约定其内容（文档以后的sid同义）
        (3) 一个json格式描述的字符串
        返回结果，如果成功，返回一个json字符串，如果失败触发http 400 错误
    注意：其url参数部分可以使用get,也可以使用post，也可以混合使用，建议使用post
二 执行SQL语句API：
    名称                SID         参数                    说明
    executeNonQuery     需要        sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个影响行数，如果无行数影响，返回-1
    executeRows         需要        sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个行集（json字符串）


    范例：
        方法 executeNonQuery 的参数arguments内容(json格式) {"sql":"insert into abc(a,b,c)values(@a,@b,@c)","args":{"a":1,"b":2,"c":3}}             
    使用 executeRows 可以得到所有表信息
    注意：executeNonQuery，executeRows两个api相当危险，请谨慎使用
三 导入订单API:
    名称                SID         参数                    说明
    appendOrder         需要        {head:{},body[{}...]}   导入一个订单
    参数说明:
        head(单据体):
            字段名           	类型   	是否空 	默认值 	格式要求                  	说明                           	参考值            	
            cpoid            	string 	是     	       	如果省略自动生成YYMM+序号 	采购订单号                     	'20200806001'     	
            dpodate          	string 	否     	       	yyyy-mm-dd或yyyy-m-d      	单据日期                       	'2020-08-05'      	
            cvencode         	string 	是     	       	                          	供应商编码                     	'01010'           	
            cdepcode         	string 	是     	       	                          	部门编码                       	'0101'            	
            cpersoncode      	string 	是     	       	                          	业务员编码                     	null              	
            cptcode          	string 	是     	       	                          	采购类型编码                   	'02'              	
            carrivalplace    	string 	是     	       	                          	到货地址                       	null              	
            cexch_name       	string 	是     	人名币 	                          	币种名称                       	美元'             	
            nflat            	number 	是     	1      	                          	汇率 本位币=原币*汇率          	7                 	
            itaxrate         	number 	是     	0      	                          	表头税率                       	13                	
            icost            	number 	是     	0      	                          	运费                           	0                 	
            ibargain         	number 	是     	0      	                          	订金                           	0                 	
            idiscounttaxtype 	number 	       	0      	                          	扣税类别 (0应税外加,1应税内含) 	                  	
            cmemo            	string 	是     	       	                          	备注                           	null              	
            cmaker           	string 	是     	       	                          	制单人                         	'demo'            	
            cverifier        	null   	是     	       	如果被设置，则自动审核     	审核人                         	                  	
            cdefine1         	string 	是     	       	                          	自定义项1                      	null              	
            cdefine2         	string 	是     	       	                          	自定义项2                      	null              	
            cdefine3         	string 	是     	       	                          	自定义项3                      	null              	
            cdefine4         	Date   	是     	       	                          	自定义项4                      	null              	
            cdefine5         	number 	是     	       	                          	自定义项5                      	null              	
            cdefine6         	Date   	是     	       	                          	自定义项6                      	null              	
            cdefine7         	number 	是     	       	                          	自定义项7                      	null              	
            cdefine8         	string 	是     	       	                          	自定义项8                      	null              	
            cdefine9         	string 	是     	       	                          	自定义项9                      	null              	
            cdefine10        	string 	是     	       	                          	自定义项10                     	null              	
            cdefine11        	string 	是     	       	                          	自定义项11                     	null              	
            cdefine12        	string 	是     	       	                          	自定义项12                     	null              	
            cdefine13        	string 	是     	       	                          	自定义项13                     	null              	
            cdefine14        	string 	是     	       	                          	自定义项14                     	null              	
            cdefine15        	number 	是     	       	                          	自定义项15                     	null              	
            cdefine16        	number 	是     	       	                          	自定义项16                     	null              	
            ccontactcode     	string 	是     	       	                          	供方联系人编码                 	'0101000000001'   	
            cvenperson       	string 	是     	       	                          	供方联系人                     	'张宏奎'          	
            cvenbank         	string 	是     	       	                          	供方银行名称                   	'农行稷山县支行'  	
            cvenaccount      	string 	是     	       	                          	供方银行账号                   	'531001040011211' 	
            cappcode         	string 	是     	       	                          	请购单号                       	null              	
            csysbarcode      	string 	是     	       	                          	单据条码                       	null              	
            ccurrentauditor  	string 	是     	       	                          	当前审批人                     	null           
        body(单据体):
            字段名      	类型        	是否空 	默认值 	说明                  	值           	
            cinvcode    	string      	是     	       	存货编码              	0100021'     	
            iquantity   	number      	是     	       	数量                  	100          	
            cunitid     	string      	是     	注(1)  	计量单位编码          	'0202'       	
            inum        	number      	是     	注(2)  	辅计量数量            	5000         	
            ipertaxrate 	userdecimal 	是     	注(3)  	税率 >=0              	13           	
            iunitprice  	number      	是     	       	原币无税单价          	120          	
            itaxprice   	userdecimal 	是     	       	原币含税单价          	135.6        	
            darrivedate 	Date        	是     	       	计划到货日期          	'2020-08-05' 	
            bgsp        	number      	是     	       	是否质检              	0            	
            btaxcost    	boolean     	是     	       	价格标准(0无税,1含税） 	1            	
            citemcode   	string      	是     	       	项目编码              	11'          	
            citem_class 	string      	是     	       	项目大类编码          	'00'         	
            cbmemo      	string      	是     	       	行备注                	null         	
            cfree1      	string      	是     	       	存货自由项1           	null         	
            cfree2      	string      	是     	       	存货自由项2           	null         	
            cfree3      	string      	是     	       	存货自由项3           	null         	
            cfree4      	string      	是     	       	存货自由项4           	null         	
            cfree5      	string      	是     	       	存货自由项5           	null         	
            cfree6      	string      	是     	       	存货自由项6           	null         	
            cfree7      	string      	是     	       	存货自由项7           	null         	
            cfree8      	string      	是     	       	存货自由项8           	null         	
            cfree9      	string      	是     	       	存货自由项9           	null         	
            cfree10     	string      	是     	       	存货自由项10          	null         	
            cdefine22   	string      	是     	       	表体自定义项22        	null         	
            cdefine23   	string      	是     	       	表体自定义项23        	null         	
            cdefine24   	string      	是     	       	表体自定义项24        	null         	
            cdefine25   	string      	是     	       	表体自定义项25        	null         	
            cdefine26   	number      	是     	       	表体自定义项26        	null         	
            cdefine27   	number      	是     	       	表体自定义项27        	null         	
            cdefine28   	string      	是     	       	表体自定义项28        	null         	
            cdefine29   	string      	是     	       	表体自定义项29        	null         	
            cdefine30   	string      	是     	       	表体自定义项30        	null         	
            cdefine31   	string      	是     	       	表体自定义项31        	null         	
            cdefine32   	string      	是     	       	表体自定义项32        	null         	
            cdefine33   	string      	是     	       	表体自定义项33        	null         	
            cdefine34   	number      	是     	       	表体自定义项34        	null         	
            cdefine35   	number      	是     	       	表体自定义项35        	null         	
            cdefine36   	Date        	是     	       	表体自定义项36        	null         	
            cdefine37   	Date        	是     	       	表体自定义项37        	null         	
        注(1): 当相关存货的igrouptype属性相关 当 igrouptype 为0时 null,否则必须填写。 相关信息参考表 ComputationGroup 表及 Inventory表的igrouptype字段
        注(2)：根据相关存货的属性igrouptype自动或手动设置，igrouptype=0时自动设置为null,igrouptype=1时iquantity=inum*ichangerate或inum=iquantity*ichangerate
当 igrouptype=2时 则倒算 ichangerate
        实例（Javascript）：
            var order={
            head:{
                dpodate:"2020-8-6",
                cvencode:"01010",
                cdepcode:'0101',
                cptcode:"02",
                cexch_name:'美元',
                nflat:7,
                itaxrate:13,
                ccontactcode:'0101000000001',
                cvenperson:'张宏奎',
                cvenbank:'农行稷山县支行',
                cvenaccount:'531001040011211',
                cmemo:"测试",
                cmaker:"张三",
                cverifier:"张三"
            },
            body:[
                {
                    cinvcode:"0100021",
                    inum:5000.0000000000,
                    iunitprice:120,
                    cunitid:'0202',
                    citemcode:'11',
                    citem_class:'00'
                }
                ]
            }   
        名称                      SID         参数                        说明
        importMaterialApp         需要        {head:{},body[{}...]}       导入一个订单
        参数说明:
            head(单据体):
                字段名      	值 	类型   	是否空 	说明      	
                ddate       	   	Date   	否     	单据日期  	
                ccode       	   	string 	否     	单据号    	
                crdcode     	   	string 	是     	出库类别  	
                cvencode    	   	string 	是     	供应商    	
                cdepcode    	   	string 	是     	部门编码  	
                cpersoncode 	   	string 	是     	操作员    	
                citem_class 	   	string 	是     	项目大类  	
                citemcode   	   	string 	是     	项目编码  	
                chandler    	   	string 	是     	审核人,如果为空(null值)则为未审核，否则自动设置相关其它审核字段
                cmemo       	   	string 	是     	cmemo     	
                cmaker      	   	string 	是     	制单人    	
                cdefine1    	   	string 	是     	cdefine1  	
                cdefine2    	   	string 	是     	cdefine2  	
                cdefine3    	   	string 	是     	cdefine3  	
                cdefine4    	   	Date   	是     	cdefine4  	
                cdefine5    	   	number 	是     	cdefine5  	
                cdefine6    	   	Date   	是     	cdefine6  	
                cdefine7    	   	number 	是     	cdefine7  	
                cdefine8    	   	string 	是     	cdefine8  	
                cdefine9    	   	string 	是     	cdefine9  	
                cdefine10   	   	string 	是     	cdefine10 	
                cdefine11   	   	string 	是     	cdefine1  	
                cdefine12   	   	string 	是     	cdefine12 	
                cdefine13   	   	string 	是     	cdefine13 	
                cdefine14   	   	string 	是     	cdefine14 	
                cdefine15   	   	number 	是     	cdefine15 	
                cdefine16   	   	number 	是     	cdefine16 	
                csource     	   	string 	是     	来源      	
            body(单据体):
                字段             	类型   	是否空 	说明           	值             	
                cwhcode          	string 	是     	仓库编码       	'01'           	
                cinvcode         	string 	否     	存货编码       	0100021'       	
                inum             	number 	是     	件数           	5000           	
                iquantity        	number 	是     	数量           	100            	
                cbatch           	string 	是     	批号           	null           	
                cassunit         	string 	是     	辅计量单位     	'0202'         	
                dmadedate        	Date   	是     	生产日期       	null           	
                dvdate           	Date   	是     	失效日期       	null           	
                dduedate         	Date   	是     	预计出库日期   	null           	
                citem_class      	string 	是     	项目大类       	'98'           	
                citemcode        	string 	是     	项目编码       	'07'           	
                cbmemo           	string 	是     	表体备注       	null           	
                cfree1           	string 	是     	cfree1         	null           	
                cfree2           	string 	是     	cfree2         	null           	
                cfree3           	string 	是     	cfree3         	null           	
                cfree4           	string 	是     	cfree4         	null           	
                cfree5           	string 	是     	cfree5         	null           	
                cfree6           	string 	是     	cfree6         	null           	
                cfree7           	string 	是     	cfree7         	null           	
                cfree8           	string 	是     	cfree8         	null           	
                cfree9           	string 	是     	cfree9         	null           	
                cfree10          	string 	是     	cfree10        	null           	
                cdefine22        	string 	是     	cdefine22      	null           	
                cdefine23        	string 	是     	cdefine23      	null           	
                cdefine24        	string 	是     	cdefine24      	null           	
                cdefine25        	string 	是     	cdefine25      	null           	
                cdefine26        	number 	是     	cdefine26      	null           	
                cdefine27        	number 	是     	cdefine27      	null           	
                cdefine28        	string 	是     	cdefine28      	'22112'        	
                cdefine29        	string 	是     	cdefine29      	'sdafasdfasfd' 	
                cdefine30        	string 	是     	cdefine30      	null           	
                cdefine31        	string 	是     	cdefine31      	null           	
                cdefine32        	string 	是     	cdefine32      	null           	
                cdefine33        	string 	是     	cdefine33      	null           	
                cdefine34        	number 	是     	cdefine34      	null           	
                cdefine35        	number 	是     	cdefine35      	null           	
                cdefine36        	Date   	是     	cdefine36      	null           	
                cdefine37        	Date   	是     	cdefine37      	null           	
                cbatchproperty1  	number 	是     	属性1          	null           	
                cbatchproperty2  	number 	是     	属性2          	null           	
                cbatchproperty3  	number 	是     	属性3          	null           	
                cbatchproperty4  	number 	是     	属性4          	null           	
                cbatchproperty5  	number 	是     	属性5          	null           	
                cbatchproperty6  	string 	是     	属性6          	null           	
                cbatchproperty7  	string 	是     	属性7          	null           	
                cbatchproperty8  	string 	是     	属性8          	null           	
                cbatchproperty9  	string 	是     	属性9          	null           	
                cbatchproperty10 	Date   	是     	属性10         	null           	
                impoids          	bigint 	是     	生产订单id     	null           	
                cmolotcode       	string 	是     	生产批号       	null           	
                cmworkcentercode 	string 	是     	工作中心       	null           	
                cmocode          	string 	是     	生产订单号     	null           	
                imoseq           	number 	是     	生产订单行号   	null           	
                iopseq           	string 	是     	行号           	null           	
                copdesc          	string 	是     	工艺路线描述   	null           	
                iomodid          	number 	是     	委外订单子表id 	null           	
                iomomid          	number 	是     	委外订单材料id 	null           	
                comcode          	string 	是     	委外订单号     	null           	
                invcode          	string 	是     	存货编码       	null           	
                cciqbookcode     	string 	是     	手册号         	null           	
                cservicecode     	string 	是     	服务单号       	null           	
                iordertype       	number 	是     	订单类型       	0              	
                iorderdid        	number 	是     	出库id         	null           	
                iordercode       	string 	是     	出库单号       	null           	
                iorderseq        	number 	是     	出库行号       	null           	
                isotype          	number 	是     	需求类型       	0              	
                isodid           	string 	是     	需求id         	null           	
                csocode          	string 	是     	订单号         	null           	
                isoseq           	number 	是     	需求行号       	null           	
                crejectcode      	string 	是     	不良品单号     	null           	
                ipesodid         	string 	是     	pe订单id       	null           	
                ipesotype        	number 	是     	pe订单类型     	0              	
                cpesocode        	string 	是     	pe件需求号     	null           	
                ipesoseq         	number 	是     	pe订单行号     	null           	
                cbsysbarcode     	string 	是     	单据行条码     	null           	
                ipickedquantity  	number 	是     	已拣货数量     	null           	
                ipickednum       	number 	是     	已拣货件数     	null           	
        注意：
            计量单位参照 appendOrder 
            对于启用了保质期的物料，dmadedate 字段必须被设置
        实例（Javascript）：
            var arg1={
	head:{
		ddate:"2020-8-6",
		crdcode:"201",
		cdepcode:'01',
		cmemo:"测试",
		cmaker:"张三"
        },
        body:[
            {
                cwhcode:"001",
                cinvcode:"0301154",
                iquantity:88,
                dmadedate:'2020-8-1',
                citemcode:'102',
                citem_class:'05'
            }
            ]
        }



