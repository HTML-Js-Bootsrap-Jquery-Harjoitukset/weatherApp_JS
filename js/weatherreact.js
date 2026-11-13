// Weather komponentti
var Weather = React.createClass({
    
    //intial state
    getInitialState: function() {
        return {
            loading: true,
            error: null,
        };
    },
    
    //hae json ajaxilla
    getWeather: function(){
        $.ajax({
            url: 'weather.json',
            cache: false,
            method: 'get',
            dataType: 'json',
            success: function(data) {
                this.setState({datas: data});
                this.setState({mja: 'Laura'});
                console.log('JSON loaded');
                console.log(data);
                //console.log(data.coord.lon);
            }.bind(this),
            error: function(xhr, status, err) {
                console.log('VIRHE: ', status, err.toString());
            }.bind(this),
        });
    },
    
    //mount
    componentDidMount: function() {
        this.getWeather();
    },
    
    //piirrä nämä
    render: function() {
        //weather
        var Weat;
        if (this.state.datas !== undefined) {
          Weat = <p>{this.state.datas.weather.description}</p> 
        } else {
          Weat = null;
        }
        
        //temperature
        var Temp;
        if (this.state.datas !== undefined) {
          Temp = <p>{this.state.datas.main.temp}°C</p> 
        } else {
          Temp = null;
        }
        //humidity
        var Humi;
        if (this.state.datas !== undefined) {
          Humi = <p>{this.state.datas.main.humidity}%</p>
        } else {
          Humi = null;
        }
        
        var Name;
        if (this.state.datas !== undefined) {
          Name = <p>{this.state.datas.name}</p>
        } else {
          Name = null;
        }
        
        return (
            <div>
                <form>
                    <input placeholder="Valitse paikkakunta"/>
                    <button>Hae</button><br/>           
                    <button > {(moment().format('dddd l'))}</button> 
                    <button> {(moment().add(1, 'days').format('dddd l'))}</button>
                    <button> {(moment().add(2, 'days').format('dddd l'))}</button>
                    <button> {(moment().add(3, 'days').format('dddd l'))}</button>
                    <button> {(moment().add(4, 'days').format('dddd l'))}</button>
                    <section id="saa">
                        <p>Paikallisesta JSONista haetut tiedot:</p>
                        
                        {Name}

                        {Weat}
                        <p>Lämpötila</p>
                        {Temp}
                        <p>Kosteus</p>
                        {Humi}
                        
                    </section>
                </form>
            </div>
        );
    }
});

ReactDOM.render(
    <Weather />, 
    document.getElementById("root")
);