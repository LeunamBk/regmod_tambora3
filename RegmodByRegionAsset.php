<?php
/**
* Asset for spatial selections in regmod 
*
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
*/

namespace app\modules\regmod;
use yii\web\AssetBundle;


class RegmodByRegionAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/selectByRegion';    

    // placing js src includes in the document head
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'js/leaflet.draw/dist/leaflet.draw.css',
    ];
    public $js = [
        'js/mapByAreaView.js',
        'js/leaflet.draw/src/Leaflet.draw.js',
    ];
    public $depends = [
        'app\modules\libraries\bundles\LeafletAsset',
        'yii\web\JqueryAsset',
    ];

}
