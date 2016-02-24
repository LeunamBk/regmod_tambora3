<?php
/**
* Asset for the regmod navigation menu based tiles colored by data availability
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

namespace app\modules\regmod;
use yii\web\AssetBundle;

class RegmodTileSelectAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/tileSelect';    

    // placing js src includes in the document head
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'css/tileSelect.css',
        'css/insights.css',
    ];
    public $js = [
        'js/tileSelect.js',
        // checks for browser and version, raises flag if to old 
        'js/insights.js',
    ];
    public $depends = [
        'app\modules\libraries\bundles\D3Asset',
        'yii\web\JqueryAsset',
    ];

}
