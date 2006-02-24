function togglePanel(elem,source,sourcetype) {
  makePanel(elem);
  toggleMenuItem(elem)}

function toggleMenuItem(elem) {
  toggleElementClass("panelShown","bar_" + elem)}

function panelIsVisible(elem) {
  return !hasElementClass(elem, "panelInvisible")}

function makePanel(elem) {
  toggleElementClass("panelInvisible", elem)}





var xmlhttp

function loadXMLDoc(url) {
// code for Mozilla, etc.
if (window.XMLHttpRequest) {
  xmlhttp=new XMLHttpRequest()
  xmlhttp.onreadystatechange=state_Change
  xmlhttp.open("GET",url,true)
  xmlhttp.send(null)
  }
// code for IE
else if (window.ActiveXObject) {
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
    if (xmlhttp) {
    xmlhttp.onreadystatechange=state_Change
    xmlhttp.open("GET",url,true)
    xmlhttp.send()
    }
  }
}

function state_Change() {
// if xmlhttp shows "loaded"
if (xmlhttp.readyState==4) {
  if (xmlhttp.status==200) {


    document.getElementById("webcams").innerHTML = xmlhttp.responseXML;
    }
  else {
    alert("Problem retrieving data:" + xmlhttp.statusText)
    }
  }
}
