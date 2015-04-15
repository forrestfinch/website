var map;

function mapInit() {
  var canvas = document.getElementById('map-canvas');

  if (canvas) {
    var defactoHQ = new google.maps.LatLng(53.212124, 6.57214);
    var mapOptions = {
      zoom: 16,
      center: defactoHQ,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      draggable: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var image = '/images/marker-orange.svg';
    var defactoMarker = new google.maps.Marker({
      position: defactoHQ,
      clickable: false,
      map: map,
      icon: image
    });
  }
}

google.maps.event.addDomListener(window, 'load', mapInit);
