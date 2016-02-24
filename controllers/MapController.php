<?php 
/**
* MapController provides all the data for the map visualisation
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\controllers;

use Yii;
use app\modules\regmod\models\Statistics;
use app\modules\regmod\models\Indices;
use app\modules\regmod\models\Raster;
use app\modules\regmod\models\Ghcnm;
use app\controllers\ControllerBase;  


class MapController extends ControllerBase
{

    /**
    * provides thermal Indices data for map visualisation
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $bbox
    */
    public function actionIndices($mode='all_data', $year=1740, $month=1, $bbox=NULL)
    {
        $bbox = json_decode($bbox, true);
        $indicesData = Indices::getIndicesData($mode, $year, $month, $bbox);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $indicesData;
    }


    /**
    * provides the temperature png bounding box coordinates for leaflet
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $bbox
    */
    public function actionTemperaturerasterextent($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $bbox=NULL)
    {
        $bbox = json_decode($bbox, true);
        $rasterExtent = Raster::getTemperatureRasterExtent($mode, $year, $month, $eventIds, $bbox);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $rasterExtent;
    }

    /**
    * provides the temperature png
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $bbox
    */
    public function actionTemperaturerasterdata($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $bbox=NULL)
    {
        $bbox = json_decode($bbox, true);
        $rasterData = Raster::getTemperatureRasterData($mode, $year, $month, $eventIds, $bbox);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';

        return $rasterData;
    }

    /**
    * provides the cru mean temperature png for month with no tambora data 
    * 
    * @param mixed $month
    */
    public function actionTemperaturenorasterdata($month=1)
    {           
        $rasterData = Raster::getTemperatureNoRasterData($month);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';
        return $rasterData;
    }

    /**
    * provides correlation map png of every index point with neighbor raster cells 
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $bbox
    */
    public function actionTregressionrasterdata($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $bbox=NULL)
    {           
        $bbox = json_decode($bbox, true);
        $regressionData = Raster::getTRegressionRasterData($mode, $year, $month, $eventIds, $bbox);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';
        return $regressionData;
    }

    /**
    *   provides ghcnmv3 teperature stations data for map visualisation
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $bbox
    */
    public function actionGhcnm($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $bbox=NULL)
    {     
        $bbox = json_decode($bbox, true);
        $ghcnmData = Ghcnm::getGhcnmData($mode, $year, $month, $eventIds, $bbox);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $ghcnmData;
    }                                                 

    /**
    * provides temperature value at mouse click event at lat lon position
    * 
    * @param mixed $mode
    * @param mixed $year
    * @param mixed $month
    * @param mixed $eventIds
    * @param mixed $lat
    * @param mixed $lon
    */
    public function actionLatloninfo($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498', $lat=50.06, $lon=12.83)
    {
        $latLonData = Statistics::getTRasterLatLonInfo($mode, $year, $month, $lat, $lon, $eventIds);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $latLonData;
    }

}
