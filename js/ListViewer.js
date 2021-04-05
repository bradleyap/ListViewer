/*
  [copyright and licensing notification to go here]  
*/

//'gData' will be update when the server returns it
var gData = null;

//use defaults for expected field names for now, anticipating dynamic method of getting these some day
gKeys = ["name","height","dob","hobby"];
gKeySelectionIdx = 0;
gSortOrder = ['a','a','a','a']; //'a' - ascending order, 'd' - descending order
gSortingOptions = {"name":["first last","last, first"]};
gSortingOptionsSelections = ["first last","","",""];
gFilteringRules = {"name":{"equals":[""]}};
gBlanketFilters = [1,1,1,1]; // 1 means fetch, 0 means ignore

//running 'initializeViewer' at startup, with nothing to display
function initializeViewer(){
    //initialize data area
    var elmt = document.getElementById('data-area');  
    if(elmt){
      elmt.innerHTML = "Loading data ...";
      elmt.className = "message-item";
    }
    
    // set up menuitem handlers
    elmt = document.getElementById('c1');
    elmt.addEventListener('click',showDetails);
    elmt = document.getElementById('c2');
    elmt.addEventListener('click',hideDetails);
    elmt.style.display = 'none';
    elmt = document.getElementById('c3');
    elmt.addEventListener('click',specifySortingParameters);
    elmt = document.getElementById('c4');
    elmt.addEventListener('click',specifyFilter);
    
    formulateAndSendRequest();
}

//make ajax request for sorted data, use defaults for now
function formulateAndSendRequest(){
    /*
        'sort_on_keys', 'sort_order' and 'sort_options_selections' may eventually be required to hold multiple key strings instead of just one, for n-ary ordering, so an array seems appropriate
        creds - credentials
    */
    var sortOptionsStr = JSON.stringify(gSortingOptionsSelections[gKeySelectionIdx]);
    var blanketFilterStr = JSON.stringify(gBlanketFilters);
    var filterRulesStr = JSON.stringify(gFilteringRules);
    var requestInfo = '{"category":"people","sort_on_keys":["' + gKeys[gKeySelectionIdx] + '"],"sort_order":["' + gSortOrder[gKeySelectionIdx]  + '"],"sort_options_selections":' + sortOptionsStr + ',"filtering_rules":' + filterRulesStr + ',"blanket_filters":' + blanketFilterStr + ',"maxPageSize":100,"creds":{"username":"user","pswd":"pass"}}';

    makeHttpRequest('GET','php/filterSortChop.php',requestInfo,[],[]);
}

//process http response message
function updateFromHttpResponse(msg){
    var jsob = JSON.parse(msg);
    if(jsob && typeof jsob.length !== 'undefined'){
        displayListData(jsob);
        gData = jsob;
    }
}

//shows only the basic list of items
function displayListData(data){
    var html = "<table>";
    for(var i=0; i<data.length; i++){
        var item = data[i];
        if(typeof item !== 'undefined' && item){
            html += "<tr>";
            html += "<td>" + item[gKeys[0]] + "</td>";
            html += "</tr>";
        }
    }
    html += "</table>";
    var elmt = document.getElementById('data-area');  
    if(elmt){
        elmt.innerHTML = html;
    }
}

//shows all the record fields 
function displayFullTableData(data){
    var html = "<table>";
    for(var i=0; i<data.length; i++){
        var item = data[i];
        if(typeof item !== 'undefined' && item){
            html += "<tr>";
            for(var j=0; j<gKeys.length; j++){
                html += "<td>" + item[gKeys[j]] + "</td>";
            }
            html += "</tr>";
        }
    }
    html += "</table>";
    var elmt = document.getElementById('data-area');  
    if(elmt){
        elmt.innerHTML = html;
    }
}


//handle mouse click events
function showDetails(e){
    displayFullTableData(gData);
    e.target.style.display = 'none';
    document.getElementById('c2').style.display = 'block';
}

function hideDetails(e){
    displayListData(gData);
    e.target.style.display = 'none';
    document.getElementById('c1').style.display = 'block';
}

function specifySortingParameters(e){
    var html = '<div id="dialog-box"><h3>Sort parameters</h3>Order by<br/><select id="order-combo">';
    for(var i=0; i<gKeys.length; i++){
        var selectedStr = '';
        if(typeof gSortingOptions[gKeys[i]] !== 'undefined'){
            var soArr = gSortingOptions[gKeys[i]];
            for(var j=0; j<soArr.length; j++){
                selectedStr = '';
                if(i == gKeySelectionIdx && soArr[j] === gSortingOptionsSelections[i]){
                    selectedStr = ' selected';
                }
                html += '<option' + selectedStr + '>' + gKeys[i] + ' (' + soArr[j] + ')' + '</option>';
            } 
            continue;
        }
        if(i == gKeySelectionIdx){
            selectedStr = ' selected';
        }
        html += '<option' + selectedStr + '>' + gKeys[i] + '</option>';
    }
    var descendingSelectedStr = '';
    var ascendingSelectedStr = ' selected';
    if(gSortOrder[gKeySelectionIdx] === 'd'){
        descendingSelectedStr = ' selected';
        ascendingSelectedStr = '';
    }
    html += '</select><p>Order <br/><select id="sequence-combo"><option' + ascendingSelectedStr  + '>ascending</option><option' + descendingSelectedStr + '>descending</option></select></p>';
    html += '<p><input type="button" id="accept-btn" value="update and refresh data" onclick="updateSortParametersAndFetchData()"></input> <input type="button" id="cancel-btn" value="cancel" onclick="cancelOperation()"></input></p></div>';
    document.getElementById('popup-location').innerHTML = html;
    showPopupBox();
}

function specifyFilter(e){
    alert('Filtering is not yet functional.');
}

function showPopupBox(){
    var elmt = document.getElementById('popup-location');
    elmt.style.display = 'block';

    //center content within popup location
    elmt = document.getElementById('dialog-box');
    elmt.style.display = 'inline-block';
    var box = elmt.getBoundingClientRect();
    elmt.style.left = ((window.innerWidth - box.width) / 2) + 'px';
    elmt.style.top = ((window.innerHeight - box.height) / 2) + 'px';
}

function closePopupBox(){
    var elmt = document.getElementById('popup-location');
    elmt.innerHTML = "";
    elmt.style.display = 'none';
}

function updateSortParametersAndFetchData(e){
    var orderSequenceChange = false;
    var sortOptionChange = false;

    var ctrlElmt = document.getElementById('order-combo');

    //we are expecting no whitespace unless it delimits a sorting option
    var spcIndex = ctrlElmt.value.indexOf(' ');
    var key = ctrlElmt.value.substring(0,spcIndex);
    var sortOptionStr = "";
    var arr = ctrlElmt.value.split(/[()]+/);
    if(arr.length > 1){
        sortOptionsStr = arr[1];
    }

    //update sorting key and sorting option selection
    var optionMissing = false;
    for(var i=0; i<gKeys.length; i++) {
        if(gKeys[i] === key){
            
            //check if a new key has been selected
            if(gKeySelectionIdx !== i){
                sortOptionChange = true;
                gKeySelectionIdx = i;
            }
            
            //check further to see if a new sort option has been selected
            var soArr = gSortingOptions[key];
            if(typeof soArr !== 'undefined' && sortOptionsStr !== ""){
                optionMissing = true;
                for(var j=0; j<soArr.length; j++){
                    if(soArr[j] === sortOptionsStr){
                        if(soArr[j] !== gSortingOptionsSelections[gKeySelectionIdx]){
                            gSortingOptionsSelections[gKeySelectionIdx] = soArr[j];
                            sortOptionChange = true;
                        }
                        optionMissing = false;
                    }
                }
            }
            break;
        }
    }

    //should not need this after initial development is complete
    if(optionMissing){
        console.log('A problem has occurred when trying to update sorting options. A data refresh will not be attempted.');
        return;
    }

    //update the order sequence
    ctrlElmt = document.getElementById('sequence-combo');
    var nuVal = 'a';
    if(ctrlElmt.value === 'descending'){
        nuVal = 'd';
    }
    if(nuVal !== gSortOrder[gKeySelectionIdx]){
        gSortOrder[gKeySelectionIdx] = nuVal;
        orderSequenceChange = true;
    }

    closePopupBox();

    //only refresh data if a parameter has been changed
    if(orderSequenceChange || sortOptionChange){
        formulateAndSendRequest();
    }
}

function cancelOperation(){
    closePopupBox();
}

