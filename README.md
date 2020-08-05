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
二 API 说明：
    名称                    参数                    说明
    executeNonQuery         sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个影响行数，如果无行数影响，返回-1
    executeRows             sql:string,args:{}      执行一个由sql参数提供的语句,使用参数args为参数,返回一个行集（json字符串）
    

