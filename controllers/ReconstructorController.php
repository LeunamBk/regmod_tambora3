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
use app\controllers\ControllerBase;
use app\modules\regmod\models\Reconstructor;


class ReconstructorController extends ControllerBase
{

    /**
     * provides statistics data for the info table for every event
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     */
    public function actionTamboraevents($mode='all_data', $year=1740, $month=1, $eventIds='171488,172498')
    {
        $cruStats = Statistics::getCruStats($mode, $year, $month, $eventIds);
        $ghcnmStats = Statistics::getGhcnmStats($mode, $year, $month, $eventIds);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return compact('cruStats', 'ghcnmStats');
    }

    /**
     * provides statistics data for the info table for every event
     *
     * @param mixed $mode
     * @param mixed $year
     * @param mixed $month
     * @param mixed $eventIds
     */
    public function actionReconstruct($year=1740, $month=1, $eventIdString='171488,172498')
    {
        $extend = Reconstructor::reconstructData($year, $month, $eventIdString);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $extend;
    }

    public function actionReconstructeddata($year=1740, $month=1, $eventIdString='171488,172498')
    {
        $data = Reconstructor::getRasterDataById($year, $month, $eventIdString);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';

        return $data;
    }

    public function actionReconstructedextent($year=1740, $month=1, $eventIdString='171488,172498')
    {
        self::actionReconstruct($year, $month, $eventIdString);

        $extent = Reconstructor::getRasterExtentById($year, $month, $eventIdString);

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $extent;
    }

    public function actionReconstructedregresdata($year=1740, $month=1, $eventIdString='171488,172498')
    {
        $data = Reconstructor::getTRegressionDataById($year, $month, $eventIdString);

        // set header response type to png and define stream output method
        Yii::$app->response->format = 'pgraster';

        return $data;
    }





}
