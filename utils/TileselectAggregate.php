<?php
/**
* Aggregates available data by century,decade,year,month
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\utils;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\models\TileSelect;

use app\modules\translation\models\Language;

class TileselectAggregate {

    public static function aggregateTilesdata($tileSelectData) {

        $lineArray = array();
        $resArray = array();
        foreach($tileSelectData as $cell) {

            // manage output data
            $century = $cell['century'];
            $decade = $cell['decade'];
            $year = $cell['year'];
            $month = $cell['month'];
            $mtc = $cell['mtc'];

            if(empty($resArray[$century])){

                $lineArray = array(
                    $century => array(
                        "count" => $mtc,
                        $decade => array(
                            "count" => $mtc,
                            $year => array(
                                "count" => $mtc,
                                $month => array(
                                    "count" => $mtc 
                                )
                            )
                        )
                    )
                );
                $resArray +=  $lineArray;
            } else if(empty($resArray[$century][$decade])){
                // update if decade not in array

                // update century count
                $resArray[$century]['count'] += $mtc;
                // add new decade entry
                $lineArray = array(
                    $decade => array(
                        "count" => $mtc,
                        $year => array(
                            "count" => $mtc,
                            $month => array(
                                "count" => $mtc 
                            )
                        )
                    )
                );

                $resArray[$century] +=  $lineArray;

            } else if(empty($resArray[$century][$decade][$year])){
                // update century count
                $resArray[$century]['count'] += $mtc;
                // update decade count
                $resArray[$century][$decade]['count'] += $mtc;

                // add new year entry
                $lineArray = array(
                    $year => array(
                        "count" => $mtc,
                        $month => array(
                            "count" => $mtc 
                        )
                    )
                );

                $resArray[$century][$decade] +=  $lineArray;

            } else if(empty($resArray[$century][$decade][$year][$month])){
                // update century count
                $resArray[$century]['count'] += $mtc;
                // update decade count
                $resArray[$century][$decade]['count'] += $mtc;
                // update decade count
                $resArray[$century][$decade][$year]['count'] += $mtc;

                // add new month entry
                $lineArray = array(
                    $month => array(
                        "count" => $mtc 
                    )
                );
                $resArray[$century][$decade][$year] +=  $lineArray;
            }
        }
        return json_encode($resArray);
    }
}
?>