<?php

use yii\db\Schema;
use yii\db\Migration;

class m150914_125646_regmod_cru_upload extends Migration
{

    private static function getTables(){
        return require __DIR__ . '/regmodTables/cruTables.php'; 
    }

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

        foreach($this->getTables() as $table) {
            $this->execute($table);
        }
        
        $modulePath = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/";
        $wdPath = $modulePath."regmod";
        $cruUpload = $modulePath."cruGenerator.R";
        $tiffDataPath = Yii::$app->getBasePath()."/data/regmod/tiff";
        $reanalysisDataPath = Yii::$app->getBasePath()."/modules/regmod/data/CRU/cru_ts3.tmp.nc";
        $dbCred = self::getDbCredentials();
        
        # populate cru tables with data
        passthru('Rscript '.$cruUpload.' '.$wdPath.' '.$dbCred['dbName'].' '.$dbCred['dbPort'].' '.$dbCred['dbUser'].' '.$dbCred['dbPass'].' '.$tiffDataPath.' '.$reanalysisDataPath);

    }

    public function safeDown()
    {
        foreach($this->getTables() as $tableName => $table) {
            echo $tableName;
            $this->execute('DROP TABLE IF EXISTS regmod.'.$tableName.' ;');     
        }

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
