<?php
/**
* Asset for the regmod info table and textinfo on top of table 
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

namespace app\modules\regmod;
use yii\web\AssetBundle;


class RegmodStatisticsAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/statistics';

    // placing js src includes in the document head
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'css/statistics.css'
    ];
    public $js = [
        'js/statistics.js'
    ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];

}
