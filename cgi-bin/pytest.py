#!/usr/bin/python

import cgi
import cgitb
cgitb.enable() # Show errors to browser. 
import sys 
import os 
import time 
import md5
sys.stderr = sys.stdout 
cgi.maxlen = 1024*1024 

debug = True

print 'Content-type: text/plain\n\n'

if debug:
    print 'Debug\n\n'


print 'Python was here 5'

print 'os.environ:', repr(os.environ).replace(',', ',\n')