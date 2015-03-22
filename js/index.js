// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master

// MAIN
var app = {
    numPagina: 0,
    initialize: function() {
      this.bind();
    },
     
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        // alert("ok");
        $("#page-home").on("swiperight", app.nextPage);
        $("#btnEntra").on("tap", app.nextPage);
        // $("#page-interno").on("swipeleft", app.torna_copertina);
        $("#btnPrev").on("tap", app.prevPage);
        $("#btnNext").on("tap", app.nextPage);
    },
     
    deviceready: function() {
    }
}

// va alla pagina successiva
app.nextPage= function (){
  if( app.numPagina == 0 ) {
    // in realtà potrebbe andare all'ultima paguina visitata?
    app.numPagina = 1;
  } else {
    app.numPagina += 1;
  }
  $("#tit-interno").html("<h2>Pag. "+ app.numPagina +"</h2>");
  $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
      transition: 'slide',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
  });
}
// va alla pagina precedente
app.prevPage= function (){
  if( app.numPagina == 0 ) {
    // questo è un errore. rimane qua
  } else {
    app.numPagina -= 1;
  }
  if(app.numPagina == 0){
    $.mobile.pageContainer.pagecontainer("change", "#page-home", {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
  } else {
    $("#tit-interno").html("<h2>Pag. "+ app.numPagina +"</h2>");
    $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
        transition: 'slide',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
  }
}
    
$(document).ready(function() {
    app.initialize();
    URL_PREFIX = "http://www.troni.it/passapport/";       
});
