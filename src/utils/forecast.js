const request = require('request')

const forecast = (latitude, longitude, darkskyKey, callback) => {
    const url = 'https://api.darksky.net/forecast/'+ darkskyKey + '/' + latitude + ',' + longitude + '?units=si'

    request({url: url, json:true}, (error, {body}) => {
        if (error) {
            callback('Unable to connect to the service!', undefined)
        } else if (body.error){
            callback('Unable to find location, try another search', undefined)
        }else {
            callback(undefined, `Weather summary: ${body.currently.summary}. The highest temperature today is ${body.daily.data[0].temperatureHigh} degrees. The lowest temperature today is ${body.daily.data[0].temperatureLow} degrees. UX index is ${body.daily.data[0].uvIndex}. It is currently ${body.currently.temperature} degrees out. There is ${body.currently.precipProbability * 100}% chance of rain. `)
        }
        
    })
}


module.exports =  forecast