<?php

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

class Reconstructor{

    private static function getDsnAttribute($name, $dsn){
        if (preg_match('/' . $name . '=([^;]*)/', $dsn, $match)) {
            return $match[1];
        } else {
            return null;
        }
    }

    private static function getDbCredentials(){

        $db = Yii::$app->getDb();

        $dbName = self::getDsnAttribute('dbname', $db->dsn);
        $dbPort = self::getDsnAttribute('port', $db->dsn);
        $dbUser = $db->username;
        $dbPass = $db->password;

        return compact('dbName', 'dbUser', 'dbPass', 'dbPort');
    }

    /**
     * because number_format also rounds the number, this function is used to only
     * limit the decimals of a number
     *
     * @param $num
     * @param string $sep
     * @param int $sig
     * @return string
     */
    private static function cutDecimals($num, $sig=2, $sep='.'){
        $cut = substr($num, 0, ( (strpos($num, $sep)+1)+$sig ));
        return $cut;
    }

    public function toIdString($eventArray){
        $eventJson = json_decode($eventArray, true);
        $idString = array();
        foreach($eventJson as $value){
            // have to consider bigint is not sortable in postgres so we have to get rid of a fiew numbers
            // => cut second decimal and negate whole number if index is negative -> 3 saved
            $negate = false;
            if($value['index'] < 0){
                $value['index'] = $value['index']*-1;
                $negate = true;
            }
            $id = self::cutDecimals($value['lat'],1).self::cutDecimals($value['lon'],1).$value['index'];
            $id = str_replace('.','',$id);
            $id = str_replace('-','9',$id);
            if($negate){
                $id = $id * -1;
            }
            array_push($idString, $id);
        }
        return implode(',', $idString);
    }

    public function getRasterExtentById($year, $month, $eventData){

        $eventIdString = self::toIdString($eventData);

        $sql = "SELECT (ST_MetaData(rast)).* , (ST_summarystats(rast)).min,
        (ST_summarystats(rast)).max
        FROM regmod.temperature_monthly_reconstructor_evaluation
        WHERE  year = ".$year." AND month = ".$month."
        AND uniq(sort(id_array::int[])) = uniq(sort(array[".$eventIdString."]));";

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

    public function getRasterDataById($year, $month, $eventData)
    {

        // set path and open color file for temperature map
        $modulePath = Yii::$app->getBasePath();
        $colFileLoc = $modulePath."/modules/regmod/data/temperatureMapColors.txt";
        $myfile = fopen($colFileLoc, "r") or die("Unable to open file!");

        $eventIdString = self::toIdString($eventData);

        $sql = "SELECT
                        ST_AsPNG(
                        ST_ColorMap(
                        ST_TRANSFORM(
                        ST_Union(f.rast, 'MAX'),3857)
                        ,'" . fread($myfile, filesize($colFileLoc)) . "'))
                        FROM (SELECT rast
                        FROM regmod.temperature_monthly_reconstructor_evaluation
                        WHERE year = " . $year . " AND month = " . $month . "
                        AND uniq(sort(id_array::int[])) = uniq(sort(array[".$eventIdString."]))
                        UNION ALL
                        SELECT st_makeemptyraster(rast) FROM regmod.temperature_cru_mean WHERE month = 1) AS f;";

        fclose($myfile);

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if (!$query) return;

        return $query["st_aspng"];

    }


    public function getTRegressionDataById($year, $month, $eventData){

        $eventIdString = self::toIdString($eventData);

        $sql = "SELECT ST_AsPNG(
        ST_ColorMap(ST_TRANSFORM(ST_Union(f.rast, 'MAX'),3857),'bluered'))
        FROM (SELECT ST_UNION(rast,'MAX') AS rast
        FROM regmod.temperature_monthly_reconstructor_evaluation_regression
         WHERE year = '$year' AND month = '$month'
                        AND uniq(sort(id_array::int[])) = uniq(sort(array[".$eventIdString."]))
        UNION ALL
        SELECT ST_MAKEEMPTYRASTER(rast) AS rast
        FROM regmod.temperature_cru_mean
        WHERE month=1) AS f
        ";

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if (!$query) return;

        return $query["st_aspng"];

    }

    /**
     * get db credentials for exec commands
     *
     * @param mixed $name
     * @param mixed $dsn
     */
    public function reconstructData($year, $month, $eventData){

        // check if already reconstructed 
        $rasterMeta = self::getRasterExtentById($year, $month, $eventData);

        if(!$rasterMeta) {
            $modulePath = Yii::$app->getBasePath();
            $reconstructPython = $modulePath . "/modules/regmod/assets/reconstructor/regmodPy/main.py";
            $tiffDataPath = $modulePath . "/data/regmod/tiff/liveTmp.tif";
            $reanalysisDataPath = $modulePath."/modules/regmod/data/CRU/cru_ts3.tmp.nc";
            $dbCred = self::getDbCredentials();

            exec("python " . $reconstructPython . " " . $dbCred['dbName'] . " " . $dbCred['dbPort'] . " " . $dbCred['dbUser'] . " " . $dbCred['dbPass'] . " " . $tiffDataPath . " " .$reanalysisDataPath. " " . json_encode($eventData) . " " . $year . " " . $month);

            // get raster extent of python calculated raster
            $rasterMeta = self::getRasterExtentById($year, $month, $eventData);
        }

        return $rasterMeta;
    }



}
?>
