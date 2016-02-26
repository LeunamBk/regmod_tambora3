<?php
use yii\helpers\Url;
use app\modules\regmod\RegmodMainAsset;
use app\modules\regmod\RegmodTimelineAsset;
use app\modules\regmod\RegmodTileSelectAsset;
use app\modules\regmod\RegmodStatisticsAsset;
use app\modules\regmod\RegmodByRegionAsset;
use app\modules\regmod\RegmodReconstructorAsset;
use app\modules\regmod\widgets\reconstructor\ReconstructorformWidget;
use app\modules\regmod\widgets\dashboards\DashboardWidget;

// load assets
$mainAssets = RegmodMainAsset::register($this);
RegmodTimelineAsset::register($this);
RegmodTileSelectAsset::register($this);
RegmodStatisticsAsset::register($this);
RegmodByRegionAsset::register($this);
RegmodReconstructorAsset::register($this);

$loadingGif = $mainAssets->baseUrl.'/images/loadanimation.gif';

// register js variable json data for tile select 
Yii::$app->view->registerJs('var phpTilesData = '. $tileSelectData,  \yii\web\View::POS_BEGIN);
?>

<!-- data links for data requests-->
<div id="tilesSelectData-content" data-url=<?= '"' . Url::to(['/regmod/tileselect/tiles']) . '"'; ?> ></div>
<div id="mapIndices-content" data-url=<?= '"' . Url::to(['/regmod/map/indices']) . '"'; ?> ></div>
<div id="mapTemperatureRasterExtent-content" data-url=<?= '"' . Url::to(['/regmod/map/temperaturerasterextent']) . '"'; ?> ></div>
<div id="mapTemperatureRasterData-content" data-url=<?= '"' . Url::to(['/regmod/map/temperaturerasterdata']) . '"'; ?> ></div>
<div id="mapTemperatureNoRasterData-content" data-url=<?= '"' . Url::to(['/regmod/map/temperaturenorasterdata']) . '"'; ?> ></div>
<div id="mapTRegressionRasterData-content" data-url=<?= '"' . Url::to(['/regmod/map/tregressionrasterdata']) . '"'; ?> ></div>
<div id="mapGhcnmData-content" data-url=<?= '"' . Url::to(['/regmod/map/ghcnm']) . '"'; ?> ></div>
<div id="mapLatLonInfoData-content" data-url=<?= '"' . Url::to(['/regmod/map/latloninfo']) . '"'; ?> ></div>

<div id="tableStatisticsData-content" data-url=<?= '"' . Url::to(['/regmod/table/statistics']) . '"'; ?> ></div>
<div id="tableInlineStatsData-content" data-url=<?= '"' . Url::to(['/regmod/table/inlinestats']) . '"'; ?> ></div>
<div id="statisticsTextCoverage-content" data-url=<?= '"' . Url::to(['/regmod/table/coveragestats']) . '"'; ?> ></div>

<div id="timelineData-content" data-url=<?= '"' . Url::to(['/regmod/timeline/timeline']) . '"'; ?> ></div>
<div id="byRegionOverviewExtent-content" data-url=<?= '"' . Url::to(['/regmod/region/overviewextent']) . '"'; ?> ></div>
<div id="byRegionOverviewData-content" data-url=<?= '"' . Url::to(['/regmod/region/overview']) . '"'; ?> ></div>
<div id="byRegionEventData-content" data-url=<?= '"' . Url::to(['/regmod/region/events']) . '"'; ?> ></div>
<div id="updateApp-trigger" data-url=<?= '"' . Url::to(['/regmod/update/updateapp']) . '"'; ?> ></div>

<!-- ADD DASHBOARD WIDGET -->
<?= DashboardWidget::widget(); ?>

<!-- ADD RECONSTRUCTOR INPUT FORM MARKUP WIDGET -->
<?= ReconstructorformWidget::widget(); ?>

<div id="wrapper">

    <header>
         <center><h3>Browse reconstructed monthly temperature distributions from monthly aggregated historical thermal indices</h3></center>
        <center><p><br></p></center>
    </header>
    <div id="top">
        <div class="left">   
            <div class="navi">
                <ul>
                    <li class="mapBrowser"><a class="active" href="#">Temperature Fields</a></li>
                    <li class="evaluation"><a href="#">Evaluation</a></li>
                    <li class="coverage"><a href="#">Coverage</a></li>
                    <li class="dashboard"><a href="#">Dashboard</a>
                        <ul>
                            <li class="offsetByIndex"><a href="#">Reanalysis offset by Index</a></li>
                            <li class="offsetByStation"><a href="#">Temperature offset by climate station</a></li>
                            <li class="aboutRegmod"><a href="#">About</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div id="advancedSelect">
                <div id="old_browser_msg">We're sorry but your browser is really old and can't handle the full interactive experience. We recommend you upgrade to the latest version as soon as possible.</div>
                <!--div class="selBorder"-->
                    <div id="century"></div>
                    <div id="decade"></div>
                    <div id="year"></div>
                    <div id="month"></div>
                    <div id="legend" class="rbow2">
                        <ul>
                            <li class="less">less data</li>
                            <li class="q1-7"></li>
                            <li class="q2-7"></li>
                            <li class="q3-7"></li>
                            <li class="q4-7"></li>
                            <li class="q5-7"></li>
                            <li class="q6-7"></li>
                            <li class="q7-7"></li>
                            <li class="more">more data</li>
                        </ul>
                    </div>  
                <!--/div-->
            </div>
            <div id="timeline"></div>

        </div>
        <div class="right">
            <div id='map'></div>
        </div>
    </div>
    <!--div id="bottom">
        <div class="center">
        <div class="mainText">
        <center><h4>Calculated from <span id="eventCount"></span> <span id="eventText"></span> of <span id="locationCount"></span> <span id="locationText"></span></h4></center>
        <div id="statsText">
        <center><b><p>Cru Offset: <span id="cruText" style="color:orange"></span> &deg;C, Station Offset: <span id="stationTextMean" style="color:orange"></span>&deg;C</p></b></center>
        </div>
        </div>
        <div id="jstable"></div>
        </div>
        <div class="right">
        </div>
    </div-->
</div>