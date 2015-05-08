// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master
var DBG = true;
var DISTANZA_ARRIVO = 50;         // distanza (in metri) entrpo la quale si giudica arrivati a destinazione
var GPS_TIMEOUT = 15000;           // intervallo di tempo della chiamata al GPS
var MAI = "0000-00-00 00:00:00";
var INTERNET_SEMPRE = true;        // si collega ad internet anche se non in WiFi

var URL_PREFIX = "http://www.troni.it/passapport/";

var destinationType; // sets the format of returned value

// Funzione che calcola la distanza
// MAIN
var app = {
  storage: window.localStorage,   // per il salvataggio locale delle info
  // inixzializzazione di phonegap
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function(){
    document.addEventListener("deviceready", app.onDeviceReady, false);
  },
  onDeviceReady: function(){
    // ok, il dispositivo è pronto: configuralo
    app.checkConnection();
    // app.showAlert("Chiamata alla fine del caricamento","msg");
    destinationType=navigator.camera.DestinationType;
    // inizializza l'elenco delle mete e le pagine
    mete.inizializza();
    pagine.leggePagine();
    // EVENTI DA LEGARE
    $("#btnReset").on("click", pagine.reset);
    $("#btnEntra").on("click", pagine.nextPage);
    $("#btnNext").on("click", pagine.nextPage);
    $("#btnPrev").on("click", pagine.prevPage);
    $("#btnCheckPos").on("click", app.checkPos);
    
    $.event.special.swipe.horizontalDistanceThreshold = 120;
    $(document).on("swiperight", "#page-home", pagine.nextPage);
    
  },
  // chiamata quando la posizione è stata letta
  onSuccessGeo: function(position){
    // aggiorna le coordinate
    attesa(false,"");
    pagine.coordinate.lat = position.coords.latitude;
    pagine.coordinate.lng = position.coords.longitude;
    pagine.coordinate.alt = position.coords.altitude;
    // dbgMsg(pagine.coordinate.lat  + " " + pagine.coordinate.lng );
    // aggiorna la distanza dalla meta corrente
    pagine.aggiornaDistanza();
  },
  // memorizza i dati della APP
  salvaDati: function(){
    attesa("memorizzo", true);
    // azzera il database
    app.storage.clear();
    pagine.scrivePagine();
    mete.scriveMete();
    attesa("", false);
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
    // dbgMsg("check Pos");
    attesa(true, "cerco la posizione...");
    navigator.geolocation.getCurrentPosition(app.onSuccessGeo, app.onErrorGeo, { timeout: GPS_TIMEOUT });
  },
  capturePhoto: function() {
    navigator.camera.getPicture(
      app.onPhotoFileSuccess,
      app.onFail,
      {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true
      }
    );
  },
  onPhotoFileSuccess: function(imageData) {
    // Get image handle
    //var smallImage = document.getElementById('smallImage');    
    //// Show the captured photo The inline CSS rules are used to resize the image
    //smallImage.src = imageData;
    // memorizza la foto nell'array delle mete
    pagine.saveFoto(imageData);
  },
  onFail: function(msg){
    showAlert("Foto non riuscita: " + error.code,"msg");
  },
  checkConnection: function() {
    var networkState = navigator.network.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
    dbgMsg('Connection type: ' + states[networkState]);
  },
  checkWifi: function(){
    var networkState = navigator.network.connection.type;
    if( networkState == Connection.WIFI || (INTERNET_SEMPRE && (networkState != Connection.NONE) ) ){
      return true;
    } else {
      return false;
    }
  }
}

// classe con le mete
var mete = {
  // elenco dei luoghi
  elenco: [],
  // inizializza il database interno delle mete
  inizializza: function(){
    var questo = mete.elenco;
    while(questo.length > 0) { // svuota l'array esistente
      questo.pop();
    };
    // aggiorna elenco mete
    if ("numMete" in localStorage){
      // legge le mete dal DB interno
      var lung = app.storage.getItem("numMete");
      dbgMsg("Legge mete da DB interno: " + lung);
      for(i=0; i<lung; i++){
        var valore = app.storage.getItem("meta"+i);
        // dbgMsg(valore);
        questo.push(JSON.parse(valore));
      }
    } else if( app.checkWifi() ){
      // legge dal sito
      dbgMsg("Legge mete da internet")
      $.ajax({
        type: 'GET',
        url: URL_PREFIX + 'php/leggiMete.php',
        data: {
          area: 1
          },
        cache: false
      }).done(function(result) {
        dbgMsg(result)
        var obj = $.parseJSON(result);
        $.each(obj, function(i, valore){
          questo.push(valore);
        })
        mete.scriveMete();    // salva i dati nel DB interno
      }).fail(function(){
        showAlert("Problemi di conessione", "Attenzione!");
      })
    } else {
      // niente da fare
      showAlert("Non c'è la rete", "Attenzione!");
    }
  },
  // verifica se ci sono nuove mete da scaricare
  checkmete: function(){
      var networkState = navigator.network.connection.type;
    // verifica se siamo in WIFI
    if( networkState == Connection.WIFI ){
      
    }
  },
  scriveMete: function(){
    app.storage.setItem("numMete", mete.elenco.length);
    $.each(mete.elenco, function(key, value){
      var valore = JSON.stringify(value);
      // dbgMsg(valore);
      app.storage.setItem("meta"+key, valore)  
    })
  }
}

// classe con le pagine
var pagine = {
  numPagina: 0,           // numero pagina attuale
  // struttura con le coordinate e le altre info di geolocalizzazione
  coordinate: {
    lat: 0,
    lng: 0,
    alt: 0
  },
  // elenco dei luoghi
  lista: [],
  // verifica se già arrivato
  arrivato: function(){
    var el  = pagine.lista[pagine.numPagina-1].dataora;
    dbgMsg(el + " + " + MAI + " + " + el.indexOf(MAI) + " + " + el.indexOf('0000'));
    dbgMsg(el == MAI + " + " + el.localCompare(MAI));
    return el.indexOf(MAI) >0;
  },
  // verifica se in zona VICINA
  vicino: function(){
    var el  = pagine.lista[numPagina-1].dist;
    return ((el >= 0) && (el <= DISTANZA_ARRIVO));
  },
  // conta i punti
  checkPunti: function(){
    var pti = 0;
    $.each(this.lista, function(key, value){
      if(value.dataora.indexOf(MAI)>0){
        pti += value.punti;
      }
    });
    return pti;
  },
  // va alla pagina successiva
  nextPage: function (){
    // dbgMsg("Next page: "+pagine.numPagina + " max page: " + pagine.numMaxPagine());
    // verifica se siamo all'ultima pagina
    if( pagine.numPagina >= pagine.lista.length){
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
    // dbgMsg("Next page: "+pagine.numPagina + " max page: " + pagine.numMaxPagine);
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
      // dbgMsg("mostra la pagina interna: ");
      $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
          transition: 'slide',
          changeHash: false,
          reverse: true,
          showLoadMsg: true
      });

      var smallImage = document.getElementById('smallImage');    

      // cancella l'esistente
      $("#lblDistanza").empty();  
      $("#lblArrivo").empty();
      $("#lblCoordinate").empty();
      // scrive i nuovi dati
      var el = pagine.lista[pagine.numPagina-1];
      $("#tit-interno").html("<h2>Pag. "+ pagine.numPagina + " - " + el.nome + "</h2>");
      // dbgMsg(el.foto);
      $("#lblCoordinate").html(el.lat + " - " + el.lng);
      if(  pagine.arrivato() ){
        $("#lblArrivo").html("Arrivato: "+ el.dataora);
        smallImage.src = el.foto;
      } else {
        $("#lblArrivo").html("Non ancora arrivato");
        smallImage.src = "";
      }
    } else {
      // mostra la copertina
      // dbgMsg("mostra la copertina");
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
    // dbgMsg("mostra l'elenco delle mete");
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
          // dbgMsg("Aggiungi meta: " + key);
          pagine.nuovaMeta(key);
      });
    });
    $('#lstMete').listview("refresh");
  },
  // aggiunge una meta al database
  nuovaMeta: function (id){
    var metaOK = true;
    var sData = adesso().substring(0, 10);
    // dbgMsg(sData);
    $.each(pagine.lista, function(key, value){
      // evita di aggiungere più volte la stessa meta se non è ancora stata raggiunta o se è stata raggiunta oggi
      // dbgMsg(value.arrivato + " " + value.dataora);
      if(value.id == id ){
        if (value.dataora.indexOf(sData) >= 0){
          showAlert("Meta già raggiunta oggi", "Attenzione");
        } else if( value.dataora.indexOf('0000-00-00')>0){
          showAlert("Meta già presente", "Attenzione");
        }
        metaOK = false;
        return false;
      }
    });
    // dbgMsg("meta ok: " + metaOK);
    if( metaOK){
      // inserisce i dati della meta nell'array delle pagine
      pagine.lista.push({
          "id": id,
          "nome": mete.elenco[id].nome,
          "lat": mete.elenco[id].lat,
          "lng": mete.elenco[id].lng,
          "alt": mete.elenco[id].alt,
          "img": mete.elenco[id].img,
          "timbro": mete.elenco[id].timbro,
          "punti": mete.elenco[id].punti,
          "nota": mete.elenco[id].nota,
          "dist": -1,
          // "arrivato":"0",
          "dataora": MAI,
          "foto": ""
          });
      pagine.scrivePagine();
      // mostra la pagina
      pagine.nextPage();
    } else {
      pagine.showPage();
    }
  },
  aggiornaDistanza: function(){
    // dbgMsg("Aggiorna Distanza");
    if( pagine.numPagina>0){
      var el = pagine.lista[pagine.numPagina-1];
      el.dist = getDistanceFromLatLng(pagine.coordinate.lat, pagine.coordinate.lng, el.lat, el.lng);
      var dst = el.dist;
      $("#lblDistanza").html("Distanza: "+ strDistanza(dst));
      // verifica se sei arrivato
      pagine.checkArrivato();
    }
  },
  // verifica la distanza
  checkArrivato: function(){
    // alert(dati.dist );
    var el = pagine.lista[pagine.numPagina-1];
    // dbgMsg("Check arrivato: " + el.arrivato + " dist " + el.dist );
    // SE non è ancora arrivato a questa meta
    if(!pagine.arrivato() && pagine.vicino() ){
      el.dataora = adesso();
      // vibra(1000);
      // var my_media = new Media("audio/audio_suonerie_applauso_01.mp3");
      // my_media.play();
      showAlertModal("Sei arrivato! Pronto per la foto ricordo?",app.capturePhoto,"BRAVO");
    }
  },
  // memorizza l'indirizzo della foto
  saveFoto: function( tst ){
    // dbgMsg(tst);
    var el = pagine.lista[pagine.numPagina-1];
    el.foto = tst;
    var smallImage = document.getElementById('smallImage');    
    smallImage.src = el.foto;
    pagine.scrivePagine();
  },
  // legge dalla memoria le pagine
  leggePagine: function(){
    dbgMsg("Legge pagine");
    if ("numPagine" in localStorage){
      attesa("memorizzo", true);
      var lung = app.storage.getItem("numPagine");
      // dbgMsg(lung);
      for(i=0; i<lung; i++){
        var valore = app.storage.getItem("pag"+i);
        // dbgMsg(valore);
        pagine.lista.push(JSON.parse(valore));
      }
      attesa("", false);
    }
  },
  // scrive in memoria le pagine e le mete
  scrivePagine: function(){
    dbgMsg("Scrive pagine");
    // salva le pagine
    app.storage.setItem("numPagine", pagine.lista.length);
    $.each(pagine.lista, function(key, value){
      var valore = JSON.stringify(value);
      // dbgMsg(valore);
      app.storage.setItem("pag"+key, valore)  
    })
  },
  // cancella tutto
  reset: function(){
    // dbgMsg("Reset");
    app.storage.clear();
  }
}

app.initialize();
