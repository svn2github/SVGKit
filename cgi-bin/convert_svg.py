#!/usr/bin/python2
#!/home/jason/local/bin/python


# Outline of code:
# Read the SVG
# Read the type to convert to
# Read the options (width, height, dpi, quality)  (TODO)
# Generate a hash for caching and check to see if we've already done this (TODO)
# Convert with scripts off
# Check the output file size.
# Send the result back

import cgi
#import cgitb; cgitb.enable() # Show errors to browser.
import sys
import os
import time
import md5
sys.stderr = sys.stdout
cgi.maxlen = 1024*1024

java = '/home/jason/local/bin/java'
batik = '/scratch/jason/local/src/batik-1.6/batik-rasterizer.jar'

mediatypes={
  'pdf':'application/pdf',
  'ps':'application/postscript',
  'jpg':'image/jpeg',
  'png':'image/png',
  'svg':'image/svg+xml'
}

debug = False
redirect = True

if debug:
    print 'Content-type: text/plain\n\n'

form = cgi.FieldStorage()
time.sleep(0.1) # Throttle requests
if debug:
    print 'Debug mode of convert_svg.py\n'
    print 'form.keys(): ' + form.keys().__str__()+'\n'
    for key in form.keys():
        print 'form['+key+'] = '+form[key].value+'\n'
source = form['source'].value
type = form['type'].value
mime = mediatypes[type]

md5hex = md5.new(source).hexdigest()
svgname = 'files/'+md5hex+'.svg'
outname = 'files/'+md5hex+'.'+type

if not os.path.isfile(outname) or source!=open(svgname, 'r' ).read():
    svgfile = open(svgname, 'w')
    svgfile.write(source)
    svgfile.close()
    if type == 'svg':
        outname = svgfile
    else:
        cmd = java+' -jar ' + batik + ' -d files -m '+mime+' '+svgname
        (child_stdin, child_stdout, child_stderr) = os.popen3(cmd)
        str_stdout = child_stdout.read() # Read until the process quits.
        str_stderr = child_stderr.read() # Read until the process quits.
        if debug:
            print cmd+'\n'
            print 'stdout:'+str_stdout+'\n'
            print 'stderr:'+str_stderr+'\n'
if redirect:
    print 'Location: '+outname+'\r\n\r\n'
else:
    outfile = open( outname, 'rb')
    image = outfile.read()
    if not debug:
        sys.stdout.write('Content-type: '+mime+'\r\n\r\n')
        sys.stdout.write(image)
    outfile.close()
