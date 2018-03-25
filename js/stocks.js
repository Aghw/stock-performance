var alpha_api = "CXUNEIO848QDTYRC"
var alph_url = "https://www.alphavantage.co"
const apiUrl = "https://cors-anywhere.herokuapp.com/" + alph_url;
// var stock_url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo"
// var stock_url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&interval=1min&apikey=demo"

var stock_url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey="
const market_url = stock_url + alpha_api;
// var currency_url = "https://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json";
// const conversion_url = "https://cors-anywhere.herokuapp.com/" + currency_url;
var quandl_api = "89wdkfPK7YciSxS7kDaZ";
// var quandl = "https://www.quandl.com/api/v3/datasets/EOD/AAPL.json?api_key=89wdkfPK7YciSxS7kDaZ";
var quandl = "https://www.quandl.com/api/v3/datasets/EOD/";
// var quandl_url = "https://cors-anywhere.herokuapp.com/" + quandl;
var quandl_metadata = 'https://www.quandl.com/api/v3/datasets/WIKI/';
var quandl_url = "https://cors-anywhere.herokuapp.com/" + quandl_metadata;


let higher_limit = 78;
let stock_data = null;
let chartData = []; // this is going to be a 2D array for the line chart
let sample_interval = 5; // time interval
let startingTime = null;
let stockTicker = [];
let stock_activity_date = null;
let real_date_time = null;
let time_series = null;
let series_status = '1D';
let months = ["Jan","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
let lastpressed = null;

$( function() {

      let stockSelect = document.getElementById('stockSearch');

      // check the stock info of selected stock ticker
      stockSelect.addEventListener("click", function() {
          removePressedClass(); // if there is a pressed button, set button to default
                                // by removeding 'pressed' class from button

          fetchDefaultData(); // this functions sets up the defaul (1 day) parameters

          findStockInfo();
      }, false);

      function removePressedClass() {
        if (lastpressed != null) {
          $(lastpressed).removeClass("pressed");
        }
      }

      //
      // this function makes ajax calls to request stock data of
      // selected company. in addition, it calls another function
      // to make ajax call to get company metadata.
      function getStockMarketData(market_url) {

        $.getJSON(market_url  , function( data ) {
            findStockData(data);
        });

        var url = quandl_url + stockTicker[0] + "/metadata.json?api_key=" + quandl_api;
        if (event.target.id === 'stockSearch') {
          console.log(url);
          getStockCompanyInfo(url);
        }
      }

      function findCompanyName(d) {
        var comp_name = $.map(d, function (e) {return e})
        console.log("Company-name 1", comp_name[0]);

        var comp = document.getElementById("company-name");
        var name = comp_name[0].name;
        name = name.split("Prices")[0];
        comp.innerHTML = name;
      }



      function getStockCompanyInfo(market_url) {
        $.getJSON(market_url  , function( data ) {
            findCompanyName(data);
        });
      }



      function processStockData(data) {
        console.log(data);

        stock_data = $.map(data, function (e) {return e})
        stock_activity_date = Object.keys(stock_data[1])[0].split(" ")[0]
        real_date_time = Object.keys(stock_data[1])[higher_limit]


        var comp = document.getElementById("company-ticker");
        comp.innerHTML = stock_data[0]["2. Symbol"];

        var activity = document.getElementById("activity-date");
        activity.innerHTML = stock_activity_date;

        var stockValues = $.map(stock_data[1], function(s) { return s});

        if (higher_limit === 0) {
          higher_limit = stockValues.length;
        }

        var sdata = stockValues.reverse();
        return sdata;
      }

      function hAxisValues(inc) {
        if (series_status == '1D') {

            var howMany = inc * sample_interval;
            var active_date = new Date(real_date_time);

            active_date.setMinutes(active_date.getMinutes() + howMany)

            var hrs = active_date.getHours();
            var mnts = active_date.getMinutes();
            var tday = (hrs >= 12) ? "PM" : "AM";
            var hr = (hrs >= 12) ? (hrs - 12) : hrs;
            hr = (hr === 0) ? 12 : hr;
            mnts = mnts < 10 ? "0" + mnts : mnts;

            return  hr + ":" + mnts + " " + tday;
          } else {
            var active_date = Object.keys(stock_data[1])[higher_limit  - inc];
            var dt = new Date(active_date);
            var mon = dt.getMonth() + 1;
            var dd = dt.getDate();
            var yr = dt.getFullYear();
            var month = months[mon];
            var date = month + " " + dd + ",'" + yr.toString().substr(-2); // substr(2,2)
            var d = dt.getDay();
            var day = weekDays[d];

            // active_date.setDate(active_date.getDate() + inc)
            // var stime = inc;
            if (series_status == '5M' || series_status == 'YTD' || series_status == '1Y' || series_status == '5Y') {
                return date;
            }
            return active_date;
          }
      }

      function findStockData(data) {
        var stockPerform = processStockData(data);
        chartData = [];
        var index = 0;
        // console.log("Stock-data length: ",   stockPerform.length);
        let start_index = stockPerform.length - 1 - higher_limit;
        start_index = (start_index < 0) ? 0 : start_index;

        for (var i = start_index; i < stockPerform.length; i++) {
          var stockVal = parseFloat($.trim(stockPerform[i]["4. close"]))
          // var volume = parseInt($.trim(stockPerform[i]["5. volume"]))
          // var tot = volume / 1000;
          // var total = `${totalVol.toFixed(2)}` + 'k'
          // var sval = `${{v: stockVal, f: stockVal.toFixed(2)}}`
          let arr = [ hAxisValues(index), {v: stockVal, f: stockVal.toFixed(2)}]
          // let arr = [ hAxisValues(index), {v: stockVal, f: stockVal.toFixed(2)}, {v: stockVal, f: tot.toFixed(2).replace(/\.0$/, '') + 'k'}]
          index++;

          chartData.push(arr);
        }
        drawChart()
      }





      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart() {
        google.charts.load('current', {packages: ['corechart', 'line']});
        google.charts.setOnLoadCallback(drawBackgroundColor);

        function drawBackgroundColor() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'stock ');
            data.addColumn('number', 'Stock Value');
            // data.addColumn('number', 'Volume Data');

            data.addRows(chartData);

            var options = { 'height':365,
              legend: 'none',
              series: {
                        0: { color: '#1c91c0' }, //f1ca3a, e2431e, e7711b, e2431e, 6f9654, 1c91c0, 43459d
                        1: { color: '#e7711b' },
                      },
              // curveType: 'function',
              hAxis: {
                textStyle : {
                      color: "gray", // #3D7FCF
                      fontSize: 11 // or the number you want
                  }
              },
              vAxis: {
                format: 'currency',
                textStyle : {
                      color: "gray",
                      fontSize: 11 // or the number you want
                  }
                // gridlines: { count: 4 }
              },
              backgroundColor: '#fde6de',
              chartArea:{left:60,top:20,width:'90%',height:'82%'},
            };

            var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
            chart.draw(data, options);
          }
      }





      function stockDataUrlBuilder(queryObj) {
          let holder = [];

          // loop through queryObj key value pairs
          for(let key in queryObj){
            // turn each one into "key=value"
            let convert = `${encodeURIComponent(key)}=${encodeURIComponent(queryObj[key])}`;
            // encodeURIComponent converts spaces and & to URI friendly values so we don't have to worry about them
            holder.push(convert);
          }
          // concatenate the pairs together, with & between
          let longString = holder.join("&");
          let fullUrl = `${apiUrl}/query?${longString}`;
          // prepend a ? to concatenated string, return
          return `${apiUrl}/query?${longString}`;
      }




      function stockData(ticker) {
          event.preventDefault(); //to prevent the form from submitting to server and refreshing the page

          let stockIdent =  {function : time_series, symbol: stockTicker[0],
                            apikey: alpha_api, interval: sample_interval + "min"};
          let formatted = stockDataUrlBuilder(stockIdent);

          console.log(formatted);
          getStockMarketData(formatted);
    }





    function findStockInfo() {
      event.preventDefault(); //to prevent the form from submitting to server and refreshing the page

      var enteredTicker =  $("#stock-ticker").val();
      stockTicker = enteredTicker.toUpperCase().split(",");

      var companyStock = {
        name : stockTicker[0]
      }

      stockData(companyStock);
    }

    function fetchDefaultData() {
      time_series ="TIME_SERIES_INTRADAY";
      sample_interval = 5;
      higher_limit = 78;
      series_status = '1D';
    }

    $("#BtnOneDay").click( function () {
        fetchDefaultData();

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });


    $("#BtnFiveDays").click( function () {
        time_series ="TIME_SERIES_INTRADAY";
        sample_interval = 30;
        series_status = '5D';
        higher_limit = 68;

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });


    $("#BtnOneMonth").click( function () {
        time_series ="TIME_SERIES_DAILY";
        sample_interval = 60;
        series_status = '1M';
        higher_limit = 20;

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });



    $("#BtnFiveMonths").click( function () {
        time_series ="TIME_SERIES_DAILY";
        higher_limit = 0;
        series_status = '5M';

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });


    function getWeekNumber(d) {
          // Copy date so don't modify original
          d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          // Set to nearest Thursday: current date + 4 - current day number
          // Make Sunday's day number 7
          d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
          // Get first day of year
          var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
          // Calculate full weeks to nearest Thursday
          var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
          // Return array of year and week number
          return [d.getUTCFullYear(), weekNo];
      }


    $("#BtnYTD").click( function () {
        time_series ="TIME_SERIES_DAILY";
        series_status = 'YTD';
        var result = getWeekNumber(new Date());
        higher_limit = (result[1] - 1) * 5;

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });

    $("#BtnOneYear").click( function () {
        time_series ="TIME_SERIES_WEEKLY";
        series_status = '1Y';
        higher_limit = 53;

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });


    $("#BtnFiveYears").click( function () {
        time_series ="TIME_SERIES_WEEKLY";
        series_status = '5Y';
        higher_limit = 262;

        removePressedClass(); // if there is a pressed button, set button to default
                              // by removeding 'pressed' class from button
        lastpressed = '#' + event.target.id;
        $(lastpressed).addClass("pressed");

        findStockInfo();
    });
  });
