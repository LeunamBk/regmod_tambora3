<?php
/**
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @copyright 2015 Geographie University of Freiburg
 * @licence http://creativecommons.org/licenses/by/4.0/
 */


namespace app\modules\regmod\widgets\reconstructor;

use yii\base\Widget;

/**
 * Class Reconstructor Widget
 * @author Manuel Beck <manuelbeck@outlook.com>
 * @since 2.0
 *
 * This class holds an form for handling input data
 * to the reconstructor Python script.
 */

class ReconstructorformWidget extends Widget
{

    public function run()
    {
        return $this->render('form');
    }

}

?>
