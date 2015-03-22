// v0.1
// git remote add origin https://github.com/giotroni/passAPPort.git
// git add .
// git commit -m "memorizzazione locale"
// git push origin master

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
        $("#page-home").on("swiperight", app.nextPage);
        $("#btnEntra").on("tap", app.nextPage);
        // $("#page-interno").on("swipeleft", app.torna_copertina);
        $("#btnPrev").on("tap", app.prevPage);
        $("#btnNext").on("tap", app.nextPage);
        $("#btnOkNuovameta").on("tap", app.nuovaMeta);
    },
     
    deviceready: function() {
    }
}

// va alla pagina successiva
app.nextPage= function (){

  if( app.numPagina == app.numMaxPagine){
    // vuoi aggiungere una pagina?
    alert("ok. pag:"+app.numPagina);
    app.elencoMete();
  } else {
    app.numPagina += 1;
    if( app.numPagina>0) {
      $("#tit-interno").html("<h2>Pag. "+ app.numPagina +"</h2>");
      $.mobile.pageContainer.pagecontainer("change", "#page-interno", {
          transition: 'slide',
          changeHash: false,
          reverse: true,
          showLoadMsg: true
      });
    }
  }
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
// va alla pagina cobn l'elenco delle mete
app.elencoMete= function (){
  mete.elencoMete();
  $.mobile.pageContainer.pagecontainer("change", "#page-elencomete", {
      transition: 'flip',
      changeHash: false,
      reverse: true,
      showLoadMsg: true
  });
}
// aggiunge meta
app.nuovaMeta= function (){
  app.numMaxPagine +=1;
  app.nextPage();
}

// classe con le mete
var mete = {
  // elenco dei luoghi
  elenco: [],
  // mostra elenco mete
  elencoMete: function() {
    $('#lstMete').empty();
    $.each(mete.elenco, function(key, value){
      var testo = '<li id="'+ key +'" ><a href="#" >';
      testo += '<p>'+value.nome ;
      testo += '</p>';
      testo += '</a></li>';
      $('#lstMete').append(testo);
      $("#lstMete li").bind("click", function(){
          app.nuovaMeta();
          //app.arcanoShow(this.id);
      });
    })
    $('#lstPlaces').listview("refresh");
  }
}

$(document).ready(function() {
    app.initialize();
    URL_PREFIX = "http://www.troni.it/passapport/";
    // aggiorna elenco mete
    while(mete.elenco.length > 0) {
      mete.elenco.pop();
    };
    var i=0;
    while(i <5) {
      mete.elenco.push({"nome": "nome " + i});
      i++;
    };
  
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
