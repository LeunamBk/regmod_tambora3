<?php
use yii\helpers\Url;
use app\modules\regmod\RegmodMainAsset;
use app\modules\regmod\widgets\dashboards\RegmodDashboardAsset;
use app\modules\regmod\widgets\dashboards\DashboardWidget;

// load assets
$mainAssets = RegmodMainAsset::register($this);
$dashboardAssets = RegmodDashboardAsset::register($this);

$loadingGif = $mainAssets->baseUrl.'/images/loadanimation.gif';
$modelDesignImg = $dashboardAssets->baseUrl.'/images/model-design.jpg';
$resGhcnmImg = $dashboardAssets->baseUrl.'/images/ghcnmMonths.jpg';
$resGwdImg = $dashboardAssets->baseUrl.'/images/gmdMonths.jpg';
$baseDataImg = $dashboardAssets->baseUrl.'/images/indicesDataGrey.jpg';
Yii::$app->view->registerJs("var loadingGif =  '{$loadingGif}'",  \yii\web\View::POS_BEGIN);
Yii::$app->view->registerJs("var modelDesignImg =  '{$modelDesignImg}'",  \yii\web\View::POS_BEGIN);

Yii::$app->view->registerJs("var resGhcnmImg =  '{$resGhcnmImg}'",  \yii\web\View::POS_BEGIN);
Yii::$app->view->registerJs("var resGwdImg =  '{$resGwdImg}'",  \yii\web\View::POS_BEGIN);
Yii::$app->view->registerJs("var baseDataImg =  '{$baseDataImg}'",  \yii\web\View::POS_BEGIN);
?>

<script type="text/javascript">
    $(function(){


        var aboutRegmodText = "<div class='abstract'>                                                                                                                                               \
        <h3>Introduction</h3>                                                                                                                                                                       \
        <p>Subject of the work presented here is the realisation, expansion, validation and web deployment of a model for the reconstruction                                                                     \
        of monthly aggregated areal temperature data from historical sources, as it is described by <a href='https://www.freidok.uni-freiburg.de/data/7904'>Riemann, (2010)</a>.</p>            \
        <p>                                                                                                                                                                                         \
        To this end, the model has been programmed in R-Statistics (also in Python) and linked on an Ubuntu server to a PostgreSQL database with                                                    \
            PostGIS extensions. The raster data which is calculated by the model is loaded into the database by using GDAL, where                                                                   \
        they are stored in WKB format. Based on this, a web application has been developed, which dynamically retrieves the                                                                         \
        calculated data using PHP and JavaScript from the database and uses leaflet.js for map visualization. In addition, individual                                                               \
        elements have been created which inform the user directly about the underlying data and offer him the opportunity to make spatial                                                           \
        and temporal selections. A direct validation of the calculated data is ensured by the provision and integration of the GHCNMV3                                                              \
        record <a href='ftp://ftp.ncdc.noaa.gov/pub/data/ghcn/v3/'>(GHCNV3, 2015)</a>. The recalculation of the model by part selecting individual events of a month or by adding new events is made possible by linking    \
        the web application with a Python-skript, which process the requested data on the fly. Moreover, additional interfaces have been                                                            \
        developed in R, Python and for QGIS for the further development and collaborative cooperation.                                                                                              \
        </p>                                                                                                                                                                                    \
        </div>                                                                                                                                                                                      \
        <div class='dataPrep'>                                                                                                                                                                      \
            <h3>Data</h3>                                                                                                                                                                           \
            <p>                                                                                                                                                                                     \
            The areal temperature fields were reconstructed based on the monthly thermal indices available from the collaborative research environment <a href='tmabora.org'>tambora</a>, monthly resolved reanalysis data (CRU TS 3.0) of the <a href='http://www.cru.uea.ac.uk/'>Climate Research Unit</a>. Monthly station temperatures from the Global Historical Climatology Network Monthly <a href='ftp://ftp.ncdc.noaa.gov/pub/data/ghcn/v3/'>(GHCNM version 3)</a> are used for the validation.        </p>\                                                                                                                                                                                        \
        </div>\
         <div class='results1'>\
        <h3>Results</h3>\
        \
        <p>\
        Through the model 1195 individual data records for 817 different months were calculated on the basis of the available monthly temperature\
        indices from tambora <i>(Based on tambora data from January 2015, only events in central Europe were taken into account)</i>. A validation of the reconstructed temperature distributions with data of GHCNMV3 and GMD (updated after Rapp, 2010)\
        showed an average deviation of 0.6&deg;C with a standard deviation of 2.8&deg;C between the reconstructed temperature fields and the GHCNMV3 data,\
            as well as an average deviation of 0.7&deg;C with a standard deviation of 2.06&deg;C to the GMD records. By cross-validation different monthly event\
        combinations were tested for correspondence with the respective validation data. Hereby, events could be identified, which deteriorate the\
        reconstructed temperatures in terms of compliance with the validation data. By omitting these events an average deviation of 0.03&deg;C with a\
            standard deviation of 1.98&deg;C between the reconstructed temperature fields and the GHCNMV3 data, as well as an average deviation of 0.61&deg;C with\
            a standard deviation of 1.81&deg;C to the GMD data was achieved.\
            The comparison of the combinations of events with the best match to the respective validation data set showed, that 67.65% of the combinations\
        of events were identical between the two validation datasets.\
        </p>\
        </div>\
        ";




        // add dashboard html to app
        $('#top .right').append(
            "<div id='dashboard' style='display:none'> \
                <div id='cruByIdx' ><img class='dash-loading' src="+loadingGif+" /></div> \
                <div id='statByIdx' class='top' ></div> \
                <div id='statByMonth' class='top' ></div> \
                <div id='statByLoc' class='bottom' ><img class='dash-loading' src="+loadingGif+" /></div> \
                <div id='aboutRegmod-text' class='top-about' >"+aboutRegmodText+"</div> \
                <!--div id='map' class='bottom'><img class='loading' src="+loadingGif+" /></div--> \
            </div>"
        );

        $('#top .left').append(
            "<div class='dash-menu' style='display:none'>                                                                                         \
                <div class='byEvents-text' style='display:none'>\
                <p>Comparison between the 7 index classes with their corresponding impact                                                      \
                on the reconstructed mean temperature difference to the underlying cru                                                         \
                reanalysis data.</p>                                                                                                           \
                <p>Reconstructions with an thermal index of 0 show no differences in temperature like expected,                                \
                negative indices have an negative impact on the reconstructed temperature. The mean                                            \
                difference in temperature for the negative thermal indices are <span id='avg-n3' class='dash-text-stats'></span>C° for -3, \
                <span id='avg-n2' class='dash-text-stats'></span>C° for -2 and <span id='avg-n1' class='dash-text-stats'></span>C° for -1.                          \
                Reconstructed temperature distributions are in the range of <span id='range-maxn' class='dash-text-stats'></span>C° down to \
                <span id='range-minn' class='dash-text-stats'></span>C° in the mean colder than the underlying       \
                reanalysis data.                                                                                                               \
                The mean difference in temperature for positive indices are <span id='avg-p3' class='dash-text-stats'></span>C° for 3, \
                <span id='avg-p2' class='dash-text-stats'></span>C° for 2 and <span id='avg-p1' class='dash-text-stats'></span>C° for 1.                                \
                Reconstructed temperature distributions are in the range of <span id='range-minp' class='dash-text-stats'></span>C° up to \
                <span id='range-maxp' class='dash-text-stats'></span>C° in the mean warmer.</p>                        \
                </div>\
                <div class='byStation-text' style='display:none'>\
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.\
                \
                \
                \
                \
                \
                \
                \
              </div>\
            </div>\
            <div class='about-menu' style='display:none'>\
                <div class='aboutRegmod-sidebar'>\
                <div class='sidebar-image'>\
                 <img style='width:95%' src="+modelDesignImg+">\
                </div>\
                </div>\
           </div>\
            <div class='about-menu' style='display:none'>\
            \
                <div class='aboutRegmod-sidebar'>\
                <div class='sidebar-image'>\
                 <img style='width:95%' src="+baseDataImg+">\
                </div>\
                </div>\
            </div>\
            \
            \
            <div class='about-menu' style='display:none'>\
            <div class='aboutRegmod-sidebar'>\
            <div class='sidebar-image'>\
            <img style='width:47%' src="+resGhcnmImg+">\
            <img style='width:47%' src="+resGwdImg+">\
            </div>\
            </div>\
            </div>"
        );


    });
</script>

<!-- DASHBOARD WIDGET DATA BINDINGS -->
<div id="dashboardWidget-content" data-url=<?= '"' . Url::to(['/regmod/dashboard/dashboard']) . '"'; ?> ></div>
