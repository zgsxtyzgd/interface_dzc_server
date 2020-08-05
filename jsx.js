function getEncoding(encoding) {
    var coding;
    try {
        coding = new Encoding(encoding);
    }
    catch (_a) {
        coding = new Encoding('utf-8');
    }
    return coding;
}
var context = server.context;
var request = context.request;
var response = context.response;
var response_charset = request.headers.getItem('Accept-Charset');
if (response_charset != undefined)
    response_charset = response_charset.trim();
else
    response_charset = 'utf-8';
try {
    var contentType = request._contentType;
    if (request.hasData && (contentType == undefined || contentType.toLowerCase() != 'application/x-www-form-urlencoded'))
        throw new Error('jsx请求期待 content-type的内容为application/x-www-form-urlencoded');
    var data = void 0;
    if (request.hasData)
        data = server.io.readStream2Text(request.inputStream, request.contentLength, request.charset != undefined ? request.charset : 'gb2312');
    var path = server.path;
    var localPath = path.combine(path.getDirectoryName(request.localPath), path.getFileNameWithoutExtension(request.localPath) + '.js');
    var args_1 = {};
    var qs = request.queryString;
    for (var i = 0; i < request.queryString.count; i++)
        args_1[qs.getKey(i)] = qs.getItem(i);
    if (data != undefined) {
        var items = data.split('&');
        items.forEach(function (item) {
            var s = item.split('=');
            var n = decodeURIComponent(s[0]);
            var v = decodeURIComponent(s[1]);
            args_1[n] = v;
        });
    }
    var entryFunction = using(localPath);
    var r = JSON.stringify(entryFunction(args_1));
    response.statusCode = 200;
    response.contentType = 'text/json;charset=' + response_charset;
    var encoding = getEncoding(response_charset);
    var bs = encoding.getBytes(r);
    response.contentLength = bs.length;
    response.outputSream.write(bs, 0, bs.length);
    response.outputSream.flush();
}
catch (error) {
    if (error.statusCode != undefined)
        context.response.statusCode = error.statusCode;
    else
        context.response.statusCode = 400;
    var err_msg = { message: error.message, rpcStack: error.stack };
    if (error.number)
        err_msg.number = error.number;
    response.contentType = 'text/json;charset=' + response_charset;
    var response_encoding = getEncoding(response_charset);
    var bs = response_encoding.getBytes(JSON.stringify(err_msg));
    response.contentLength = bs.length;
    response.outputSream.write(bs, 0, bs.length);
}
