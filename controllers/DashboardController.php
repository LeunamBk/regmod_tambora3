<?php
/**
 * DashboardController
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

namespace app\modules\regmod\controllers;

use Yii;
use yii\web\Controller;
use app\modules\regmod\models\Dashboard;


class DashboardController extends Controller
{

    /**
     * provides the summary statistics for the dashboard data view
     *
     * @param mixed $mode
     */
    public function actionDashboard($mode='index_data')
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        if($mode == 'index_data'){

            $plots = Dashboard::getCruByIndex();
            $stats = Dashboard::getCruByIndexStats();
            
            return compact('plots','stats');

        } else if($mode == 'station_data'){
            $dashboardData = Dashboard::getCruStatsByEvids();
            return $dashboardData;
        }

    }

}