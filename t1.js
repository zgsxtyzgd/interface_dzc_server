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