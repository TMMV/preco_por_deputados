
var info = {2005:{},2009:{},2011:{},2015:{}};

$.ajax({
  type: "GET",
  url: "https://raw.githubusercontent.com/centraldedados/resultados_eleicoes_simples/master/data/dados_deputados.csv",
  dataType: "text",
  success: function(data) {
    // primeiro colocamos os deputados (só nos interessam os que partidos que tiveram deputados)
    addDeputados(data);
    console.log(info);
    $.ajax({
      type: "GET",
      url: "https://raw.githubusercontent.com/charlieIT/eleicoes-legislativas_orcamentos/master/data/eleicoes-legislativas_orcamentos.csv",
      dataType: "text",
      success: function(data) {
        addOrcamento(data);
        // now that we have the information all settled down lets add to html
        addInfoToHTML();
      }
    });
  }
});

var addOrcamento = function(orcamentos){
  var csv = orcamentos.split("\n");
  for(i in csv){
    if(i == 0){
      continue;
    }
    var campos = csv[i].split(",");
    var ano = campos[0];
    var partido = campos[1];
    if(partido && partido in info[ano]){
      var total_orcamento_receitas = campos[4];
      var total_real_receitas = campos[2];
      info[ano][partido]["total_orcamento_receitas"] = Math.round(total_orcamento_receitas);info[ano][partido]["total_orcamento_receitas"] = Math.round(total_orcamento_receitas);
      info[ano][partido]["total_real_receitas"] = Math.round(total_real_receitas);
    }
    //data[partido] = {"total_receitas": Math.round(total_receitas)};
  }
};

var addDeputados = function(deputados){
  var csv = deputados.split("\n");
  for(i in csv){
    if(i == 0){
      continue;
    }
    var campos = csv[i].split(",");
    var ano = campos[0];
    var partido = campos[1];
    if(partido){
      var num_deputados = campos[2];
      info[ano][partido] = {"num_deputados": Math.round(num_deputados)};
    }
  }
};

var addInfoToHTML = function(){
  // first lets score the maximum cash per deputado over every year and use that as a baseline
  var maximumRadius = 300; //in pixels
  var maximumCashPerDeputado = 0;
  for(anoName in info){
    var anoValue = info[anoName];
    for(partidoName in anoValue){
      var partidoValue = anoValue[partidoName];
      var pricePerDeputado = partidoValue["total_real_receitas"]/partidoValue["num_deputados"];
      if(pricePerDeputado > maximumCashPerDeputado){
        maximumCashPerDeputado = pricePerDeputado;
      }
    }
  }

var main = $('#pt-main');
  // lets draw!
  var keys = Object.keys(info);
  var anosSorted = keys.sort().reverse();
  for(i in anosSorted){
    var anoName = anosSorted[i];
    var anoValue = info[anoName];
    var pageAno = "pt-page-"+anoName;
    main.append(
      "<div class='ano " + anoName + " pt-page " + pageAno + "'><h2>" + anoName + "</h2>"
      + "<div class='info'></div>"
      + "</div>"
    );

    /*$("."+anoName+" .info").append(
      "<hr>"
    );*/

    var sortingF = function getSortedKeys(obj) {
      var keys = []; for(var key in obj) keys.push(key);
      return keys.sort(function(a,b){return obj[b]["num_deputados"]-obj[a]["num_deputados"]});
    }

    var partidosSorted = sortingF(anoValue);
    console.log(partidosSorted);
    for(i in partidosSorted){
      var partidoName = partidosSorted[i];
      var partidoValue = anoValue[partidoName];
      if(anoName!="2015"){
        receitas = partidoValue["total_real_receitas"];
        comment = "<br/>";
      }
      else{
        receitas = partidoValue["total_orcamento_receitas"];
        //comment = "<br/>calculados tendo como base os valores de orçamentação previstos";
      }
      var pricePerDeputado = Math.round(receitas/partidoValue["num_deputados"]);
      var partidoHeight = Math.sqrt(pricePerDeputado/maximumCashPerDeputado*Math.pow(maximumRadius,2));
      var partidoWidth = partidoHeight;
      pricePerDeputado = parseInt( pricePerDeputado ).toLocaleString('de-DE');
      var treatedPartidoName = partidoName.replace("/","").replace("-","");

      $("."+anoName+" .info").append(
        "<div class='partido'>"
        + "<div>"
        //+ "<div style='height:"+partidoHeight+"px; width:"+partidoWidth+"px;' class='ball " + treatedPartidoName + "'>"
        + "<div style='height:"+partidoHeight+"px; width:"+partidoWidth+"px;' class='ball " + treatedPartidoName + "'>"
        +"<div class='centered-content'>"
        + "<span>" + pricePerDeputado + "€ <small> por deputado</small></span>"
        +"</div></div>"
        + "</div>"
        + "<div class='header'><h3><span class='" + treatedPartidoName + "'></span>" + partidoName + "</h3>" + "<p>" + partidoValue["num_deputados"]
        + " deputados eleitos" + "</p>"
        + "</br>" + parseInt( receitas ).toLocaleString() + " €"
        + "</div>"
        + "</div>"
      );
    }
  }
};

var isAnimating = false,
    endCurrPage = false,
    endNextPage = false,
    animEndEventNames = {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    },
    // animation end event name

    //VOLTAR AQUI *****************************************************************

    //AnimEndEventName = 'webkitAnimationEnd';
    AnimEndEventName = animEndEventNames[Modernizr.prefixed('animation')],
    // support css animations
    support = Modernizr.cssanimations;


/*
var pages = [
$(".pt-page-1 .table .tableCell .container").height(),
$(".pt-page-2 .table .tableCell .container").height(),
$(".pt-page-3 .table .tableCell .container").height(),
$(".pt-page-4 .table .tableCell .container").height()
];
var navigation = $(".navigation").height();
*/

function move(page) {
    if (isAnimating) {
        return false;
    }
	$currPage = $(".pt-page-current");
    if($currPage.hasClass("pt-page-"+page)){
    	return false;
    }
    $( "li.active" ).removeClass("active");
    $nextPage = $(".pt-page-" + page);
    isAnimating = true;

    $nextPage.addClass('pt-page-current');
    $($( "li" ).get(page-1)).addClass("active");

    $currPage.addClass('pt-page-moveToLeft').on(animEndEventName, function() {
        $currPage.off(animEndEventName);
        endCurrPage = true;
        if (endNextPage) {
            onEndAnimation($currPage, $nextPage,page);
        }
    });

    $nextPage.addClass('pt-page-moveFromRight').on(animEndEventName, function() {
        $nextPage.off(animEndEventName);
        endNextPage = true;
        if (endCurrPage) {
            onEndAnimation($currPage, $nextPage,page);
        }
    });

    if (!support) {
        onEndAnimation($currPage, $nextPage,page);
    }

}

function onEndAnimation($outpage, $inpage,page) {
    endCurrPage = false;
    endNextPage = false;
    resetPage($outpage, $inpage,page);
    isAnimating = false;
}

function resetPage($outpage, $inpage,page) {
	$outpage.removeClass('pt-page-moveToLeft');
    $outpage.removeClass('pt-page-current');
    $inpage.removeClass('pt-page-moveFromRight');
    if($(window).scrollTop()>150)
        $('html,body').animate({
          scrollTop: $('.content').offset().top
        }, 300);
}
