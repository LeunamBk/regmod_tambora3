<?php
/**
* RegionController provides the data for the select by region total data overview
* 
* @author Manuel Beck <manuelbeck@outlook.com.de> 
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\controllers;

use Yii;
use app\controllers\ControllerBase;
use app\modules\regmod\models\ByRegion;

use yii\helpers\Html;
use yii\helpers\Url;


class RegionController extends ControllerBase
{
    /**
    * provides the bounding box coordinates of png file for leaflet
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public function actionOverviewextent($mode = 'all_data', $bbox = NULL, $yearStart = NULL, $yearEnd = NULL)
    {
        $bbox = json_decode($bbox, true);
        $overviewExtent = ByRegion::getOverviewExtent($mode, $bbox, $yearStart, $yearEnd);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $overviewExtent;
    }

    /**
    * provides the total data by raster cell png 
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public function actionOverview($mode = 'all_data', $bbox=NULL, $yearStart = NULL, $yearEnd = NULL)
    {
        $bbox = json_decode($bbox, true);
        $overviewData = ByRegion::getOverview($mode, $bbox, $yearStart, $yearEnd);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';
        return $overviewData;
    }

    /**
    * provides the events grouped by lat lon
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public function actionEvents($mode = 'all_data', $bbox=NULL)
    {
        $bbox = json_decode($bbox, true);
        $eventData = ByRegion::getEvents($mode, $bbox);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $eventData;
    }

}