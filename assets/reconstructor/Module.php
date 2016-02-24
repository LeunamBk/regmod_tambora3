<?php
/**
 * MapModule creates an area for timeline handling
 *
 * @author    Michael Kahle <michael.kahle@ub.uni-freiburg.de>
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
 */

namespace app\modules\_example;

class ExampleModule extends \yii\base\Module {
  
  private $_assetsUrl;

  public function init() {
    parent::init();
    // this method is called when the module is being created
		// you may place code here to customize the module or the application

		// import the module-level models and components
		/*$this->setImport(array(
			'explore.models.*',
			'explore.components.*',
		));*/
  }  
}
