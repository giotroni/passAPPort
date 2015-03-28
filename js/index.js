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
//      $("#page-home").on("swiperight", app.nextPage);
        $("#btnEntra").on("click", app.nextPage);
        // $("#page-interno").on("swipeleft", app.torna_copertina);
        $("#btnPrev").on("click", app.prevPage);
        $("#btnNext").on("click", app.nextPage);
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
// Mostra la pagina corrente
app.showPage = function(){
    $("#tit-interno").html("<h2>Pag. "+ app.numPagina +"</h2>");
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
app.nuovaMeta= function (){
  app.numMaxPagine +=1;
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
        alert(testo);
        $('#lstMete').append(testo);
        $("#lstMete li").bind("click", function(){
            app.nuovaMeta();
            alert("Aggiungi meta: " + this.id);
        });
    });
    alert("Rinfresca");
    $('#lstMete').listview("refresh");
    alert("Rinfrescato");
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
