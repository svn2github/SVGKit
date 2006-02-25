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

function panelMochiLogger(inline) {
   var m = MochiKit.LoggingPane;
   m._loggingPane = new m.LoggingPane(inline, MochiKit.Logging.logger);
   return m._loggingPane}

function onLoadScripts() {
   addLoadEvent(roundPanelCorners());
   addLoadEvent(topTimeFunc());
   }
