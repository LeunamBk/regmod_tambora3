#!/bin/python
# -*- coding: utf-8 -*-
# validate user input

import sys
import json
import numpy as np
from utils import snapToGrid

def validateArgv(arg):
    
    def is_intstring(s):
        try:
            int(s)
            return True
        except ValueError:
            return False
    
    def is_floatstring(s):
        try:
            float(s)
            return True
        except ValueError:
            return False 
    
    def is_jsonstring(s):
        try:
            json.loads(s)
            return True
        except ValueError:
            return False
    
    if not is_intstring(arg) and not is_floatstring(arg) and not is_jsonstring(arg):
        sys.exit("Wrong argument datatype supplied. Exit.")
        
def readDataArgv():

    # validate input data
    validateArgv(sys.argv[2])
    validateArgv(sys.argv[7:][0])
    validateArgv(sys.argv[8])
    validateArgv(sys.argv[9])

    dbname = sys.argv[1]
    dbport = sys.argv[2]
    dbuser = sys.argv[3]
    dbpass = sys.argv[4]
    tiffpath = sys.argv[5]
    ncpath = sys.argv[6]
    year = sys.argv[8]
    month = sys.argv[9]

    if not year:
        year = 2015
    
    # read indexvalues and lat lon from input
    eventList =  json.loads(sys.argv[7:][0])
    indexvalues = []
    for event in eventList:
        indexvalues.append([snapToGrid(float(event['lat'])), snapToGrid(float(event['lon'])), int(event['index'])])
    
    indexvalues = np.matrix(indexvalues)
    n = indexvalues.shape[0]
    
    return indexvalues, n, year, month, dbname, dbport, dbuser, dbpass, tiffpath, ncpath