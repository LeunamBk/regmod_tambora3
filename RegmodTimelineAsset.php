<?php
/**
* Asset for the regmod timeline
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

namespace app\modules\regmod;
use yii\web\AssetBundle;

class RegmodTimelineAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/timeline';    

    public $css = [
        'css/tipsy.css',
        'css/styles.css',
    ];
    public $js = [
        'js/tipsy.js',
        'js/timeline.js',
    ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];

}