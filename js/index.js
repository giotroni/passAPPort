// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master
var DBG = true;
var DISTANZA_ARRIVO = 50;         // distanza (in metri) entrpo la quale si giudica arrivati a destinazione
var GPS_TIMEOUT = 10000;           // intervallo di tempo della chiamata al GPS
var GPS_MAXIMUMAGE = 60000;       // intervallo di tempo MASSIMO per cui tenre buono il dato
var MAI = '0000-00-00 00:00:00';
var INTERNET_SEMPRE = true;        // si collega ad internet anche se non in WiFi

var URL_PREFIX = "http://www.troni.it/passapport/";

var myFolderApp = "passAPPort";
var appDir = "";
var destinationType; // sets the format of returned value
var suffisso = 1;     // serve ad alternare le pagine in lettura
var id_User = 1;    // id dell'utilizzatore
var dragga = true;  // abilitato durante il drag
var direction = false;  // verso della transizione nello scorrimento delle pagine
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
    // app.checkConnection();
    // app.showAlert("Chiamata alla fine del caricamento","msg");
    app.setDir();   // memorizza il path della cartella applicazione
    destinationType=navigator.camera.DestinationType;
    // inizializza l'elenco delle mete e le pagine
    mete.inizializza();
    pagine.leggePagine();
    //app.checkPos();
    pagine.showPage();
    // EVENTI DA LEGARE
    $( "#popupDesc" ).enhanceWithin().popup(); // Abilita il pop-up che descrive le immagini per tutte le pagine
    $( "#popupMenu" ).enhanceWithin().popup(); // Abilita il pop-up con le opzioni
    $("div[data-role='panel']").panel().enhanceWithin();

    $("#btnSettings").on("click", pagine.settings);    
    $("#btnSettings1").on("click", pagine.settings);    
    $("#btnReset").on("click", pagine.reset);
    $("#btnSave").on("click", pagine.savePagine);
    $("#btnHome").on("click", pagine.home);    
    $("#btnHome1").on("click", pagine.home);
    $("#btnNuovaMeta").on("click", pagine.showMete);
    $("#btnLastPage").on("click", pagine.lastPage);
    $("#btnPagine").on("click", pagine.showElencoPagine);
    $(".numPagina").on("click", pagine.showElencoPagine);
    
    $("#btnDelete").on("click", function(){showYesNo("Vuoi DAVVERO cancellare questa meta?", pagine.cancellaPagina)} );
    $(".btnSx").on("click", pagine.prevPage);
    $(".btnDx").on("click", pagine.nextPage);
    // $("#btnNext1").on("click", pagine.nextPage);
    // $("#btnPrev1").on("click", pagine.prevPage);
    $("#btnCheckPos").on("click", app.checkPos);
//    $("#btnDelete1").on("click", function(){showYesNo("Vuoi DAVVERO cancellare questa meta?", pagine.cancellaPagina)} );
//    $("#btnPrev2").on("click", pagine.prevPage);
//    $("#btnCheckPos2").on("click", app.checkPos);
    $(".imgMeta").on("click", pagine.popupNote);
    //$("#imgMeta2").on("click", pagine.popupNote);
    $("#txtNota1").on( "change", pagine.memoNota );
    $("#txtNota2").on( "change", pagine.memoNota );
//    $(".imgOptions").on("click", pagine.popupMenu);
    $(".imgShare").on( "click", sharePhoto );
    
    var draggable = document.getElementById('draggable');
    var altezza = $(document).height();
    draggable.addEventListener('touchmove', function(event){
      // gestisce la timbratura
      if( dragga ){
        var touch = event.targetTouches[0];
        draggable.style.left = touch.pageX - 25 + 'px';
        draggable.style.top= touch.pageY - 25 + 'px';
        $("#btnDownload").html("alt" + (altezza *3 / 4)+"X:"+touch.pageX+" Y:"+touch.pageY  );
        if(touch.pageY  > (altezza *3 / 4)){
            draggable.style.left = '45%';
            draggable.style.top= '1em';
            dragga = false;
            showAlertModal("Bravo", app.capturePhoto, "Messaggio");
        }
        event.preventDefault();            
      }
    }, false);

    //$.event.special.swipe.horizontalDistanceThreshold = 120;
    $(".interno").on("swiperight", function(event){
      // dbgMsg("swipe right");
      if( event.handled !== true){
        // dbgMsg("Swipe ok");
        pagine.prevPage();
        event.handled = true;
      }
      return false;         
    });
    $(".interno").on("swipeleft", function(event){
      // dbgMsg("swipe left");
      if( event.handled !== true){
        // dbgMsg("Swipe ok");
        pagine.nextPage();
        event.handled = true;
      }
      return false;         
    });
    $(".copertina").on("swipeleft", function(event){
      // dbgMsg("swipe left");
      if( event.handled !== true){
        // dbgMsg("Swipe ok");
        pagine.nextPage();
        event.handled = true;
      }
      return false;         
    });
    $(window).on("navigate", function (event, data) {
      var direzione = data.state.direction;
      if (direzione == 'back' && pagine.paginaMeteVisibile) {
        // do something
        pagine.showPage();
      }
    });
    dbMsg("Partito user:" + id_User );
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
    attesa(true, "Memorizzo");
    // azzera il database
    app.storage.clear();
    pagine.scrivePagine();
    mete.scriveMete();
    attesa(false, "");
  },
  // chiamata quando c'è un errore nella lettura della posizione
  onErrorGeo: function(error) {
    var msg;
    attesa(false,"");
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "E' stata disabilitata la geolocalizzazione."
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "La localizzazione non è disponibile."
            break;
        case error.TIMEOUT:
            msg = "Tempo scaduto nella localizzazione."
            break;
        case error.UNKNOWN_ERROR:
            msg = "Errore sconosciuto, cercando la posizione."
            break;
    }
    showAlert(msg + " Verifica se il GPS è abilitato", "Errore");
  },
  // verifica la posizione GPS
  checkPos: function(){
    // dbgMsg("check Pos");
    attesa(true, "cerco la posizione...");
    navigator.geolocation.getCurrentPosition(app.onSuccessGeo, app.onErrorGeo, { maximumAge: GPS_MAXIMUMAGE, timeout: GPS_TIMEOUT });
  },
  // fa la foto
  capturePhoto: function() {
    navigator.camera.getPicture(
      app.onPhotoFileSuccess,
      fail,
      {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true
      }
    );
  },
  // Foto ok
  onPhotoFileSuccess: function(imageData) {
    // Get image handle
    //var smallImage = document.getElementById('smallImage');    
    //// Show the captured photo The inline CSS rules are used to resize the image
    //smallImage.src = imageData;
    // memorizza la foto nell'array delle mete
    pagine.scriviFoto(imageData);
  },
  // verifica se il wifi è abilitato O SE è stato autorizzato comunque il trasferimento dati in 3G
  checkWifi: function(){
    var networkState = navigator.network.connection.type;
    if( networkState == Connection.WIFI || (INTERNET_SEMPRE && (networkState !== Connection.NONE) ) ){
      return true;
    } else {
      return false;
    }
  },
  // memorizza il path della cartella 
  setDir: function(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,     // accede al file system
      function(fileSys) {                                     // ok accede
        //The folder is created if doesn't exist
        fileSys.root.getDirectory(
          myFolderApp, {create:true, exclusive: false},
          function(directory) {                           // cartella creata
            appDir = directory.toURL();
            //dbgMsg("Cartella della app pronta: " + appDir );
          },
          fail
        );
      },
      fail                                              // accesso al file system non riuscito
    );
  },
  // scarica un file da internet
  downloadFile: function(origine, nome){
    var uri = encodeURI(origine);
    var dest = appDir + nome;
    var ft = new FileTransfer();
    ft.download(
        uri,
        dest,
        function(theFile) {
        },
        fail
    );
  }
}

// classe con le mete
var mete = {
  // elenco dei luoghi
  elenco: [],
  areaMete: 1,
  versioneMete: 1,
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
      if ("areaMete" in localStorage){
        mete.areaMete = app.storage.getItem("areaMete");
      }
      if ("versioneMete" in localStorage){
        versioneMete = app.storage.getItem("versioneMete");
      }
      dbgMsg("Legge mete da DB interno: " + lung);
      for(i=0; i<lung; i++){
        var valore = app.storage.getItem("meta"+i);
        // dbgMsg(valore);
        questo.push(JSON.parse(valore));
      }
    } else if( app.checkWifi() ){
      // legge dal sito
      attesa(true, "Attendere: aggiorno l'elenco delle mete");
      dbgMsg("Legge mete da internet, area:  " + mete.areaMete);
      $.ajax({
        type: 'GET',
        url: URL_PREFIX + 'php/leggiMete.php',
        data: {
          area: mete.areaMete
          },
        cache: false
      }).done(function(result) {
        dbgMsg("Lette le mete: " + result)
        var obj = $.parseJSON(result);
        $.each(obj, function(i, valore){
          questo.push(valore);
          // scarica l'immagine
          var img = valore.img;
          if(img.length>0){
            app.downloadFile(URL_PREFIX + "php/img/" + img, img);
          }
          img = valore.timbro;
          if(img.length>0){
            app.downloadFile(URL_PREFIX + "php/img/" + img, img);
          }
        })
        mete.scriveMete();    // salva i dati nel DB interno
        attesa(false, "");
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
 // Memorizza le mete nel DB interno
  scriveMete: function(){
    app.storage.setItem("numMete", mete.elenco.length);
    app.storage.setItem("areaMete", mete.areaMete);
    app.storage.setItem("versioneMete", mete.versioneMete);
    $.each(mete.elenco, function(key, value){
      var valore = JSON.stringify(value);
      app.storage.setItem("meta"+key, valore)  
    })
  },
  // aggiorna la lista dei mappa.luoghi, ordinandola sulla base della distanza
  sortMete: function(){
    $.each(mete.elenco, function(key, value){
      value.dist = getDistanceFromLatLng(value.lat, value.lng, pagine.coordinate.lat, pagine.coordinate.lng )
    })
    mete.elenco.sort(mycomparator);    
  }

}

// classe con le pagine
var pagine = {
  numPagina: 0,           // numero pagina attuale
  paginaMeteVisibile: false,
  saved: true,            // flag che indica se le pagine sono state salvate sul DB internet
  // struttura con le coordinate e le altre info di geolocalizzazione
  coordinate: {
    lat: 0,
    lng: 0,
    alt: 0
  },
  // elenco dei luoghi
  lista: [],
  // verifica se la pagina i è già arrivata
  arrivato: function(i){
    var retVal = false;
    if(i>0 && i<= pagine.lista.length){
      retVal = pagine.lista[i-1].dataora.indexOf(MAI) <0;
    }
    return retVal 
  },
  // verifica se in zona VICINA
  vicino: function(){
    var el  = pagine.lista[pagine.numPagina-1].dist;
    // dbgMsg(el + " " + DISTANZA_ARRIVO + " + " + (el <= DISTANZA_ARRIVO) );
    return ((el >= 0) && (el <= DISTANZA_ARRIVO));
  },
  // conta i punti
  checkPunti: function(){
    var pti = 0;
    $.each(pagine.lista, function(key, value){
      if(pagine.arrivato(key+1)){
        pti += (value.punti * 1);
      }
    });
    return pti;
  },
  // va alla pagina copertina
  home: function (){
    pagine.numPagina = 0;
    pagine.showPage();
  },
  // va all'ultima pagina
  lastPage: function(){
    pagine.numPagina=pagine.lista.length;
    pagine.showPage();
  },
  // va alla pagina dei settings
  settings: function (){
    $.mobile.pageContainer.pagecontainer("change", "#page-settings", {
      transition: 'slide',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
    });
  },
  // va alla pagina successiva
  nextPage: function (){
    // dbgMsg("Next page: "+pagine.numPagina + " max page: " + pagine.numMaxPagine());
    // verifica se siamo all'ultima pagina
    direction = false;
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
    direction = true;
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
    dragga = true;
    if(pagine.numPagina>0){
      suffisso = suffisso % 2 +1; // alterna le pagine per geenrare l'effetto dello scorrimento
      $.mobile.pageContainer.pagecontainer("change", "#page-interno"+suffisso, {
          transition: 'slide',
          reverse:direction
      });
      // cancella l'esistente
      $("#lblDistanza"+suffisso).empty();  
      // scrive i nuovi dati
      var el = pagine.lista[pagine.numPagina-1];
      $("#tit-interno"+suffisso).html("<b>"+el.meta+"</b");
      $("#numPagina"+suffisso).html("<i><b>pag. "+pagine.numPagina +"</b></i>")
      $('#imgMeta'+suffisso).css('background-image', 'url('+appDir + el.img+')');
      $("#txtNota"+suffisso).val(el.note);
      if(  pagine.arrivato(pagine.numPagina ) ){
        $('.imgShare').show();
        $('#smallImage'+suffisso).show();
        $('#smallImage'+suffisso).attr('src',el.foto);
        $("#lblArrivo"+suffisso).css("color","green");
        $("#lblArrivo"+suffisso).html("Arrivato il:<br>"+txtDataora(el.dataora));
        $('#imgTimbro'+suffisso).show();
        $('#imgTimbro'+suffisso).attr('src',appDir + el.timbro);
        var sData = adesso().substring(0, 10);
        if (el.dataora.indexOf(sData) >= 0){ // è oggi!!
          $("#txtNota"+suffisso).attr("disabled", false);  
        } else {
          // dal giorno successivo all'arrivo, le note non sono più modificabili
          $("#txtNota"+suffisso).attr("disabled", true);  
        }
      } else {
        $("#txtNota"+suffisso).attr("disabled", false);  
        $('.imgShare').hide();
        $('#smallImage'+suffisso).hide();
        $('#smallImage'+suffisso).attr('src', '');
        $("#lblArrivo"+suffisso).css("color","red");
        $("#lblArrivo"+suffisso).html("Non ancora arrivato");
        $('#imgTimbro'+suffisso).hide();
        $('#imgTimbro'+suffisso).attr('src','');
      }
    } else {
      // mostra la copertina
      $.mobile.pageContainer.pagecontainer("change", "#page-home", {
          transition: 'flip'
      });
      $("#lblPunti").html("<b>Hai " +  pagine.checkPunti() +" punti</b>");
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
    mete.sortMete();
    pagine.paginaMeteVisibile = true;
    pagine.elencaMete();
  },
  // mostra la pagina con l'elenco delle pagine
  showElencoPagine: function(){
    $.mobile.pageContainer.pagecontainer("change", "#page-elencopagine", {
        transition:   'flip',
        changeHash:   false,
        reverse:      true,
        showLoadMsg:  true
    });
    pagine.elencaPagine();
  },
  // crea l'elenco mete 
  elencaMete: function() {
    $('#lstMete').empty();
    
    $.each(mete.elenco, function(key, value){
      var testo = '<li id="meta_'+ key +'" ><a href="#" >';
      testo += '<img src="' + appDir + value.img +'">';
      testo += value.meta + ' - ' + value.localita;
      testo += '<p>'+value.desc + '</p>';
      testo += '</a></li>';
      $('#lstMete').append(testo);
      $("#lstMete li#meta_"+key).bind("click", function(){
          dbgMsg("Aggiungi meta - key " + key + " id " + value.id + " meta " + value.meta);
          pagine.nuovaMeta(key);
      });
    });
    $('#lstMete').listview("refresh");
  },
  // crea l'elenco pagine
  elencaPagine: function(){
    $('#lstPagine').empty();
    $.each(pagine.lista, function(key, value){
      var nPag = key*1+1;
      var testo = '<li id="pag_'+ nPag+'" ><a href="#" >';
      testo += '<img src="' + appDir + value.img +'">';
      testo += "pag. " + nPag + " - " + value.meta;
      if(  pagine.arrivato( key ) ){
        testo += "<p>Arrivato il:<br>"+txtDataora(value.dataora)+"</p>";
      } else {
        testo += "<p>Non Arrivato</p>";
      }
      testo += '</a></li>';
      dbgMsg("testo: " + testo);
      $('#lstPagine').append(testo);
      $("#lstPagine li#pag_"+nPag).bind("click", function(){
        dbgMsg("Vai a pagina: " + nPag);
        pagine.numPagina = nPag;
        pagine.showPage();
      });
    })
    $('#lstPagine').listview("refresh");
  },
  // aggiunge una meta al database
  nuovaMeta: function (id){
    var metaOK = true;
    var sData = adesso().substring(0, 10);
    // dbgMsg(sData);
    paginaMeteVisibile = false;
    // dbgMsg("id " + mete.elenco[id].id);
    $.each(pagine.lista, function(key, value){
      // evita di aggiungere più volte la stessa meta se non è ancora stata raggiunta o se è stata raggiunta oggi
      // dbgMsg("value.id " + value.idMeta);
      if(value.idMeta == mete.elenco[id].id ){
        //dbgMsg(value.dataora + " " + value.dataora.indexOf(sData));
        if (value.dataora.indexOf(sData) >= 0){
          showAlert("Non si può aggiungere: meta raggiunta oggi", "Attenzione");
          pagine.numPagina = key+1;
          metaOK = false;
          return false;
        } else if( value.dataora.indexOf('0000-00-00')>=0){
          showAlert("Non si può aggiungere: meta presente", "Attenzione");
          pagine.numPagina = key+1;
          metaOK = false;
          return false;
        }
      }
    });
    // dbgMsg("meta ok: " + metaOK);
    if( metaOK){
      numPagina = pagine.lista.length;
      // inserisce i dati della meta nell'array delle pagine
      // dbgMsg("id: " + id + " " + mete.elenco[id].id + " " + mete.elenco[id].meta);
      pagine.lista.push({
          "idMeta": mete.elenco[id].id,
          "meta": mete.elenco[id].meta,
          "lat": mete.elenco[id].lat,
          "lng": mete.elenco[id].lng,
          "alt": mete.elenco[id].alt,
          "img": mete.elenco[id].img,
          "timbro": mete.elenco[id].timbro,
          "punti": mete.elenco[id].punti,
          "desc": mete.elenco[id].desc,
          "localita": mete.elenco[id].localita,
          "area": mete.area,
          "note": "",
          "dist": -1,
          "saved": true,
          // "arrivato":"0",
          "dataora": MAI,
          "foto": "",
          "altro": ""
          });
      pagine.saved = false;
      pagine.scrivePagine();
      // mostra la pagina
      pagine.nextPage();
    } else {
      pagine.showPage();
    }
  },
  // aggiorna i dati sulla distanza
  aggiornaDistanza: function(){
    // dbgMsg("Aggiorna Distanza");
    if( pagine.numPagina>0){
      var el = pagine.lista[pagine.numPagina-1];
      el.dist = getDistanceFromLatLng(pagine.coordinate.lat, pagine.coordinate.lng, el.lat, el.lng);
      var dst = el.dist;
      $("#lblDistanza1").html("Distanza: "+ strDistanza(dst));
      $("#lblDistanza2").html("Distanza: "+ strDistanza(dst));
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
    if(!pagine.arrivato(pagine.numPagina) && pagine.vicino() ){
      el.dataora = adesso();
      pagine.saved = false;
      el.saved = false;
      // vibra(1000);
      // var my_media = new Media("audio/audio_suonerie_applauso_01.mp3");
      // my_media.play();
      // showAlertModal("Sei arrivato! Pronto per la foto ricordo?",app.capturePhoto,"BRAVO");
      navigator.vibrate(500);
      $.mobile.pageContainer.pagecontainer("change", "#page-arrivo", {
          transition: 'slide',
          changeHash: false,
          reverse: true,
          showLoadMsg: true
      });
    }
  },
  // memorizza l'indirizzo della foto
  scriviFoto: function( tst ){
    // dbgMsg(tst);
    var el = pagine.lista[pagine.numPagina-1];
    el.foto = tst;
    el.saved = false;
    pagine.saved = false;
    pagine.scrivePagine();
    pagine.showPage();
  },
  // legge dalla memoria le pagine
  leggePagine: function(){
    //dbgMsg("Legge pagine");
    if ("pagineSaved" in localStorage){
      pagine.saved = app.storage.getItem("pagineSaved");
    }
    if ("numPagine" in localStorage){
      attesa(true, "memorizzo");
      var lung = app.storage.getItem("numPagine");
      // dbgMsg(lung);
      for(var i=0; i<lung; i++){
        var valore = app.storage.getItem("pag"+i);
        // dbgMsg(valore);
        pagine.lista.push(JSON.parse(valore));
      }
      //pagine.resetLstPagine();
      attesa(false, "");
    }
  },
  // scrive in memoria locale le pagine e le mete
  scrivePagine: function(){
    // dbgMsg("Scrive pagine");
    // salva le pagine
    app.storage.setItem("numPagine", pagine.lista.length);
    app.storage.setItem("pagineSaved", pagine.saved);
    $.each(pagine.lista, function(key, value){
      var valore = JSON.stringify(value);
      // dbgMsg(valore);
      app.storage.setItem("pag"+key, valore)  
    })
    // pagine.savePagine();
  },
  // salva le pagine sul DB internet
  savePagine: function(){
    dbgMsg("Save Pagine - " + pagine.saved);
    if(!pagine.saved && app.checkWifi() ){
      // se le pagine non sono state salvate e c'è la connessione salva le pagine su internet
      dbgMsg("Save pagine");
      var listaProvvisoria = [];
      // legge le pagine e memorizza quelle non salvate per salvarle sul DB internet
      $.each(pagine.lista, function(key, value){
        dbgMsg(value.meta + " " + value.saved);
        if( !value.saved ){
          listaProvvisoria.push(value);
        }
      });
      // salva l'array
      $.ajax({
        type: 'GET',
        url: URL_PREFIX + 'php/savePagine.php',
        data: {
          id: id_User,
          arr: JSON.stringify(listaProvvisoria)
          },
        cache: false
      }).done(function(result) {
        dbgMsg(result)
        $.each(pagine.lista, function(key, value){
          value.saved = true;
        });
        pagine.saved = true;
        scrivePagine();
      }).fail(function(){
        showAlert("Problemi di conessione", "Attenzione!");
      })
    }
  },
  // fa venir fuori il popup con le info sulla meta
  popupNote: function(){
    //$("#popupDesc" ).on( "popupafteropen", function( event, ui ) {dbgMsg("PopUp Note fatta");} );
    var el = pagine.lista[pagine.numPagina-1];
    var txt = "<b>"+el.meta;
    txt +=  "</b><br>" + el.desc;
    txt += "<br>Vale: "+ el.punti + " punti";
    txt +=  "<br><i>lat:</i> " + el.lat + "<br><i>Long:</i> " + el.lng + "<br><i>Alt:</i> " + el.alt;
    $("#popupLblDesc").html(txt);
    $("#popupDesc").popup( "open" );
    
  },
  // elimina una pagina ind
  cancellaPagina: function( ind ){
    if(ind == 1){
      pagine.lista.splice(pagine.numPagina-1, 1);
      if(pagine.numPagina > pagine.lista.length ){
        pagine.numPagina = pagine.lista.length;
      }
      pagine.showPage();
    }
  },
  // cancella tutto
  reset: function(){
    dbgMsg("Reset");
    app.storage.clear();
  },
  // memorizza la nota
  memoNota: function(){
    pagine.lista[pagine.numPagina-1].note = $("#txtNota"+suffisso).val();
    // dbgMsg(pagine.lista[pagine.numPagina-1].note);
  }
}

app.initialize();
