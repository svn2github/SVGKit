function debug() {
   if (!debug.box) {
       debug.box = document.createElement("div");
       debug.box.setAttribute("style",
                              "background-color: white; " +
                              "border: solid black 3px; " +
                              "padding: 10px;");
       document.body.appendChild(debug.box);
   }

   // Start Mochikit interpreter
   if (!(typeof(interpreterManager) == "undefined")) {
           var debugString = '<h5>Interactive Javascript Interpreter/Debugger</h5><form id="interpreter_form"><div id="interpreter_area"><div id="interpreter_output"></div></div><input id="interpreter_text" name="input_text" type="text" class="textbox" size="100" /></form>';
           debug.box.innerHTML = debugString;
           interpreterManager.initialize();
   }
   else {
           debugString = '<h5>MochiKit Interactive Interpreter/Debugger Not Found</h5>';
           debug.box.innerHTML = debugString;
   }
}
