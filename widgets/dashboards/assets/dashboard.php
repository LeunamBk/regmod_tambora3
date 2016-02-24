<?php

// Show all information, defaults to INFO_ALL
//phpinfo();



/*
* Define PostgreSQL database server connect parameters.
*/            

define('PGHOST','localhost');
define('PGPORT',5432);
define('PGDATABASE','regmod');
define('PGUSER', 'regmod');
define('PGPASSWORD', '36<(CK#DnRe-@CS7');
define('PGCLIENTENCODING','UNICODE');
define('ERROR_ON_CONNECT_FAILED','Sorry, can not connect the database server now!');

/*
* Merge connect string and connect db server with default parameters.
*/

$fyear = $_GET['year'];
$fmonth = $_GET['month'];
$fmode = $_GET['mode'];


$dbconn = pg_connect('host=' . PGHOST . ' port=' . PGPORT . ' dbname=' . PGDATABASE . ' user=' . PGUSER . ' password=' . PGPASSWORD)  or die('Verbindungsaufbau fehlgeschlagen: ' . pg_last_error());


if($fmode == 0){
    $query = "SELECT CC.idx, (ST_SUMMARYSTATS(BB.rast)).mean - (ST_SUMMARYSTATS(ST_INTERSECTION(AA.rast,BB.rast))).mean AS cru_diff_mean FROM temperature_cru_mean AS AA, temperature_monthly_recon_single AS BB 
    INNER JOIN tambora_temperature_monthly AS CC ON BB.event_id = CC.event_id
    WHERE AA.month = CC.month
    ORDER BY CC.idx;"; 
    $result = pg_query($query) or die('Abfrage fehlgeschlagen: ' . pg_last_error());
    $resres = array();
    $qlen= pg_num_rows($result);

    while($line = pg_fetch_array($result, null, PGSQL_ASSOC)){
        array_push($resres, array($line['idx'], $line['cru_diff_mean'])); 
    } 
    // echo $_GET['callback']  . $resres;
    echo json_encode($resres, JSON_NUMERIC_CHECK);

} else if ($fmode == 1){
    $query = "
    SELECT  CC.event_id as evid,
    CC.idx AS idxval, 
    CC.year, 
    CC.month,
    (ST_SUMMARYSTATS(BB.rast)).mean AS recontemp,
    AA.temperature AS stattemp,
    (ST_VALUE(BB.rast,AA.geom)-AA.temperature) AS reconstatdiff,
    AA.station_id AS locid,
    AA.name

    FROM (SELECT EE.station_id, EE.name, EE.geom, DD.temperature, DD.month, DD.year FROM temperature_validation_stations AS EE INNER JOIN temperature_validation_data AS DD ON EE.station_id = DD.station_id)
    AS AA, temperature_monthly_recon_single AS BB 
    INNER JOIN tambora_temperature_monthly AS CC ON BB.event_id = CC.event_id
    WHERE AA.year = CC.year 
    AND AA.month = CC.month 
    AND ST_INTERSECTS(BB.rast,AA.geom)
    ORDER BY CC.year, CC.month;
    "; 

    $result = pg_query($query) or die('Abfrage fehlgeschlagen: ' . pg_last_error());
    $statByIdx = array();
    $statByMonth = array();
    $statByLoc = array();
    $evidLookUp = array();
    $locationNameLU = array();
    $resres = array();
    $qlen= pg_num_rows($result);
    $lookupidarray=array();
    $lookid=0;
    while($line = pg_fetch_array($result, null, PGSQL_ASSOC)){
        array_push($statByIdx, array($line['idxval'], $line['reconstatdiff'])); 
        array_push($statByMonth, array($line['month'], $line['reconstatdiff']));
        $line['name'] = str_replace("/","",$line['name']); 
        $line['name'] = str_replace("\\","",$line['name']);
        if( $line['reconstatdiff'] != ''){
            if(!array_key_exists($line['locid'], $lookupidarray)){ 
                $lookupidarray[$line['locid']] = $lookid; 
                $id = $lookid;
                ++$lookid;
            } else {
               $id = $lookupidarray[$line['locid']]; 
            }
            array_push($statByLoc, array($id, $line['reconstatdiff'])); 
            //     array_push($statByLoc, $line['reconstatdiff']);
            if (!in_array($line['name'], $locationNameLU)){ 
                array_push($locationNameLU, $line['name']);
            }
        }
        array_push($evidLookUp, $line['evid']); 

    } 

    // echo $_GET['callback']  . $resres;
    $resres['statByIdx'] = $statByIdx;
    $resres['statByMonth'] = $statByMonth;
    $resres['statByLoc'] = $statByLoc;
    $resres['evidLookUp'] = $evidLookUp;
    $resres['locNameLU'] = $locationNameLU;

    echo json_encode($resres, JSON_NUMERIC_CHECK) ;

} else if ($fmode == 2){

    //  -- get average offset for temp station all data
    $query = "
    SELECT
    bbb.name, bbb.lat, bbb.lon, avg(ST_Value(aaa.rast, bbb.geom) -  bbb.temperature) as off, count(*) 
    FROM(
    SELECT rast, year, month FROM temperature_monthly_recon
    ) as aaa,(
    SELECT lat, lon, geom, temperature_validation_data.station_id, name, temperature, year, month FROM temperature_validation_stations INNER JOIN temperature_validation_data ON temperature_validation_stations.station_id=temperature_validation_data.station_id
    ) as bbb
    WHERE bbb.year = aaa.year AND bbb.month = aaa.month AND  ST_Intersects(aaa.rast,1, bbb.geom)
    GROUP BY bbb.name, bbb.lat, bbb.lon 
    ORDER BY off DESC;
    "; 

    $result = pg_query($query) or die('Cannot execute query: ' . pg_last_error());
    $idxPDat=array();
    while($line = pg_fetch_array($result)){

        $idxPDatLine = array();           
        foreach ($line as $key => $col_value) {
            $idxPDatLine += array($key => $col_value);
        }
        array_push($idxPDat, $idxPDatLine); 
    }

    $resres['idxPDat'] = $idxPDat;
    //    $resres['stationStats'] = $stationStats;

    echo  $_GET['callback'] . '(' . json_encode($resres) .')';

}

// Speicher freigeben
pg_free_result($result);

// Verbindung schließen
pg_close($dbconn);
?>