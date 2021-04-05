/*
  [copyright and licensing notification to go here]  
*/


//send http requests
function makeHttpRequest(httpVerb,fileStr,msg,paramLst,hdrLst,usr,pwd){
    var xmlhttp;    
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if(xmlhttp.status != 200 && xmlhttp.status !== 0){
            console.log('Response from server: ' + xmlhttp.statusText + ' code: ' + xmlhttp.status);
        }
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var responseTxt = xmlhttp.responseText.trim();
            var rsLen = responseTxt.length;
            if(rsLen < 500000 || suspendPacketSzLimit){
                updateFromHttpResponse(responseTxt);
            }
            suspendPacketSzLimit = false;
        }
    }
    var paramStr = "";
    var plSep = ""; //plSep - parameter list separator
    var portSep = ":";
    var querySep = "?";
    var pathStr = "";
    var pathSep = '/';
    var pathArr = window.location.pathname.split(pathSep);
    for(var i=0; i<pathArr.length - 1; i++){
        if(pathArr[i] === '')continue;
        pathStr += '/' + pathArr[i];
    }
    if(pathStr === '/'){
        pathSep = ''; 
    }
    pathStr += '/' + fileStr;
    if(window.location.port === "")portSep = "";
    var urlString = "http://" + window.location.hostname + portSep + window.location.port + "/" + pathStr;
    var sendMsg = "";
    if(msg !== ""){
        msg = "msg=" + msg;
    }
    if(paramLst.length > 0){
        for(var i=0; i<paramLst.length; i++){
            paramStr += plSep + paramLst[i];
            plSep = "&"; 
        }
    }
    if(httpVerb === "GET"){
        if(msg !== ""){
            paramStr += plSep + msg;
        }
    }
    else{
        sendMsg = msg;
    }
    urlString += querySep + paramStr;
    xmlhttp.open(httpVerb,urlString,true,usr,pwd); 
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(sendMsg);
}

function safeParseJSON(jsonString){
    var jsonOb = null;
    try {
        jsonOb = JSON.parse(jsonString);
    }
    catch(err) {
        var msg = "JSON.parse "
        displayErrorMessage("JSON.parse() found invalid JSON string. Details: " + err.message);
    }
    return jsonOb;
}

