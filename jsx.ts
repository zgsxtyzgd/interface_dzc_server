///<reference path="superjslite.d.ts" />
function getEncoding(encoding:string):Encoding{
    var coding:Encoding;
    try{
        coding=new Encoding(encoding);
    }
    catch{ 
        coding=new Encoding('utf-8')
    }
    return coding;
     
}
var context = server.context;
var request = context.request;
var response = context.response;

var response_charset: string = request.headers.getItem('Accept-Charset');
if (response_charset != undefined)
    response_charset = response_charset.trim();
else 
    response_charset = 'utf-8';
try {
    var contentType=request._contentType;
    if (request.hasData && (contentType==undefined || contentType.toLowerCase() != 'application/x-www-form-urlencoded'))
        throw new Error('jsx请求期待 content-type的内容为application/x-www-form-urlencoded');
    let data: string;
    if (request.hasData)
        data=server.io.readStream2Text(request.inputStream, request.contentLength, request.charset != undefined ? request.charset : 'gb2312');
        //data = JSON.parse(server.io.readStream2Text(request.inputStream, request.contentLength, request.charset != undefined ? request.charset : 'gb2312'));
    var path=server.path;
    let localPath=path.combine(path.getDirectoryName(request.localPath),path.getFileNameWithoutExtension(request.localPath) + '.js');
    //let localPath =server.path.combine(server.path. server.path.getFileNameWithoutExtension(request.localPath) + '.js'
    let args: any = {};
    let qs = request.queryString;
    for (let i = 0; i < request.queryString.count; i++)
        args[qs.getKey(i)] = qs.getItem(i);
    if(data!=undefined){
        let items=data.split('&');
        items.forEach(item=>{
            let s=item.split('=');
            let n=decodeURIComponent(s[0]);
            let v=decodeURIComponent(s[1]);
            args[n]=v;
        });
    }
    
    let entryFunction = using(localPath);
    let r = JSON.stringify(entryFunction(args));
    response.statusCode = 200;
    response.contentType = 'text/json;charset=' + response_charset;
    var encoding=getEncoding(response_charset);
    let bs=encoding.getBytes(r);
    //server.io.writeText2Stream(r,response.outputSream,response_charset);
    response.contentLength=bs.length;
    response.outputSream.write(bs,0,bs.length);
    response.outputSream.flush();
}
catch (error) {
    if (error.statusCode != undefined)
        context.response.statusCode = error.statusCode;
    else
        context.response.statusCode = 400;
    var err_msg:any={message:error.message,rpcStack:error.stack};
    if(error.number)
        err_msg.number=error.number;

    response.contentType = 'text/json;charset=' + response_charset;
    let response_encoding = getEncoding(response_charset);
    let bs = response_encoding.getBytes(JSON.stringify(err_msg));
    response.contentLength = bs.length;
    response.outputSream.write(bs, 0, bs.length);
}