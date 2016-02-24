<?php

namespace app\modules\regmod\models;              
use app\modules\regmod\utils\TileselectAggregate;


use Yii;
use PDO;

/**
* Functions for the tile based select menu
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

class TileSelect {

    /**
    * returns the total data of every timeframe aggregated by century, decade, year, month
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public static function getTileSelectData($mode, $bbox) 
    {
        
        if($mode == 'all_data'){
            
            $sql = "SELECT
            centuryID*100 as century, decadeID*10 as decade, year, month, sum(event_count) as mtc
            FROM
            (
            SELECT
            trunc(year/100,0) as centuryID,
            trunc(year/10,0) as decadeID
            FROM
            regmod.temperature_monthly_recon
            GROUP BY
            trunc(year/100,0),
            trunc(year/10,0)
            )
            AS lookup
            INNER JOIN
            regmod.temperature_monthly_recon AS data
            ON  data.year >= lookup.centuryID * 100
            AND data.year <  lookup.centuryID * 100 + 100 
            AND data.year >= lookup.decadeID * 10
            AND data.year <  lookup.decadeID * 10 + 10  
            GROUP  BY centuryID,decadeID,year,month
            Order By centuryID,decadeID,year,month
            ;";       

        } elseif($mode == 'bbox_data'){

            $sql="SELECT
            centuryID*100 AS century, decadeID*10 AS decade, 
            lookup.year, lookup.month, count(*) AS mtc
            FROM (
            SELECT
            trunc(year/100,0) AS centuryID,
            trunc(year/10,0) AS decadeID,
            year, month
            FROM
            regmod.temperature_monthly_recon_single AS dataRast
            INNER JOIN
            regmod.tambora_temperature_monthly as dataPoint
            ON dataPoint.event_id = dataRast.event_id
            WHERE ST_INTERSECTS(dataPoint.geom, 
            ST_MakeEnvelope(".$bbox[0]['lon'].",
            ".$bbox[0]['lat'].",".$bbox[2]['lon'].",
            ".$bbox[1]['lat'].", 4326)) 
            ) AS lookup
            WHERE 
            lookup.year >= lookup.centuryID * 100
            AND lookup.year <  lookup.centuryID * 100 + 100 
            AND lookup.year >= lookup.decadeID * 10
            AND lookup.year <  lookup.decadeID * 10 + 10  
            GROUP BY centuryID, decadeID, lookup.year, lookup.month
            ORDER BY centuryID, decadeID, lookup.year, lookup.month;";

        }        

        $command = Yii::$app->db->createCommand($sql);
        $query = $command->queryAll(); 
      
        return $query;    
    }
}
?>