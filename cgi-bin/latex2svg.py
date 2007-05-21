#!/usr/bin/python2
#!/home/jason/local/bin/python

# Outline of code:
# Read the LaTeX Code
# Read the type of equation: inline, text, or stand alone equation
# Create a new .tex file containing the equation
# Verify the latex code using Texvc: http://en.wikipedia.org/wiki/Texvc
# Call latex
# Call dvips with a zoom factor
# Call pstoedit
# Edit the resulting SVG to unzoom,  recalculate bounding box, and include Texvc's output
# Send the result back

# TODO: bin_dir is bad -- everything should be gotten from the path or overriden
# TODO: Complicated examples like \begin{array} don't work: http://meta.wikimedia.org/wiki/Help:Formula
# TODO: Get latex -output-directory and -halt-on-error options to work.  New version?
# TODO: Redo zoom -- figure out the viewBox 8in thing and zoom/center appropriately.
# TODO: Get rid of zoom_ file.
# TODO: Delete the files when finished.
"""
=== Texvc Output format ===

Status codes and HTML/MathML transformations are returned on stdout.
A rasterized PNG file will be written to the output directory, named
for the MD5 hash code.

texvc output format is like this:
    +%5		ok, but not html or mathml
    c%5%h	ok, conservative html, no mathml
    m%5%h	ok, moderate html, no mathml
    l%5%h	ok, liberal html, no mathml
    C%5%h\0%m	ok, conservative html, with mathml
    M%5%h\0%m	ok, moderate html, with mathml
    L%5%h\0%m	ok, liberal html, with mathml
    X%5%m	ok, no html, with mathml
    S		syntax error
    E		lexing error
    F%s		unknown function %s
    -		other error

 \0 - null character
 %5 - md5, 32 hex characters
 %h - html code, without \0 characters
 %m - mathml code, without \0 characters

"""
import cgi
import cgitb; cgitb.enable() # Show errors to browser.
import sys
import os
import time
import md5
import re
sys.stderr = sys.stdout
cgi.maxlen = 10*1024

bin_dir = '/home/jason/local/bin/'
os.environ['PATH'] += os.pathsep+bin_dir

debug = False
redirect = True
verify_code = True  # Verifies the LaTeX code with Texvc for security

if debug:
    print 'Content-type: text/html\n\n'

# For some reason (apache?) this comes pre unquoted, which makes pluses 
# not work because even though they started as '%2B', now that they're '+' they are treated as ' '
# TODO: Spaces seem to get encoded as pluses, dammit.
#os.environ['QUERY_STRING'] = os.environ['QUERY_STRING'].replace('+', '%2B')
if os.environ.has_key('QUERY_STRING') and \
        os.environ.has_key('REQUEST_URI') and \
        len(os.environ['REQUEST_URI'].split('?')) >= 2: # Only for GET, not POST
    os.environ['QUERY_STRING'] = os.environ['REQUEST_URI'].split('?')[1]

form = cgi.FieldStorage(strict_parsing=True)
time.sleep(0.1) # Throttle requests
if debug:
    print 'Debug mode of ltaex2svg.py\n'
    form = cgi.FieldStorage()
    if not form:
        print "<h1>No Form Keys</h1>"
    else:
        print "<h2>Environ</h2><ul>"
        for key in os.environ.keys():
            value = os.environ[key]
            print "<li>", cgi.escape(key), ":", cgi.escape(value), '</li>'
        print '</ul>'
        print "<h2>Form Keys</h2><ul>"
        for key in form.keys():
            value = form[key].value
            print "<li>", cgi.escape(key), ":", cgi.escape(value), '</li>'
        print '</ul>'
    print '<pre>'
latex = form['latex'].value
#type = form['type'].value  # inline or whatever
#redirect = form['redirect'].value

md5hex = md5.new(latex).hexdigest()

base_dir = 'files/'

def extensionToFile(ext):
    #return os.path.join(base_dir, 'files/'+md5hex+'.'+ext)
    #return os.path.abspath(base_dir+md5hex+'.'+ext)
    return md5hex+'.'+ext

tex_name = extensionToFile("tex")
aux_name = extensionToFile("aux")
log_name = extensionToFile("log")
ps_name = extensionToFile("ps")
dvi_name = extensionToFile("dvi")
svg_name = extensionToFile("svg")
out_name = extensionToFile("out")
zoom_name = 'zoom_'+svg_name

def execute_cmd(cmd):
    (child_stdin, child_stdout, child_stderr) = os.popen3(cmd)
    str_stdout = child_stdout.read() # Read until the process quits.
    str_stderr = child_stderr.read() # Read until the process quits.
    if debug:
        print cmd+'\n'
        print 'stdout:'+str_stdout+'\n'
        print 'stderr:'+str_stderr+'\n'
    return str_stdout

header = """
\\nonstopmode
\\documentclass[12pt]{article}
\\pagestyle{empty}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage[latin1]{inputenc}
\\begin{document}
\\[
"""

footer = """
\\]
\\end{document}
"""

zoom = 10

# If the result doesn't already exist in cached form, create it
if True or not os.path.isfile(base_dir+svg_name):
    tex_file = open(base_dir+tex_name, 'w')
    tex_file.write(header)
    tex_file.write(latex)
    tex_file.write(footer)
    tex_file.close()
    
    def escapeshell(code):
        #return code.replace('"', '\\"')
        return code.replace('\n',' ').replace('\r',' ')  # This seems to do the right thing
     
    stdout = execute_cmd('cd '+base_dir+'; texvc . . "'+escapeshell(latex)+'" iso-8859-1')
    # First character must be an indication of success
    if verify_code and '+cmlCMLX'.find(stdout[0]) == -1:
        print 'Content-type: text/plain\n\n'
        print 'Error parsing TeX'
        print stdout
        sys.exit()
        
    #print ('latex -output-directory=' + base_dir + ' -halt-on-error ' + tex_name  + ' > ' + out_name)
    execute_cmd('cd '+base_dir+'; latex ' + tex_name  + ' > ' + out_name)
    execute_cmd('cd '+base_dir+'; dvips -q -f -e 0 -E -D 10000 -x ' + str(1000*zoom) +' -o '+ps_name +' '+dvi_name)
    #execute_cmd('pstoedit -f plot-svg -dt -ssp '+ps_name+' '+svg_name)
    execute_cmd('cd '+base_dir+'; pstoedit -f plot-svg -dt -ssp ' + ps_name + ' ' + svg_name + '> ' + out_name)

    svg_file = open(base_dir+svg_name)
    zoom_file = open(base_dir+zoom_name, 'w')
    for line in svg_file:
        zoom_file.write( re.sub('translate\(.*\) scale\(1,-1\) scale\(0.0017361\)',  'scale(1,-1) scale('+str(0.0017361/zoom)+')',  line) )
    svg_file.close()
    zoom_file.close()

outname = base_dir+svg_name
outname = base_dir+zoom_name
mime = 'image/svg+xml'
    
if redirect:
    print 'Location: '+outname+'\r\n\r\n'
else:
    outfile = open( outname, 'rb')
    image = outfile.read()
    #image = image.replace('scale(0.0017361)', 'scale('+str(0.0017361/zoom)+')')
    #image = re.sub('translate\(.*\) scale\(1,-1\) scale\(0.0017361\)', 
    #                'scale(1,-1) scale('+str(0.0017361/zoom)+')', 
    #                image)

    if not debug:
        sys.stdout.write('Content-type: '+mime+'\r\n\r\n')
        sys.stdout.write(image)
    outfile.close()
