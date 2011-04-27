#!/usr/bin/python

"""
convertsvg.py  0.1

See <http://svgkit.sourceforge.net/> for documentation, downloads, license, etc.

(c) 2006-2007 Jason Gallicchio.
Licensed under the open source (GNU compatible) MIT License
"""

# Outline of code:
# Read the SVG
# Read the type to convert to
# Read the options (width, height, dpi, quality)  (TODO)
# Generate a hash for caching and check to see if we've already done this (TODO)
# Convert with scripts off
# Check the output file size.
# Send the result back

import cgi
import cgitb; cgitb.enable() # Show errors to browser.
import sys
import os
import time
import md5
sys.stderr = sys.stdout
cgi.maxlen = 1024*1024


# Shared programs
pdf2ps = '/usr/bin/pdf2ps'

# Local programs
local_dir ='/home/project-web/svgkit/local'
lib_dir   = os.path.join(local_dir, 'lib')
bin_dir   = os.path.join(local_dir, 'bin')
src_dir   = os.path.join(local_dir, 'src')
pstoedit  = os.path.join(bin_dir, 'pstoedit')
texvc     = os.path.join(src_dir, 'texvc')

java  = os.path.join(src_dir, 'jre1.6.0_12/bin/java')
batik = os.path.join(src_dir, 'batik-1.7/batik-rasterizer.jar')
results_dir = '/home/project-web/svgkit/persistent/svgresults/'
results_url = '../svgresults/'

os.environ['PATH'] += os.pathsep+bin_dir
os.environ['LD_LIBRARY_PATH'] = os.pathsep+lib_dir


mediatypes={
  'pdf':  'application/pdf',
  'ps':   'application/pdf',  # Gets converted after
  'jpg':  'image/jpeg',
  'png':  'image/png',
  'tiff': 'image/tiff',
  'svg':  'image/svg+xml'
}

debug = False
redirect = True

if debug:
    print 'Content-type: text/plain\n\n'
    print 'Debugging convert_svg.py'

def execute_cmd(cmd):
    (child_stdin, child_stdout, child_stderr) = os.popen3(cmd)
    str_stdout = child_stdout.read() # Read until the process quits.
    str_stderr = child_stderr.read() # Read until the process quits.
    if debug:
        print cmd+'\n'
        print 'stdout:'+str_stdout+'\n'
        print 'stderr:'+str_stderr+'\n'
        
#execute_cmd('chown jason users files/*.*')  # Redhat disables chown
        
form = cgi.FieldStorage()
time.sleep(0.1) # Throttle requests
if debug:
    print 'Debug mode of convert_svg.py\n'
    execute_cmd('which java')
    #execute_cmd('locate javac')
    #execute_cmd('locate java')
    #execute_cmd('ls /usr/bin/')
    #execute_cmd('ls /etc/alternatives/')
    execute_cmd('df')
    execute_cmd('mount')
    print 'form.keys(): ' + form.keys().__str__()+'\n'
    for key in form.keys():
        print 'form['+key+'] = '+form[key].value+'\n'
source = form['source'].value
type = form['type'].value
mime = mediatypes[type]

md5hex = md5.new(source).hexdigest()
svgname = results_dir+md5hex+'.svg'
outname = results_dir+md5hex+'.'+type
out_url = results_url+md5hex+'.'+type

# If the result doesn't already exist in cached form, create it
if not os.path.isfile(outname) or source!=open(svgname, 'r' ).read():
    svgfile = open(svgname, 'w')
    svgfile.write(source)
    svgfile.close()
    if type == 'svg':
        outname = svgname
    else:
        cmd = java+' -jar ' + batik + ' -d ' + results_dir + ' -m '+mime+' '+svgname # -dpi <resolution>  -q <quality>
        execute_cmd(cmd)
        
        if type=='ps':
            inname = results_dir+md5hex+'.pdf'
            cmd = pdf2ps+' '+inname+' '+outname
            execute_cmd(cmd)

if redirect:
    print 'Location: '+out_url+'\r\n\r\n'
else:
    outfile = open( outname, 'rb')
    image = outfile.read()
    if not debug:
        sys.stdout.write('Content-type: '+mime+'\r\n\r\n')
        sys.stdout.write(image)
    outfile.close()
