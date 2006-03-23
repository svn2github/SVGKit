/***

MochiKit.SVG 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.
(c) 2006 Jason Gallicchio.  All rights Reserved.

    http://www.sitepoint.com/article/oriented-programming-2
    http://www.sitepoint.com/article/javascript-objects
    
    At some point I'd like to auto-detect if user has SVG and if it's Adobe or W3C:
        http://blog.codedread.com/archives/2005/06/21/detecting-svg-viewer-capabilities/
        http://blog.codedread.com/archives/2006/01/13/inlaying-svg-with-html/
        http://www.adobe.com/svg/workflow/autoinstall.html
    Also, transmogrify <object> tags into <embed> tags automatically,
    perhaps using <!–[if IE]> and before the content loads.
    
    Problem of divs loading and unloading, especially with multiple writeln() in the interpreter.
    Perhaps on unload, save xml and then restore on a load.
    Can't draw anything until it's loaded.  Really annoying in the interpreter.
    
    Browser SVG:
     * Should always provide fallback content -- png, pdf, (shudder) swf
     * Interactivity requires SVG, but initial static content should have static fallback
     * Best effort to have it work on Firefox, Opera, Safari, IE+ASV, Batik
     * Text sucks -- different settings/browsers render it in vastly differens sizes.
***/

if (typeof(dojo) != 'undefined') {
    dojo.provide("MochiKit.SVG");
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
    throw "MochiKit.SVG depends on MochiKit.DOM!";
}

if (typeof(MochiKit.SVG) == 'undefined') {
    // Constructor
    MochiKit.SVG = function(widthOrIdOrNode, height, id, type) {
        if (typeof(this.__init__)=='undefined' || this.__init__ == null){
            log("You called SVG() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new MochiKit.SVG(widthOrIdOrNode, height, id, type);
        }
        this.__init__(widthOrIdOrNode, height, id, type);
        return null
    };
}

MochiKit.SVG.NAME = "MochiKit.SVG";
MochiKit.SVG.VERSION = "1.2";
MochiKit.SVG.__repr__ = function () {
    return "[" + MochiKit.SVG.NAME + " " + MochiKit.SVG.VERSION + "]";
};
MochiKit.SVG.prototype.__repr__ = MochiKit.SVG.__repr__;

MochiKit.SVG.toString = function () {
    return this.__repr__();
};
MochiKit.SVG.prototype.toString = MochiKit.SVG.toString;

// The following has been converted by Zeba Wunderlich's Perl Script
// from http://www.w3.org/TR/SVG/eltindex.html

MochiKit.SVG.EXPORT = [
/*
    "setCurrentSVG",
    "currentSVGDocument",
    "currentSVGElement",
    "appendNode",
    "createSVG",
    "grabSVG",
    //"A",
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

MochiKit.SVG.EXPORT_OK = [
];


MochiKit.SVG.prototype._svgMIME = 'image/svg+xml';
MochiKit.SVG.prototype._svgEmptyName = 'empty.svg';
MochiKit.SVG.prototype._mochiKitBaseURI = '';
MochiKit.SVG.prototype._errorText = "You can't display SVG. Download Firefox." ;

MochiKit.SVG.prototype.setBaseURI = function() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (!src) {
            continue;
        }
        if (src.match(/MochiKit\.js$/)) {  // Confused why putting "SVG.js" doesn't work, but it gets called right after the browser read the script tag for MochiKit even here.
            this._mochiKitBaseURI = src.substring(0, src.lastIndexOf('MochiKit.js'));
        }
    }
}

MochiKit.SVG.prototype.getDefs = function(createIfNeeded /* = false */) {
    var defs = this.svgDocument.getElementsByTagName('defs');
    if (defs.length>0)
        return defs[0];
    if (typeof(createIfNeeded) != 'undefined' && createIfNeeded!=null && !createIfNeeded) {
        return null;
    }
    defs = this.DEFS(null);
    log("Created defs", defs, "... going to append")
    this.append(defs);
    log("append worked")
    return defs;
}

MochiKit.SVG.prototype.__init__ = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/, type /*optional*/) {
    // The following are described at http://www.w3.org/TR/SVG/struct.html
    this.htmlElement = null;   // the <object> or <embed> html element the SVG lives in, otherwise null
    this.svgDocument = null;  // When an 'svg' element is embedded inline this will be document
    this.svgElement = null;   // corresponds to the 'svg' element
    this._redrawId = null;
    this.newSVGType = 'object'; // Determine a good default dynamically (inline svg, object, or embed)
    
    log("SVG.__init__ widthOrIdOrNode = ", widthOrIdOrNode);
    this.setBaseURI();
    if (typeof(widthOrIdOrNode) == 'object' || typeof(widthOrIdOrNode) == 'string') {  // Not <object> but a JS object
        this.grabSVG(widthOrIdOrNode);
    }
    else {
        this.createSVG(widthOrIdOrNode, height, id, type)
    }
    // Note that this.svgDocument and this.svgElement may not be set at this point.  Must wait for onload callback.

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
};

MochiKit.SVG.prototype.whenReady = function (func) {
    if (this.svgElement != null && this.svgDocument != null) {
        func();
    }
    else if (this.htmlElement != null) {
        //log("adding to onload event for htmlElement=", this.htmlElement, " the function", func);
        addToCallStack(this.htmlElement, 'onload', func);
    }
}

MochiKit.SVG.prototype.setSize = function(width, height) {
    setNodeAttribute(this.svgElement, 'width', width);
    setNodeAttribute(this.svgElement, 'height', height);
    if (this.htmlElement != null && this.htmlElement != this.svgElement) {
        // For inline images, this was just accomplished above.
        setNodeAttribute(this.htmlElement, 'width', width);
        setNodeAttribute(this.htmlElement, 'height', height);
    }
}

MochiKit.SVG.prototype.createSVG = function (width /*=100*/, height /*=100*/, id /* optional */) {
    /***

        Create a new HTML DOM element of specified type ('object', 'embed', or 'svg')
        and set the attributes appropriately.  You'd never call this for JavaScript
        code within the SVG.

        @param type: The tag that we will create

        @param width: default 100

        @param height: default 100
        
        @param id: Optionally assign the HTML element an id.

        @rtype: DOMElement

    ***/
    var dom = MochiKit.DOM;
    
    if (typeof(width) == "undefined" || width == null) {
        width = 100;
    }
    if (typeof(height) == "undefined" || height == null) {
        height = 100;
    }
    if (typeof(id) == "undefined" || id == null) {
        id = null;
    }
    
    var attrs = {'width':width, 'height':height};
    if (id != null) {
        attrs['id'] = id;
    }
    
    attrs['width'] = width;
    attrs['height'] = height;
    
    var finishSettingProps = function (svg) {
        svg.svgElement = svg.svgDocument.rootElement;
        svg.setSize(width, height);
    }
    
    if (this.newSVGType=='inline') {
        /*  Make sure html tag has SVG namespace support?
                <html xmlns="http://www.w3.org/1999/xhtml"
                  xmlns:svg="http://www.w3.org/2000/svg"
                  xml:lang="en">
        */
        attrs['xmlns:svg'] = 'http://www.w3.org/2000/svg';  // for <svg:circle ...> tags
        attrs['xmlns'] = 'http://www.w3.org/2000/svg';      // for <circle> tags
        this.svgDocument = document;
        this.svgElement = this.createSVGDOM('svg', attrs);  // Create an element in the SVG namespace
        this.htmlElement = this.svgElement;   // When you move it around in HTML, you want to move the <svg> directly.
    }
    else if (this.newSVGType=='object') {
        attrs['data'] = this._mochiKitBaseURI + this._svgEmptyName;
        attrs['type'] = this._svgMIME;
        this.htmlElement = createDOM('object', attrs, this._errorText);
        var svg = this;  // Define svg in context of function below.
        this.whenReady( function (event) {
            svg.svgDocument = svg.htmlElement.contentDocument;
            finishSettingProps(svg);
        } );
    }
    else if (this.newSVGType=='embed') {
        attrs['src'] = this._mochiKitBaseURI + this._svgEmptyName;
        attrs['type'] = this._svgMIME;
        attrs['pluginspage'] = 'http://www.adobe.com/svg/viewer/install/';
        this.htmlElement = createDOM('embed', attrs );
        var svg = this;
        this.whenReady( function (event) {
            svg.svgDocument = svg.htmlElement.getSVGDocument();
            finishSettingProps(svg);
        } );
    }
}

/* The problem is that each time the object or embed is shown (first time
   or after being hidden) there is a delay before the SVG content is
   accessible.
*/

MochiKit.SVG.prototype.grabSVG = function (htmlElement) {
    /***
        Given an HTML element (or it's id) that refers to an SVG, 
        get the SVGDocument object.
        If htmlElement is an 'object' use contentDocument.
        If htmlElement is an 'embed' use getSVGDocument().
        If htmlElement is an inline SVG, return something else.
        
        If is's an object or embed and it's not showing or
        the SVG file hasn't loaded, this won't work.
        
        @param htmlElement: either an id string or a dom element ('object', 'embed', 'svg)
    ***/
    log("grabSVG htmlElement = ", htmlElement);
    if (typeof(htmlElement) == 'string') {
        htmlElement = MochiKit.DOM.getElement(htmlElement);
    }
    this.htmlElement = htmlElement;
    log("embed  htmlElement = ", htmlElement);
    var tagName = htmlElement.tagName.toLowerCase();
    log("embed  tagName = ", tagName);
    log("embed  htmlElement.getSVGDocument = ", typeof(htmlElement.getSVGDocument));
    if (tagName == 'svg')  { // Inline
        this.svgDocument = document;
        this.svgElement = htmlElement;
    }
    else if (tagName == 'object' && htmlElement.contentDocument) {
        this.svgDocument = htmlElement.contentDocument;
        this.svgElement = this.svgDocument.rootElement;
    }
    else if (tagName == 'embed' && typeof(htmlElement.getSVGDocument) != 'unknown') {
        this.svgDocument = htmlElement.getSVGDocument();
        this.svgElement = this.svgDocument.rootElement;
        log("embed  this.svgDocument = ", this.svgDocument);
        log("embed  this.svgElement = ", this.svgElement);
    }
}

MochiKit.SVG.prototype.append = function (node) {
    /***
        Convenience method for appending to the root element
    ***/
    appendChildNodes(this.svgElement, node);
}

MochiKit.SVG.prototype.createUniqueID = function(base) {
    var i=0;
    var id;
    do {
        id = base + i;
        i++;
    } while ( this.svgDocument.getElementById(id) != null );
    return id;
}

MochiKit.SVG.prototype.createSVGDOM = function (name, attrs/*, nodes... */) {
    /*
        Like MochiKit.SVG.createDOM, but with the SVG namespace.
    */
    var elem;
    var dom = MochiKit.DOM;
    if (typeof(name) == 'string') {
        elem = this.svgDocument.createElementNS("http://www.w3.org/2000/svg", name);
    } else {
        elem = name;
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

MochiKit.SVG.prototype.createSVGDOMFunc = function (/* tag, attrs, *nodes */) {
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


MochiKit.SVG.prototype.toXML = function (decorate /* = false */) {
    // This doesn't work cux toHTML converts everything to lower case.
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

MochiKit.SVG.prototype.suspendRedraw = function (miliseconds /* = 1000 */) {
    if (typeof(miliseconds) == "undefined" || miliseconds == null) {
        ms = 1000;
    }
    this._redrawId = this.svgElement.suspendRedraw(miliseconds);
}

MochiKit.SVG.prototype.unsuspendRedraw = function () {
    if (this._redrawId != null) {
        this.svgElement.unsuspendRedraw(this._redrawId);
        this._redrawId = null;
    }
}

MochiKit.SVG.prototype.deleteContent = function() {
    /***
        Deletes all graphics content, but leaves definitions
    ***/
}

MochiKit.SVG.prototype.deleteEverything = function() {
    /***
        Deletes everything including definitions
    ***/
}

MochiKit.SVG.prototype.test = function() {
    var circ = this.CIRCLE({'cx':30,'cy':30,'r':10});
    this.append(circ);
}

MochiKit.SVG.__new__ = function () {
    var m = MochiKit.Base;
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };
    m.nameFunctions(this);
}
MochiKit.SVG.__new__(this);

MochiKit.Base._exportSymbols(this, MochiKit.SVG);

var SVG = MochiKit.SVG;
