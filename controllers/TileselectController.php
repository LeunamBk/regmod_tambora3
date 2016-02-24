<?php 
/**
* TileselectController provides the data for the tile based select menu
* 
* @author    Manuel Beck <manuelbeck@outlook.com>
* @copyright 2015 Geographie University of Freiburg
* @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html 
*/
namespace app\modules\regmod\controllers;

use Yii;
use app\modules\regmod\models\TileSelect;
use app\modules\regmod\utils\TileselectAggregate;
use app\controllers\ControllerBase;  


class TileselectController extends ControllerBase
{

    //TODO: Check where to set response header, cause tiles data is loaded in actionIndex;
    // if response header JSON set there whole page is json
    /**
    * provides the data for the tile select menu
    * 
    * @param mixed $mode
    * @param mixed $bbox
    */
    public function actionTiles($mode='all_data', $bbox = NULL)
    {
        $bbox = json_decode($bbox, true);
        $tileSelectData = TileSelect::getTileSelectData($mode, $bbox);
        $tilesData = TileselectAggregate::aggregateTilesdata($tileSelectData);

        //Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return $tilesData;
    }
}
