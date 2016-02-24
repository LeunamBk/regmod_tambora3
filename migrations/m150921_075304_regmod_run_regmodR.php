<?php

use yii\db\Schema;
use yii\db\Migration;
// get create table commands for regmod

class m150921_075304_regmod_run_regmodR extends Migration
{

    private static function getDbCredentials(){

        $db = Yii::$app->getDb();

        $dbName = self::getDsnAttribute('dbname', $db->dsn);
        $dbPort = self::getDsnAttribute('port', $db->dsn);
        $dbUser = $db->username;
        $dbPass = $db->password;

        return compact('dbName', 'dbUser', 'dbPass', 'dbPort');
    }

    private static function getDsnAttribute($name, $dsn){
        if (preg_match('/' . $name . '=([^;]*)/', $dsn, $match)) {
            return $match[1];
        } else {
            return null;
        }
    }

    public function Up()
    {
        $modulePath = Yii::$app->getBasePath();
        $regmodR = $modulePath."/modules/regmod/assets/R/regmodR/R/regmod/";
        $regmodRLogTmp = $modulePath."/data/regmod/log/mapCreateLogTmp.txt";
        $regmodRLog = $modulePath."/data/regmod/log/mapCreateLog.txt";
        $tiffDataPath = $modulePath."/data/regmod/tiff";
        $reanalysisDataPath = $modulePath."/modules/regmod/data/CRU/cru_ts3.tmp.nc";
        $dbCred = self::getDbCredentials();
                                                                     
        echo  'running regmodR may take a while...';
        $start = microtime(true);

        # run regmod
        passthru('Rscript '.$regmodR.'mainCL.R '.$regmodR.' '.$dbCred['dbName'].' '.$dbCred['dbPort'].' '.$dbCred['dbUser'].' '.$dbCred['dbPass'].' '.$tiffDataPath.' '.$reanalysisDataPath.' | tee '.$regmodRLogTmp);
        $time_elapsed_secs = microtime(true) - $start;
        echo 'Execution time: '.$time_elapsed_secs; 

        # create 'clean' log
        exec('cat '.$regmodRLogTmp.' | grep -i -e SOURCEDATE -i -e ERROR -i -e WARNING -i -e Fehler -i -e debug -i -e EXEC -i -e MeanTemp>> '.$regmodRLog);
        exec('echo >> '.$regmodRLog);
        exec('echo Execution time: '.$time_elapsed_secs.' >> '.$regmodRLog);

    }

    public function safeDown()
    {
        $this->execute('DELETE FROM regmod.temperature_monthly_regio_idxrec;');     
        $this->execute('DELETE FROM regmod.temperature_monthly_regio_weight;');     
        $this->execute('DELETE FROM regmod.temperature_monthly_recon_single;');     
        $this->execute('DELETE FROM regmod.temperature_monthly_recon_live;'); 
        $this->execute('DELETE FROM regmod.temperature_monthly_recon;');     
    }

}
