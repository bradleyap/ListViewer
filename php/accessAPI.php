
<?php

/*
    The following callAPI method was based on similar method at:
    https://weichie.com/blog/curl-api-calls-with-php/
*/

function callAPI($method, $url, $data){
   $curl = curl_init();
   switch ($method){
      case "POST":
         curl_setopt($curl, CURLOPT_POST, 1);
         if ($data)
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
         break;
      case "PUT":
         curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
         if ($data)
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);			 					
         break;
      default:
         if ($data)
            $url = sprintf("%s?%s", $url, http_build_query($data));
    }
    // OPTIONS:
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'APIKEY: 111111111111111111111',
      'Content-Type: application/json',
    ));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

    $prefix = "";
    //blocking call to API - to fetch data from endpoint
    $result = curl_exec($curl);
    if(!$result){
        $prefix = 'ERROR: Unable to connect to third party service. ';
    }
    curl_close($curl);
    if (!is_string($result) || !strlen($result)) {
        $prefix = "ERROR: unable obtain server response ";
    }
    
    return $prefix . $result;
}

?>
