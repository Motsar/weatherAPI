const router = require('express').Router();
const cheerio = require('cheerio');
const rp = require('request-promise');
const{verifyToken} = require('../middlewares');

router.post('/' ,verifyToken ,async(req,res)=>{


let locationString = req.body.location;
let longitude = req.body.latitude;
let latitude = req.body.longitude;

if (!locationString && !longitude && !latitude) return res.status(404).json({error:"request cant be empty"});

//Mapbox API url

const locationUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(longitude)+',' +encodeURIComponent(latitude)+ '.json?access_token='+ process.env.MAPBOXACCESS;

async function asiOnJama(){
    let muutuja;
    await rp({
        method: 'GET',
        uri: locationUrl,
        json: true,
        headers: {
          'content-type': 'application/json' 
        }
      })
    .then(function (body) {
        let koht= body.features[0].place_name;
        muutuja=koht.split(",")[1];;
    })
    .catch(function (err) {
        muutuja=err;
    });
    return muutuja;
}

async function neededVariable(){
    let location = locationString? locationString: await asiOnJama();
    let tulemus;
    await rp({
        method: 'GET',
        uri: ""+process.env.SEARCHADDR + location+""})
    .then(function (body) {
        const $ = cheerio.load(body);
        let hrefTulemus = $('.search-results-list li a');
        tulemus = hrefTulemus[0].attribs.href;
    })
    .catch(function (err) {
        tulemus= res.status(404).json({error: "location not found"});
    });
    return tulemus;
}

async function getData(){
    let result;
    let weatherLocation = await neededVariable();
    await rp({method: 'GET',
    url:''  +process.env.ADDRESS + weatherLocation + ''})
    .then(function (body){
        const $ = cheerio.load(body);
        let locationData =$('.location-region').text();
        let tempNow = $('.now-hero__next-hour-temperature-text .temperature').text();
        let weatherConditions =$('.now-hero__next-hour-symbol .nrk-sr').text();
        let feelsLike = $('.feels-like-text .temperature').text();
        let windDescription = $('.now-hero__next-hour-wind').text();
        let persipication = $('.now-hero__next-hour-content .precipitation__value').text()+" "+$('.now-hero__next-hour-content .precipitation__unit abbr');
        let dateData = $('.daily-weather-list__intervals .daily-weather-list-item__date-heading');
        let tempData =$('.daily-weather-list__intervals .daily-weather-list-item__temperature');
        let windData =$('.daily-weather-list__intervals .daily-weather-list-item__wind');
        let conditionsData =$('.daily-weather-list__intervals .daily-weather-list-item__symbols');
        
        
        let dateArray = [];
        let tempArray =[];
        let windArray = [];
        let conditions= {
            nmae:[]
        };

        dateData.each((index,element)=>{
            let dates=$(element).text();
            dateArray.push(dates)
        })
 
        tempData.each((index,element)=>{
            let temps=$(element).text();
            let temperature = temps.split(":")[1];
            tempArray.push(temperature)
        })
        
        windData.each((index,element)=>{
            let winds=$(element).text();
            let wind = winds.split(":")[1];
            windArray.push(wind)
        })
        
        conditionsData.each((index,element)=>{
            let conditionsText=$(element).find('.nrk-sr');
            conditions.nmae.push(conditionsText.text().match(/[A-Z]+[^A-Z]*|[^A-Z]+/g));
        })

        let DataObject= {
            current:{"location":locationData, "conditions":weatherConditions,"temperature":tempNow ,"feelsLike":feelsLike,"wind": windDescription,"precipitation":persipication+"mm"},
            forecast:[]
        }

        for(let i=0;i<dateArray.length;i++){
            DataObject.forecast.push({'date':dateArray[i],'temperature': tempArray[i], 'wind':windArray[i], 'conditions':conditions.nmae[i]});
        }
     
        
        result= JSON.stringify(DataObject);
    })
    .catch(function (err) {
        result=err;
    });
    return result;
}

let results = await getData(); 

return res.status(200).json(results)

})

module.exports = router;