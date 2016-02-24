<?php

/**Update Controller for updating the reconstructed monthly data based on new entries added to the database
This routine is executed every startup of the webapp
 */

namespace app\modules\regmod\models;
use app\modules\regmod\utils\RasterExtent;

//use app\modules\regmod\utils\BboxIsAllEvids;

use Yii;
use PDO;

/**
 * Functions for retrieving raster data for map visualization
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

class Updater{

    private static function getDbCredentials(){

        $db = Yii::$app->getDb();

        $dbName = self::getDsnAttribute('dbname', $db->dsn);
        $dbPort = self::getDsnAttribute('port', $db->dsn);
        $dbUser = $db->username;
        $dbPass = $db->password;

        return compact('dbName', 'dbUser', 'dbPass', 'dbPort');
    }

    private static function getDsnAttribute($name, $dsn){
        if (preg_match('/' . $name . '=([^;]*)/', $dsn, $match)) {
            return $match[1];
        } else {
            return null;
        }
    }

    private static function getAllEventidsFromDate($dates){


        $sql = "SELECT event_id
                    FROM events_timespace
                    WHERE node_id = 237 AND
                      duration_days >=28 AND
                      duration_days <= 31 AND
                      NOT location_id IN (5095, 5141) AND
                      average IS NOT NULL AND
                      project_id NOT IN (SELECT id FROM grouping.project WHERE acronym IN ('goethe', 'WK2', 'WeikImp1'))
		              AND (year, month) IN (".$dates.");";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll();

        // format data for sql query
        $idArray = [];
        foreach($query as $id){
            array_push($idArray, $id['event_id']);
        }
        $ids = implode($idArray,",");

        return $ids;

    }

    public function checkForUpdatedData(){

        $sql = "SELECT year, month FROM events_timespace
                  WHERE node_id = 237 AND
                  duration_days >=28 AND
                  duration_days <= 31 AND
                  NOT location_id IN (5095, 5141) AND
                  average IS NOT NULL AND
                  project_id NOT IN (SELECT id FROM grouping.project WHERE acronym IN ('goethe', 'WK2', 'WeikImp1'))
		          AND md5(checksum) NOT IN  (
                    SELECT md5(checksum) FROM regmod.temperature_monthly_events_update_register
        		  )
        		GROUP BY year, month";

        $command = Yii::$app->db->createCommand($sql);
        $dateArray = $command->queryAll();

        if (!$dateArray) return false;

        // format dates for sql as query tuples
        $dates = [];
        foreach($dateArray as $date){
            array_push($dates,"(".$date['year'].",".$date['month'].")");
        }
        $dates = implode($dates, ",");

        // get all event ids from new, updated and events in the same year month as updated/new
        $ids = self::getAllEventidsFromDate($dates);

        return compact('dates','ids', 'dateArray');

    }

    private static function deleteById($ids){

        $sqlArray[0] = "DELETE FROM regmod.temperature_monthly_recon_single WHERE event_id IN (".$ids.");";
        $sqlArray[1] = "DELETE FROM regmod.temperature_monthly_regio_idxrec WHERE event_id IN (".$ids.");";
        $sqlArray[2] = "DELETE FROM regmod.temperature_monthly_regio_weight WHERE event_id IN (".$ids.");";
        $sqlArray[3] = "DELETE FROM regmod.statistics_events WHERE event_id IN (".$ids.");";

        foreach($sqlArray as $sql){
            $command = Yii::$app->db->createCommand($sql);
            $command->execute();
        }

    }

    private static function deleteByDate($dates){

        $sqlArray[0] = "DELETE FROM regmod.statistics_ghcnm WHERE (year, month) IN(".$dates.");";
        $sqlArray[1] = "DELETE FROM regmod.temperature_monthly_recon WHERE (year, month) IN(".$dates.");";
        $sqlArray[2] = "DELETE FROM regmod.temperature_monthly_recon_live WHERE (year, month) IN(".$dates.");";


        foreach($sqlArray as $sql){
            $command = Yii::$app->db->createCommand($sql);
            $command->execute();
        }


    }

    private static function deletFromLiveReconstruction(){

        $sqlArray[0] = "DELETE FROM regmod.temperature_monthly_reconstructor_evaluation;";
        $sqlArray[1] = "DELETE FROM regmod.temperature_monthly_reconstructor_evaluation_regression;";

        foreach($sqlArray as $sql){
            $command = Yii::$app->db->createCommand($sql);
            $command->execute();
        }

    }

    private static function deleteFromUpdateRegister($ids){
        $sql = "DELETE FROM regmod.temperature_monthly_events_update_register WHERE event_id IN (".$ids.");";

        $command = Yii::$app->db->createCommand($sql);
        $command->execute();
    }

    private static function updateEventStats($ids){

        $sql = "INSERT INTO regmod.statistics_events (event_id, idx, event_mean, cru_mean) (
                  SELECT CC.event_id,
                           CC.average AS idx,
                           (ST_SUMMARYSTATS(BB.rast)).mean AS event_mean,
                           (ST_SUMMARYSTATS(ST_INTERSECTION(AA.rast,BB.rast))).mean AS cru_mean
                    FROM  regmod.temperature_cru_mean AS AA,
                          regmod.temperature_monthly_recon_single AS BB
                    INNER JOIN events_timespace AS CC
                    ON BB.event_id = CC.event_id
                    WHERE AA.month = CC.month AND
                    BB.event_id IN (".$ids."));";

        $command = Yii::$app->db->createCommand($sql);
        $command->execute();

    }

    private static function updateStationStats($ids){

        $sql = "INSERT INTO regmod.statistics_ghcnm (event_id, idx, year, month, ghcnm_temperature, event_atghcnm_temperature, station_id, name)(
                  SELECT event_id, average AS idx, station.year,
		            station.month,
                    station.temperature AS ghcnm_temperature,
                    ST_VALUE(reconevent.rast, station.geom) AS event_atghcnm_temperature,
                    station.station_id,
                    station.name
                    FROM (
                      SELECT EE.station_id, name, geom, temperature, month, year
                    FROM regmod.temperature_validation_stations AS EE
                    INNER JOIN regmod.temperature_validation_data AS DD
                    ON EE.station_id = DD.station_id
                        ) AS station, (
                      SELECT events.event_id, recon.rast, average, year, month
                    FROM events_timespace as events
                    INNER JOIN regmod.temperature_monthly_recon_single As recon
                    ON events.event_id = recon.event_id
                    ORDER BY event_id
                    ) AS reconevent
                         WHERE station.year = reconevent.year
                          AND station.month = reconevent.month
                          AND ST_INTERSECTS(reconevent.rast, station.geom)
                          AND ST_VALUE(reconevent.rast, station.geom) IS NOT NULL
			              AND reconevent.event_id IN (".$ids."));";

        $command = Yii::$app->db->createCommand($sql);
        $command->execute();

    }

    public function deleteModelData($dataIdArray){
        self::deleteById($dataIdArray['ids']);
        self::deleteByDate($dataIdArray['dates']);
        self::deletFromLiveReconstruction();
        self::deleteFromUpdateRegister($dataIdArray['ids']);
    }

    public function reconstructUpdate($datesArray){

        $years = [];
        $months = [];
        foreach($datesArray as $date){
            array_push($years, $date['year']);
            array_push($months, $date['month']);
        }

        $years = implode($years, ',');
        $months = implode($months, ',');

        $modulePath = Yii::$app->getBasePath();
        $regmodR = $modulePath."/modules/regmod/assets/R/regmodR/R/regmod/";
        $regmodRLogTmp = $modulePath."/data/regmod/log/mapCreateLogTmp.txt";
        $regmodRLog = $modulePath."/data/regmod/log/mapCreateLog.txt";
        $tiffDataPath = $modulePath."/modules/regmod/data/tmp";
        $reanalysisDataPath = $modulePath."/modules/regmod/data/CRU/cru_ts3.tmp.nc";

        $dbCred = self::getDbCredentials();

        $start = microtime(true);

        # run regmod
        exec('Rscript '.$regmodR.'mainCL.R '.$regmodR.' '.$dbCred['dbName'].' '.$dbCred['dbPort'].' '.$dbCred['dbUser'].' '.$dbCred['dbPass'].' '.$tiffDataPath.' '.$reanalysisDataPath.' '.$years.' '.$months.' | tee '.$regmodRLogTmp);

        $time_elapsed_secs = microtime(true) - $start;
        //echo 'Execution time: '.$time_elapsed_secs;

        # create 'clean' log
        exec('cat '.$regmodRLogTmp.' | grep -i -e SOURCEDATE -i -e ERROR -i -e WARNING -i -e Fehler -i -e debug -i -e EXEC -i -e MeanTemp>> '.$regmodRLog);
        exec('echo >> '.$regmodRLog);
        exec('echo Execution time: '.$time_elapsed_secs.' >> '.$regmodRLog);
    }

    public function statisticsUpdate($ids){
        self::updateEventStats($ids);
        self::updateStationStats($ids);
    }

    public function checkIfMigrationsFinished(){

        $sql = "SELECT EXISTS (
                  SELECT 1
                  FROM pg_catalog.pg_class c
                    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = 'regmod'
                    AND c.relname = 'statistics_events'
                    AND c.relkind = 'r'    -- only tables
                );";

        $command = Yii::$app->db->createCommand($sql);
        $exists = $command->execute();

        if($exists['exists']){
            return true;
        } else {
            return false;
        }

    }

}
?>
