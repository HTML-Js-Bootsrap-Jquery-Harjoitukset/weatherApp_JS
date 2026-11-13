$(document).ready(function(){
    //hae kaupunki
    $('#citybutton').click(function(){
        //nollaa kaupunki??
            
        //syötetty kaupunki
        var city = $('#city').val(); 
        console.log(city);
        if (city != "") {
                //openweather 5 päivää json url
                var url ="http://api.openweathermap.org/data/2.5/forecast?q="+ city +"&units=metric&lang=fi&APPID=de1abf67dd420d2455bc69e2ceb2a139"
                //hae json
                //$.ajaxSetup({ cache: false });
                $.getJSON(url, function(result){
                    //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                    var city = $('#city').val(); 
                    console.log(result);
                    //tyhjennä vanhat tiedot
                    $('#saa').empty();
                    $('#error').empty();
                    //tulostaa tiedot
                    $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0].weather[0].icon+'.png"/>');
                    $('#saa').append('<p><b>'+city+'</b></p>');
                    $('#saa').append('<p><b>'+moment().format('l')+'</b></p>');
                    $('#saa').append('<p>Lämpötila: <b>'+result.list[0].main.temp+'°C</b></p>');
                    $('#saa').append('<p>Kosteus: <b>'+result.list[0].main.humidity+'%</b></p>');
                    $('#saa').append('<p>Kuvaus: <b>'+result.list[0].weather[0].description+'</b></p>');
                    //korosta valinta
                    $('#eka').addClass('activated');
                    $('#toka').removeClass('activated');
                    $('#kolmas').removeClass('activated');
                    $('#neljas').removeClass('activated');
                    $('#viides').removeClass('activated');
                    
                    
                    //ensimmäinen päivä
                    $('#eka').click(function(){
                        //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                        var city = $('#city').val(); 
                        console.log(result);
                        //tyhjennä vanhat tiedot
                        $('#saa').empty();
                        $('#error').empty();
                        //tulostaa tiedot
                        $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0].weather[0].icon+'.png"/>');
                        //console.log(result.list[0].weather[0].icon);
                        $('#saa').append('<p><b>'+city+'</b></p>');
                        $('#saa').append('<p><b>'+moment().format('l')+'</b></p>');
                        $('#saa').append('<p>Lämpötila: <b>'+result.list[0].main.temp+'°C</b></p>'); //klo 12
                        $('#saa').append('<p>Kosteus: <b>'+result.list[0].main.humidity+'%</b></p>');
                        $('#saa').append('<p>Kuvaus: <b>'+result.list[0].weather[0].description+'</b></p>');
                        console.log(city);
                        //korosta valinta
                        $('#eka').addClass('activated');
                        //poista muista
                        $('#toka').removeClass('activated');
                        $('#kolmas').removeClass('activated');
                        $('#neljas').removeClass('activated');
                        $('#viides').removeClass('activated');
                    }); 
                    
                    //toinen päivä
                    $('#toka').click(function(){
                        //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                        var city = $('#city').val(); 
                        console.log(result);
                        //tyhjennä vanhat tiedot
                        $('#saa').empty();
                        $('#error').empty();
                        //tulostaa tiedot
                        $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0+8].weather[0].icon+'.png"/>');
                        $('#saa').append('<p><b>'+city+'</b></p>');
                        $('#saa').append('<p><b>'+moment().add(1, 'days').format('l')+'</b></p>');
                        $('#saa').append('<p>Lämpötila: <b>'+result.list[0+8].main.temp+'°C</b></p>'); //klo 12 + 24h
                        $('#saa').append('<p>Kosteus: <b>'+result.list[0+8].main.humidity+'%</b></p>');
                        $('#saa').append('<p>Kuvaus: <b>'+result.list[0+8].weather[0].description+'</b></p>');
                        console.log(city);
                        //korosta valinta
                        $('#toka').addClass('activated');
                        //poista muista
                        $('#eka').removeClass('activated');
                        $('#kolmas').removeClass('activated');
                        $('#neljas').removeClass('activated');
                        $('#viides').removeClass('activated');
                    });   

                    //kolmas päivä
                    $('#kolmas').click(function(){
                        //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                        var city = $('#city').val(); 
                        console.log(result);
                        //tyhjennä vanhat tiedot
                        $('#saa').empty();
                        $('#error').empty();
                        //tulostaa tiedot
                        $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0+16].weather[0].icon+'.png"/>');
                        $('#saa').append('<p><b>'+city+'</b></p>');
                        $('#saa').append('<p><b>'+moment().add(2, 'days').format('l')+'</b></p>');
                        $('#saa').append('<p>Lämpötila: <b>'+result.list[0+16].main.temp+'°C</b></p>'); //klo 12 + 48h
                        $('#saa').append('<p>Kosteus: <b>'+result.list[0+16].main.humidity+'%</b></p>');
                        $('#saa').append('<p>Kuvaus: <b>'+result.list[0+16].weather[0].description+'</b></p>');
                        console.log(city);
                        //korosta valinta
                        $('#kolmas').addClass('activated');
                        //poista muista
                        $('#eka').removeClass('activated');
                        $('#toka').removeClass('activated');
                        $('#neljas').removeClass('activated');
                        $('#viides').removeClass('activated');
                    }); 

                    //neljäs päivä
                    $('#neljas').click(function(){
                        //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                        var city = $('#city').val(); 
                        console.log(result);
                        //tyhjennä vanhat tiedot
                        $('#saa').empty();
                        $('#error').empty();
                        //tulostaa tiedot
                        $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0+24].weather[0].icon+'.png"/>');
                        $('#saa').append('<p><b>'+city+'</b></p>');
                        $('#saa').append('<p><b>'+moment().add(3, 'days').format('l')+'</b></p>');
                        $('#saa').append('<p>Lämpötila: <b> '+result.list[0+24].main.temp+'°C</b></p>'); //klo 12 + 72h
                        $('#saa').append('<p>Kosteus: <b> '+result.list[0+24].main.humidity+'%</b></p>');
                        $('#saa').append('<p>Kuvaus: <b>'+result.list[0+24].weather[0].description+'</b></p>');
                         console.log(city);
                        //korosta valinta
                        $('#neljas').addClass('activated');
                        //poista muista
                        $('#eka').removeClass('activated');
                        $('#toka').removeClass('activated');
                        $('#kolmas').removeClass('activated');
                        $('#viides').removeClass('activated');
                    });

                    //viides päivä
                    $('#viides').click(function(){
                        //uudestaan tässä, jotta ei poimi kaikkia syötettyjä kaupunkeja
                        var city = $('#city').val(); 
                        console.log(result);
                        //tyhjennä vanhat tiedot
                        $('#saa').empty();
                        $('#error').empty();
                        //tulostaa tiedot
                        $('#saa').append('<img src="https://openweathermap.org/img/w/'+ result.list[0+32].weather[0].icon+'.png"/>');
                        $('#saa').append('<p><b>'+city+'</b></p>');
                        $('#saa').append('<p><b>'+moment().add(4, 'days').format('l')+'</b></p>');
                        $('#saa').append('<p>Lämpötila: <b>'+result.list[0+32].main.temp+'°C</b></p>'); //klo 12 + 96h
                        $('#saa').append('<p>Kosteus: <b>'+result.list[0+32].main.humidity+'%</b></p>');
                        $('#saa').append('<p>Kuvaus: <b>'+result.list[0+32].weather[0].description+'</b></p>');
                        console.log(city);
                        //korosta valinta
                        $('#viides').addClass('activated');
                        //poista muista
                        $('#eka').removeClass('activated');
                        $('#toka').removeClass('activated');
                        $('#kolmas').removeClass('activated');
                        $('#neljas').removeClass('activated');
                    });
                    
                });
    
            } else {
                $('#saa').empty();
                $('#error').empty();
                $('#error').append('<p>VALITSE ENSIN PAIKKAKUNTA</p>').css("font-weight","bold");
            }   
     });

        //moment js päivät   
        $('#eka').append(moment().format('dddd<br>l')).css('text-transform', 'capitalize');
        $('#toka').append(moment().add(1, 'days').format('dddd<br>l')).css('text-transform', 'capitalize');
        $('#kolmas').append(moment().add(2, 'days').format('dddd<br>l')).css('text-transform', 'capitalize');
        $('#neljas').append(moment().add(3, 'days').format('dddd<br>l')).css('text-transform', 'capitalize');
        $('#viides').append(moment().add(4, 'days').format('dddd<br>l')).css('text-transform', 'capitalize');
    
});