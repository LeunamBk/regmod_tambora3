<?php

namespace app\modules\regmod\models;      
use app\modules\regmod\utils\StIntersectsParser;
use app\modules\regmod\models\Reconstructor;

use Yii;
use PDO;

/**
*  Functions for receiving GHCNMV3 climate stations data for map visualization
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

class Ghcnm {
   
    
   /**
   *   get relevant climate stations data for map visualisation
   * 
   * @param mixed $mode
   * @param mixed $year
   * @param mixed $month
   * @param mixed $eventIds
   * @param mixed $bbox
   */
    public static function getGhcnmData($mode, $year, $month, $eventIds, $bbox) 
    {
   
        if($mode == 'all_data'){

            $sql = "SELECT DISTINCT ST_Intersects(aaa.rast,1, bbb.geom),  
                                    round(CAST(float8 ((ST_SummaryStats(aaa.rast)).stddev) AS numeric), 2) AS stats,
                                    ST_Value(aaa.rast, bbb.geom) AS temp_recon,
                                    bbb.temperature, bbb.station_id, bbb.lat, bbb.lon, bbb.name, bbb.elevation, bbb.rural
                    FROM(
                        SELECT rast 
                            FROM regmod.temperature_monthly_recon 
                        WHERE year= ".$year." AND month = ".$month."
                    ) AS aaa,(
                        SELECT  lat, lon, name, geom as geom, temperature, 
                                stations.station_id, 
                                elevation, rural FROM regmod.temperature_validation_stations AS stations 
                                    INNER JOIN regmod.temperature_validation_data AS stationsData ON 
                                        stations.station_id = stationsData.station_id 
                        WHERE stationsData.year = ".$year." and stationsData.month=".$month."
                    ) as bbb;";   

        } elseif($mode == 'select_data'){

            $sql = "SELECT DISTINCT ST_Intersects(aaa.rast,1, bbb.geom),  
                                    round(CAST(float8 ((ST_SummaryStats(aaa.rast)).stddev) as numeric), 2) AS stats,
                                    ST_Value(aaa.rast, bbb.geom) AS temp_recon,
                                    bbb.temperature, bbb.station_id, bbb.lat, bbb.lon, bbb.name, bbb.elevation, bbb.rural
                    FROM(
                        SELECT rast 
                        FROM regmod.temperature_monthly_recon_live 
                        WHERE uniq(sort(event_id_array::int[])) = uniq(sort(array[".$eventIds."]))
                    ) AS aaa,(
                        SELECT lat, lon, name, geom as geom, temperature, stations.station_id,
                                elevation, rural 
                        FROM regmod.temperature_validation_stations AS stations
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON  
                            stations.station_id = stationsData.station_id 
                        WHERE stationsData.year = ".$year." AND stationsData.month=".$month."
                    ) AS bbb;";   

        } elseif($mode == 'bbox_data'){

            $sql = "SELECT DISTINCT ST_Intersects(aaa.rast,1, bbb.geom), 
                                    round(CAST(float8 ((ST_SummaryStats(aaa.rast)).stddev) as numeric), 2) AS stats,
                                    ST_Value(aaa.rast, bbb.geom) AS temp_recon, bbb.temperature, bbb.station_id, 
                                    bbb.lat, bbb.lon, bbb.name, bbb.elevation, bbb.rural
                    FROM(
                        SELECT rast
                        FROM regmod.temperature_monthly_recon_live 
                        WHERE uniq(sort(event_id_array::int[])) 
                            IN( 
                                SELECT array_agg(event_id) as agg 
                                FROM regmod.tambora_temperature_monthly 
                                WHERE year = ".$year." AND month = ".$month." 
                                    AND ST_Intersects(geom, 
                                                ST_MakeEnvelope(".$bbox[0]['lon'].",
                                                                ".$bbox[0]['lat'].",
                                                                ".$bbox[2]['lon'].",
                                                                ".$bbox[1]['lat'].", 
                                                                4326))
                                )
                    ) AS aaa,(
                        SELECT lat, lon, name, geom as geom, temperature,
                                stations.station_id, 
                                elevation, rural 
                        FROM regmod.temperature_validation_stations AS stations 
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON 
                                stations.station_id = stationsData.station_id 
                        WHERE stationsData.year = ".$year." and stationsData.month= ".$month."
                    ) AS bbb; ";   

        } elseif($mode == 'reconstructed_data'){

            $eventIds = Reconstructor::toIdString($eventIds);

            $sql = "SELECT DISTINCT ST_Intersects(aaa.rast,1, bbb.geom),
                                    round(CAST(float8 ((ST_SummaryStats(aaa.rast)).stddev) as numeric), 2) AS stats,
                                    ST_Value(aaa.rast, bbb.geom) AS temp_recon,
                                    bbb.temperature, bbb.station_id, bbb.lat, bbb.lon, bbb.name, bbb.elevation, bbb.rural
                    FROM(
                        SELECT rast
                        FROM regmod.temperature_monthly_reconstructor_evaluation
                        WHERE
                          year = ".$year." AND
                          month = ".$month." AND
                          uniq(sort(id_array::int[])) = uniq(sort(array[".$eventIds."]))
                    ) AS aaa,(
                        SELECT lat, lon, name, geom as geom, temperature, stations.station_id,
                                elevation, rural
                        FROM regmod.temperature_validation_stations AS stations
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON
                            stations.station_id = stationsData.station_id
                        WHERE stationsData.year = ".$year." AND stationsData.month=".$month."
                    ) AS bbb;";

        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll(); 

        // parse query for st_intersects == t and get offset
        $ghcnmData = StIntersectsParser::intersectingGhcnm($query);

        return $ghcnmData;
    }
}
?>