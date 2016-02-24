<?php
/**
 * Checks if all available events and events selected bay region bounding box
 * are the same
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */
namespace app\modules\regmod\utils;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\models\Dashboard;

class boxplotStatistics {

    /**
     * calculates the statistics for the boxplot plots
     *
     * modified from:
     * http://stackoverflow.com/questions/19210066/how-do-i-get-box-plot-key-numbers-from-an-array-in-php
     * @param mixed $query
     */
    private static function box_plot_values($array)
    {
        $return = array(
            'min'            => 0,
            'q1'             => 0,
            'median'         => 0,
            'q3'             => 0,
            'max'            => 0,
            'outliers'       => array(),
        );

        $array_count = count($array);
        sort($array, SORT_NUMERIC);

        $return['min']            = $array[0];
        $return['max']            = $array[$array_count - 1];
        $middle_index             = floor($array_count / 2);
        $return['median']         = $array[$middle_index]; // Assume an odd # of items
        $lower_values             = array();
        $higher_values            = array();

        // If we have an even number of values, we need some special rules
        if ($array_count % 2 == 0)
        {
            // Handle the even case by averaging the middle 2 items
            $return['median'] = round(($return['median'] + $array[$middle_index - 1]) / 2);

            foreach ($array as $idx => $value)
            {
                if ($idx < ($middle_index - 1)) $lower_values[]  = $value; // We need to remove both of the values we used for the median from the lower values
                elseif ($idx > $middle_index)   $higher_values[] = $value;
            }
        }
        else
        {
            foreach ($array as $idx => $value)
            {
                if ($idx < $middle_index)     $lower_values[]  = $value;
                elseif ($idx > $middle_index) $higher_values[] = $value;
            }
        }

        $lower_values_count = count($lower_values);
        $lower_middle_index = floor($lower_values_count / 2);
        $return['q1']       = $lower_values[$lower_middle_index];
        if ($lower_values_count % 2 == 0)
            $return['q1'] = round(($return['q1'] + $lower_values[$lower_middle_index - 1]) / 2);

        $higher_values_count = count($higher_values);
        $higher_middle_index = floor($higher_values_count / 2);
        $return['q3']        = $higher_values[$higher_middle_index];
        if ($higher_values_count % 2 == 0)
            $return['q3'] = round(($return['q3'] + $higher_values[$higher_middle_index - 1]) / 2);

        // Check if min and max should be capped
        $iqr = $return['q3'] - $return['q1']; // Calculate the Inner Quartile Range (iqr)

        $return['min'] = $return['q1'] - 1.5*$iqr; // This ( q1 - 1.5*IQR ) is actually the lower bound,
        // We must compare every value in the lower half to this.
        // Those less than the bound are outliers, whereas
        // The least one that greater than this bound is the 'min'
        // for the boxplot.
        foreach( $lower_values as  $idx => $value )
        {
            if( $value < $return['min'] )  // when values are less than the bound
            {
                $return['outliers'][$idx] = $value ; // keep the index here seems unnecessary
                // but those who are interested in which values are outliers
                // can take advantage of this and asort to identify the outliers
            }else
            {
                $return['min'] = $value; // when values that greater than the bound
                break;  // we should break the loop to keep the 'min' as the least that greater than the bound
            }
        }

        $return['max'] = $return['q3'] + 1.5*$iqr; // This ( q3 + 1.5*IQR ) is the same as previous.
        foreach( array_reverse($higher_values) as  $idx => $value )
        {
            if( $value > $return['max'] )
            {
                $return['outliers'][$idx] = $value ;
            }else
            {
                $return['max'] = $value;
                break;
            }
        }

        // two decimals
        foreach($return as $key => $value){
            if($key != 'outliers') {
                $return[$key] = round($value, 2);
            }
        }

        return $return;
    }

    private static function aggregateForBoxplot($data){

        $boxplotData = array();
        foreach($data as $row) {
            $key = $row[0];
            $value = $row[1];
            // aggregate data for boxplot statistics
            if (array_key_exists($key, $boxplotData)) {
                array_push($boxplotData[$key], $value);
            } else {
                $boxplotData[$key] = array($value);
            }
        }

        return $boxplotData;

    }

    public static function getBoxplotStatistics($array){

        $array = self::aggregateForBoxplot($array);

        $boxplotStatsByIdx = array();
        foreach($array as $key => $idxClassArray){
            //boxplot only data with more than 5 events
            if(sizeof($idxClassArray)>5) {
                $boxplotStatsByIdx[$key] = self::box_plot_values($idxClassArray, $key);
            }
        }

        return $boxplotStatsByIdx;
    }
}
?>