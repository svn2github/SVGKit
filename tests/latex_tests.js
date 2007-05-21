var topleft = function(s, elem) {
    //log(s.toXML(elem))
    s.append(elem)
    var bbox = elem.getBBox()
    log('before:', '"', getNodeAttribute(elem, 'transform'), '"', bbox.x, bbox.y, bbox.width, bbox.height)
    setNodeAttribute(elem, 'transform', 'scale(0.2)scale(1,-1)translate('+(-bbox.x)+','+(-bbox.y-bbox.height)+')')
}

var testFunctions = {
    
    'simple' : function(svg) {
        var s = 'x + 7'
        var sucess = partial(topleft, svg)
        SVGLaTeX.doit(s, sucess)
    },
    
    'sum' : function(svg) {
        var s = '\\sum _{n=1}^{\\infty } \\frac{1}{n^2}=\\frac{\\pi ^2}{6}'
        var sucess = partial(topleft, svg)
        SVGLaTeX.doit(s, sucess)
    }
};
