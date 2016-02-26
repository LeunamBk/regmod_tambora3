<?php

/**
 * Functions for spatial selection overview
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */


namespace app\modules\regmod\models;
use app\modules\regmod\utils\RasterExtent;

use Yii;
use PDO;


class ByRegion {

    /**
     * returns bounding box coordinates of total data availability
     * by rastercell overview raster
     *
     * @param mixed $mode
     * @param mixed $bbox
     */
    public static function getOverviewExtent($mode, $bbox, $yearStart, $yearEnd)
    {

        if($mode == 'all_data'){

            $sql = "SELECT (ST_MetaData(ST_Union(rast,'COUNT'))).*
                    FROM regmod.temperature_monthly_recon;";

        } elseif($mode == 'bbox_data'){

            $sql = "SELECT (ST_MetaData(ST_Union(AA.rast,'COUNT'))).*
                    FROM regmod.temperature_monthly_recon_single AS AA 
                        INNER JOIN
                            events_timespace AS BB ON
                            AA.event_id = BB.event_id 
                    WHERE ST_Intersects(BB.geog_point,
                                ST_MakeEnvelope(
                                    ".$bbox[0]['lon'].",
                                    ".$bbox[0]['lat'].",
                                    ".$bbox[2]['lon'].",
                                    ".$bbox[1]['lat'].",
                                    4326
                                    )
                                );";

        } elseif($mode == 'timeframe_data') {

            $sql ="SELECT (ST_MetaData(ST_Union(rast,'COUNT'))).*
                    FROM regmod.temperature_monthly_recon
                    WHERE year >= ".(int)$yearStart." AND year <= ".(int)$yearEnd.";";

        }

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if ($query === false) return;

        // calculate raster bounding box coordinates
        $rasterExtent =  RasterExtent::getRasterExtent($query);

        return compact('rasterExtent');
    }

    /**
     * returns blue to red classified png of available data per rastercell
     *
     * @param mixed $mode
     * @param mixed $bbox
     */
    public static function getOverview($mode, $bbox, $yearStart, $yearEnd)
    {

        if($mode == 'all_data'){
/*
            $sql = "SELECT 
                        ST_AsPNG(ST_ColorMap(
                            ST_SetBandNoDataValue(
                                ST_Transform(
                                    ST_Union(rast,'COUNT')
                                ,3857)
                            ,0)
                        ,'bluered'))
                    FROM regmod.temperature_monthly_recon;";
*/
            $sql = "SELECT
                        ST_AsPNG(ST_ColorMap(
                            ST_SetBandNoDataValue(
                                ST_TRANSFORM(
                                    ST_Union(f.rast, 'MAX'),3857)
                                ,0)
                              ,'bluered'))
                        FROM (SELECT ST_Union(rast,'COUNT') AS rast
                        FROM regmod.temperature_monthly_recon
                        UNION ALL
                        SELECT st_makeemptyraster(rast) FROM regmod.temperature_cru_mean WHERE month = 1) AS f;";

        } elseif($mode == 'bbox_data'){
/*
            $sql = "SELECT
                        ST_AsPNG(ST_ColorMap(
                            ST_SetBandNoDataValue(
                              ST_Transform(
                                ST_Union(AA.rast,'COUNT')
                                  ,3857)
                            ,0)
                        ,'bluered'))
                    FROM regmod.temperature_monthly_recon_single AS AA 
                        INNER JOIN
                            events_timespace AS BB ON
                                AA.event_id = BB.event_id 
                    WHERE ST_Intersects(BB.geog_point,
                                ST_MakeEnvelope(
                                    ".$bbox[0]['lon'].",
                                    ".$bbox[0]['lat'].",
                                    ".$bbox[2]['lon'].",
                                    ".$bbox[1]['lat'].", 
                                    4326
                                )
                    );";
*/

  $sql = "SELECT
                        ST_AsPNG(ST_ColorMap(
                            ST_SetBandNoDataValue(
                                ST_TRANSFORM(
                                    ST_Union(f.rast, 'MAX'),3857)
                                ,0)
                              ,'bluered'))
                        FROM (SELECT ST_Union(rast,'COUNT') AS rast
                    FROM regmod.temperature_monthly_recon_single AS AA
                        INNER JOIN
                            events_timespace AS BB ON
                                AA.event_id = BB.event_id
                    WHERE ST_Intersects(BB.geog_point,
                                ST_MakeEnvelope(
                                    ".$bbox[0]['lon'].",
                                    ".$bbox[0]['lat'].",
                                    ".$bbox[2]['lon'].",
                                    ".$bbox[1]['lat'].",
                                    4326
                                )
                    )
                                            UNION ALL
                        SELECT st_makeemptyraster(rast) FROM regmod.temperature_cru_mean WHERE month = 1) AS f;";

        } elseif($mode == 'timeframe_data') {

            $sql = "SELECT
                        ST_AsPNG(ST_ColorMap(
                            ST_SetBandNoDataValue(
                                ST_Transform(
                                    ST_Union(rast,'COUNT')
                                ,3857)
                            ,0)
                        ,'bluered'))
                    FROM regmod.temperature_monthly_recon
                    WHERE year >= ".(int)$yearStart." AND year <= ".(int)$yearEnd.";";


        }


        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryOne();

        if ($query === false) return;

        return $query["st_aspng"];

    }

    /**
     * return events grouped by location
     *
     * @param mixed $mode
     * @param mixed $bbox
     */
    public static function getEvents($mode, $bbox)
    {

        if($mode == 'all_data'){

            $sql = "SELECT AA.location_name AS location, AA.longitude AS lon, AA.latitude AS lat, count(*)
                    FROM events_timespace as AA
                        INNER JOIN 
                            regmod.temperature_monthly_regio_weight as BB ON 
                                AA.event_id = BB.event_id
                    GROUP BY location, lon, lat
                    ORDER BY count(*);";


            $sql = "SELECT AA.location_name AS location, AA.longitude AS lon, AA.latitude AS lat, AA.year, AA.month
                    FROM events_timespace as AA
                        INNER JOIN
                            regmod.temperature_monthly_regio_weight as BB ON
                                AA.event_id = BB.event_id
                   ;";




            $command = Yii::$app->db->createCommand($sql);
            $query = $command->queryAll();

            return $query;

        } elseif($mode == 'bbox_data'){

            $sql = "SELECT AA.location_name AS location, AA.longitude AS lon, AA.latitude AS lat, count(*)
                    FROM events_timespace as AA
                        WHERE ST_INTERSECTS(AA.geog_point,
                                    ST_MakeEnvelope(
                                        ".$bbox[0]['lon'].",
                                        ".$bbox[0]['lat'].",
                                        ".$bbox[2]['lon'].",
                                        ".$bbox[1]['lat'].", 
                                        4326
                                        )
                        )
                    GROUP BY location, lon, lat
                    ORDER BY count(*);";

            $command = Yii::$app->db->createCommand($sql);
            $query = $command->queryAll();

            return $query;

        }
    }
}
?>