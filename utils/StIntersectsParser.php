<?php

/**
* Parses data for st_intersects == t; because significant faster 
* (~500-700ms/80-100ms) than where st_intersects sql clause.
* Also calculates the differnce between reconstructed data value and climate
* station value
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\utils;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\models\Ghcnm;

class StIntersectsParser {
         
    public static function intersectingGhcnm($ghcnmDataRaw){
        $meanGhcnmOff = array();
        $ghcnmData = array();
        if($ghcnmDataRaw){
            foreach ($ghcnmDataRaw as $row) {
                if($row['st_intersects'] == 't' && $row['temp_recon'] != ""){
                    $diff = $row['temp_recon'] - $row['temperature'];
                    array_push($meanGhcnmOff, $diff);
                    array_push($ghcnmData, $row);
                }
            }

            // calc mean offset of reconstructed temp to station data
            if(count($meanGhcnmOff) > 0){
                $meanGhcnmOff = array_sum($meanGhcnmOff) / count($meanGhcnmOff);
            } 
        }
        return compact('ghcnmData', 'meanGhcnmOff');
    }
}
?>