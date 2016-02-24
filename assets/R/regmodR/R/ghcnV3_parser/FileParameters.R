


FILE.PARAMETERS = list (InvWidths = c(11,9,10,7,31,5,1,5,2,2,2,2,1,2,16,1),                          
                       InvNames  = c("Id","Lat","Lon","Elevation","Name",
                                                   "GridEl","Rural","Population",
                                                   "Topography","Vegetation","Coastal",
                                                    "DistanceToCoast","Airport",
                                                    "DistanceToTown","NDVI","Light_Code"),
                  
                        DataWidths     =  c(11,4,4,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,
                                                  1,5,1,1,1,5,1,1,1, 5,1,1,1,5,1,1,1,5,
                                                  1,1,1,5,1,1,1,5,1,1,1,5,1,1,1),
                        
                        DataOnly     =  c(11,4,-4,5,-1,-1,-1,5,-1,-1,-1,5,-1,-1,-1,5,-1,-1,
                                          -1,5,-1,-1,-1,5,-1,-1,-1, 5,-1,-1,-1,5,-1,-1,-1,5,
                                          -1,-1,-1,5,-1,-1,-1,5,-1,-1,-1,5,-1,-1,-1),
                        
                        QcOnly       = c(11,4,-4,-5,1,1,1,-5,1,1,1,-5,1,1,1,-5,1,1,
                                                  1,-5,1,1,1,-5,1,1,1,-5,1,1,1,-5,1,1,1,-5,
                                                  1,1,1,-5,1,1,1,-5,1,1,1,-5,1,1,1),
                               
                        DataNames      =   c("Id","Year","Element",
                                                  "Jan","DMF1","QCF1","DSF1",
                                                  "Feb","DMF2","QCF2","DSF2",
				                                          "Mar","DMF3","QCF3","DSF3",
				                                          "Apr","DMF4","QCF4","DSF4",
				                                          "May","DMF5","QCF5","DSF5",
				                                          "Jun","DMF6","QCF6","DSF6",
				                                          "Jul","DMF7","QCF7","DSF7",
				                                          "Aug","DMF8","QCF8","DSF8",
				                                          "Sep","DMF9","QCF9","DSF9",
				                                          "Oct","DMF10","QCF10","DSF10",
				                                          "Nov","DMF11","QCF11","DSF11",
				                                          "Dec","DMF12","QCF12","DSF12"),
                         DataColumns    =   c("Id","Year",
                                                   "Jan","Feb","Mar","Apr","May",
                                                  "Jun","Jul","Aug","Sep","Oct",
                                                   "Nov","Dec"),
                         QCColumns      =   c("Id","Year",
                                               "DMF1","DMF2","DMF3","DMF4",
                                                "DMF5","DMF6","DMF7","DMF8",
                                                "DMF9","DMF10","DMF11","DMF12",
                                                "QCF1","QCF2","QCF3","QCF4",
                                                "QCF5","QCF6","QCF7","QCF8",
                                                 "QCF9","QCF10","QCF11","QCF12",
                                                 "DSF1","DSF2","DSF3","DSF4",
                                                "DSF5","DSF6","DSF7","DSF8",
                                                "DSF9","DSF10","DSF11","DSF12"),
                                              
                                              
                                              
                          DMFlags       =   c("Id","Year",
                                                    "DMF1","DMF2","DMF3","DMF4",
                                                    "DMF5","DMF6","DMF7","DMF8",
                                                    "DMF9","DMF10","DMF11","DMF12"),
                          QCFlags       =   c("Id","Year",
                                                    "QCF1","QCF2","QCF3","QCF4",
                                                    "QCF5","QCF6","QCF7","QCF8",
                                                    "QCF9","QCF10","QCF11","QCF12"),
                          DSFlags       =   c("Id","Year",
                                                    "DSF1","DSF2","DSF3","DSF4",
                                                    "DSF5","DSF6","DSF7","DSF8",
                                                    "DSF9","DSF10","DSF11","DSF12") 
                                
                                 
                                  )
	