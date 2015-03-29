// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master
// COSTANTE CON LA DISTANZA ENTRO LA QUALE SI SETTA L'ARRIVO
var DISTANZA_ARRIVO = 30;
// calcolo della distanza
function getDistanceFromLatLng(lat1,lng1,lat2,lng2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1); // deg2rad below
  var dLng = deg2rad(lng2-lng1);
  var a =
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
  Math.sin(dLng/2) * Math.sin(dLng/2)
  ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 1000; // Distance in m
  return d;
}
// calcolo in gradi
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// MAIN
var app = {
    numPagina: 0,
    numMaxPagine: 0,
    initialize: function() {
      this.bind();
    },
     
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        // alert("ok");
//      $("#page-home").on("swiperight", app.nextPage);
        $("#btnEntra").on("click", app.nextPage);
        // $("#page-interno").on("swipeleft", app.torna_copertina);
        $("#btnPrev").on("click", app.prevPage);
        $("#btnNext").on("click", app.nextPage);
        $("#btnCheckPos").on("click", app.checkPos);
//        $("#btnOkNuovameta").on("click", app.nuovaMeta);
    },
     
    deviceready: function() {
    }
}

// va alla pagina successiva
app.nextPage= function (){
  if( app.numPagina >= app.numMaxPagine){
    // vuoi aggiungere una pagina?
    alert("ok. pag:"+app.numPagina);
    app.elencoMete();
  } else {
    app.numPagina += 1;
    app.showPage();
  }
}
// va alla pagina precedente
app.prevPage= function (){
  if( app.numPagina > 0 ) {
    app.numPagina -= 1;
  }
  if(app.numPagina <= 0){
    $.mobile.pageContainer.pagecontainer("change", "#page-home", {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
    app.numPagina = 0;
  } else {
    app.showPage();
  }
}
// chiamata quando la posizione è stata letta
app.onSuccessGeo = function(position){
  alert(coordinate.lat  + " " + coordinate.long );
  coordinate.lat = position.coords.latitude;
  coordinate.long = position.coords.longitude;
  coordinate.alt = position.coords.altitude;
  // se c'è una meta selezionata, ne calcola la distanza
  if( app.numPagina>0){
    var el = pagine.lista[app.numPagina-1];
    coordinate.dist = getDistanceFromLatLng(coordinate.lat, coordinate.long, el.lat, el.long);
    var dst = coordinate.dist;
    $("#lblDistanza").html("Distanza: "+ dst);  
    pagine.checkArrivato();
  }
}
// chiamata quando c'è un errore nella lettura della posizione
app.onErrorGeo  = function(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error, reading position, occurred."
            break;
    }
}
// verifica la posizione GPS
app.checkPos = function(){
  alert("check Pos");
  navigator.geolocation.getCurrentPosition(app.onSuccessGeo, app.onErrorGeo, { timeout: 15000 });
}
// Mostra la pagina META corrente
app.showPage = function(){
  $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
      transition: 'slide',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
  });
  // cancella l'esistente
  $("#lblDistanza").empty();  
  $("#lblArrivato").empty();  
  var el = pagine.lista[app.numPagina-1];
  $("#tit-interno").html("<h2>Pag. "+ app.numPagina + " - " + el.nome + "</h2>");
  if( el.arrivato>0){
    $("#lblArrivo").html("Arrivato: "+ el.dataora);  
  }
}
// va alla pagina cobn l'elenco delle mete
app.elencoMete= function (){
  $.mobile.pageContainer.pagecontainer("change", "#page-elencomete", {
      transition:   'flip',
      changeHash:   false,
      reverse:      true,
      showLoadMsg:  true
  });
  mete.elencaMete();
}
// aggiunge meta
app.nuovaMeta= function (id){
  var dt = new Date();
  var sTime = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
  alert(id);
  $.each(pagine.lista, function(key, value){
    // evita di aggiungere più volte la stessa meta se non è ancora stata raggiunta o se è stata raggiunta oggi
    alert(value.arrivato);
    if(value.id == id && (value.arrivato == 0 || value.dataora.indexOf(sTime) >= 0)){
      return;
    }
  })
  app.numMaxPagine +=1;
  pagine.lista.push({
      "id": id,
      "nome": mete.elenco[id].nome,
      "lat": mete.elenco[id].lat,
      "long": mete.elenco[id].long,
      "alt": mete.elenco[id].alt,
      "arrivato":"0",
      "dataora":"0000-00-00 00:00:00"
      });
  alert(pagine.lista[pagine.lista.length-1].nome);
  app.nextPage();
}

// classe con le mete
var mete = {
  // elenco dei luoghi
  elenco: [],
  // mostra elenco mete
  elencaMete: function() {
    $('#lstMete').empty();
    $.each(mete.elenco, function(key, value){
      var testo = '<li id="meta_'+ key +'" ><a href="#" >';
      testo += value.nome ;
      testo += '</a></li>';
      $('#lstMete').append(testo);
      $("#lstMete li#meta_"+key).bind("click", function(){
          alert("Aggiungi meta: " + key);
          app.nuovaMeta(key);
      });
    });
    $('#lstMete').listview("refresh");
  }
}

// classe con le pagine
var pagine = {
  // elenco dei luoghi
  lista: [],
  corrente: function(){
    if( lista.length>0){
      return pagine.lista[app.numPagina-1];
    } else {
      return null;
    }
  }
}
// classe con le coordinate e le altre info di geolocalizzazione
var coordinate = {
  lat: 0,
  long: 0,
  alt: 0,
  dist: -1     // dalla meta attuale
}
// verifica la distanza
pagine.checkArrivato = function(){
  alert(coordinate.dist );
  var el = pagine.lista[app.numPagina-1];
  // SE non è ancora arrivato a questa meta
  if(el.arrivato == 0 && coordinate.dist  < DISTANZA_ARRIVO ){    
      alert("arrivato");
      capturePhotoWithData();
  }
}
// chiamata quando la foto riesce e mosta l'immagine
function onPhotoDataSuccess(imageData) {
  alert('Foto fatta');
  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');
  // Unhide image elements
  //
  smallImage.style.display = 'block';
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;
}
// QUando la foto non riesce
function onFail(message) {
  alert('Failed because: ' + message);
}
// scatta la foto
function capturePhotoWithData() {
  // Take picture using device camera and retrieve image as base64-encoded string
  alert('Foto da fare');
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
  alert('Foto ...');
} 

$(document).ready(function() {
    app.initialize();
    URL_PREFIX = "http://www.troni.it/passapport/";
    // aggiorna elenco mete
    while(mete.elenco.length > 0) {
      mete.elenco.pop();
    };
    mete.elenco.push({
      "id": "meta_" + 1,
      "nome": "Prima",
      "lat": "45.4439153",
      "long":"12.3386693",
      "alt": "0"
      });
    mete.elenco.push({
      "id": "meta_" + 2,
      "nome": "Seconda",
      "lat": "45.443454",
      "long": "12.338730",
      "alt": "0"
      });
    mete.elenco.push({
      "id": "meta_" + 3,
      "nome": "Terza",
      "lat": "45.442558",
      "long": "12.338237",
      "alt": "0"
      });
    mete.elenco.push({
      "id": "meta_" + 4,
      "nome": "Quarta",
      "lat": "45.441684",
      "long": "12.337671",
      "alt": "0"
      });
  //alert(navigator.camera);
    //$.ajax({
    //  type: 'GET',
    //  url: URL_PREFIX + 'php/leggi_mete.php',
    //  async: false,
    //  data: {
    //    tipo: 'vicino',
    //    param: ''
    //    },
    //  cache: false
    //}).done(function(result) {
    //  var obj = $.parseJSON(result);
    //  $.each(obj, function(i, valore){
    //    mete.elenco.push(valore);
    //    //alert(mappa.luoghi[i].descrizione);
    //  })
    //}).fail(function(){
    //  alert("Attenzione! Problemi di conenssione");
    //})

});
