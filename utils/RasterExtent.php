<?php

/**
* Calculates raster bounding box coordinates
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\utils;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\models\Raster;

class RasterExtent {

    /**
    * calculate raster bounding box coordinates
    * 
    * @param mixed $query
    */
    public static function getRasterExtent($query) {
        
        $xmin = $query['upperleftx'];
        $ymax = $query['upperlefty'];
        $xmax = $xmin + ($query['width'] * $query['scalex']); 
        $ymin = $ymax + ($query['height'] * $query['scaley']);

        $rasterExtent = array('ymax' => floatval($ymax),
            'xmax' => $xmax,
            'ymin' => $ymin,
            'xmin' => floatval($xmin));

        return $rasterExtent; 
    }
}
?>