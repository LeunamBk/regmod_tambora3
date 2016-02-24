<?php

namespace app\modules\regmod\models;              

use Yii;
use PDO;

/**
* Functions for the timeline data retrieval
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

class Timeline {

   /**
   * returns the monthly mean data for the timeline
   * 
   * @param mixed $mode
   * @param mixed $bbox
   */
    public static function getTimelineData($mode, $bbox) 
    {

        if($mode == 'all_data'){

            $sql = "SELECT year, month, (ST_SummaryStats(rast)).mean
                    FROM(
                        SELECT trunc(year/100,0) as decadeID
                        FROM regmod.temperature_monthly_recon
                        GROUP BY trunc(year/100,0)
                    ) AS lookup
                    INNER JOIN regmod.temperature_monthly_recon AS data ON 
                        data.year >= lookup.decadeID * 100 AND
                        data.year <  lookup.decadeID * 100 + 100 
                    GROUP BY year, month, rast
                    ORDER BY year, month;";

        } elseif($mode = 'bbox_data'){
           
            $sql = "SELECT lookup.year, lookup.month, lookup.event_id, (ST_SummaryStats(KK.rast)).mean
                    FROM(
                        SELECT year, month, event_id
                        FROM regmod.tambora_temperature_monthly
                        WHERE ST_Intersects(geom, ST_MakeEnvelope(".$bbox[0]['lon'].",
                                                                  ".$bbox[0]['lat'].",
                                                                  ".$bbox[2]['lon'].",
                                                                  ".$bbox[1]['lat'].", 
                                                                  4326))
                    ) AS lookup
                    INNER JOIN regmod.temperature_monthly_recon_single AS KK ON
                        lookup.event_id = KK.event_id
                    ORDER BY lookup.year,lookup.month";

        }
        
        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll(); 

        // order data
        $timeline = array();
        foreach ($query as $row) {
            $timeline[$row['year']][$row['month']]['mean'] = round($row['mean'],2);
        }
        
        // get mean temperature value for month       
        $timelineData = array();
        $resline = array();
        foreach($timeline as $year => $value){
            foreach($timeline[$year] as $month => $value){
                $resline['date'] = $year.'-'.sprintf('%02d', $month).'-01';
                $resline['mean'] =  $timeline[$year][$month]['mean'];
                array_push($timelineData,$resline);
            }
        }                    

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $timelineData;
    }
}
?>