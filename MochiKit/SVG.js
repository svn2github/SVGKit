/***

MochiKit.SVG 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.
(c) 2006 Jason Gallicchio.  All rights Reserved.

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
    MochiKit.SVG = {};
}

MochiKit.SVG.NAME = "MochiKit.SVG";
MochiKit.SVG.VERSION = "1.2";
MochiKit.SVG.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.SVG.toString = function () {
    return this.__repr__();
};

// The following has been converted by Zeba Wunderlich's Perl Script
// from http://www.w3.org/TR/SVG/eltindex.html

MochiKit.SVG.EXPORT = [
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
];

MochiKit.SVG.EXPORT_OK = [
];

MochiKit.SVG.appendNode = function (node) {
    appendChildNodes(MochiKit.SVG._svgElement, node);
}

MochiKit.SVG.createDOM = function (name, attrs/*, nodes... */) {
    /*
        Like MochiKit.SVG.createDOM, but with the SVG namespace.
    */

    var elem;
    var self = MochiKit.SVG;
    var dom = MochiKit.DOM;
    if (typeof(name) == 'string') {
        elem = self._svgDocument.createElementNS("http://www.w3.org/2000/svg", name);
    } else {
        elem = name;
    }
    if (attrs) {
        dom.updateNodeAttributes(elem, attrs);
    }
    if (arguments.length <= 2) {
        return elem;
    } else {
        var args = MochiKit.Base.extend([elem], arguments, 2);
        return dom.appendChildNodes.apply(this, args);
    }
};

MochiKit.SVG.createDOMFunc = function (/* tag, attrs, *nodes */) {
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
        m.extend([MochiKit.SVG.createDOM], arguments)
    );
};

/* The problem is that each time the object or embed is shown (first time
   or after being hidden) there is a delay before the SVG content is
   accessible.
*/



MochiKit.SVG.grabSVG = function (htmlElement) {
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
    var svgDocument = null;
    if (typeof(node) == 'string') {
        htmlElement = document.getElementById(htmlElement);
    }
    tagName = htmlElement.tagName.toLowerCase();
    if (tagName == 'svg')  // Inline
        svgDocument = null;
    else if (tagName == 'embed' && htmlElement.getSVGDocument)
        svgDocument = htmlElement.getSVGDocument();
    else if (tagName == 'object' && htmlElement.contentDocument)
        svgDocument = htmlElement.contentDocument
    return svgDocument
}


MochiKit.SVG.setCurrentSVG = function (svgDocument) {
    /***
        Given an SVGDocument, set the current SVGDocument and SVGSVGElement
        If you pass in a string, grabSVG will get called to get the svgDocument.
        
        @param svgDocument: either an id string or a SVGDocument object
    ***/
    var self = MochiKit.SVG;
    var document = svgDocument;
    if (typeof(svgDocument) == 'string') {
        document = self.grabSVG(svgDocument);
    }
    self._svgDocument = document;
    self._svgElement = document.rootElement;   // The W3C way of doing it.  Other way is document.documentElement
}


MochiKit.SVG._svgMIME = 'image/svg+xml';
MochiKit.SVG._svgEmptyName = 'empty.svg';
MochiKit.SVG._svgEmptyBase = '';
MochiKit.SVG._errorText = "You can't display SVG. Download Firefox." 

MochiKit.SVG.getBaseURI = function() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (!src) {
            continue;
        }
        if (src.match(/MochiKit.js$/)) {  // Confused why putting "SVG.js" doesn't work, but it gets called right after the browser read the script tag for MochiKit even here.
            MochiKit.SVG._svgEmptyBase = src.substring(0, src.lastIndexOf('MochiKit.js'));
        }
    }
};
MochiKit.SVG.getBaseURI();

MochiKit.SVG.createSVG = function (type, width /*=100*/, height /*=100*/, id /* optional */) {
    /***

        Create a new HTML DOM element of specified type ('object', 'embed', or 'svg')
        and set the attributes appropriately.

        @param type: The tag that we will create

        @param width: default 100

        @param height: default 100
        
        @param id: Optionally assign the HTML element an id.

        @rtype: DOMElement

    ***/
    var self = MochiKit.SVG;
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
    
    //var svgDocument = null;
    //var svgElement = null;
    
    if (type=='inline') {
        attrs['xmlns:svg'] = 'http://www.w3.org/2000/svg';
        attrs['xmlns'] = 'http://www.w3.org/2000/svg';
        var svgElement = self.SVG(attrs);
        return svgElement;
    }
    else if (type=='object') {
        attrs['data'] = self._svgEmptyBase + self._svgEmptyName;
        attrs['type'] = self._svgMIME;
        var htmlElement = createDOM('object', attrs, self._errorText);
        //svgDocument = htmlElement.contentDocument;
    }
    else if (type=='embed') {
        attrs['src'] = self._svgEmptyBase + self._svgEmptyName;
        attrs['type'] = self._svgMIME;
        attrs['pluginspage'] = 'http://www.adobe.com/svg/viewer/install/';
        var htmlElement = createDOM('embed', attrs );
        //svgDocument = htmlElement.getSVGDocument();
    }
    else {
        return null;
    }
    
    //svgElement = svgDocument.rootElement;
    //setNodeAttribute(svgElement, 'width', width);
    //setNodeAttribute(svgElement, 'height', height);
    
    return htmlElement;
}
 
MochiKit.SVG.currentSVGDocument = function () {
    return MochiKit.DOM._svgDocument;
};

MochiKit.SVG.currentSVGElement = function () {
    return MochiKit.DOM._svgElement;
};

MochiKit.SVG.suspendRedraw = function (miliseconds /* = 1000 */) {
    var self = MochiKit.SVG;
    if (typeof(miliseconds) == "undefined" || miliseconds == null) {
        ms = 1000;
    }
    self._redrawId = self._svgElement.suspendRedraw(miliseconds);
}

MochiKit.SVG.unsuspendRedraw = function () {
    if (self._redrawId != null) {
        self._svgElement.unsuspendRedraw(self._redrawId);
        self._redrawId = null;
    }
}

MochiKit.SVG.__new__ = function (win) {

    var m = MochiKit.Base;
    // The following are described at http://www.w3.org/TR/SVG/struct.html
    this._svgDocument = null;  // When an 'svg' element is embedded inline this will not exist
    this._svgElement = null;   // corresponds to the 'svg' element
    this._redrawId = null;

    //this.domConverters = new m.AdapterRegistry(); 

    var createDOMFunc = this.createDOMFunc;
    //this.A = createDOMFunc("a")
    this.ALTGLYPH = createDOMFunc("altGlyph")
    this.ALTGLYPHDEF = createDOMFunc("altGlyphDef")
    this.ALTGLYPHITEM = createDOMFunc("altGlyphItem")
    this.ANIMATE = createDOMFunc("animate")
    this.ANIMATECOLOR = createDOMFunc("animateColor")
    this.ANIMATEMOTION = createDOMFunc("animateMotion")
    this.ANIMATETRANSFORM = createDOMFunc("animateTransform")
    this.CIRCLE = createDOMFunc("circle")
    this.CLIPPATH = createDOMFunc("clipPath")
    this.COLOR_PROFILE = createDOMFunc("color-profile")
    this.CURSOR = createDOMFunc("cursor")
    this.DEFINITION_SRC = createDOMFunc("definition-src")
    this.DEFS = createDOMFunc("defs")
    this.DESC = createDOMFunc("desc")
    this.ELLIPSE = createDOMFunc("ellipse")
    this.FEBLEND = createDOMFunc("feBlend")
    this.FECOLORMATRIX = createDOMFunc("feColorMatrix")
    this.FECOMPONENTTRANSFER = createDOMFunc("feComponentTransfer")
    this.FECOMPOSITE = createDOMFunc("feComposite")
    this.FECONVOLVEMATRIX = createDOMFunc("feConvolveMatrix")
    this.FEDIFFUSELIGHTING = createDOMFunc("feDiffuseLighting")
    this.FEDISPLACEMENTMAP = createDOMFunc("feDisplacementMap")
    this.FEDISTANTLIGHT = createDOMFunc("feDistantLight")
    this.FEFLOOD = createDOMFunc("feFlood")
    this.FEFUNCA = createDOMFunc("feFuncA")
    this.FEFUNCB = createDOMFunc("feFuncB")
    this.FEFUNCG = createDOMFunc("feFuncG")
    this.FEFUNCR = createDOMFunc("feFuncR")
    this.FEGAUSSIANBLUR = createDOMFunc("feGaussianBlur")
    this.FEIMAGE = createDOMFunc("feImage")
    this.FEMERGE = createDOMFunc("feMerge")
    this.FEMERGENODE = createDOMFunc("feMergeNode")
    this.FEMORPHOLOGY = createDOMFunc("feMorphology")
    this.FEOFFSET = createDOMFunc("feOffset")
    this.FEPOINTLIGHT = createDOMFunc("fePointLight")
    this.FESPECULARLIGHTING = createDOMFunc("feSpecularLighting")
    this.FESPOTLIGHT = createDOMFunc("feSpotLight")
    this.FETILE = createDOMFunc("feTile")
    this.FETURBULENCE = createDOMFunc("feTurbulence")
    this.FILTER = createDOMFunc("filter")
    this.FONT = createDOMFunc("font")
    this.FONT_FACE = createDOMFunc("font-face")
    this.FONT_FACE_FORMAT = createDOMFunc("font-face-format")
    this.FONT_FACE_NAME = createDOMFunc("font-face-name")
    this.FONT_FACE_SRC = createDOMFunc("font-face-src")
    this.FONT_FACE_URI = createDOMFunc("font-face-uri")
    this.FOREIGNOBJECT = createDOMFunc("foreignObject")
    this.G = createDOMFunc("g")
    this.GLYPH = createDOMFunc("glyph")
    this.GLYPHREF = createDOMFunc("glyphRef")
    this.HKERN = createDOMFunc("hkern")
    this.IMAGE = createDOMFunc("image")
    this.LINE = createDOMFunc("line")
    this.LINEARGRADIENT = createDOMFunc("linearGradient")
    this.MARKER = createDOMFunc("marker")
    this.MASK = createDOMFunc("mask")
    this.METADATA = createDOMFunc("metadata")
    this.MISSING_GLYPH = createDOMFunc("missing-glyph")
    this.MPATH = createDOMFunc("mpath")
    this.PATH = createDOMFunc("path")
    this.PATTERN = createDOMFunc("pattern")
    this.POLYGON = createDOMFunc("polygon")
    this.POLYLINE = createDOMFunc("polyline")
    this.RADIALGRADIENT = createDOMFunc("radialGradient")
    this.RECT = createDOMFunc("rect")
    this.SCRIPT = createDOMFunc("script")
    this.SET = createDOMFunc("set")
    this.STOP = createDOMFunc("stop")
    this.STYLE = createDOMFunc("style")
    this.SVG = createDOMFunc("svg")
    this.SWITCH = createDOMFunc("switch")
    this.SYMBOL = createDOMFunc("symbol")
    this.TEXT = createDOMFunc("text")
    this.TEXTPATH = createDOMFunc("textPath")
    this.TITLE = createDOMFunc("title")
    this.TREF = createDOMFunc("tref")
    this.TSPAN = createDOMFunc("tspan")
    this.USE = createDOMFunc("use")
    this.VIEW = createDOMFunc("view")
    this.VKERN = createDOMFunc("vkern")


    //this.hideElement = m.partial(this.setDisplayForElement, "none");
    //this.showElement = m.partial(this.setDisplayForElement, "block");
    //this.removeElement = this.swapDOM;

    //this.$ = this.getElement;

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);

};

MochiKit.SVG.__new__(this);

MochiKit.Base._exportSymbols(this, MochiKit.SVG);
