<?php

namespace app\modules\regmod\controllers;

use Yii;
use app\modules\regmod\models\Updater;
use app\controllers\ControllerBase;


class UpdateController extends ControllerBase
{

    public function actionUpdateapp()
    {

        // only update if migrations are finished
        if(Updater::checkIfMigrationsFinished()) {

            // get events wich has changed or are new
            $updateDateArray = Updater::checkForUpdatedData();

            Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

            if ($updateDateArray) {

                // delete existing reconstructed model data for updated events
                Updater::deleteModelData($updateDateArray);

                // calculate model data for updated events
                Updater::reconstructUpdate($updateDateArray['dateArray']);

                // calculate statistics for updated events
                Updater::statisticsUpdate($updateDateArray['dates']);

                return true;

            }
        }

        return false;

    }
}

