### get cru data from hdf5 file for according month
import h5py
import json
import sys
"""
def getHdf5Data(hdf5PATH, month):
 
    # set path                
    hdf5 = hdf5PATH + str(month) + ".hdf5"

    # read file
    file = h5py.File(hdf5, 'r') 
    # select dataset
    dataset = file['cru_data']
    reqDataset  = dataset[()]
    file.close() 
    
    return reqDataset
"""

def getHdf5Data(hdf5PATH, month, datasets):
 
    # set path                
    hdf5 = hdf5PATH + str(month) + ".hdf5"

    # read file
    file = h5py.File(hdf5, 'r') 
    # select dataset
    cruData = {}
    for i, dataset in enumerate(datasets):
        cruData[i] = file[dataset][()]
    file.close() 
    
    return (cruData)  

def csvToHdf5(csvFile, hdf5File, datasetName):
    # modified from: http://stackoverflow.com/a/24448379    
    # translate csv to hdf5 for much better performance
    csvData = np.genfromtxt(csvFile, delimiter=',', skip_header = 1)
    h = h5py.File(hdf5File, 'w')
    dset = h.create_dataset(datasetName, data=csvData)
    # 
    #for i in range(1,13):
    #    pca_data = np.genfromtxt('/var/shiny-server/www/datacollectorv2/CRU_Data/mSelInCol_'+str(i)+'.csv', delimiter=',', skip_header = 1)
    #    h = h5py.File('/var/shiny-server/www/datacollectorv2/CRU_Data/mSelInCol_'+str(i)+'.hdf5', 'w')
    #    dset = h.create_dataset('cru_data', data=pca_data)
    #    print i

def snapToGrid(number): 
    coord = round(number * 4) / 4
    if coord%1 == 0 or coord%1 == 0.5:
        coord += 0.25        
    return coord

def getCruData(month, dimLon, dimLat, cruPath):
  
  from netCDF4 import MFDataset
  import numpy as np
  
  #dimLon = np.array((-30.25, 50.25))
  #dimLat = np.array((30.25, 70.25))

  # account python 0 indexing 
  month = int(month) - 1
  
  # open netCDF file
  nc = MFDataset(cruPath)
  
  # map lat lon data to file cru ncdf indexing schema
  lonStart = np.where(nc.variables['lon'][:] == snapToGrid(dimLon[0]))[0][0]+1
  lonEnd = np.where(nc.variables['lon'][:] == snapToGrid(dimLon[1]))[0][0]-1
  lonDim = lonEnd - lonStart

  latStart = np.where(nc.variables['lat'][:] == snapToGrid(dimLat[0]))[0][0]+1
  latEnd = np.where(nc.variables['lat'][:] == snapToGrid(dimLat[1]))[0][0]-1
  latDim = latEnd - latStart
     
  # get number of available years for every month
  yearsAvailable = len(nc.dimensions['time']) / 12
          
  # predefine month array like 100 81 161
  monthData = np.empty((yearsAvailable, latDim, lonDim))
  monthData[:] = np.nan

  for i in range(0, yearsAvailable):
    # read data from file for given month
    monthData[i,:,:] = nc.variables['tmp'][month,latStart:latEnd,lonStart:lonEnd]
    month = month + 12
    
  # to stay consitent with old array schema
  monthData = monthData.T
 
  # get vector of lat lon data
  longitude = nc.variables['lon'][lonStart:lonEnd] 
  latitude = nc.variables['lat'][latStart:latEnd] 
  
  nc.close()

  # set na values
  monthData[monthData > 100] = np.nan

  return monthData, longitude, latitude

def toDecimals(number, decimals = 1):
    #  float%.1f will be rounded when decimals were cut therefore we use string manipulation
    splitNumber = str(number).split(".")
    if len(splitNumber)>1:
        return splitNumber[0] + "." + splitNumber[1][:decimals]
    else:
        return str(number)

def getIdString():
    print sys.argv[6:][0]
    eventList =  json.loads(sys.argv[6:][0])
    idArray = []
    for event in eventList:
        # have to consider bigint is not sortable in postgres so we have to get rid of a fiew numbers
        # => cut second decimal and negate whole number if index is negative -> 3 saved
        negate = False
        if(float(event['index']) < 0):
            event['index'] = str(int(event['index']) *-1)
            negate = True
        id = toDecimals(event['lat']) + toDecimals(event['lon']) + str(event['index'])
        id = id.replace(".","")
        id = id.replace("-","9")
        if negate:
            id = str(int(id)*-1)
        idArray.append(id)
    return ','.join(idArray)

