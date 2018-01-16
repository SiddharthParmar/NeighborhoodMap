//Toggle the sidebar
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//Global variables
var map, clientID, clientSecret;

function HikingViewModel() {
    var self = this;
    this.searchBox = ko.observable("");
    this.markers = [];

    //Create google map with night styles and location data
    this.initMap = function() {
        // Create a styles array to use with the map.
        var styles = [{
                elementType: 'geometry',
                stylers: [{
                    color: '#242f3e'
                }]
            },
            {
                elementType: 'labels.text.stroke',
                stylers: [{
                    color: '#242f3e'
                }]
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#746855'
                }]
            },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{
                    color: '#263c3f'
                }]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#6b9a76'
                }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{
                    color: '#38414e'
                }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{
                    color: '#212a37'
                }]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#9ca5b3'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{
                    color: '#746855'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{
                    color: '#1f2835'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#f3d19c'
                }]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{
                    color: '#2f3948'
                }]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{
                    color: '#17263c'
                }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#515c6d'
                }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{
                    color: '#17263c'
                }]
            }
        ];
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(37.401951, -122.015251),
            zoom: 8,
            styles: styles
        };
        map = new google.maps.Map(mapCanvas, mapOptions);
        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        //Change the color of markers based on mouse in and mouse out
        var defaultIcon = this.makeMarkerIcon('39ff14');
        var highlightedIcon = this.makeMarkerIcon('ffad33');
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            this.markerTitle = locations[i].title;
            this.markerLat = locations[i].lat;
            this.markerLng = locations[i].lng;
            // Create a marker per location, and put into markers array.
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                icon: defaultIcon,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.toggleBounce);
            this.marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            this.marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });

        }
    };
    // This function takes in a COLOR, and then creates a new marker of that color
    this.makeMarkerIcon = function(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    };
    //Create the infowindow with foursquare details
    this.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            clientID = "O3TLZUTPGQFNY3XIYRGXK2HRRHRR1ARYVSDK03GPIKN2XTKM";
            clientSecret = "FLUBENRIEIIATCZWNBBLW01CMLQCL1LL3DJVNEAAY0PFSQMG";
            var fourSquareApiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title + '&v=20180112';
            var placeTitle = '<h4>' + marker.title + '</h4>';
            $.getJSON(fourSquareApiUrl, function(marker) {
                var key = marker.response.venues[0];
                var checkIns = key.stats.checkinsCount
                var category = key.categories[0].shortName;
                var placeDetails = '<h5>(' + category + ')</h5>' +
                    '<h6> CheckIns: ' + checkIns + ' </h6>' +
                    '<img class ="img-responsive" src="img/fs.png" alt="fourSqaure logo for attribution">' + '</img>';
                infowindow.setContent(placeTitle + placeDetails);
            }).fail(function() {
                // Send alert
                alert(
                    "Foursquare API call was unsuccessful. Please try refreshing your page."
                );
            });
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };
    //Call the populateInfoWindow() and animate the marker when clicked
    this.toggleBounce = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };
    //Initialize the map
    this.initMap();
    // Filter locations based on the user input
    this.filter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var location = this.markers[i];
            if (location.title.toLowerCase().includes(this.searchBox().toLowerCase())) {
                result.push(location);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}
//Error message in case maps fail to load.
function errorLoadingMaps() {
    alert(
        'Sorry! Google Maps did not load. Please try refreshing the page.'
    );
};

function openHikingApp() {
    ko.applyBindings(new HikingViewModel());
}