<?php 
/**
* TableController provides the data for the info table and inline statistics
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

namespace app\modules\regmod\controllers;
use Yii;
use app\modules\regmod\models\Statistics;
use app\controllers\ControllerBase;  


class TableController extends ControllerBase
{
    /**
    * provides statistics data for the info table for every event
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    */
    public function actionStatistics($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498')
    {
        $cruStats = Statistics::getCruStats($mode, $year, $month, $eventIds);
        $ghcnmStats = Statistics::getGhcnmStats($mode, $year, $month, $eventIds);
       
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return compact('cruStats', 'ghcnmStats');
    }

    /**
    * provides the inline statistics for selected data
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $bbox
    */
    public function actionInlinestats($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $bbox=NULL)
    {
        $bbox = json_decode($bbox, true);
        $cruStats = Statistics::getInlineCruStats($mode, $year, $month, $eventIds, $bbox);
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
       
        if($mode == 'select_data'){
            $ghcnmStats = Statistics::getInlineGhcnmStats($mode, $year, $month, $eventIds);
            return compact('cruStats', 'ghcnmStats');
        }

        return compact('cruStats');
    }

    public function actionCoveragestats($mode = 'all_data', $bbox=NULL)
    {
        $covStats = Statistics::getCoverageStats();

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $covStats;

    }
           
}
