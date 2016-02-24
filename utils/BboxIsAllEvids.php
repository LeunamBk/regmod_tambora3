<?php
/**
* Checks if all available events and events selected bay region bounding box
* are the same 
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\utils;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\models\Raster;

class BboxIsAllEvids {

    /**
    * calculate raster bounding box coordinates
    * 
    * @param mixed $query
    */
    public static function areBboxEventsAllEvents($year, $month, $bbox) {

        $sqlBbox = "SELECT array_agg(event_id) as agg 
        FROM regmod.tambora_temperature_monthly 
        WHERE year = ".$year." AND month = ".$month." AND
        ST_Intersects(geom, ST_MakeEnvelope(".$bbox[0]['lon'].",
        ".$bbox[0]['lat'].",
        ".$bbox[2]['lon'].",
        ".$bbox[1]['lat'].",
        4326))";

        $command = Yii::$app->db->createCommand($sqlBbox);
        $bboxIds = $command->queryOne();

        $sqlAll = "SELECT array_agg(event_id) as agg
        FROM regmod.tambora_temperature_monthly 
        WHERE year = ".$year." AND month = ".$month.";"; 

        $command = Yii::$app->db->createCommand($sqlAll);
        $allIds = $command->queryOne(); 

        $equal = count(array_diff($bboxIds, $allIds));

        if($equal == 0){
            return;
        } else {
            return trim(implode(" ",$bboxIds),"{}");
        }
    }
}
?>