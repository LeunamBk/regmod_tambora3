import numpy as np

def sendDbQuery(conn, query):
     
    # Open a cursor to perform database operations
    cur = conn.cursor()

    # Query the database and obtain data as Python objects                     
    cur.execute(query)
   
    # commit transaction     
    try:
        conn.commit()
    except:
        print "Cant update table!"
    
    # Close communication with the database
    cur.close()
    
    
def getPgData(conn, query):
     
    # Open a cursor to perform database operations
    cur = conn.cursor()
    
    # Query the database and obtain data as Python objects                     
    cur.execute(query)

    #fetchone(), fetchmany(), fetchall().
    raw =  cur.fetchall()
    res = []
    for itm in raw:
        print itm[0]
        res.append(int(itm[0]))
            
    # Close communication with the database
    cur.close()
    
    return res    
      
def getPgRast(conn, query, meta = False, bboxExtent = False):
    # use it like "Select ST_DUMPVALUES(rast) From crumapsmean100 WHERE month = 1;"
  
    # Open a cursor to perform database operations
    cur = conn.cursor()
    
    # Query the database and obtain data as Python objects                     
    cur.execute(query)

    # handle calls for aditional metadata
    if meta:
        #fetchone(), fetchmany(), fetchall().
        raw =  cur.fetchall()[0]
        
        # get metadata
        metadata = raw[0:9]
        
        # get raster data
        raw = raw[10]
    else:
        #get raster data
        raw =  cur.fetchone()[0]
    
    # print returned datatype
    # print type(raw)

    def pgrastToNumpy(raw):
        # unescape bytea from postgres NOTICE: FORCE DB TO OUTPUT with escape
        # ALTER DATABASE postgres SET bytea_output = 'escape'; 
        # new format (since postgres 9.x is hex escaped which is diffrent to encode)
        
        raw = raw[6:-4]
        raw = raw.split('},{')
        res = []
        for rowRaw in raw:
            rowItmsRaw = rowRaw.split(',')
            rowItms = []
            for itm in rowItmsRaw:
                # check for Nan representation  -1.70000000e+308 == 9999
                if(itm == 'NULL' or float(itm) ==  -1.70000000e+308):
                    rowItms.append(np.nan)
                else:
                    rowItms.append(float(itm))
            res.append(rowItms)
        data = np.asarray(res)
        # flip array upside down
        return np.flipud(data)
        
        '''
        # something like this sould worke for St_AsBinary(rast) but I couldnt figure out the right datatype
        # no one from http://docs.scipy.org/doc/numpy/user/basics.types.html is working correctly...
        define raster dimensions
        w = int(137)
        h = int(117)
        img = []                           
        cdef np.ndarray[double] band =  np.frombuffer(raw, dtype='float16', count=w*h)
        img.append((np.reshape(band, ((h, w)))))        
        #print img[0]
        '''  
     
    # Close communication with the database
    cur.close()
   
    # return postgis raster as numpy array
    if meta:
        return [pgrastToNumpy(raw), metadata]
    else:
        return pgrastToNumpy(raw)

    
def geotiff2psql(conn, year, month, evIds, dbUser, dbName, dbPort, tempTiffFile):    
    ## write geotiff to postgres
    import os
     
    #os.system("/usr/bin/raster2pgsql -N 9999 -s 4326 -a " + str(tempTiffFile) + " regmod.temperature_monthly_recon_live | psql -d "+dbName+" -U "+dbUser+"")
    ''' UNCOMMENT ON TABORA SERVER !!!
    os.system("raster2pgsql -N 9999 -s 4326 -a " + str(tempTiffFile) + " regmod.temperature_monthly_recon_live | psql -d "+dbName+" -U "+dbUser+" -p "+dbPort)
    '''
    os.system("/usr/bin/raster2pgsql -N 9999 -s 4326 -a " + str(tempTiffFile) + " regmod.temperature_monthly_recon_live | psql -d "+dbName+" -U "+dbUser+"")

    # create hash from event ids to identify previous calculated fields ('simple approach may be inadequate')
    # eventHash = sum(evIds)+len(evIds)

    # update metadata
    query = "UPDATE regmod.temperature_monthly_recon_live SET year = " + str(year) + ", month = " + str(month) + ", event_id_array = '{" + evIds + "}' WHERE event_id_array IS NULL;"
    sendDbQuery(conn, query)
