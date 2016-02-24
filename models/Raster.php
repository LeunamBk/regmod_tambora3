<?php

namespace app\modules\regmod\models;
use app\modules\regmod\utils\RasterExtent;
use app\modules\regmod\utils\BboxIsAllEvids;

use Yii;
use PDO;

/**
 * Functions for retrieving raster data for map visualization
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

class Raster {

    /**
     * get db credentials for exec commands
     *
     * @param mixed $name
     * @param mixed $dsn
     */
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

    private static function getRasterExtentByEvids($year, $month, $eventIds){

        $sql = "SELECT (ST_MetaData(rast)).* , (ST_summarystats(rast)).min,
        (ST_summarystats(rast)).max
        FROM regmod.temperature_monthly_recon_live
        WHERE  year = ".$year." AND month = ".$month."
        AND uniq(sort(event_id_array::int[])) = uniq(sort(array[".$eventIds."]));";


        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if(!$query) return;

        // get raster temperature min max
        $rasterMinMax = array('tempMin' => $query['min'],
            'tempMax' => $query['max']);

        // calculate raster bounding box coordinates
        $rasterExtent =  RasterExtent::getRasterExtent($query);

        return compact('rasterExtent', 'rasterMinMax');

    }

    private static function getRasterExtentByYearMonth($year, $month){

        $sql = "SELECT (ST_MetaData(rast)).* , (ST_summarystats(rast)).min, 
        (ST_summarystats(rast)).max 
        FROM regmod.temperature_monthly_recon 
        WHERE year = ".$year." AND month = ".$month.";";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if(!$query) return false;

        // get raster temperature min max
        $rasterMinMax = array('tempMin' => $query['min'],
            'tempMax' => $query['max']);

        // calculate raster bounding box coordinates
        $rasterExtent =  RasterExtent::getRasterExtent($query);

        return compact('rasterExtent', 'rasterMinMax');

    }

    private static function getCruRasterExtent($month){

        $sql = "SELECT (ST_summarystats(rast)).min, (ST_summarystats(rast)).max 
        FROM regmod.temperature_cru_mean 
        WHERE month = ".$month.";";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if(!$query) return;

        // get raster temperature min max
        $rasterMinMax = array('tempMin' => $query['min'],
            'tempMax' => $query['max']);

        $rasterExtent = 'no data';
        return compact('rasterExtent', 'rasterMinMax');

    }

    private static function getRasterDataByYearMonth($year, $month, $myfile, $colFileLoc, $mode='evaluation_mode'){

        /** query with world window
         *  Data will be projected differently according due their extent. Therefore for "precise" visualization
         *  all data fields are referenced to the same global extent (in Evaluation mode). This ensures no distortions
         *  among same fields of nearly same extent. Sadly this could not be overall practice, because of performance
         *  maybe old libpq (see postgresql.nabble.com/BUG-2236-extremely-slow-to-get-unescaped-bytea-data-from-db-td2119888.html)
         *
         */
        if($mode == 'evaluation_mode') {
            $sql = "SELECT
                        ST_AsPNG(
                        ST_ColorMap(
                        ST_TRANSFORM(
                        ST_Union(f.rast, 'MAX'),3857)
                        ,'" . fread($myfile, filesize($colFileLoc)) . "'))
                        FROM (SELECT rast
                        FROM regmod.temperature_monthly_recon
                        WHERE year = " . $year . " AND month = " . $month . "
                        UNION ALL
                        SELECT st_makeemptyraster(rast) FROM regmod.temperature_cru_mean WHERE month = 1) AS f;";
        } else {
            $sql = "SELECT
                        ST_AsPNG(
                        ST_ColorMap(
                        ST_TRANSFORM(
                        rast,3857)
                        ,'".fread($myfile,filesize($colFileLoc))."'))
                        FROM regmod.temperature_monthly_recon
                        WHERE year = ".$year." AND month = ".$month;
        }

        return $sql;
    }

    private static function getRasterDataByEvids($year, $month, $myfile, $colFileLoc, $eventIds, $bbox = false){

        if($bbox){

            $sql = "SELECT
            ST_AsPNG(
            ST_ColorMap(
            ST_TRANSFORM(
            rast,3857)
            ,'" . fread($myfile, filesize($colFileLoc)) . "'))
            FROM regmod.temperature_monthly_recon_live
            WHERE uniq(sort(event_id_array::int[])) = uniq(sort(array[" . $eventIds . "]))
            ;";

        } else {
            $sql = "SELECT
            ST_AsPNG(
            ST_ColorMap(
            ST_TRANSFORM(
            ST_Union(f.rast, 'MAX'),3857)
            ,'" . fread($myfile, filesize($colFileLoc)) . "'))
            FROM (SELECT rast
            FROM regmod.temperature_monthly_recon_live
            WHERE uniq(sort(event_id_array::int[])) = uniq(sort(array[" . $eventIds . "]))
            UNION ALL
            SELECT ST_MAKEEMPTYRASTER(rast) AS rast
            FROM regmod.temperature_cru_mean
            WHERE month=1) AS f";
        }
        return $sql;
    }

    private static function getTRegressionDataByYearMonth($year, $month){

        $sql="SELECT ST_AsPNG(
        ST_ColorMap(ST_TRANSFORM(ST_Union(f.rast, 'MAX'),3857),'bluered'))
        FROM (SELECT ST_UNION(rast,'MAX') AS rast
        FROM regmod.temperature_monthly_regio_weight 
        WHERE event_id 
        IN(
        SELECT event_id 
        FROM regmod.tambora_temperature_monthly AS AA 
        WHERE year = ".$year." AND month = ".$month."
        )
        UNION ALL 
        SELECT ST_MAKEEMPTYRASTER(rast) AS rast
        FROM regmod.temperature_cru_mean
        WHERE month=1) AS f";

        return $sql;

    }

    private static function getTRegressionDataByEvids($year, $month, $eventIds){

        $sql = "SELECT ST_AsPNG(
        ST_ColorMap(ST_TRANSFORM(ST_Union(f.rast, 'MAX'),3857),'bluered'))
        FROM (SELECT ST_UNION(rast,'MAX') AS rast
        FROM regmod.temperature_monthly_regio_weight
        WHERE event_id IN(".$eventIds.")
        UNION ALL
        SELECT ST_MAKEEMPTYRASTER(rast) AS rast
        FROM regmod.temperature_cru_mean
        WHERE month=1) AS f
        ";

        return $sql;

    }

    /**
     * returning Temperature raster bounding box coordinates
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @param mixed $bbox
     */
    public static function getTemperatureRasterExtent($mode, $year, $month, $eventIds, $bbox)
    {

        if($mode == 'all_data' || $mode == 'bbox_data'){

            if($mode == 'all_data'){

                $rasterMeta = self::getRasterExtentByYearMonth($year, $month);
                if($rasterMeta){

                    return $rasterMeta;

                } else {
                    // if no view available get cru mean map min max
                    $rasterMeta = self::getCruRasterExtent($month);
                    return $rasterMeta;
                }

            } elseif($mode == 'bbox_data'){

                // check if all available events for month are within bounding box, if not return event ids in bbox
                $bboxEvids = BboxIsAllEvids::areBboxEventsAllEvents($year, $month, $bbox);

                if(!$bboxEvids){

                    // all events for month are within bbox
                    $rasterMeta = self::getRasterExtentByYearMonth($year, $month);
                    if($rasterMeta){

                        return $rasterMeta;

                    } else {
                        // if no view available get cru mean map min max
                        $rasterMeta = self::getCruRasterExtent($month);
                        return $rasterMeta;
                    }

                }

                // check if selected event combination was calculated before, if so get meta
                $rasterMeta = self::getRasterExtentByEvids($year, $month, $bboxEvids);

                if ($rasterMeta){
                    return $rasterMeta;
                } else {

                    // reconstruct temperature distribution based on selected events
                    $modulePath = Yii::$app->getBasePath();
                    $pcaPython = $modulePath."/modules/regmod/assets/Python/pcaPython/main.py";
                    $tiffDataPath = $modulePath."/data/regmod/tiff";
                    $reanalysisDataPath = $modulePath."/modules/regmod/data/CRU/cru_ts3.tmp.nc";
                    $dbCred = self::getDbCredentials();

                    exec("python ".$pcaPython." ".$dbCred['dbName']." ".$dbCred['dbPort']." ".$dbCred['dbUser']." ".$dbCred['dbPass']." ".$tiffDataPath." ".$reanalysisDataPath." ".$year." ".$month." ".str_replace(","," ",$bboxEvids));

                    // get raster extent of python calculated raster
                    $rasterMeta = self::getRasterExtentByEvids($year, $month, $bboxEvids);

                    if($rasterMeta){
                        return $rasterMeta;
                    } else {;
                        // if raster couldnt been reconstructed return cru raster for month
                        $rasterMeta = self::getCruRasterExtent($month);
                        return $rasterMeta;
                    }
                }
            }

        } elseif($mode == 'select_data'){

            // check if selected event combination was calculated before, if so get meta
            $rasterMeta = self::getRasterExtentByEvids($year, $month, $eventIds);

            if ($rasterMeta){
                return $rasterMeta;
            }else {

                // reconstruct temperature distribution based on selected events
                $modulePath = Yii::$app->getBasePath();
                $pcaPython = $modulePath."/modules/regmod/assets/Python/pcaPython/main.py";
                $tiffDataPath = $modulePath."/data/regmod/tiff";
                $reanalysisDataPath = $modulePath."/modules/regmod/data/CRU/cru_ts3.tmp.nc";
                $dbCred = self::getDbCredentials();

                exec("python ".$pcaPython." ".$dbCred['dbName']." ".$dbCred['dbPort']." ".$dbCred['dbUser']." ".$dbCred['dbPass']." ".$tiffDataPath." ".$reanalysisDataPath." ".$year." ".$month." ".str_replace(","," ", $eventIds));

                // check if selected event combination was calculated before, if so get meta
                $rasterMeta = self::getRasterExtentByEvids($year, $month, $eventIds);

                return $rasterMeta;
            }
        }
    }

    /**
     * returning temperature raster png classified according to col.txt file
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @param mixed $bbox
     */
    public static function getTemperatureRasterData($mode, $year, $month, $eventIds, $bbox)
    {

        // set path and open color file for temperature map
        $modulePath = Yii::$app->getBasePath();
        $colFileLoc = $modulePath."/modules/regmod/data/temperatureMapColors.txt";
        $myfile = fopen($colFileLoc, "r") or die("Unable to open file!");

        if($mode == 'all_data'){

            $sql= self::getRasterDataByYearMonth($year, $month, $myfile, $colFileLoc);

        } elseif($mode == 'all_data_simple'){

            $sql= self::getRasterDataByYearMonth($year, $month, $myfile, $colFileLoc, $mode='browse_mode');

        } elseif($mode == 'select_data'){

            $sql = self::getRasterDataByEvids($year, $month, $myfile, $colFileLoc, $eventIds);

        } elseif($mode == 'bbox_data'){

            // checks if through bounding box selected events and all available events are the same
            $bboxEvids = BboxIsAllEvids::areBboxEventsAllEvents($year, $month, $bbox);

            if(!$bboxEvids){

                $sql= self::getRasterDataByYearMonth($year, $month, $myfile, $colFileLoc);

            } else {

                $sql = self::getRasterDataByEvids($year, $month, $myfile, $colFileLoc, $bboxEvids, true);

            }
        }

        fclose($myfile);

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if (!$query) return;

        return $query["st_aspng"];
    }

    /**
     * returning regression raster png classified from blue to red
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     * @param mixed $bbox
     */
    public static function getTRegressionRasterData($mode, $year, $month, $eventIds, $bbox)
    {

        if($mode == "all_data"){

            $sql= self::getTRegressionDataByYearMonth($year, $month);

        } elseif($mode == "select_data"){

            $sql = self::getTRegressionDataByEvids($year, $month, $eventIds);

        } elseif($mode == "bbox_data"){


            // check if all available events for month are within bounding box, if not return event ids in bbox
            $bboxEvids = BboxIsAllEvids::areBboxEventsAllEvents($year, $month, $bbox);
            if(!$bboxEvids){

                $sql= self::getTRegressionDataByYearMonth($year, $month);

            } else {

                $sql = self::getTRegressionDataByEvids($year, $month, $bboxEvids);

            }
        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if ($query === false) return;

        return $query["st_aspng"];
    }

    /**
     * returning cru monthly mean temperature raster png classified according to col.txt file
     *
     * @param mixed $month
     */
    public static function getTemperatureNoRasterData($month)
    {

        // set path and open color files for temperature map
        $modulePath = Yii::$app->getBasePath();
        $colFileLoc = $modulePath."/modules/regmod/data/temperatureMapColors.txt";
        $myfile = fopen($colFileLoc, "r") or die("Unable to open file!");

        $sql = "
        SELECT 
        ST_AsPNG(
        ST_ColorMap(
        ST_TRANSFORM(
        rast,3857),'".fread($myfile,filesize($colFileLoc))."'
        )              
        ) 
        FROM regmod.temperature_cru_mean WHERE month = ".$month.";"
        ;

        fclose($myfile);

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if ($query === false) return;

        return $query["st_aspng"];
    }

}
?>