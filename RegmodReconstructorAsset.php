<?php
/**
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @copyright 2015 Geographie University of Freiburg
 * @licence http://creativecommons.org/licenses/by/4.0/
 */


namespace app\modules\regmod;
use yii\web\AssetBundle;
use yii\base\Widget;

/**
 * Class Reconstructor Assets
 * @author Manuel Beck <manuelbeck@outlook.com>
 * @since 2.0
 *
 * This class holds the assets for the live
 * reconstructor part of the regmod module.
 */

class RegmodReconstructorAsset extends AssetBundle
{
    public $sourcePath = '@app/modules/regmod/assets/reconstructor';

    // placing js src includes in the document head
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];

    public $css = [
        'css/reconstructor.css',

    ];
    public $js = [
        'js/reconstructor.js',
        'js/jquery.geocomplete.min.js'
    ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];

}
