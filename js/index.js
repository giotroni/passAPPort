// v0.1
var CORDOVA= true;
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master

// MAIN
var app = {
    storage: window.localStorage,   // per il salvataggio locale delle info
    user_data: {nome: "", id: 0},
    initialize: function() {
      this.bind();
    },
     
    bind: function() {
        if ( CORDOVA) {
          document.addEventListener('deviceready', this.deviceready, false);
        }
        // alert("ok");
        $("#page-home").on("tap", app.entra_pagina);
        
        //$("#page-home").on("swipeleft", app.entra);
        //$("#btnLst").on("tap", app.entra);
        
        $("#page-interno").on("swipeleft", app.torna_copertina);

    },
     
    deviceready: function() {
    }
}


app.entra_pagina = function (){
  $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
      transition: 'slide',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
  });
}
// ritorna alla copertina    
app.torna_copertina= function (){
  $.mobile.pageContainer.pagecontainer("change", "#page-home", {
      transition: 'flip',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
  });
}
    
$(document).ready(function() {
    app.initialize();
    if ( CORDOVA ) {
      URL_PREFIX = "http://www.troni.it/passapport/";       
    } else {
      URL_PREFIX = "";
    }
});
