<?php
/**
* The regmod module is a system for the reconstruction
* and visualization of monthly aggregated areal temperature
* data from historical sources. 
* 
* The reconstruction and database integration of the calculated 
* data is done with R-Statistics and GDAL and is triggered regularly
* by the server. The data is held in an raster enabled PostgreSQL/PostGIS
* database in WKT format from which it is dynamically retrieved by the
* webapplication. By part selecting individual events in the 
* webapplication a Python-Script is triggered which recalculates the 
* requested data on the fly and sends it back to the application where
* it is visualized. The webapplications serves also several statistical
* elements about the underlying data and gives the user the opportunity
* to make spatial and temporal selections. By the incorporation of the
* GHCNMV3 adjusted monthly mean data set a direct validation of the 
* calculated data is also available in the webapplication.
*
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
*/

namespace app\modules\regmod;

class Module extends \yii\base\Module {
    public function init() {
        parent::init();
        // Further module configuration goes here...
    }
}