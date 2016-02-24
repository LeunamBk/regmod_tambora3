<?php

use yii\db\Schema;
use yii\db\Migration;
// get create table commands for regmod

class m150914_074847_regmod_init extends Migration
{
    private function getTables(){
        return require __DIR__ . '/regmodTables/regmodTables.php'; 
    }
    
    public function safeUp()
    {
       
        $this->execute('CREATE SCHEMA IF NOT EXISTS regmod');
        $this->execute('CREATE EXTENSION IF NOT EXISTS intarray;');
                               
        foreach($this->getTables() as $table) {
            $this->execute($table);
        }  

    }

    public function safeDown()
    {
    
        foreach($this->getTables() as $tableName => $table) {
            $this->execute('DROP TABLE IF EXISTS regmod.'.$tableName.' ;');     
        }

    }

}
