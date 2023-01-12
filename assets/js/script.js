var textBox = $('#search-focus');
var searchBtn = $('#search-btn');
var searchHist = $('#search-history')
var results = $('#results-daily');
var results5Day = $('#results-5-day');
var API_KEY = 'a873567ac529fb62c2b629f80a488a4f';
var today = dayjs();

var historyData = localStorage.getItem("history");
var historyList = []

var showHistory = () =>
{

    var pollHistory = localStorage.getItem('history')
    var historyData = JSON.parse(pollHistory)
    // sort this for viewing purposes
    var htmlHistory = ''
    searchHist.html(htmlHistory)
    if (historyData)
    {
        // append buttons dynamically
        for (let i = 0; i < historyData.length; i++)
        {
            var buttonVar = $('<button>')
            buttonVar.text(historyData[historyData.length - (i+1)])
            buttonVar.addClass('buttons')
            buttonVar.addClass('button-style')
            buttonVar.addClass('btn btn-primary')
            searchHist.append(buttonVar)

        }
    }
}

showHistory()

var process = (cityName) => 
{
    // call response on city name
    var responseUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&&appid=' + API_KEY
    // process response
    fetch(responseUrl)
        .then((response) => response.json()) // returns a promise of json()
        .then((data) => {
            console.log(data)
            // process history
            processHistory(cityName)
            // retrieve data
            var longitude = data.coord.lon
            var latitude = data.coord.lat
            var currTemp = data.main.temp;
            var currHumidity= data.main.humidity;
            var currWind = data.wind.speed;

            // update current status
            var htmlCurrStat = `<h1>${cityName} ${today.format(' [(]M/D/YY[)] ')} <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png"></h1>
                                <p>Temp: ${currTemp}˚</p>
                                <p>Wind: ${currWind} MPH</p>
                                <p>Humidity: ${currHumidity}%</p>`
            // get 5 day forecast
            var fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`
            fetch(fiveDayURL)
                .then((response) =>response.json())
                .then((fivedata) => {
                    // console.log(fivedata)
                    var listData = fivedata.list
                    var curridx = 0;
                    // define the five day forcast regio
                    var htmlIter = `<h2 class="five-day-forecast-title">5-Day Forecast:</h2>`
                    // iterate through each time step of list data
                    listData.forEach((element)=>{
                        // only select every 8 since api gives 24hr window in 3hr updates
                        if (curridx % 8 === 0)
                        {
                            // extract variables
                            var tempIter = element.main.temp;
                            var windIter = element.wind.speed;
                            var humiIter = element.main.humidity
                            var dateTxt = element.dt_txt
                            var icon = element.weather[0].icon
                            // form html for cards and append
                            htmlIter +=`<div class="card card-elements card-style">
                                            <div class="card-body">
                                                <p class="card-title five-day-forecast-title">${dateTxt.split(' ')[0].split('-')[1]}/${dateTxt.split(' ')[0].split('-')[2]}/${dateTxt.split(' ')[0].split('-')[0]}</p>
                                                <img src="http://openweathermap.org/img/wn/${icon}.png">
                                                <p class="status-data">Temp: ${tempIter}˚</p>
                                                <p class="status-data">Wind: ${windIter} MPH</p>
                                                <p class="status-data">Humidity: ${humiIter}%</p>
                                            </div>
                                        </div>`      
                        }
                        curridx++;
                    })
                    
                    console.log(curridx)
                    // append html elements
                    results.html(htmlCurrStat)
                    results.addClass('current-status')
                    results5Day.html(htmlIter)
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err));
        
}
var processHistory = (cityName) =>
{

    var tempHistory = JSON.parse(localStorage.getItem('history'))
    if (tempHistory !== null)
    {
        // maximum history was left
        if (tempHistory.length == 10)
        {
            // check if cityName exists and append normally
            if (!tempHistory.includes(cityName))
            {
                // remove index 0 (pop)
                tempHistory.shift() 
                // append to history normally (push)
                tempHistory.push(cityName)
                localStorage.setItem('history',JSON.stringify(tempHistory))
            }
            
        }
        else 
        {   
            // check if cityName exists and append normally
            if (!tempHistory.includes(cityName))
            {
                tempHistory.push(cityName)
                localStorage.setItem('history',JSON.stringify(tempHistory))
            }
        }
    }
    else{
        localStorage.setItem('history',JSON.stringify([cityName]))
    }
    
    // we have updated data in localStorage
    showHistory()
}

// process button callback
var processBtn = () => 
{
    let city = textBox.val()
    // begin processing
    process(city);

}

// add handler on button click
searchBtn.click(processBtn);

searchHist.on('click', '.buttons', function (event)
{
    // grab button instance
    var citySelected = event.target.innerText;
    // update textbox selection
    textBox.val(citySelected)
    // process the city
    process(citySelected)
})