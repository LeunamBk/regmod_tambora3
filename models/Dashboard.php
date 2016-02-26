<?php

namespace app\modules\regmod\models;
use app\modules\regmod\utils\BboxIsAllEvids;
use app\modules\regmod\utils\BoxplotStatistics;

use Yii;
use PDO;

/**
 * Statistics functions for validation
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

class Dashboard {

    private static function avgIndexClass(){
        $sql = "SELECT idx, avg(event_mean - cru_mean)
                FROM regmod.statistics_events
                GROUP BY idx
                ORDER BY idx;";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll();

        $avgClassData = array();
        foreach($query as $line){
            $avgClassData[$line['idx']] = round(floatval($line['avg']),2);
        }

        return $avgClassData;
    }

    private static function avgSignedIndexClass(){
        $sql = "SELECT min(event_mean - cru_mean), max(event_mean - cru_mean)
                FROM regmod.statistics_events
                GROUP BY idx > 0, idx < 0;";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll();

        $avgClassData = array();
        $avgClassData['zero'] = array(round(floatval($query[0]['min']),2), round(floatval($query[0]['max']),2));
        $avgClassData['negative'] = array(round(floatval($query[1]['min']),2), round(floatval($query[1]['max']),2));
        $avgClassData['positive'] = array(round(floatval($query[2]['min']),2), round(floatval($query[2]['max']),2));


        return $avgClassData;

    }



    public static function getCruByIndex(){

        $sql = "SELECT tambora.event_id,
                        tambora.average AS idx,
                        tambora.year,
                        tambora.month,
                        tambora.location_name AS location,
                        stats.event_mean,
                         stats.cru_mean,
                          event_mean - cru_mean AS cru_diff_mean
                FROM regmod.statistics_events AS stats
		        INNER JOIN events_timespace AS tambora
		          ON stats.event_id = tambora.event_id
                  ORDER BY stats.idx;";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll();

        $scatterplot = array();
        $boxplotData = array();
        $tooltipMeta = array();
        foreach($query as $line){

            $indice = $line['idx'];
            $indiceValue = floatval($line['cru_diff_mean']);
            // aggregate data for scatterplot
            array_push($scatterplot, array($indice, $indiceValue));

            // aggregate data for tooltip metadata info
            array_push($tooltipMeta,
                array(
                    'id'=> intval($line['event_id']),
                    'year'=> intval($line['year']),
                    'month' => intval($line['month']),
                    'location' => $line['location'],
                    'eventMean' => floatval($line['event_mean']),
                    'cruMean' => floatval($line['cru_mean'])
                ));
            
        }

        // calculate boxplot data
        $boxplot = boxplotStatistics::getBoxplotStatistics($scatterplot);

        return compact('scatterplot', 'boxplot', 'tooltipMeta');
    }

    public static function getCruByIndexStats(){

        $avgIndex = self::avgIndexClass();
        $avgSignedIndex = self::avgSignedIndexClass();

        return compact('avgIndex','avgSignedIndex');

    }

    public static function getCruStatsByEvids(){

        $sql = "SELECT *, event_atghcnm_temperature-ghcnm_temperature AS reconstatdiff
                FROM regmod.statistics_ghcnm
                ORDER BY name;";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll();

        $statByIdx = array();
        $statByMonth = array();
        $statByLoc = array();
        $evidLookUp = array();
        $locationNameLU = array();
        $dashboardData = array();
        $lookupidarray=array();
        $lookid=0;

        $tooltipMeta = array();

        foreach($query as $line){
            array_push($statByIdx, array($line['idx'], floatval($line['reconstatdiff'])));
            array_push($statByMonth, array($line['month'], floatval($line['reconstatdiff'])));
            $line['name'] = str_replace("/","",$line['name']);
            $line['name'] = str_replace("\\","",$line['name']);



            if($line['reconstatdiff'] != ''){

                if(!array_key_exists($line['station_id'], $lookupidarray)){
                    $lookupidarray[$line['station_id']] = $lookid;
                    $id = $lookid;
                    ++$lookid;

                } else {
                    $id = $lookupidarray[$line['station_id']];
                }

                array_push($statByLoc, array($id, floatval($line['reconstatdiff'])));
                //     array_push($statByLoc, $line['reconstatdiff']);
                if (!in_array($line['name'], $locationNameLU)){
                    array_push($locationNameLU, $line['name']);
                }

            }

            // aggregate metadata
            array_push($evidLookUp, $line['event_id']);


            // aggregate data for tooltip metadata info
            array_push($tooltipMeta,
                array(
                    'id'=> intval($line['event_id']),
                    'index'=> intval($line['idx']),
                    'year'=> intval($line['year']),
                    'month' => intval($line['month']),
                    'TGhcnm' => intval($line['ghcnm_temperature']),
                    'TEvent' => intval($line['event_atghcnm_temperature']),
                    'Tdifference' => intval($line['reconstatdiff']),
                    'location' => $line['name'],
                ));

        }

        // calculate boxplot data
        $boxplotByIndex = boxplotStatistics::getBoxplotStatistics($statByIdx);
        $boxplotByMonth = boxplotStatistics::getBoxplotStatistics($statByMonth);
        $boxplotByLocation = boxplotStatistics::getBoxplotStatistics($statByLoc);

        $dashboardData['statByIdx'] = array('plots' => array('scatterplot' => $statByIdx, 'boxplot' => $boxplotByIndex));
        $dashboardData['statByMonth'] = array('plots' => array('scatterplot' => $statByMonth, 'boxplot' => $boxplotByMonth));
        $dashboardData['statByLoc'] = array('plots' => array('scatterplot' => $statByLoc, 'locationLookUp' => $locationNameLU, 'boxplot' => $boxplotByLocation));
        $dashboardData['tooltipMeta'] = $tooltipMeta;

        $dashboardData['evidLookUp'] = $evidLookUp;
       

        return $dashboardData;

    }

}
?>