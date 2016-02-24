<?php
/**
 * TimelineAsset creates an area for timeline handling
 *
 * @author    Michael Kahle <michael.kahle@ub.uni-freiburg.de>
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
 */

namespace app\modules\_example;
use yii\web\AssetBundle;

class ExampleAsset extends AssetBundle
{
    //public $basePath = '@app/module/timeline/assets'; // will be replaced by publish soon
    //public $baseUrl = '@app/module/timeline/assets';  // will be replaced by publish soon
    public $sourcePath = '@app/modules/_example/assets';    
    
    public $css = [
        'css/example.css',
    ];
    public $js = [
        'js/example.js',
        'ng/exampleController.js'
    ];
    public $depends = [
        'app\assets\TamboraAsset',
        'app\modules\libraries\bundles\AngularAsset',
        'app\modules\libraries\bundles\LeafletAsset',
        'app\modules\libraries\bundles\D3Asset',
        //'yii\web\JqueryAsset',
    ];
    
}
