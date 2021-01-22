// Starting locations

function plusOrMinus() {
  return(Math.random() < 0.5 ? -1 : 1);
}

function createRandCoord() {
  return(Math.random()*90*plusOrMinus());
}

function createStartLocation() {
  startingLat = createRandCoord();
  startingLng = 2*createRandCoord();
  startingLocation = [startingLat, startingLng];
  console.log("Starting Coordinates are " + startingLocation); // at some point, reduce # of sig digits displayed by deconstructing startingLocation var
}

// Ensure starting location is not in the ocean. If on continent, startPoly returns an array of geoJSON poly containing start location
function startLandCheck() {
  leafletPip.bassackwards = true;
  contGeoJ = L.geoJSON(continentsPoly);
  startPoly = leafletPip.pointInLayer(startingLocation, contGeoJ);
}

// Broke this up into two separate functions to make any troubleshooting easier
function initiateStart() {
  createStartLocation();
  startLandCheck();
}

var startPoly = [];
while (startPoly.length == 0) {
  console.log("trying start coordinates");
  initiateStart();
}


// Initiating Layer Creation

var token = "pk.eyJ1IjoibGV2YmFraW4iLCJhIjoiY2toY2F2bzEwMDM5dzMybWZ2ajVnaXJvZSJ9.9OYoBsDXZmgV5lNIYZ7ODA";

var satLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGV2YmFraW4iLCJhIjoiY2toY2F2bzEwMDM5dzMybWZ2ajVnaXJvZSJ9.9OYoBsDXZmgV5lNIYZ7ODA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 13,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token',
    opacity: 0.2
});

var Esri_WorldShadedRelief = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
       	attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
       	maxZoom: 13
});

var streetLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGV2YmFraW4iLCJhIjoiY2toY2F2bzEwMDM5dzMybWZ2ajVnaXJvZSJ9.9OYoBsDXZmgV5lNIYZ7ODA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 13,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token',
    minZoom: 1,
});

var streetLayer2Boogaloo = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGV2YmFraW4iLCJhIjoiY2toY2F2bzEwMDM5dzMybWZ2ajVnaXJvZSJ9.9OYoBsDXZmgV5lNIYZ7ODA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 13,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token',
    minZoom: 1,
});

var baseMaps = {
  "Terrain": Esri_WorldShadedRelief
};


// Overlay Markers

var CompassIcon = L.Icon.extend({
    options: {
        shadowUrl: 'images/marker_shadow.png',
        iconSize:     [25, 44],
        shadowSize:   [30, 20],
        iconAnchor:   [15, 40],
        shadowAnchor: [4, -1],
        popupAnchor:  [-3, -65]
    }
});

var blueIcon = new CompassIcon({iconUrl: 'images/marker_darkblue.png'}),
    lilacIcon = new CompassIcon({iconUrl: 'images/marker_lilac.png'});

var startingMarker = L.marker(startingLocation, {icon: blueIcon}).bindPopup('You were dropped here!');

var guessMarker = L.marker([], {icon:lilacIcon}).bindPopup('Your guess');

var overlayMaps = {
    "Satellite": satLayer,
    "Start Marker": startingMarker,
};


// Adding Layers to the Maps

var mySatMap = L.map('satMapId', {
    layers: [Esri_WorldShadedRelief, satLayer, startingMarker],
  })
    .setView(startingLocation, 8);

L.control.layers(baseMaps, overlayMaps).addTo(mySatMap);
L.control.scale().addTo(mySatMap);

var myStreetMap = L.map('streetMapId', {
  })
  .setView([70,100], 1);

streetLayer.addTo(myStreetMap);


//reset map view to origin. used for map button

function recenterMapView() {
  mySatMap.setView(startingLocation);
}

// Event Listeners //

function onMapClick(e) {
  guessMarker
        .setLatLng(e.latlng)
        .addTo(myStreetMap);
      return ( clickLocation = e.latlng );
}

myStreetMap.on('click', onMapClick);


// Zoom
var minZoom = mySatMap._zoom;

document.getElementById('minZoom').innerHTML = "Min zoom lvl: " + mySatMap._zoom;

new CircleProgress('.progress', {
  max: 13,
  value: mySatMap._zoom,
});

mySatMap.on('zoom', function(ev){
  $('.progress')[0].circleProgress.attr('value', mySatMap._zoom); //updates circle zoom on map zoom
  if (minZoom > mySatMap._zoom) {
    minZoom = mySatMap._zoom;
    document.getElementById('minZoom').innerHTML = "New min zoom lvl: " + minZoom;
    zoomMod = 1 - (8 - minZoom) * 0.2;
    if (zoomMod < 0) {zoomMod = 0;}
    document.getElementById('zoomMod').innerHTML = zoomMod.toPrecision(1);
  }
});



// Time to score!
var clickLocation = [];
function distanceText() {
  if (clickLocation.length == 0) {
    document.getElementById('outerStreet').style = "border: 5px solid #355c7d";
    alert("Click on the street map to the right to make a guess!");
  }
  else {
    dist = myStreetMap.distance(startingLocation, clickLocation);
    dist = Math.round(dist/1000);
    zoomMod = 1 - (8 - minZoom) * 0.2;
    if (zoomMod < 0) {zoomMod = 0;}
    distancePoints = Math.round((20000 - dist)/20000 * 1000 * zoomMod); //furthest 2 points on earth are 20k km from each other. making the whole point system out of 1,000
    document.getElementById("distanceTextId").innerHTML = "You were " + dist + " kilometers away" + " and received " + distancePoints + " out of 1000 points.";
    scoreModal.style.display = "block";
    scoreMove();

  }
}

// Score Map

var myScoreMap = L.map('scoreMap', {
  });

streetLayer2Boogaloo.addTo(myScoreMap);

function scoreMapBounds() {
  bounds = [startingLocation, [clickLocation.lat, clickLocation.lng]];
  polylineScore = L.polyline(bounds, {color: 'black'}).addTo(myScoreMap);
  myScoreMap.fitBounds(bounds);
  L.marker(clickLocation, {icon: lilacIcon}).addTo(myScoreMap).bindPopup('Your Guess');
  L.marker(startingLocation, {icon: blueIcon}).addTo(myScoreMap).bindPopup('Start');
}

// Score Bar

function scoreMove() {

  var i = 0;
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("scoreBar");
    var width = 1;
    var id = setInterval(frame, 1); //Found out that any interval defined to be shorter than 10ms auto changed to 10.
    // increased the width increase to '10' every frame instead of '1' and that did the trick.

    function frame() {
      if (width >= distancePoints) {
        clearInterval(id);
        i = 0;
      } else {
        width = width + 10;
        elem.style.width = width * 0.1 + "%";
        elem.innerHTML = distancePoints;
      }
    }
  }
  scoreMapBounds();
}


//Some optimization can be done here with this modal code.

// Modal

// Get the modal
var welcModal = document.getElementById("welcomeModal");
var scoreModal = document.getElementById("scoreModal");

// Get the button that opens the modal
var welcBtn = document.getElementById("welcomeBtn");
var scoreBtn = document.getElementById("scoreBtn");

// Get the element that closes the modal
var span = document.getElementsByClassName("close")[0];
var close = document.getElementById("closeBtn");

// When the user clicks the button, open the modal
welcBtn.onclick = function() {
  welcModal.style.display = "block";
};


// When the user clicks on <span> (x) or closeBtn, close the modal.
span.onclick = function closeModal() {
  welcModal.style.display = "none";
};

closeBtn.onclick = function closeModal() {
  welcModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == welcModal ) {
    welcModal.style.display = "none";
  }
};

// Close modal when user presses "escape" key
document.onkeyup = function(e) {
     if (e.key === "Escape") { // escape key maps to keycode `27`
      welcModal.style.display = "none";
    }
};
