// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master

// MAIN
var app = {
    initialize: function() {
      this.bind();
    },
     
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        // alert("ok");
        $("#page-home").on("swiperight", app.entra_pagina);
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
    URL_PREFIX = "http://www.troni.it/passapport/";       
});
