function topTimeFunc() {       
    topTimeRefresh = window.setTimeout( "topTimeFunc()", 1000 );       
    var dateToday = new Date();       
    $('top_time').innerHTML= toISOTimestamp(dateToday)}

function togglePanel(elem,source,sourcetype) {
    makePanel(elem);
    toggleMenuItem(elem)}

function toggleMenuItem(elem) {
    toggleElementClass("panelShown","bar_" + elem)}

function panelIsVisible(elem) {
    return !hasElementClass(elem, "panelInvisible")}

function makePanel(elem) {
    toggleElementClass("panelInvisible", elem)}

function roundPanelCorners() {
    roundClass("div", "panel", {bgColor: "#000000"})}

function loadClearSkyClock() {
    var dateToday = new Date();
    var myImg = IMG( {'src':'http://cleardarksky.com/csk/getcsk.php?id=OkRdgObMA'} );
    replaceChildNodes('img_skyclock', myImg);
    $('timestamp_skyclock').innerHTML= toISOTimestamp(dateToday);}
    
function onLoadScripts() {
    addLoadEvent(roundPanelCorners());
    addLoadEvent(topTimeFunc());
    addLoadEvent(jsInterpreterManager.initialize()); 
    addLoadEvent(State.makeHash());
    addLoadEvent(State.updateLoop());
    }
/*
addLoadEvent(roundPanelCorners());
addLoadEvent(topTimeFunc());
addLoadEvent(jsInterpreterManager.initialize());
*/