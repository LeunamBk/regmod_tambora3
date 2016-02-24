<?php 
/**
* TimelineController provides the data for the timeline
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\controllers;

use Yii;
use app\modules\regmod\models\Timeline;
use app\controllers\ControllerBase;  


class TimelineController extends ControllerBase
{
    // TODO: Check if mode is neccessary hear ore obsolete because of event_ids
    /**
    * provides the data for the timeline
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public function actionTimeline($mode = 'all_data', $bbox = NULL)
    {
        $bbox = json_decode($bbox, true);
        $timelineData = Timeline::getTimelineData($mode, $bbox);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $timelineData;
    }

}
