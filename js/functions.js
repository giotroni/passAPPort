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
    showAlert(msg, "Debug");
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
// restituisce l'ora attuale nel formato 0000-00-00 00:00:00
function adesso(){
  var dt = new Date();
  var sGiorno = dt.getFullYear() + "-" + dt.getMonth + "-" + dt.getDay();
  var sOra= dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
  dbgMsg("adesso: " + sGiorno + " " + sOra)
  return (sGiorno + " " + sOra);
}