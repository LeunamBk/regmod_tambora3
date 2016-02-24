<?php
/**
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @copyright 2015 Geographie University of Freiburg
 * @licence http://creativecommons.org/licenses/by/4.0/
 */


namespace app\modules\regmod\widgets\dashboards;

use yii\base\Widget;

/**
 * Class Dashboard Widget
 * @author Manuel Beck <manuelbeck@outlook.com>
 * @since 2.0
 *
 * This class holds the markup and js for the dashboard.
 *
*/

class DashboardWidget extends Widget
{
    public function run()
    {
        return $this->render('dashboard');
    }

}

?>