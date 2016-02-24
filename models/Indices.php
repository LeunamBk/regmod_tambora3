<?php

namespace app\modules\regmod\models;              

use Yii;
use PDO;

/**
* Functions for retrieving indices data for map visualisation
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

class Indices {

    /**
    *  get relevant indices data for map visualisation as leaflet circle markers and
    *  for displaying additional data, based on indices classification
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $bbox
    */
    public static function getIndicesData($mode, $year, $month, $bbox) 
    {

        if($mode == 'all_data'){

            $sql = "SELECT location_name AS location, average AS idx, longitude AS lon, latitude AS lat,
                            quote_text AS text, event_id, longitude AS lon_info, latitude AS lat_info, public
                    FROM events_timespace
                    WHERE node_id = 237 AND
                      duration_days >=28 AND
                      duration_days <= 31 AND
                      NOT location_id IN (5095, 5141) AND
                      average IS NOT NULL AND
                      project_id NOT IN (SELECT id FROM grouping.project WHERE acronym IN ('goethe', 'WK2', 'WeikImp1')) AND
                      year = ".$year." AND month = ".$month.";";

        } elseif($mode == 'bbox_data'){

            $sql = "SELECT location_name AS location, average AS idx, longitude AS lon, latitude AS lat,
                            quote_text AS text, event_id, longitude AS lon_info, latitude AS lat_info, public
                    FROM events_timespace
                    WHERE node_id = 237 AND
                      duration_days >=28 AND
                      duration_days <= 31 AND
                      NOT location_id IN (5095, 5141) AND
                      average IS NOT NULL AND
                      project_id NOT IN (SELECT id FROM grouping.project WHERE acronym IN ('goethe', 'WK2', 'WeikImp1')) AND
                      year = ". $year. ' AND month = '.$month.' AND
                      ST_Intersects(geom,
                                ST_MakeEnvelope('.$bbox[0]['lon'].",
                                                ".$bbox[0]['lat'].",
                                                ".$bbox[2]['lon'].",
                                                ".$bbox[1]['lat'].',
                                                 4326)
                    );';

        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll(); 

        return $query;
    }
}
?>