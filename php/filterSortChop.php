<?php

include "accessAPI.php";

//unpack request info
$msg = $_GET['msg'];
$requestMap = json_decode($msg,true,1000);
if(is_null($requestMap)){
  echo "Unable to decode JSON request";
  exit(0);
}

//validate requestMap subparts
$itemType = $requestMap['category'];
if(is_null($itemType) || strlen($itemType) < 1){
  echo "Unable to access items of unspecified type";
  exit(0);
}
$sortOnKeysArray = $requestMap['sort_on_keys'];
if(is_null($sortOnKeysArray)){
    $sortOnKeysArray = array("name");
}
$sortOptionsSelections = $requestMap['sort_options_selections'];
if(is_null($sortOptionsSelections)){
    echo "Unable to acquire sort options selection.";
    exit(0);
}
$sortOrder = $requestMap['sort_order'][0];
if(is_null($sortOrder)){
    echo "Unable to detect sort order.";
    exit(0);
}

//get items from remote location 
$result = callAPI('GET', "https://api.crystal-d.com/codetest","");

//temp:
//$result = '{"people":[{"name":"Zeno Adams","height":10.0,"dob":"1910-10-19T14:08:03-05:00","hobby":"Collecting cigar boxes"},{"name":"John Smith","height":6.2,"dob":"1980-10-19T14:08:03-05:00","hobby":"Circuitry"},{"name":"Jane Smith","height":5.4,"dob":"1984-06-20T02:30:35-05:00","hobby":"Fostering puppies"},{"name":"Bob Singleton","height":5.8,"dob":"1993-06-23T05:14:43-05:00","hobby":"Car racing"},{"name":"Walter Taylor","height":6.1,"dob":"1997-11-29T13:08:03-06:00","hobby":"Cooking"}]}';

if(is_null($result)){
    echo "Unable to retrieve data from API";
    exit(0);
}

//parse the returne result
$dataMap = json_decode($result,true,1000);
if(is_null($dataMap)){
    echo "Unable to decode JSON data from API endpoint";
    exit(0);
}
if(array_key_exists($itemType,$dataMap) == false){
    echo "This is a sequential array";
    exit(0);
}
if(is_null($dataMap[$itemType])){
    echo "No info available of type " . $itemType;
    exit(0);
}

//get array of items
$dataArray = $dataMap[$itemType];
if(is_null($dataArray)){
    echo "'" . $itemType . "' data is not populated";
    exit(0);
}
if(is_array($dataArray) == false){
    echo "Format error for data returned by API";
    exit(0);
}

//filter items, tbd


//sort items
$sortField = $sortOnKeysArray[0];

//create sortable key-value pair list
$sortableArray = array();
for($i = 0; $i < count($dataArray); $i++){
    $item = $dataArray[$i];
    if(array_key_exists($sortField,$item)){
        $safeVal = $item[$sortField];
        if(gettype($safeVal) === 'double'){
            $safeVal = strval($safeVal);
        }
        if($sortOptionsSelections != ""){
            if($sortOptionsSelections === "last, first"){
                $nameArr = explode(' ',$safeVal);
                $safeVal = $nameArr[1] . $nameArr[0];
            }
        }
        $sortableArray[$safeVal] = $i;
    }
}
if(count($sortableArray) < 1){
    echo "Unable to setup sortable array.";
    exit(0);
}

//sort the sortable key-value list according to the specified sort order
if($sortOrder !== 'd'){
    ksort($sortableArray);
}
else{
    arsort($sortableArray);
}
$sortedKeys = array_keys($sortableArray);

//build sorted version of items
$outArray = array();
for($i = 0; $i < count($sortableArray); $i++){
    $outArray[$i] = $dataArray[$sortableArray[$sortedKeys[$i]]];
}

//return sorted, filtered items
echo trim(json_encode($outArray));

?>