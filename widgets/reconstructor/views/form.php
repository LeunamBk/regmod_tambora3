<?php

/**
 * Timeline creates an area for timeline handling
 *
 * @author    Michael Kahle <michael.kahle@ub.uni-freiburg.de>
 * @copyright 2015 University Library of Freiburg
 * @copyright 2015 Leibniz Institute for Regional Geography
 * @license   GNU General Public License - http://www.gnu.org/copyleft/gpl.html
 */

namespace app\modules\reconstructor;

use Yii;
use yii\helpers\Html;
use app\modules\regmod\ExampleAsset;
use yii\helpers\Url;

?>



<!-- reconstructor app routes-->
<div id="liveReconstructTemperatureData-content" data-url=<?= '"' . Url::to(['/regmod/reconstructor/reconstructeddata']) . '"'; ?> ></div>
<div id="liveReconstructTemperatureExtent-content" data-url=<?= '"' . Url::to(['/regmod/reconstructor/reconstructedextent']) . '"'; ?> ></div>
<div id="liveReconstructRegressionData-content" data-url=<?= '"' . Url::to(['/regmod/reconstructor/reconstructedregresdata']) . '"'; ?> ></div>


<link href='https://fonts.googleapis.com/css?family=Fauna+One' rel='stylesheet' type='text/css'>
<script src="http://maps.googleapis.com/maps/api/js?libraries=places"></script>

<form id="reconstructor-form" class="sidebar" style='display:none'>
    <p id="returnmessage"></p>
    <!--label>Month: <span class="required">*</span></label>
    <select id="monthSel">
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4" selected>April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
    </select>

    <label id="yearLable">Year:</label>
    <input id="yearSel" type="number">
    <p></p-->
    <label>Thermal Index Event:<!--span class="required">*</span--></label>
    <div id="table" class="table-editable">
        <span class="table-add glyphicon glyphicon-plus"></span>
        <table class="table">
            <tr>
                <th>location</th>
                <th>lat</th>
                <th>lon</th>
                <th>index</th>
                <th>active</th>
            </tr>
            <!-- This is our clonable table line -->
            <tr class="hide">
                <td contenteditable="false" class="id" style="display: none;"></td>
                <td><input type="text" class="name" placeholder="location"></td>
                <td contenteditable="true" class="lat">lat</td>
                <td contenteditable="true" class="lon">lon</td>
                <td class="index">
                    <center>
                        <select class="indexSel">
                            <option value="-3">-3</option>
                            <option value="-2">-2</option>
                            <option value="-1">-1</option>
                            <option value="0" selected>0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </center>
                </td>
                <td class="index-active">
                    <center><input class="event-active" type="checkbox"/></center>
                </td>
                <td>
                    <span class="table-remove glyphicon glyphicon-remove"></span>
                </td>
            </tr>
        </table>
    </div>
    <!--label>load tambora data</label>
    <input id="loadTambora" type="checkbox"-->

    <input type="button" id="recon-submit" value="reconstruct temperature"/>
    <!--div><span class="required">*</span><i>required</i></div-->
    <p></p>
</form>
