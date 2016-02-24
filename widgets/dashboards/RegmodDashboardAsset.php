<?php
/**
 * Asset for regmod map visualization and general styling of the application
 *
 * @author    Manuel Beck <manuelbeck@outlook.com>
 * @copyright 2015 Geographie University of Freiburg
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

namespace app\modules\regmod\widgets\dashboards;
use yii\web\AssetBundle;


class RegmodDashboardAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/widgets/dashboards/assets';

    // placing js src includes in the document head
    # public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'css/dashboard.css'

    ];
    public $js = [
        'js/highcharts.js',
        'js/highcharts-more.js',
        'js/exporting.js',
        'js/dashboard.js'
    ];
    public $depends = [
        'yii\web\JqueryAsset'
    ];

}
