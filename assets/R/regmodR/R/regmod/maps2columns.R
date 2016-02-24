# TODO: rename later!
# source http://www.google.de/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CCkQFjAA&url=http%3A%2F%2Fwww.springer.com%2Fcda%2Fcontent%2Fdocument%2Fcda_downloaddocument%2F9780387981840-c1.pdf%3FSGWID%3D0-0-45-771012-p173897417&ei=pBmXU8jKLaiK7Ab0nIFw&usg=AFQjCNGKOvZ1wt_hnrNjGunnjysly7a5HQ&bvm=bv.68445247,d.ZGU
maps2columns <- function(maps){
  if (length(dim(maps)) != 3){
    stop('ERROR in maps2columns argument has wrong dimensions')
  }
  # aperm => Transpose an array by permuting its dimensions and optionally resizing it (by dim).
  # c(1,3,2) => transpose first by "time" than by column for line
  dimmaps <- dim(maps)
  incolumns <- aperm(maps, c(1,3,2))
  dim(incolumns) <- c(dimmaps[1], dimmaps[2] * dimmaps[3])
  
  return(incolumns)
}
