L.Square = L.Path.extend({
    initialize: function (latlng, radius, options) {
        L.Path.prototype.initialize.call(this, options);

        this._latlng = L.latLng(latlng);
        this._mRadius = radius;
    },

    options: {
        fill: true
    },

    setLatLng: function (latlng) {
        this._latlng = L.latLng(latlng);
        return this.redraw();
    },

    setRadius: function (radius) {
        this._mRadius = radius;
        return this.redraw();
    },

    projectLatlngs: function () {
        var lngRadius = this._getLngRadius(),
        latlng = this._latlng,
        pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

        this._point = this._map.latLngToLayerPoint(latlng);
        this._radius = Math.max(this._point.x - pointLeft.x, 1);
    },

    getBounds: function () {
        var lngRadius = this._getLngRadius(),
        latRadius = (this._mRadius / 40075017) * 360,
        latlng = this._latlng;

        return new L.LatLngBounds(
            [latlng.lat - latRadius, latlng.lng - lngRadius],
            [latlng.lat + latRadius, latlng.lng + lngRadius]);
    },

    getLatLng: function () {
        return this._latlng;
    },

    getPathString: function () {
        var p = this._point,
        r = this._radius;

        if (this._checkIfEmpty()) {
            return '';
        }

        if (L.Browser.svg) {
            //    'M37,17v15H14V17H37z M50,0H0v50h50V0z'
            return 'm'+(p.x+7)+','+(p.y-7)+'v14h-14v-14h14v0z';
        } else {
            p._round();
            r = Math.round(r);
            return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
        }
    },

    getRadius: function () {
        return this._mRadius;
    },

    // TODO Earth hardcoded, move into projection code!

    _getLatRadius: function () {
        return (this._mRadius / 40075017) * 360;
    },

    _getLngRadius: function () {
        return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
    },

    _checkIfEmpty: function () {
        if (!this._map) {
            return false;
        }
        var vp = this._map._pathViewport,
        r = this._radius,
        p = this._point;

        return p.x - r > vp.max.x || p.y - r > vp.max.y ||
        p.x + r < vp.min.x || p.y + r < vp.min.y;
    }
});

L.square = function (latlng, radius, options) {
    return new L.Square(latlng, radius, options);
};

/*
* L.CircleMarker is a circle overlay with a permanent pixel radius.
*/

L.SquareMarker = L.Square.extend({
    options: {
        radius: 10,
        weight: 2
    },

    initialize: function (latlng, options) {
        L.Square.prototype.initialize.call(this, latlng, null, options);
        this._radius = this.options.radius;
    },

    projectLatlngs: function () {
        this._point = this._map.latLngToLayerPoint(this._latlng);
    },

    _updateStyle : function () {
        L.Square.prototype._updateStyle.call(this);
        this.setRadius(this.options.radius);
    },

    setLatLng: function (latlng) {
        L.Square.prototype.setLatLng.call(this, latlng);
        if (this._popup && this._popup._isOpen) {
            this._popup.setLatLng(latlng);
        }
        return this;
    },

    setRadius: function (radius) {
        this.options.radius = this._radius = radius;
        return this.redraw();
    },

    getRadius: function () {
        return this._radius;
    }
});

L.squareMarker = function (latlng, options) {
    return new L.SquareMarker(latlng, options);
};


/*
* CircleMarker canvas specific drawing parts.
*/
L.SquareMarker.include(!L.Path.CANVAS ? {} : {
    _updateStyle: function () {
        L.Path.prototype._updateStyle.call(this);
    }
});

var PointToGeoJSON = {
    toGeoJSON: function () {
        return L.GeoJSON.getFeature(this, {
            type: 'Point',
            coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
        });
    }
};

L.Square.include(PointToGeoJSON);
L.SquareMarker.include(PointToGeoJSON);
