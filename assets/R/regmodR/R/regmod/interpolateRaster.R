interpolateRaster <- function(raster, interpolsteps= 0.1){
 
   map.p <- rasterToPoints(raster)

   x <- map.p[,1]
   y <- map.p[,2]
   z <- map.p[,3]
   xx <- seq(min(x), max(x), interpolsteps)
   yy <- seq(min(y), max(y), interpolsteps)
   akima.li <- interp(x, y, z, xo=xx, yo=yy)
   akima.li.rast <- raster(akima.li)
                        
   # returns file path
   return(akima.li.rast) 
}

