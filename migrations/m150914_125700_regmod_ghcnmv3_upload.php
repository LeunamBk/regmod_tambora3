<?php

use yii\db\Schema;
use yii\db\Migration;

class m150914_125700_regmod_ghcnmv3_upload extends Migration
{

    /**
    * get db credentials for exec commands
    * $db = Yii::$app->getDb();
    * $dbName = $this->getDsnAttribute('dbname', $db->dsn);
    * $db->password;
    * $db->username;
    * @param mixed $name
    * @param mixed $dsn
    */
    private function getDsnAttribute($name, $dsn)
    {
        if (preg_match('/' . $name . '=([^;]*)/', $dsn, $match)) {
            return $match[1];
        } else {
            return null;
        }
    }

    public function up()
    {

        //$this->execute('CREATE TABLE regmod.temperature_validation_stations();');
        //$this->execute('CREATE TABLE regmod.temperature_validation_data();');
       
        $db = Yii::$app->getDb();
        $dbName = $this->getDsnAttribute('dbname', $db->dsn);
        $dbPort = $this->getDsnAttribute('port', $db->dsn);
        $ghcnDataPath = Yii::$app->getBasePath()."/data/regmod/ghcn";
        $modulePath = Yii::$app->getBasePath()."/modules/regmod/assets/R/regmodR/R/ghcnV3_parser/";
        
        $ghcnmUpload = $modulePath."main.R localhost ".$db->username." ".$db->password." ".$dbName." ".$dbPort." ".$modulePath." ".$ghcnDataPath;

        # populate cru tables with data
        exec('Rscript '.$ghcnmUpload);


    }

    public function safeDown()
    {
        $this->execute('DROP TABLE IF EXISTS regmod.temperature_validation_stations;');
        $this->execute('DROP TABLE IF EXISTS regmod.temperature_validation_data;');
    
        // return false;
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
