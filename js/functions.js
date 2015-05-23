// Funzioni d'uso vario
// calcola la distanza tra due coordinate (2D)
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
// restituisce il valore in radianti dai gradi
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// mostra un messaggio
function showAlert (message, title) {
    if (navigator.notification) {
        navigator.notification.alert(message, null, title, 'OK');
    } else {
        alert(title ? (title + ": " + message) : message);
    }
}
// mostra un messaggio e lancia una funzione dopo
function showAlertModal (message, func, title) {
    if (navigator.notification) {
        navigator.notification.alert(message, func, title, 'OK');
    } else {
        alert(title ? (title + ": " + message) : message);
        func();
    }
}
// vibra
function vibra(mm){
    if (navigator.notification) {
      navigator.notification.vibrate(mm)
    }
}
// messaggi diagnostici
function dbgMsg(msg){
  if(DBG){
    //showAlert(msg, "Debug");
    writeLog(msg);
  }
}
// mostra l'icona dell'attesa
function attesa(valore, testo){
  if (valore) {
    $.mobile.loading( "show", {
            text: testo,
            textVisible: true,
            theme: 'b',
            textonly: false,
            html: ""
    });
  } else {
    $.mobile.loading( "hide" );
  }
}
// formatta la distanza in modo "umano"
function strDistanza(x){
  var num = x;
  var val = " mt";
  if(x>1000){
    num = x/1000;
    val = " km";
  }
  return (num.toFixed(1) + val);
}
// formatta un numero con (almeno) due caratteri, inserendo uno 0 in testa
function twoDigits( x ){
  var st = "";
  if( x > 9) {
    st = x;
  } else {
    st = "0" + x;
  }
  return st;
}
// restituisce l'ora attuale nel formato 0000-00-00 00:00:00
function adesso(){
  var dt = new Date();
  var sGiorno = dt.getFullYear() + "-" + (twoDigits(dt.getMonth()*1+1)) + "-" + twoDigits(dt.getDate());
  var sOra= twoDigits(dt.getHours()) + ":" + twoDigits(dt.getMinutes()) + ":" + twoDigits(dt.getSeconds());
  // dbgMsg("adesso: " + sGiorno + " " + sOra)
  return (sGiorno + " " + sOra);
}

// Show a custom confirmation dialog
//
function showYesNo( msg, func ) {
  navigator.notification.confirm(
    msg, // message
     func,            // callback to invoke with index of button pressed
    'ATTENZIONE',           // title
    ['Si','No']         // buttonLabels
  );
}

// funzione per l'ordinamento di una lista di numeri float
function mycomparator(a,b) {
    return parseFloat(a.dist) - parseFloat(b.dist) ;
}
// funzione che ritorna il formato data ora in modo "leggibile
function txtDataora( dt ){
  var month = new Array();
  month[0] = "gen";
  month[1] = "feb";
  month[2] = "mar";
  month[3] = "apr";
  month[4] = "mag";
  month[5] = "giu";
  month[6] = "lug";
  month[7] = "ago";
  month[8] = "set";
  month[9] = "ott";
  month[10] = "nov";
  month[11] = "dic";
  return (dt.substr(8,2) + " " + month[parseInt(dt.substr(5,2))-1] + " " + dt.substr(0,4) + " alle " + dt.substr(11,5));
}

function writeLog(txt){
  // scrive il testo txt sul file log
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
    function(fileSystem) {
      fileSystem.root.getFile("log_passAPPort.txt", {create: true, exclusive: false},
        function(fileEntry){ // memorizza il testo sul file di log
          fileEntry.createWriter(function(writer){
            writer.seek(writer.length);
            writer.write(adesso() + "," + txt + "\r\n" );
          }, fail);
        },
      fail);
    },
  fail);
}

function fail(error){
  dbgMsg("Errore: " + error.source + " + " + error.target+ " + " + error.code)
}

function sharePhoto() {
  showAlert("Pronto a vondividere?", "Attenzione");
  var imageLink;
  dbgMsg('Calling from CapturePhoto');
  navigator.screenshot.save(function(error,res){
  if(error){
    dngMsg(error);
  }else{
    dbgMsg('ok',res.filePath); //should be path/to/myScreenshot.jpg
  //For android
    imageLink = res.filePath;
   window.plugins.socialsharing.share("Meta condivisa da passAPPort", "passPPort",'file://'+imageLink, null);
   //For iOS
   //window.plugins.socialsharing.share(null,   null,imageLink, null)
 }
 },'jpg',50,'myScreenShot');
}

