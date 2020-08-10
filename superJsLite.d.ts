/**一个表达式实例 */
interface Expression{
    /**获取一个变量回调 */
    setVars(vars:(name:string)=>void);
    /**设置一个参数回调 */
    setParameters(params:(name:string)=>void);
    /**计算 */
    eval():any;
}
/**创建一个表达式解释器引擎 
 * 支持 %,!=,!>,!<,case [expr] [when then] else end,[not] in(...)等等符号和语句
*/
interface ExpressionEngine{
    /**解释器函数回调 */
    setFunction(fun:(name:string,args:any[])=>any);
    /**创建表达式解释器,expr为表达式 */
    createExpression(expr:string):Expression;
}

interface ExpressionEngineConstructor{
    new():ExpressionEngine;
}

declare var ExpressionEngine:ExpressionEngineConstructor;

interface BytesConstructor {
    new(vd: number): Bytes;
    new(base64: string): Bytes;
    new(binary:any):Bytes;
    new(bytes: string, format: 'base64' | 'hex'): Bytes;
}

interface Bytes {
    /**字节数组的长度（字节数） */
    length: number;
    /**获得指定偏移量的字节 */
    getItem(offset: number): number;
    /**设置一个指定偏移量的字节 */
    setItem(offset: number, value: number): void;
    toString(algorithm:'base64'|'hex')
}
/**创建一个字节数组 */
declare var Bytes: BytesConstructor;

interface Console {
    /**打印一个空行 */
    log():void;
    /**打印一行，用msg参数 */
    log(msg:string):void;
    /**打印一行允许使用参数{0}...{n} */
    log(msg:string,...args:any[]):void
}
/**控制台 */
declare var console:Console;
/**引用一个脚本 */
declare function using(fileName:string):any;


interface NameValueCollection {
    /**添加一个项目 */
    add(key: string, value: string):void;
    /**获取一个项目 */
    getItem(idx: number | string): string;
    /**设置一个项目 */
    setItem(key: string, value: string): void;
    /**数量 */
    count: number;
    /**获取一个键 */
    getKey(idx: number): string;
    /**移除一个键 */
    remove(key: string): void;
}

interface Cookie {
    /**名称 */
    name: string;
    /**值 */
    value: string;
    /**路径 */
    path: string;
    /**域 */
    domain: string;
    /**到期时间 */
    expires: Date;
    /**是否过期 */
    expired: boolean;
}

interface CookieCollection {
    count: number;
    add(cookie: Cookie): void;
    get(item: number | string): Cookie;
    //remove(cookie: Cookie): void;
}

interface Stream {
    length: number;
    canWrite: boolean;
    canRead: boolean;
    canSeek: boolean;
    /** origin begin:0;current:1,end:2 */
    seek(offset: number, origin: 0|1|2): number;
    position:number;
    setLength(length:number):void;
    write(buffer:Bytes,offset:number,count:number):void;
    read(buffer:Bytes,offset:number,count:number):number;
    close():void;
    dispose():void;
    flush():void;
}


interface HttpRequest {
    queryString: NameValueCollection;
    inputStream:Stream;
    contentType: string;
    hasData: boolean;
    httpMethod: string;
    keepAlive: boolean;
    clientAddress: string;
    acceptTypes: string[];
    rawUrl: string;
    hostName: string;
    hostAddress: string;
    headers: NameValueCollection;
    cookies: CookieCollection;
    contentLength: number;
    isAuthenticated:boolean;
    isSecureConnection:boolean;
    localPath:string;
    absolutePath:string;
    charset:string;
    boundary:string;
    /**去掉其它说明(如 charset,boundary等等的)的 contentType*/
    _contentType:string;
}

interface HttpResponse{
    headers: NameValueCollection;
    outputSream:Stream;
    statusCode:number;
    keepAlive:boolean;
    contentLength:number;
    cookies:CookieCollection;
    setCookie(cookie:Cookie):void;
    appendCookie(cookie:Cookie):void;
    appendHeader(name:string,value:string);
    close():void;
    abort():void;
    contentType:string;
    sendChunked:boolean;

}

interface HttpContext {
    request:HttpRequest;
    response:HttpResponse;
}

interface Path{
    combine(path1:string,path2:string):string;
    getExtension(path:string):string;
    getFileName(path:string):string;
    getFileNameWithoutExtension(path:string):string;
    getDirectoryName(path:string):string;
}

interface Utils{
    newid():string;
    hashBytes(algorithm: 'MD5' | 'SHA' | 'SHA1' ,bytes: Bytes ):Bytes;
    hashText(algorithm: 'MD5' | 'SHA' | 'SHA1',txt:string):Bytes;
    stringToBase64(encoding:'utf-8'|'gb2312'|string,txt:string):string;
    base64ToString(encoding:'utf-8'|'gb2312'|string,base64Txt:string):string;
    encryptor(bytes:Bytes,offset:number,count:number,key?:{hexKey:string,hexIV:string}):Bytes;
    decryptor(bytes:Bytes,offset:number,count:number,key?:{hexKey:string,hexIV:string}):Bytes;
    encryptorText(encoidng:'utf-8'|'gb2312'|string,txt:string,key?:{hexKey:string,hexIV:string}):Bytes;
    decryptorText(encoidng:'utf-8'|'gb2312'|string,bytes:Bytes,key?:{hexKey:string,hexIV:string}):string;
}

interface IO{
    writeText2Stream(txt:string,stream:Stream,charset:string):number;
    readStream2Text(stream:Stream,length:number,charset:string):string;
}
interface Server{
    serverPath:string;
    httpPath:string;
    mimeName:string;
    context:HttpContext;
    path:Path;
    io:IO;
    setValue(key:string,value:string|boolean|number|Date):void;
    getValue(key:string):any;
    confuseStr:string;
    sleep(timeout:number);
    httpRequest(url:string,options?:{method?:string,headers?:string[],data?:Bytes,timeout?:number,async?:boolean}):
        {statusCode:number,state:number,charset:string,getHeaders:()=>string[],getData:()=>Bytes,getErrorMsg:()=>string};
    import(nativeType:string,typeName:string):any;
    utils:Utils;
}

declare var server:Server;

interface Encoding{
    getBytes(str:string):Bytes;
    getString(bytes:Bytes):string;
    getString(bytes:Bytes,index:number,count:number):string;
}

interface EncodingConstructor{
    new (encodeName:'utf-7'|'utf-8'|'utf-16'|'utf-32'|'us-ascii'|'gb2312'|string):Encoding;
}

declare var Encoding:EncodingConstructor;

interface String{
    format(...str:any[]):string;
    /**右取字符串 */
    right(length:number):string;
}

interface Date{
    /**返回年月日字符串 0:yyyy-MM-dd; 1:yyyy-MM-dd HH:mm:ss; 2:yyyy-MM-dd HH:mm:ss.fff; 3:yyyyMMdd;4:yyMMdd */
    toYMD(more?:0|1|2|3|4):string;
    /**返回不包括时间部分的日期 */
    date:Date;
    /**返回 date 减去当前值得差 */
    diff(type:'y'|'yy'|'yyyy'|'year'|'m'|'mm'|'month'|'d'|'dd'|'day'|'h'|'hh'|'hour'|'mi'|'minutes'|'s'|'sec'|'second',date:Date):number;
    /**返回一个指定日期的相加值 */
    add(type:'y'|'yy'|'yyyy'|'year'|'m'|'mm'|'month'|'d'|'dd'|'day'|'h'|'hh'|'hour'|'mi'|'minutes'|'s'|'sec'|'second',x:number):Date;
}

interface ICommand{
    dispose():void;
    disposed:boolean;
    count:number;
    add(name:string,value:any):number;
    clear():void;
    set(paramIdx:number,value:any):void;
    get(paramIdx:number):any;
    timeout:number;
    executeNonQuery():number;
    executeScalar():any;
    executeRows():any[];
    executeRowSet():{columns:any,rows:any[][]};
    executeReader(eachRow:(cols:string[],row:any[])=>boolean):void;
}

interface DBScope{
    completeTrans():void;
    dispose():void;
    disposed:boolean;
    timeout:number;
    executeNonQuery(sql:string,params?:any):number;
    executeScalar(sql:string,params?:any):any;
    executeRows(sql:string,params?:any):any[];
    executeRowSet(sql:string,params?:any):{columns:any,rows:any[][]};
    executeReader(sql:string,params:any,eachRow:(row:any[])=>boolean):void;
    executeReader(sql:string,eachRow:(cols:string[],row:any[])=>boolean):void;
    createCommand(sql:string,cmdScope:(cmd:ICommand)=>any):any;
}
interface DB{
    createScope(cnnString:string):DBScope;
    createScope(cnnString:string,beginTrans:boolean):DBScope;
    /**isRaw指示直接使用原始语句执行 */
    createScope(cnnString:string,beginTrans:boolean,isRaw:boolean):DBScope;
}

interface Random{
    next():number;
    next(max:number):number;
    next(min:number,max:number):number;
    nextDouble():number;
}

interface RandomConstructor{
    new();
    new(seed:number);
}

declare var Random: RandomConstructor;
declare var database:DB;
declare var exports:any;