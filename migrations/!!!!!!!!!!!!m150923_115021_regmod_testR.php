<?php

use yii\db\Schema;
use yii\db\Migration;

class m150923_115021_regmod_testR extends Migration
{
    public function up()
    {
        $regmodR = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/";
        $regmodRLogTmp = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/log/mapCreateLogTmp.txt";
        $regmodRLog = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/log/mapCreateLog.txt";

        echo  'running regmodR may take a while...\n';
        $start = microtime(true);
        # run regmod
        passthru('Rscript '.$regmodR.'mainCL.R '.$regmodR.' 1740 11');
        $time_elapsed_secs = microtime(true) - $start;
        echo 'Execution time: '.$time_elapsed_secs; 

    }                    
    public function down()
    {
        $regmodR = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/";
        $regmodRLogTmp = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/log/mapCreateLogTmp.txt";
        $regmodRLog = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/regmod/log/mapCreateLog.txt";

        echo  'running regmodR may take a while...\n';
        $start = microtime(true);
        # run regmod
        passthru('Rscript '.$regmodR.'mainCL.R '.$regmodR);
        $time_elapsed_secs = microtime(true) - $start;
        echo 'Execution time: '.$time_elapsed_secs; 
        echo "m150923_115021_regmod_testR cannot be reverted.\n";

        return false;
    }

    /*
    // Use safeUp/safeDown to run migration code within a transaction
    public function safeUp()
    {
    }

    public function safeDown()
    {
    }
    */
}
