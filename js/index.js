// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master

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
  pagine.checkArrivato();
}
// chiamata quando c'è un errore nella lettura della posizione
app.onErrorGeo  = function(error) {
  alert("nessun dato dal GPS...");
}
// verifica la posizione GPS
app.checkPos = function(){
  alert("check Pos");
  navigator.geolocation.getCurrentPosition(app.onSuccessGeo, app.onErrorGeo);
}
// Mostra la pagina corrente
app.showPage = function(){
    $("#tit-interno").html("<h2>Pag. "+ app.numPagina + " - " + pagine.lista[app.numPagina-1].nome + "</h2>");
    $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
        transition: 'slide',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });    
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
  lista: []
}
// classe con le coordinate
var coordinate = {
  lat: 0,
  long: 0
}

pagine.checkArrivato = function(){
  var el = pagine.lista[app.numPagina-1];
  var dst = getDistanceFromLatLng(coordinate.lat, coordinate.long, el.lat, el.long);
  alert(dst);
  if( getDistanceFromLatLng  < 50 ){
    alert("arrivato");
  }
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
