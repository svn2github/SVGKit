/***

SVGKit 0.1

See <http://svgkit.com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.

    Some notes:
    http://www.sitepoint.com/article/oriented-programming-2
    http://www.sitepoint.com/article/javascript-objects
    
    At some point I'd like to auto-detect if user has SVG and if it's Adobe or W3C:
        http://blog.codedread.com/archives/2005/06/21/detecting-svg-viewer-capabilities/
        http://blog.codedread.com/archives/2006/01/13/inlaying-svg-with-html/
        http://www.adobe.com/svg/workflow/autoinstall.html
    Also, transmogrify <object> tags into <embed> tags automatically,
    perhaps using <!–[if IE]> and before the content loads.
    
    This should work if included in an SVG to for inline scripting.
    
    Do I want to do anything with events or just let the DOM and MochiKit handle them?
    
    toXML needs to output case-sensitive tags and attributes.
    
    Problem of divs loading and unloading, especially with multiple writeln() in the interpreter.
    Perhaps on unload, save xml and then restore on a load.
    Can't draw anything until it's loaded.  Really annoying in the interpreter.
    
    Browser SVG:
     * Should always provide fallback content -- png, pdf, (shudder) swf
     * Interactivity requires SVG, but initial static content should have static fallback
     * Best effort to have it work on Firefox, Opera, Safari, IE+ASV, Batik
     * Text sucks -- different settings/browsers render it in vastly differens sizes.
    
    Add getURL and setURL to non-ASP based renders like
    http://jibbering.com/2002/5/dynamic-update-svg.html
    
    SVG (and most client-side web stuff) is depressing.  Things looked so bright back in
    1999 and here we are SEVEN years later and even I just learned about the standard.
    
    Make a MochiMin version as an option for inclusion.
***/


if (typeof(dojo) != 'undefined') {
    dojo.provide("SVGKit");
    dojo.require("MochiKit.DOM");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(MochiKit.DOM) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "SVGKit depends on MochiKit.DOM!";
}

if (typeof(SVGKit) == 'undefined') {
    // Constructor
    SVGKit = function(widthOrIdOrNode, height, id, type) {
        if (typeof(this.__init__)=='undefined' || this.__init__ == null){
            //log("You called SVG() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new SVGKit(widthOrIdOrNode, height, id, type);
        }
        this.__init__(widthOrIdOrNode, height, id, type);
        return null
    };
}

SVGKit.NAME = "SVGKit";
SVGKit.VERSION = "0.1";
SVGKit.__repr__ = function () {
    return "[" + SVGKit.NAME + " " + SVGKit.VERSION + "]";
};
SVGKit.prototype.__repr__ = SVGKit.__repr__;

SVGKit.toString = function () {
    return this.__repr__();
};
SVGKit.prototype.toString = SVGKit.toString;

// The following has been converted by Zeba Wunderlich's Perl Script
// from http://www.w3.org/TR/SVG/eltindex.html

SVGKit.EXPORT = [
/*
    "setCurrentSVG",
    "currentSVGDocument",
    "currentSVGElement",
    "appendNode",
    "createSVG",
    "grabSVG",
    "A",
    "ALTGLYPH",
    "ALTGLYPHDEF",
    "ALTGLYPHITEM",
    "ANIMATE",
    "ANIMATECOLOR",
    "ANIMATEMOTION",
    "ANIMATETRANSFORM",
    "CIRCLE",
    "CLIPPATH",
    "COLOR_PROFILE",
    "CURSOR",
    "DEFINITION_SRC",
    "DEFS",
    "DESC",
    "ELLIPSE",
    "FEBLEND",
    "FECOLORMATRIX",
    "FECOMPONENTTRANSFER",
    "FECOMPOSITE",
    "FECONVOLVEMATRIX",
    "FEDIFFUSELIGHTING",
    "FEDISPLACEMENTMAP",
    "FEDISTANTLIGHT",
    "FEFLOOD",
    "FEFUNCA",
    "FEFUNCB",
    "FEFUNCG",
    "FEFUNCR",
    "FEGAUSSIANBLUR",
    "FEIMAGE",
    "FEMERGE",
    "FEMERGENODE",
    "FEMORPHOLOGY",
    "FEOFFSET",
    "FEPOINTLIGHT",
    "FESPECULARLIGHTING",
    "FESPOTLIGHT",
    "FETILE",
    "FETURBULENCE",
    "FILTER",
    "FONT",
    "FONT_FACE",
    "FONT_FACE_FORMAT",
    "FONT_FACE_NAME",
    "FONT_FACE_SRC",
    "FONT_FACE_URI",
    "FOREIGNOBJECT",
    "G",
    "GLYPH",
    "GLYPHREF",
    "HKERN",
    "IMAGE",
    "LINE",
    "LINEARGRADIENT",
    "MARKER",
    "MASK",
    "METADATA",
    "MISSING_GLYPH",
    "MPATH",
    "PATH",
    "PATTERN",
    "POLYGON",
    "POLYLINE",
    "RADIALGRADIENT",
    "RECT",
    "SCRIPT",
    "SET",
    "STOP",
    "STYLE",
    "SVG",
    "SWITCH",
    "SYMBOL",
    "TEXT",
    "TEXTPATH",
    "TITLE",
    "TREF",
    "TSPAN",
    "USE",
    "VIEW",
    "VKERN"
    */
];

SVGKit.EXPORT_OK = [
];


SVGKit._defaultType = 'object'
SVGKit.prototype._svgMIME = 'image/svg+xml';
SVGKit.prototype._svgEmptyName = 'empty.svg';
SVGKit.prototype._SVGiKitBaseURI = '';
SVGKit.prototype._errorText = "You can't display SVG. Download Firefox 1.5." ;

SVGKit.prototype.setBaseURI = function() {
    /***
        To create an empty SVG using <object> or <embed> you need to give the tag
        a valid SVG file, so an empty one lives in the same directory as the JavaScript.
        This function finds that directory and sets the _SVGiKitBaseURI variable
        for future use.
    ***/
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (!src) {
            continue;
        }
        if (src.match(/SVGKit\.js$/)) {
            this._SVGiKitBaseURI = src.substring(0, src.lastIndexOf('SVGKit.js'));
        }
    }
}

SVGKit.prototype.getDefs = function(createIfNeeded /* = false */) {
    /***
        Return the <defs> tag inside of the SVG document where definitions
        like gradients and markers are stored.
        
        @param createIfNeeded -- If this is true, a <defs> element will be created if
                                none already exists.
                                
        @returns the defs element.  If createIfNeeded is false, this my return null
    ***/
    var defs = this.svgDocument.getElementsByTagName('defs');
    if (defs.length>0)
        return defs[0];
    if (typeof(createIfNeeded) != 'undefined' && createIfNeeded!=null && !createIfNeeded) {
        return null;
    }
    defs = this.DEFS(null);
    //log("Created defs", defs, "... going to append")
    this.append(defs);
    //log("append worked")
    return defs;
}

SVGKit.prototype.__init__ = function (p1, p2, p3, p4, p5) {
    // TODO:  Make thse work right.
    // __init__()                          For JavaScript included in an SVG.
    // __init__(node)                      Already have an HTML element
    // __init__(id)                        Have the id for an HTML element (if your id ends in .svg, pass in the node instead)
    // __init__(filename, id, type, width, height)        Create a new HTML element that references filename (ends in .svg)
    // __init__(width, height, id, type)   Create a new SVG from scratch with width, height, and id
    
    // The following are described at http://www.w3.org/TR/SVG/struct.html
    this.htmlElement = null;   // the <object> or <embed> html element the SVG lives in, otherwise null
    this.svgDocument = null;  // When an 'svg' element is embedded inline this will be document
    this.svgElement = null;   // corresponds to the 'svg' element
    this._redrawId = null;   // The reference that SVG's suspendRedraw returns.  Needed to cancel suspension.
    this.newSVGType = SVGKit._defaultType; // Determine a good default dynamically ('inline' , 'object', or 'embed')
    
    log("SVG.__init__(", p1, p2, p3, p4, p5, ")");
    this.setBaseURI();
    if (typeof(p1)=='undefined' || p1==null) {
        // Inside of an SVG.
        
    }
    else if (typeof(p1) == 'string') {
        if (p1.length>5 && p1.substr(p1.length-4,4).toLowerCase()=='.svg')  // IE doesn't do substr(-4)
            this.loadSVG(p1, p2, p3, p4, p5);
        else
            this.grabSVG(p1);
    }
    else if (typeof(p1) == 'object') {  // Not <object> but a JS object
        this.grabSVG(p1);
    }
    else {
        this.createSVG(p1, p2, p3, p4)
    }
    // Note that this.svgDocument and this.svgElement may not be set at this point.  Must wait for onload callback.

    this._addDOMFunctions();
}

SVGKit.prototype.whenReady = function (func) {
    /***
        Calls func when the SVG is ready.
        If you create or try to use an SVG inside of <embed> or <object>, the
        SVG file must be loaded.  The browser does this asynchronously, and 
        you can't do anything to the SVG unti it's been loaded.
        If the file already loaded or you're working with an imbeded SVG, func
        will get called instantly.
        If it hasn't loaded yet, func will get added to the elemen's onload 
        event callstack.
    ***/
    if (this.svgElement != null && this.svgDocument != null) {
        func();
    }
    else if (this.htmlElement != null) {
        //log("adding to onload event for htmlElement=", this.htmlElement, " the function", func);
        addToCallStack(this.htmlElement, 'onload', func);
    }
    else {
        // Try again half a second later.  This is only for loaing an SVG from an XML file to an inline element.
        callLater(0.5, func);
    }
}

SVGKit.prototype.setSize = function(width, height) {
    /***
        Sets the size of the svgElement and any 
        htmlElement that contains it.  If no size is given, it's assumed you
        want to set the size of the HTML element based on the size of the SVG.
    ***/
    if (typeof(width)=='undefined' || width==null)
        width = getNodeAttribute(this.svgElement, 'width')
    else
        setNodeAttribute(this.svgElement, 'width', width);
    if (typeof(height)=='undefined' || height==null)
        height = getNodeAttribute(this.svgElement, 'height')
    else
        setNodeAttribute(this.svgElement, 'height', height);
    if (this.htmlElement != null && this.htmlElement != this.svgElement) {
        // For inline images, this was just accomplished above.
        setNodeAttribute(this.htmlElement, 'width', width);
        setNodeAttribute(this.htmlElement, 'height', height);
    }
}


SVGKit.prototype.createSVG = function (width, height, id /* optional */, type /* =default */) {
    /***
        Loads a blank SVG and sets its size and the size of any HTML
        element it lives in to the given width and height.
    ***/
    log("createSVG(", width, height, id , type,")");
    this.loadSVG(this._svgEmptyName, id, type, width, height)
}

SVGKit.prototype.loadSVG = function (filename, id /* optional */, type /* =default */, width /* = from file */, height /* = from file */) {
    /***

        Create a new HTML DOM element of specified type ('object', 'embed', or 'svg')
        and set the attributes appropriately.  You'd never call this for JavaScript
        code within the SVG.
        
        If you're type is inline and you're loading from a file other than empty.svg, 
        you have to wait for the XML to load for the htmlElement to be set. In code
        that appends this htmlElement to the document, you have to call waitReady()
        Conversely, if you're type is embed or object, you CAN'T call whenReady to
        append the htmlElement to the document because it will ever be ready until it's
        displayed!  There must be a better way to handle this.

        @param type: The tag that we will create

        @param width: default 100

        @param height: default 100
        
        @param id: Optionally assign the HTML element an id.

        @rtype: DOMElement

    ***/
    var dom = MochiKit.DOM;
    
    // TODO If it is new, default width and height are 100.  If it's from a file, defaults come from the file.
    //      You can still set the width and height if you want the thing to scroll.

    var attrs = {};
    
    if (typeof(id) == "undefined" || id == null) {
        id = null;
    }
    else {
        attrs['id'] = id;
    }
    if (typeof(type) == "undefined" || type == null) {
        type = this.newSVGType;
    }
    
    log("loadSVG(", filename, id, type, width, height,")");
    
    if (type=='inline') {
        /*  Make sure html tag has SVG namespace support?
                <html xmlns="http://www.w3.org/1999/xhtml"
                  xmlns:svg="http://www.w3.org/2000/svg"
                  xml:lang="en">
        */
        attrs['xmlns:svg'] = 'http://www.w3.org/2000/svg';  // for <svg:circle ...> type tags
        attrs['xmlns'] = 'http://www.w3.org/2000/svg';      // for <circle> type tags
        attrs['width'] = width;
        attrs['height'] = height;
        this.svgDocument = document;
        
        if (filename != this._svgEmptyName) {
            this.htmlElement = null;
            var callback = function(svg, event) {
                var xmlDoc = event.currentTarget;
                svg.svgElement = xmlDoc.documentElement.cloneNode(true);
                svg.htmlElement = svg.svgElement;
            }
            SVGKit.importXML(filename, partial(callback, this));
        }
        else {
            var ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
            var opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
            if (ie && (ie[1] >= 6) && (!opera)) {
                var width = attrs["width"] ? attrs["width"] : "100";
                var height = attrs["height"] ? attrs["height"] : "100";
                var eid = attrs["id"] ? attrs["id"] : "notunique";
                
                var html = '<svg:svg width="' + width + '" height="' + height + '" ';
                html += 'id="' + eid + '" version="1.1" baseProfile="full">';

                this.svgElement = document.createElement(html);

                // create embedded SVG inside SVG.
                var group = canvas.getSVGDocument().createElementNS(PlotKit.SVGRenderer.SVGNS, "svg");
                group.setAttribute("width", width);
                group.setAttribute("height", height);
                canvas.getSVGDocument().appendChild(group);

                return canvas;
            }
            else {
                this.svgElement = this.createSVGDOM('svg', attrs);  // Create an element in the SVG namespace
            }
            this.htmlElement = this.svgElement;   // html can work with the <svg> tag directly
        }
    }
    else if (type=='object') {  // IE:  Cannot support
        attrs['data'] = this._SVGiKitBaseURI + filename;
        attrs['type'] = this._svgMIME;
        this.htmlElement = createDOM('object', attrs, this._errorText);
        var svg = this;  // Define svg in context of function below.
        function finishObject(svg, width, height, event) {
            // IE doesn't have contentDocument
            // IE would have to use some sort of SVG pool of objects
            // that add themselves to a list uppon load.
            svg.svgDocument = svg.htmlElement.contentDocument;
            svg.svgElement = svg.svgDocument.rootElement;  // svgDocument.documentElement works too.
            svg.setSize(width, height);
        }
        this.whenReady( partial(finishObject, svg, width, height) );
    }
    else if (type=='embed') { // IE:  Cannot support
        attrs['src'] = this._SVGiKitBaseURI + filename;
        attrs['type'] = this._svgMIME;
        attrs['pluginspage'] = 'http://www.adobe.com/svg/viewer/install/';
        log("Going to createDOM('embed')");
        this.htmlElement = createDOM('embed', attrs );
        var svg = this;
        function finishEmbed(svg, width, height, event) {
            // IE doesn't load the embed when you include it in the DOM tree.
            // if no real fix, you could create an SVG "pool" of empty width=1, height=1 
            // and move them around. This seems to work in IE.
            // width=0, height=0 works in Firefox, but not IE.
            log("new embed: svg.htmlElement = " + svg.htmlElement) ;
            log("new embed: Going to svg.htmlElement.getSVGDocumen() )") ;
            svg.svgDocument = svg.htmlElement.getSVGDocument();
            svg.svgElement = svg.svgDocument.rootElement;  // svgDocument.documentElement works too.
            svg.setSize(width, height);
        }
        this.whenReady( partial(finishEmbed, svg, width, height) );
    }
}

/* The problem is that each time the object or embed is shown (first time
   or after being hidden) there is a delay before the SVG content is
   accessible.
*/

/*
x = SVGKit.importXML('example.svg')
c = x.documentElement.cloneNode(true);
*/

SVGKit.importXML = function (file, onloadCallback) {
    // http://www.sitepoint.com/article/xml-javascript-mozilla/2
    // http://www-128.ibm.com/developerworks/web/library/wa-ie2mozgd/
    // http://www.quirksmode.org/dom/importxml.html
    var xmlDoc;
    var moz = (typeof document.implementation != 'undefined') && 
            (typeof document.implementation.createDocument != 'undefined');
    var ie = (typeof window.ActiveXObject != 'undefined');

    if (moz) {
        //var parser = new DOMParser(); 
        //xmlDoc = parser.parseFromString(xmlString, "text/xml"); 
        xmlDoc = document.implementation.createDocument("", "", null);
        if (onloadCallback)
            xmlDoc.onload = onloadCallback;
    }
    else if (ie) {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        //xmlDoc.loadXML(xmlString)
        //while(xmlDoc.readyState != 4) {};
        if (onloadCallback) {
            xmlDoc.onreadystatechange = function () {
    			if (xmlDoc.readyState == 4) onloadCallback()
    		};
        }
    }
    xmlDoc.load(file);  // Same for both, surprisingly.
    return xmlDoc;
}


SVGKit.prototype.grabSVG = function (htmlElement) {
    /***
        Given an HTML element (or its id) that refers to an SVG, 
        get the SVGDocument object.
        If htmlElement is an 'object' use contentDocument.
        If htmlElement is an 'embed' use getSVGDocument().
        If htmlElement is an inline SVG, return something else.
        
        If is's an object or embed and it's not showing or
        the SVG file hasn't loaded, this won't work.
        
        @param htmlElement: either an id string or a dom element ('object', 'embed', 'svg)
    ***/
    log("grabSVG htmlElement (node or id) = ", htmlElement);
    if (typeof(htmlElement) == 'string') {
        htmlElement = MochiKit.DOM.getElement(htmlElement);
    }
    this.htmlElement = htmlElement;
    log("htmlElement (node) = ", htmlElement);
    var tagName = htmlElement.tagName.toLowerCase();
    log("tagName = ", tagName, "  If not svg: htmlElement.contentDocument=", htmlElement.contentDocument);
    if (tagName == 'svg')  { // Inline
        this.svgDocument = document;
        this.svgElement = htmlElement;
    }
    // IE Bug: <object> SVGs display, but have no property to access their contents.
    else if (tagName == 'object' && htmlElement.contentDocument) {
        this.svgDocument = htmlElement.contentDocument;
        this.svgElement = this.svgDocument.rootElement;  // svgDocument.documentElement works too.
        log("object  this.svgDocument = ", this.svgDocument);
        log("object  this.svgElement = ", this.svgElement);
    }
    // IE Bug:  htmlElement.getSVGDocument is nothing, but htmlElement.getSVGDocument() works.
    else if (tagName == 'embed' /* && typeof(htmlElement.getSVGDocument) != 'undefined' */) {
        log("embed typeof(htmlElement.getSVGDocument) = " + typeof(htmlElement.getSVGDocument));
        this.svgDocument = htmlElement.getSVGDocument();
        this.svgElement = this.svgDocument.rootElement;  // svgDocument.documentElement works too.
        log("embed  this.svgDocument = ", this.svgDocument);
        log("embed  this.svgElement = ", this.svgElement);
    }
}

SVGKit.prototype.append = function (node) {
    /***
        Convenience method for appending to the root element of the SVG.
        Anything you draw by calling this will show up on top of everything else.
    ***/
    this.svgElement.appendChild(node);
}

SVGKit.prototype.createUniqueID = function(base) {
    /***
        For gradients and things, often you want them to have a unique id
        of the form 'gradient123' where the number is sequentially increasing.
        You would pass this function 'gradient' and it would look for the lowest
        number which returns no elements when you do a getElementByID.
    ***/
    var i=0;
    var id;
    do {
        id = base + i;
        i++;
    } while ( this.svgDocument.getElementById(id) != null );
    return id;
}

SVGKit.prototype.createSVGDOM = function (name, attrs/*, nodes... */) {
    /***
        Like SVGKit.createDOM, but with the SVG namespace.
    ***/
    var elem;
    var dom = MochiKit.DOM;
    if (typeof(name) == 'string') {
        try {
            // W3C Complient
            elem = this.svgDocument.createElementNS("http://www.w3.org/2000/svg", name);
        }
        catch (e) {
            // IE
            log("Creating element with name=", name, " in SVG namespace for IE");
            elem = this.svgDocument.createElement(name);
            elem.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        }
    } else {
        elem = name;  // Parameter "name" was really an object
    }
    if (attrs) {
        dom.updateNodeAttributes(elem, attrs);
    }
    if (arguments.length <= 2) {
        return elem;
    } 
    else {
        var args = MochiKit.Base.extend([elem], arguments, 2);
        return dom.appendChildNodes.apply(this, args);
    }
};

SVGKit.prototype.createSVGDOMFunc = function (/* tag, attrs, *nodes */) {
    /***

        Convenience function to create a partially applied createSVGDOM

        @param tag: The name of the tag

        @param attrs: Optionally specify the attributes to apply

        @param *notes: Optionally specify any children nodes it should have

        @rtype: function

    ***/
    var m = MochiKit.Base;
    return m.partial.apply(
        this,
        m.extend([this.createSVGDOM], arguments)
    );
};


SVGKit.prototype.toXML = function (decorate /* = false */) {
    /***
        This doesn't work cuz toHTML converts everything to lower case.
        
        returns a string of XML.
    ***/
    if (typeof(decorate) == "undefined" || decorate == null) {
        decorate = false;
    }
    var source = toHTML(this.svgElement);
    //var newsrc = source.replace(/\/(\w*)\>/g, "/$1>\n");
    var newsrc = source.replace(/>/g, ">\n");
    if (decorate) {
        return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + newsrc
    }
    else {
        return newsrc;
    }
}

SVGKit.prototype.suspendRedraw = function (miliseconds /* = 1000 */) {
    if (typeof(miliseconds) == "undefined" || miliseconds == null) {
        ms = 1000;
    }
    this._redrawId = this.svgElement.suspendRedraw(miliseconds);
}

SVGKit.prototype.unsuspendRedraw = function () {
    if (this._redrawId != null) {
        this.svgElement.unsuspendRedraw(this._redrawId);
        this._redrawId = null;
    }
}

SVGKit.prototype.deleteContent = function() {
    /***
        Deletes all graphics content, but leaves definitions
    ***/
    var deleteFrom = 0;
    while(this.svgElement.childNodes.length>0) {
        if (this.svgElement.childNodes[deleteFrom].tagName=='defs')
            deleteFrom++;
        else
            this.svgElement.removeChild(this.svgElement.childNodes[deleteFrom]);
    }
}

SVGKit.prototype.deleteEverything = function() {
    /***
        Deletes everything including definitions
    ***/
    while(this.svgElement.childNodes.length>0) {
        this.svgElement.removeChild(this.svgElement.childNodes[0]);
    }
}

/*
    The following take an element and transforms it.  If the last item in
    the transform string is the same as what you're trying to do, replace it.
    Note that translate(2,0) gets turned into translate(2).
    Regular Expressions are hard coded so they can be compiled once on load.
*/


SVGKit.rotateRE = /(.*)rotate\(\s*(.*)\s*\)\s*$/
SVGKit.prototype.rotate = function(elem, degrees) {
    var old_transform = elem.getAttribute('transform')
    var new_transform = this._oneParameter(old_transform, degrees, 
                                            SVGKit.rotateRE, 'rotate')
    elem.setAttribute('transform', new_transform);
}


SVGKit.translateRE = /(.*)translate\(\s*(.*)\s*,+\s*(.*)?\s*\)\s*$/
SVGKit.prototype.translate = function(elem, tx, ty) {
    var old_transform = elem.getAttribute('transform')
    var new_transform = this._twoParameter(old_transform, sx, sy, 
                                            SVGKit.translateRE,
                                            'translate')
    elem.setAttribute('transform', new_transform);
}

SVGKit.scaleRE = /(.*)scale\(\s*(.*)\s*,+\s*(.*)?\s*\)\s*$/
SVGKit.prototype.scale = function(elem, sx, sy) {
    var old_transform = elem.getAttribute('transform')
    var new_transform = this._twoParameter(old_transform, sx, sy, 
                                            SVGKit.scaleRE, 'scale')
    elem.setAttribute('transform', new_transform);
}

SVGKit.prototype._oneParameter = function(old_transform, degrees, 
                                                 regexp, name) {
    /***
        rotate('translate(1,2)rotate(12)', -12)  -> 'translate(1,2)'
        rotate('translate(1,2)rotate(12)', -11)  -> 'translate(1,2)rotate(1)'
        rotate('rotate( 4 ) rotate( 12 )', -12)  -> 'rotate( 4 ) '
    ***/
    SVGKit.rotateRE.lastIndex = 0;
    var transform = elem.getAttribute('transform')
    //var transform = elem;
    var new_transform, array;
    
    if (old_transform==null)
        new_transform = 'rotate('+degrees+')'
    else if ( (array = SVGKit.rotateRE.exec(old_transform)) != null ) {
        var old_angle = parseFloat(array[2]);
        var new_angle = old_angle+degrees;
        new_transform = array[1];
        if (new_angle!=0)
            new_transform += 'rotate('+new_angle+')';
    }
    else
        new_transform = transform + 'rotate('+degrees+')';
    return new_transform;
}

SVGKit.prototype._twoParameter = function(old_transform, x, y, 
                                                 regexp, name) {
    // Test: SVGKit.prototype._twoParameter('transform( 1 ,2 ) scale( 3 , 4  )', 1, 1, SVGKit.scaleRE, 'scale')
    regexp.lastIndex = 0;
    var transform = elem
    var new_transform, array;
    
    if (old_transform==null)
        new_transform = name+'('+x+','+y+')';
    else if ( (array = regexp.exec(transform)) != null ) {
        var old_x = parseFloat(array[2]);
        var new_x = old_x+x;
        var old_y;
        if (array[3]!=null)
            old_y = parseFloat(array[3]);
        else
            old_y = 0;
        var new_y = old_y+y;
        new_transform = array[1];
        if (new_x!=0 && new_y!=0)
            new_transform += name+'('+new_x+','+new_y+')';
    }
    else
        new_transform = old_transform + name+'('+x+','+y+')';
    return new_transform
}


SVGKit.removeAllChildren = function(node) {
    while(node.childNodes.length>0) {
        node.removeChild(node.childNodes[0]);
    }
}

SVGKit.__new__ = function () {
    var m = MochiKit.Base;
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };
    m.nameFunctions(this);
}
SVGKit.__new__(this);

SVGKit.prototype.circle = function() {
    var c = this.CIRCLE( {'cx':50, 'cy':50, 'r':20, 'fill':'purple', 'fill-opacity':.3} );
    this.append(c);
}

SVGKit.prototype._addDOMFunctions = function() {
    this.$ = function(id) { return this.svgDocument.getElementById(id) }
    //var createSVGDOMFunc = this.createSVGDOMFunc;
    this.A = this.createSVGDOMFunc("a")
    this.ALTGLYPH = this.createSVGDOMFunc("altGlyph")
    this.ALTGLYPHDEF = this.createSVGDOMFunc("altGlyphDef")
    this.ALTGLYPHITEM = this.createSVGDOMFunc("altGlyphItem")
    this.ANIMATE = this.createSVGDOMFunc("animate")
    this.ANIMATECOLOR = this.createSVGDOMFunc("animateColor")
    this.ANIMATEMOTION = this.createSVGDOMFunc("animateMotion")
    this.ANIMATETRANSFORM = this.createSVGDOMFunc("animateTransform")
    this.CIRCLE = this.createSVGDOMFunc("circle")
    this.CLIPPATH = this.createSVGDOMFunc("clipPath")
    this.COLOR_PROFILE = this.createSVGDOMFunc("color-profile")
    this.CURSOR = this.createSVGDOMFunc("cursor")
    this.DEFINITION_SRC = this.createSVGDOMFunc("definition-src")
    this.DEFS = this.createSVGDOMFunc("defs")
    this.DESC = this.createSVGDOMFunc("desc")
    this.ELLIPSE = this.createSVGDOMFunc("ellipse")
    this.FEBLEND = this.createSVGDOMFunc("feBlend")
    this.FECOLORMATRIX = this.createSVGDOMFunc("feColorMatrix")
    this.FECOMPONENTTRANSFER = this.createSVGDOMFunc("feComponentTransfer")
    this.FECOMPOSITE = this.createSVGDOMFunc("feComposite")
    this.FECONVOLVEMATRIX = this.createSVGDOMFunc("feConvolveMatrix")
    this.FEDIFFUSELIGHTING = this.createSVGDOMFunc("feDiffuseLighting")
    this.FEDISPLACEMENTMAP = this.createSVGDOMFunc("feDisplacementMap")
    this.FEDISTANTLIGHT = this.createSVGDOMFunc("feDistantLight")
    this.FEFLOOD = this.createSVGDOMFunc("feFlood")
    this.FEFUNCA = this.createSVGDOMFunc("feFuncA")
    this.FEFUNCB = this.createSVGDOMFunc("feFuncB")
    this.FEFUNCG = this.createSVGDOMFunc("feFuncG")
    this.FEFUNCR = this.createSVGDOMFunc("feFuncR")
    this.FEGAUSSIANBLUR = this.createSVGDOMFunc("feGaussianBlur")
    this.FEIMAGE = this.createSVGDOMFunc("feImage")
    this.FEMERGE = this.createSVGDOMFunc("feMerge")
    this.FEMERGENODE = this.createSVGDOMFunc("feMergeNode")
    this.FEMORPHOLOGY = this.createSVGDOMFunc("feMorphology")
    this.FEOFFSET = this.createSVGDOMFunc("feOffset")
    this.FEPOINTLIGHT = this.createSVGDOMFunc("fePointLight")
    this.FESPECULARLIGHTING = this.createSVGDOMFunc("feSpecularLighting")
    this.FESPOTLIGHT = this.createSVGDOMFunc("feSpotLight")
    this.FETILE = this.createSVGDOMFunc("feTile")
    this.FETURBULENCE = this.createSVGDOMFunc("feTurbulence")
    this.FILTER = this.createSVGDOMFunc("filter")
    this.FONT = this.createSVGDOMFunc("font")
    this.FONT_FACE = this.createSVGDOMFunc("font-face")
    this.FONT_FACE_FORMAT = this.createSVGDOMFunc("font-face-format")
    this.FONT_FACE_NAME = this.createSVGDOMFunc("font-face-name")
    this.FONT_FACE_SRC = this.createSVGDOMFunc("font-face-src")
    this.FONT_FACE_URI = this.createSVGDOMFunc("font-face-uri")
    this.FOREIGNOBJECT = this.createSVGDOMFunc("foreignObject")
    this.G = this.createSVGDOMFunc("g")
    this.GLYPH = this.createSVGDOMFunc("glyph")
    this.GLYPHREF = this.createSVGDOMFunc("glyphRef")
    this.HKERN = this.createSVGDOMFunc("hkern")
    this.IMAGE = this.createSVGDOMFunc("image")
    this.LINE = this.createSVGDOMFunc("line")
    this.LINEARGRADIENT = this.createSVGDOMFunc("linearGradient")
    this.MARKER = this.createSVGDOMFunc("marker")
    this.MASK = this.createSVGDOMFunc("mask")
    this.METADATA = this.createSVGDOMFunc("metadata")
    this.MISSING_GLYPH = this.createSVGDOMFunc("missing-glyph")
    this.MPATH = this.createSVGDOMFunc("mpath")
    this.PATH = this.createSVGDOMFunc("path")
    this.PATTERN = this.createSVGDOMFunc("pattern")
    this.POLYGON = this.createSVGDOMFunc("polygon")
    this.POLYLINE = this.createSVGDOMFunc("polyline")
    this.RADIALGRADIENT = this.createSVGDOMFunc("radialGradient")
    this.RECT = this.createSVGDOMFunc("rect")
    this.SCRIPT = this.createSVGDOMFunc("script")
    this.SET = this.createSVGDOMFunc("set")
    this.STOP = this.createSVGDOMFunc("stop")
    this.STYLE = this.createSVGDOMFunc("style")
    this.SVG = this.createSVGDOMFunc("svg")
    this.SWITCH = this.createSVGDOMFunc("switch")
    this.SYMBOL = this.createSVGDOMFunc("symbol")
    this.TEXT = this.createSVGDOMFunc("text")
    this.TEXTPATH = this.createSVGDOMFunc("textPath")
    this.TITLE = this.createSVGDOMFunc("title")
    this.TREF = this.createSVGDOMFunc("tref")
    this.TSPAN = this.createSVGDOMFunc("tspan")
    this.USE = this.createSVGDOMFunc("use")
    this.VIEW = this.createSVGDOMFunc("view")
    this.VKERN = this.createSVGDOMFunc("vkern")
}

MochiKit.Base._exportSymbols(this, SVGKit);

//var SVG = SVGKit;
