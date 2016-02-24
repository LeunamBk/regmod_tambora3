<?php
/**
* Asset for regmod map visualization and general styling of the application
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
*/

namespace app\modules\regmod;
use yii\web\AssetBundle;


class RegmodMainAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/main';    
    
    // placing js src includes in the document head
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'css/styles.css',
        
    ];
    public $js = [
        'js/mapView_opti.js',
        'js/utils.js',
        'js/legend.js',
        'js/geojson.min.js',
        'js/appNavigation.js',
        'js/leafletExtend.js',
    ];
    public $depends = [
        'app\modules\libraries\bundles\LeafletAsset',
        'yii\web\JqueryAsset',
    ];

}
