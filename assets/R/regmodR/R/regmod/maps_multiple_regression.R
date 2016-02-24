maps_multiple_regression <- function(prediktoren, prediktant){  
  
  prediktoren_incolumns <- array(0,c(dim(prediktoren)[3],dim(prediktoren)[1:2]))
  for(i in 1:dim(prediktoren)[3]){
    prediktoren_incolumns[i,,] <- prediktoren[,,i]
  }
  
  prediktoren_incolumns <- maps2columns(prediktoren_incolumns)
  
  # prepare linear regression
  X <-  cbind(matrix(1,ncol(prediktoren_incolumns),1),t(prediktoren_incolumns))
  Y <-  matrix(t(prediktant),nrow(prediktant) * ncol(prediktant),1)
  
  # execute linear regression
  fit <- lm(Y ~ X)
  
  # returns Na row for X1, only values for no na passed to variables
  coefficients <- matrix((coefficients(fit)[!is.na(coefficients(fit))]),,1)
  bint <- matrix(confint(fit, level=0.95)[!is.na(confint(fit, level=0.95))],ncol(X),2) # CIs for model parameters
  r <- '' 
  rint <- ''
  stats <-  summary(fit)$r.squared
  print(summary(fit))
  
  if(is.na(stats==1)) {
    print('na stats == 1')
    recunstructed <- prediktant
    recunstructed <- matrix(t(recunstructed), nrow(prediktant) * ncol(prediktant),1)
  } else {
    # calculates matrix product (dot product)
    recunstructed <- X %*% as.vector(coefficients)
  }

  # check if mlr effects calculated data if this passes, mlr and therefore pca has no effects on the model outcome!!!
  if(identical(matrix(recunstructed,81,161,byrow = T), prediktant)){
    print(paste('pca false', year, month))
  }
  if(matequal(matrix(recunstructed,81,161,byrow = T), prediktant)){
    print(paste('pca false mate', year, month))
  }
  
  return(list(recunstructed, coefficients))
  
}
