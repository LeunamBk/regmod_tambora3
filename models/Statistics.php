<?php

namespace app\modules\regmod\models;
use app\modules\regmod\utils\BboxIsAllEvids;
use app\modules\regmod\models\Reconstructor;

use Yii;
use PDO;

/**
 * Statistics functions for validation
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

class Statistics {

    private static function getCruStatsByYearMonth($year, $month){

        $sql = "SELECT ST_SummaryStats(ST_Intersection(aaa.rast, bbb.rast,1)) AS cru, 
        ST_SummaryStats(bbb.rast) AS regmod 
        FROM(
        SELECT rast 
        FROM regmod.temperature_cru_mean 
        WHERE month= ".$month."
        ) AS aaa,(
        SELECT rast 
        FROM regmod.temperature_monthly_recon 
        WHERE year = ".$year." AND month = ".$month."
        ) AS bbb;";

        return $sql;

    }
    private static function getCruStatsByEvids($year, $month, $eventIds){

        $sql = "SELECT ST_SummaryStats(ST_Intersection(aaa.rast, bbb.rast,1)) as cru,
                            ST_SummaryStats(bbb.rast) AS regmod 
                    FROM(
                        SELECT rast 
                        FROM regmod.temperature_cru_mean 
                        WHERE month= ".$month."
                    ) as aaa,(
                        SELECT rast 
                        FROM regmod.temperature_monthly_recon_live 
                        WHERE year = ".$year." AND month = ".$month." 
                        AND uniq(sort(event_id_array::int[])) = uniq(sort(array[".$eventIds."]))
                    ) as bbb;";

        return $sql;

    }

    private static function getCruStatsForReconstruction($year, $month, $ids){

        $eventIds = Reconstructor::toIdString($ids);

        $sql = "SELECT ST_SummaryStats(ST_Intersection(aaa.rast, bbb.rast,1)) as cru,
                            ST_SummaryStats(bbb.rast) AS regmod
                    FROM(
                        SELECT rast
                        FROM regmod.temperature_cru_mean
                        WHERE month= ".$month."
                    ) as aaa,(
                        SELECT rast
                        FROM regmod.temperature_monthly_reconstructor_evaluation
                        WHERE year = ".$year." AND month = ".$month."
                        AND uniq(sort(id_array::int[])) = uniq(sort(array[".$eventIds."]))
                    ) as bbb;";

        return $sql;

    }

    /**
     * returns mean temperature differnece between cru monthly mean temperature data
     * and reconstructed data
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @return []
     */
    public static function getCruStats($mode, $year, $month, $eventIds)
    {

        if($mode == 'all_data'){

            // get cru stats from event ids
            $sql = "SELECT AA.event_id, (ST_SUMMARYSTATS(AA.rast)).mean - (ST_SUMMARYSTATS(ST_INTERSECTION(BB.rast,AA.rast))).mean AS cru_diff_mean 
                    FROM regmod.temperature_monthly_recon_single AS AA,
                         regmod.temperature_cru_mean AS BB 
                    WHERE AA.event_id IN(".$eventIds.") AND BB.month = ".$month.";";

            $command = Yii::$app->db->createCommand($sql);
            $query = $command->queryAll();

            $cruStats = array();
            foreach ($query as $row) {
                $key = $row['event_id'];
                $val = round($row['cru_diff_mean'],2);
                if(empty($stats[$key])) $cruStats[$key] = array($val);
                else $cruStats[$key] = $val;
            }

            return $cruStats;
        }
    }

    /**
     * returns mean temperature differnece between ghcnmv3 monthly mean temperature station data
     * and reconstructed temperature field for every index (single) for info table summarization
     *
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @return []
     */
    public static function getGhcnmStats($mode, $year, $month, $eventIds)
    {

        if($mode == 'all_data'){

            $sql = "SELECT AA.event_id, avg(ST_Value(AA.rast, BB.geom) - BB.temperature) AS station_offset 
                    FROM(
                        SELECT rast, event_id 
                        FROM regmod.temperature_monthly_recon_single 
                        WHERE event_id IN(".$eventIds.")
                    ) as AA,(
                        SELECT * 
                        FROM regmod.temperature_validation_stations AS stations
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON 
                                stations.station_id = stationsData.station_id 
                        WHERE year = ".$year. " AND month = ".$month."
                    ) as BB
                    WHERE ST_Intersects(AA.rast, BB.geom,1)
                    GROUP BY event_id;";

            $command = Yii::$app->db->createCommand($sql);
            $query = $command->queryAll();

            $ghcnmStats = array();
            foreach ($query as $row) {
                $key = $row['event_id'];
                $val = round($row['station_offset'],2);
                if(empty($stats[$key])) $ghcnmStats[$key] = array($val);
                else $ghcnmStats[$key] = $val;
            }

            return $ghcnmStats;
        }
    }

    /**
     * returns statistics for cru monthly mean temperature data
     * and coherent reconstructed temperature field (all)
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @param mixed $bbox
     */
    public static function getInlineCruStats($mode, $year, $month, $eventIds, $bbox)
    {

        if($mode == 'all_data'){

            $sql = self::getCruStatsByYearMonth($year, $month);

        } elseif($mode == 'select_data'){

            $sql = self::getCruStatsByEvids($year, $month, $eventIds);

        } elseif($mode == 'bbox_data'){

            // check if all available events for month are within bounding box, if not return event ids in bbox
            $bboxEvids = BboxIsAllEvids::areBboxEventsAllEvents($year, $month, $bbox);

            if(!$bboxEvids){
                $sql = self::getCruStatsByYearMonth($year, $month);
            } else {
                $sql = self::getCruStatsByEvids($year, $month, $bboxEvids);
            }

        } elseif($mode == 'reconstructed_data') {
            $sql = self::getCruStatsForReconstruction($year, $month, $eventIds);
        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        $CruStats = array();
        $cru = str_replace(array( '(', ')' ), '', $query['cru']);
        $regmod = str_replace(array( '(', ')' ), '', $query['regmod']);
        $cru = explode(",", $cru);
        $regmod = explode(",", $regmod);
        $CruStats['cru']['mean'] = round($cru[2],2);
        $CruStats['cru']['stddev'] = round($cru[3],2);
        $CruStats['cru']['min'] = round($cru[4],2);
        $CruStats['cru']['max'] = round($cru[5],2);
        $CruStats['regmod']['mean'] = round($regmod[2],2);
        $CruStats['regmod']['stddev'] = round($regmod[3],2);
        $CruStats['regmod']['min'] = round($regmod[4],2);
        $CruStats['regmod']['max'] = round($regmod[5],2);
        $CruStats['comparisonStats']['mean'] = $CruStats['regmod']['mean'] - $CruStats['cru']['mean'];

        return $CruStats;

    }

    /**
     * returns statistics for ghcnmv3 monthly mean temperature station data
     * and coherent reconstructed temperature field (all)
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     */
    public static function getInlineGhcnmStats($mode, $year, $month, $eventIds)
    {
        if($mode == 'all_data'){

            // get Station temperature and regmod temperature vor station lat/lon point
            $sql = "SELECT avg(ST_Value(aaa.rast, bbb.geom) - bbb.temperature) AS station_offset 
                    FROM(
                        SELECT rast 
                        FROM regmod.temperature_monthly_recon 
                        WHERE year = ".$year." AND month = ".$month." 
                    ) AS aaa,(
                        SELECT temperature, geom 
                        FROM regmod.temperature_validation_stations AS stations
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON 
                                stations.station_id = stationsData.station_id 
                        WHERE year = ".$year." AND month = ".$month."
                    ) AS bbb;";

        } elseif($mode == 'select_data'){

            $sql = "SELECT avg(ST_Value(aaa.rast, bbb.geom) - bbb.temperature) AS station_offset 
                    FROM(
                        SELECT rast 
                        FROM regmod.temperature_monthly_recon_live 
                        WHERE year = ".$year." AND month = ".$month." 
                        AND uniq(sort(event_id_array::int[])) = uniq(sort(array[".$eventIds."]))
                    ) AS aaa,(
                        SELECT * 
                        FROM regmod.temperature_validation_stations AS stations
                            INNER JOIN regmod.temperature_validation_data AS stationsData ON 
                                stations.station_id = stationsData.station_id 
                        WHERE year = ".$year." AND month = ".$month."
                    ) AS bbb;";

        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if(!$query['station_offset']){
            $stationStats['mean'] = "";
        } else {
            $stationStats['mean'] = $query['station_offset'];
        }

        return $stationStats;
    }

    /**
     * returns temperature at location lat lon
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $lat
     * @param mixed $lon
     * @param mixed $eventIds
     */
    public static function getTRasterLatLonInfo($mode, $year, $month, $lat, $lon, $eventIds)
    {
        if($mode == 'all_data'){

            $sql="SELECT ST_Value(ST_TRANSFORM(rast,3857), 
                            ST_Transform(ST_SetSRID(ST_MakePoint(".$lon.", ".$lat."),4326),3857)) 
                  FROM regmod.temperature_monthly_recon 
                  WHERE year = ".$year." AND month = ".$month.";";

        } elseif($mode == 'select_data' || $mode == 'bbox_data'){

            $sql="SELECT ST_Value(ST_TRANSFORM(rast,3857), 
                            ST_Transform(ST_SetSRID(ST_MakePoint(".$lon.", ".$lat."),4326),3857)) 
                  FROM regmod.temperature_monthly_recon_live 
                  WHERE uniq(sort(event_id_array::int[])) = uniq(sort(array[".$eventIds."]));";

        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        return $query['st_value'];
    }

    public static function getCoverageStats(){

        $sql = "SELECT count(RECON.event_id) AS event_count,
                  count(DISTINCT(TAMBORA.location_id)) AS location_count
                FROM regmod.temperature_monthly_recon_single AS RECON
                INNER JOIN events_timespace AS TAMBORA
                ON TAMBORA.event_id = RECON.event_id;";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        return $query;

    }
}
?>