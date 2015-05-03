// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master
var DBG = true;
var DISTANZA_ARRIVO = 30;         // distanza (in metri) entrpo la quale si giudica arrivati a destinazione
var GPS_TIMEOUT = 15000;           // intervallo di tempo della chiamata al GPS

var URL_PREFIX = "http://www.troni.it/passapport/";

var destinationType; // sets the format of returned value

// Funzione che calcola la distanza
// MAIN
var app = {
  // inixzializzazione di phonegap
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function(){
    document.addEventListener("deviceready", app.onDeviceReady, false);
  },
  onDeviceReady: function(){
    // ok, il dispositivo è pronto: configuralo
    // app.showAlert("Chiamata alla fine del caricamento","msg");
    destinationType=navigator.camera.DestinationType;
    // inizializza l'elenco delle mete
    mete.inizializza();
    // EVENTI DA LEGARE
    $("#btnEntra").on("click", pagine.nextPage);
    $("#btnNext").on("click", pagine.nextPage);
    $("#btnPrev").on("click", pagine.prevPage);
    $("#btnCheckPos").on("click", app.checkPos);
  },
  // chiamata quando la posizione è stata letta
  onSuccessGeo: function(position){
    // aggiorna le coordinate
    attesa(false,"");
    pagine.coordinate.lat = position.coords.latitude;
    pagine.coordinate.lng = position.coords.longitude;
    pagine.coordinate.alt = position.coords.altitude;
    dbgMsg(pagine.coordinate.lat  + " " + pagine.coordinate.lng );
    // aggiorna la distanza dalla meta corrente
    pagine.aggiornaDistanza();
  },
  // chiamata quando c'è un errore nella lettura della posizione
  onErrorGeo: function(error) {
    var msg;
    attesa(false,"");
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            msg = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            msg = "An unknown error, reading position, occurred."
            break;
    }
    showAlert(msg, "Errore");
  },
  // verifica la posizione GPS
  checkPos: function(){
    dbgMsg("check Pos");
    attesa(true, "cerco la posizione...");
    navigator.geolocation.getCurrentPosition(app.onSuccessGeo, app.onErrorGeo, { timeout: GPS_TIMEOUT });
  },
  capturePhoto: function() {
    app.showAlert("Fotografa!","Pronto?");
    navigator.camera.getPicture(app.onPhotoFileSuccess, app.onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
  },
  onPhotoFileSuccess: function(imageData) {
    // Get image handle
    var smallImage = document.getElementById('smallImage');    
    // Show the captured photo The inline CSS rules are used to resize the image
    smallImage.src = imageData;
  },
  onFail: function(msg){
    app.showAlert("Foto non riuscita: " + error.code,"msg");
  }
}


// classe con le mete
var mete = {
  // elenco dei luoghi
  elenco: [],
  inizializza: function(){
    var questo = mete.elenco;
    // aggiorna elenco mete
    // prima svuota
    while(questo.length > 0) {
      questo.pop();
    };
    questo.push({
      "id": "meta_" + 1,
      "nome": "Prima",
      "lat": "45.4439901",
      "lng":"12.3386693",
      "alt": "0"
      });
    questo.push({
      "id": "meta_" + 2,
      "nome": "Seconda",
      "lat": "45.443454",
      "lng": "12.338730",
      "alt": "0"
      });
    questo.push({
      "id": "meta_" + 3,
      "nome": "Terza",
      "lat": "45.442558",
      "lng": "12.338237",
      "alt": "0"
      });
    questo.push({
      "id": "meta_" + 4,
      "nome": "Quarta",
      "lat": "45.441684",
      "lng": "12.337671",
      "alt": "0"
      });
  }
}

// classe con le pagine
var pagine = {
  numPagina: 0,           // numero pagina attuale
  numMaxPagine: 0,        // numero max di pagine attualmente nel passapport
  // struttura con le coordinate e le altre info di geolocalizzazione
  coordinate: {
    lat: 0,
    lng: 0,
    alt: 0,
    dist: -1     // dalla meta attuale
  },
  // elenco dei luoghi
  lista: [],
  // va alla pagina successiva
  nextPage: function (){
    dbgMsg("Next page: "+pagine.numPagina + " max page: " + pagine.numMaxPagine);
    // verifica se siamo all'ultima pagina
    if( pagine.numPagina >= pagine.numMaxPagine){
      // se si aggiunge una meta?
      pagine.showMete();
    } else {
      // altrimenti vai alla pagina successiva e mostrale
      pagine.numPagina += 1;
      pagine.showPage();
    }
  },
  // va alla pagina precedente
  prevPage: function (){
    dbgMsg("Next page: "+pagine.numPagina + " max page: " + pagine.numMaxPagine);
    // se non siamo già alla copertina, va alla pagina precedente
    if( pagine.numPagina > 0 ) {
      pagine.numPagina -= 1;
    } else {
      // evita errori
      if(pagine.numPagina < 0){
        pagine.numPagina = 0;
      }
    }
    pagine.showPage();
  },
  // Mostra la pagina corrente
  showPage: function(){
    if(pagine.numPagina>0){
      // siamo dentro il passAPPort
      dbgMsg("mostra la pagina interna: ");
      $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
          transition: 'slide',
          changeHash: false,
          reverse: true,
          showLoadMsg: true
      });
      // cancella l'esistente
      $("#lblDistanza").empty();  
      $("#lblArrivato").empty();
      $("#lblCoordinate").empty();
      // scrive i nuovi dati
      var el = pagine.lista[pagine.numPagina-1];
      $("#tit-interno").html("<h2>Pag. "+ pagine.numPagina + " - " + el.nome + "</h2>");
      $("#lblCoordinate").html(el.lat + " - " + el.lng);
      if( el.arrivato>0){
        $("#lblArrivo").html("Arrivato: "+ el.dataora);  
      }
    } else {
      // mostra la copertina
      dbgMsg("mostra la copertina");
      $.mobile.pageContainer.pagecontainer("change", "#page-home", {
          transition: 'flip',
          changeHash: false,
          reverse: true,
          showLoadMsg: true
      });
    }
  },
  // mostra la pagina con l'elenco delle mete
  showMete: function (){
    dbgMsg("mostra l'elenco delle mete");
    $.mobile.pageContainer.pagecontainer("change", "#page-elencomete", {
        transition:   'flip',
        changeHash:   false,
        reverse:      true,
        showLoadMsg:  true
    });
    pagine.elencaMete();
  },
  // crea l'elenco mete 
  elencaMete: function() {
    $('#lstMete').empty();
    $.each(mete.elenco, function(key, value){
      var testo = '<li id="meta_'+ key +'" ><a href="#" >';
      testo += value.nome ;
      testo += '</a></li>';
      $('#lstMete').append(testo);
      $("#lstMete li#meta_"+key).bind("click", function(){
          alert("Aggiungi meta: " + key);
          pagine.nuovaMeta(key);
      });
    });
    $('#lstMete').listview("refresh");
  },
  // aggiunge una meta al database
  nuovaMeta: function (id){
    var dt = new Date();
    var sTime = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    $.each(pagine.lista, function(key, value){
      // evita di aggiungere più volte la stessa meta se non è ancora stata raggiunta o se è stata raggiunta oggi
      if(value.id == id && (value.arrivato == 0 || value.dataora.indexOf(sTime) >= 0)){
        return;
      }
    })
    // aggiorna l'indicatore del numero di pagine totale
    pagine.numMaxPagine +=1;
    // inserisce i dati della meta nell'array delle pagine
    pagine.lista.push({
        "id": id,
        "nome": mete.elenco[id].nome,
        "lat": mete.elenco[id].lat,
        "lng": mete.elenco[id].lng,
        "alt": mete.elenco[id].alt,
        "arrivato":"0",
        "dataora":"0000-00-00 00:00:00"
        });
    // mostra la pagina
    pagine.nextPage();
  },
  aggiornaDistanza: function(){
    dbgMsg("Aggiorna Distanza");
    if( pagine.numPagina>0){
      var el = pagine.lista[pagine.numPagina-1];
      pagine.coordinate.dist = getDistanceFromLatLng(pagine.coordinate.lat, pagine.coordinate.lng, el.lat, el.lng);
      var dst = coordinate.dist;
      $("#lblDistanza").html("Distanza: "+ dst);
      // verifica se sei arrivato
      pagine.checkArrivato();
    }
  },
  // verifica la distanza
  checkArrivato: function(){
    // alert(coordinate.dist );
    dbgMsg("Check arrivato");
    var el = pagine.lista[pagine.numPagina-1];
    // SE non è ancora arrivato a questa meta
    if(!el.arrivato == 0 && pagine.coordinate.dist < DISTANZA_ARRIVO ){    
        showAlert("Sei arrivato!","BRAVO");
        capturePhotoWithData();
    }
  }
}


app.initialize();
