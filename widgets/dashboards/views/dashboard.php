<?php
use yii\helpers\Url;
use app\modules\regmod\RegmodMainAsset;
use app\modules\regmod\widgets\dashboards\RegmodDashboardAsset;
use app\modules\regmod\widgets\dashboards\DashboardWidget;

// load assets
$mainAssets = RegmodMainAsset::register($this);
RegmodDashboardAsset::register($this);

$loadingGif = $mainAssets->baseUrl.'/images/loadanimation.gif';
Yii::$app->view->registerJs("var loadingGif =  '{$loadingGif}'",  \yii\web\View::POS_BEGIN);
?>

<script type="text/javascript">
    $(function(){

        // add dashboard html to app
        $('#top .right').append(
            "<div id='dashboard' style='display:none'> \
                <div id='cruByIdx' ><img class='dash-loading' src="+loadingGif+" /></div> \
                <div id='statByIdx' class='top' ></div> \
                <div id='statByMonth' class='top' ></div> \
                <div id='statByLoc' class='bottom' ><img class='dash-loading' src="+loadingGif+" /></div> \
                <!--div id='map' class='bottom'><img class='loading' src="+loadingGif+" /></div--> \
            </div>"
        );

        /*
        $('#top .left').append(
            "<div id='dash-menu' style='display:none'> \
                <a class='thumbnail-dash' href='#thumb'><img src='http://h2281281.stratoserver.net/regmod/img/storyData/indicesData.jpg' width='45%' height='150px' border='0' alt='indices data overview'/></a>   \
                <a class='thumbnail-dash' href='#thumb'><img id='idxbyloc' src='http://h2281281.stratoserver.net/regmod/img/storyData/idxByLoc.png' width='45%' height='150px' border='0' alt='indices by location'/></a>   \
                <a class='thumbnail-dash' href='#thumb'><img src='http://h2281281.stratoserver.net/regmod/img/results/gmdMonths.jpg' width='45%' height='150px' border='0' alt='gmd by month'/></a>   \
                <a class='thumbnail-dash' href='#thumb'><img src='http://h2281281.stratoserver.net/regmod/img/results/ghcnmMonths.jpg' width='45%' height='150px' border='0' alt='ghcnmv3 by month'/></a>   \
                <!--a class='thumbnail-dash' href='#thumb'><img src='http://h2281281.stratoserver.net/regmod/img/results/dash1.jpg' width='92.5%' height='150px' border='0' alt='ghcnmv3 by month'/></a>   \
                <a class='thumbnail-dash' href='#thumb'><img src='http://h2281281.stratoserver.net/regmod/img/results/dash2.jpg' width='45%' height='150px' border='0' alt='ghcnmv3 by month'/></a>   \
            --></div>"
        );
        */
        $('#top .left').append(
            "<div id='dash-menu' style='display:none'>                                                                                         \
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
            </div>"
        );

    });
</script>

<!-- DASHBOARD WIDGET DATA BINDINGS -->
<div id="dashboardWidget-content" data-url=<?= '"' . Url::to(['/regmod/dashboard/dashboard']) . '"'; ?> ></div>
