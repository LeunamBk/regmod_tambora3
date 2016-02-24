<?php
/**
* DefaultController provides the regmod view and the tile select menu data 
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/

namespace app\modules\regmod\controllers;
use Yii;
use app\modules\regmod\models\TileSelect;
use app\modules\regmod\utils\TileselectAggregate;
use yii\web\Controller;

class MyController extends Controller
{
    // set page onload function to initialize javascript functions 
    // at the right time; here populate tile menu with tiles data
    public $onloadFunction='getAdvancedMenu1();';
}

class DefaultController extends MyController
{

    public function actionIndex()
    {
        // get data for select menu
        $tileSelectData = TileSelect::getTileSelectData($mode='all_data', $bbox=NULL);

        // aggregate data to century/decade/year/month
        $tilesData = TileselectAggregate::aggregateTilesdata($tileSelectData);

        return $this->render('regmod', 
            array('tileSelectData' => $tilesData)
        );
    }

}