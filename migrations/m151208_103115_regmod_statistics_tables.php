<?php

use yii\db\Schema;
use yii\db\Migration;

class m151208_103115_regmod_statistics_tables extends Migration
{

    private static function createGHCNMStatistics(){

        $sql = "CREATE TABLE regmod.statistics_ghcnm AS (
                  SELECT event_id, average AS idx, station.year,
		            station.month,
                    station.temperature AS ghcnm_temperature,
                    ST_VALUE(reconevent.rast, station.geom) AS event_atghcnm_temperature,
                    station.station_id,
                    station.name
                    FROM (
                      SELECT EE.station_id, name, geom, temperature, month, year
                    FROM regmod.temperature_validation_stations AS EE
                    INNER JOIN regmod.temperature_validation_data AS DD
                    ON EE.station_id = DD.station_id
                        ) AS station, (
                      SELECT events.event_id, recon.rast, average, year, month
                    FROM events_timespace as events
                    INNER JOIN regmod.temperature_monthly_recon_single As recon
                    ON events.event_id = recon.event_id
                    ORDER BY event_id
                    ) AS reconevent
                         WHERE station.year = reconevent.year
                          AND station.month = reconevent.month
                          AND ST_INTERSECTS(reconevent.rast, station.geom)
                                  AND ST_VALUE(reconevent.rast, station.geom) IS NOT NULL
                );";

        return $sql;
    }

    private static function createEventStatistics(){

        $sql = "CREATE TABLE regmod.statistics_events AS (
                    SELECT CC.event_id,
                           CC.average AS idx,
                           (ST_SUMMARYSTATS(BB.rast)).mean AS event_mean,
                           (ST_SUMMARYSTATS(ST_INTERSECTION(AA.rast,BB.rast))).mean AS cru_mean
                    FROM  regmod.temperature_cru_mean AS AA,
                          regmod.temperature_monthly_recon_single AS BB
                    INNER JOIN events_timespace AS CC
                    ON BB.event_id = CC.event_id
                    WHERE AA.month = CC.month
                    );";

        return $sql;
    }

    public function Up()
    {
        $this->execute(self::createGHCNMStatistics());
        $this->execute(self::createEventStatistics());
    }

    public function safeDown()
    {
        $this->execute('DROP TABLE IF EXISTS regmod.statistics_ghcnm;');
        $this->execute('DROP TABLE IF EXISTS regmod.statistics_events;');
    }

}
