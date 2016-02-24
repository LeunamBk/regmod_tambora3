### get cru data from hdf5 file for according month
import h5py

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

def getCruData(NCFILE, month, dimLon, dimLat):
  from netCDF4 import MFDataset
  import numpy as np

  # account python 0 indexing
  month = month - 1

  # open netCDF file
  nc = MFDataset(NCFILE)

  # map lat lon data to file cru ncdf indexing schema
  lonStart = np.where(nc.variables['lon'][:] == dimLon[0])[0][0]
  lonEnd = np.where(nc.variables['lon'][:] == dimLon[1])[0][0]
  lonDim = (lonEnd - lonStart)

  latStart = np.where(nc.variables['lat'][:] == dimLat[0])[0][0]
  latEnd = np.where(nc.variables['lat'][:] == dimLat[1])[0][0]
  latDim = (latEnd - latStart)

  # get number of available years for every month
  yearsAvailable = len(nc.dimensions['time']) / 12

  # predefine month array like 100 81 161
  monthData = np.empty((yearsAvailable, latDim, lonDim))
  monthData[:] = np.nan

  for i in range(0, yearsAvailable):
    # read data from file for given month
    monthData[i,:,:] = nc.variables['tmp'][month,latStart:latEnd,lonStart:lonEnd]
    month = month + 12

  # set na value
  monthData[monthData > 100] = np.nan

  # get vector of lat lon data
  longitude = nc.variables['lon'][lonStart:lonEnd]
  latitude = nc.variables['lat'][latStart:latEnd]

  nc.close()

  return monthData, longitude, latitude