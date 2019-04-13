if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const mapboxKey = process.env.MAPBOX_KEY
const darkskyKey = process.env.DARKSKY_KEY

const path = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const app = express()
const port = process.env.PORT || 3001

// static pages to serve
app.use(express.static(path.join(__dirname, '../public')))

//handlebar engine and views location
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '../templates/views'))
hbs.registerPartials(path.join(__dirname, '../templates/partials'))


app.get('', (req, res) => {
    res.render('index', {
        title: 'Meowlo'
        
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Meowlo'
    })
})

app.get('/products', (req, res) => {
    res.render('products', {
        title: 'Meowlo Products'
    })
})

app.get('/weather', (req, res) => {
    if (!req.query.address){
        return res.send({
            error: 'You must provide an address.'
        })
    }

    geocode(req.query.address, mapboxKey, (error, {latitude, longitude, location} = {}) => {
        if (error){
            return res.send({error})
        }

        forecast(latitude, longitude, darkskyKey, (error, forecastData) => {
            if (error) {
                return res.send({error})
            }

            res.send({
                forecast: forecastData,
                location,
                address: req.query.address
            })
        })
    })
   
})


app.get('*', (req, res) => {
    res.render('404', {
        title: 'Opps, something\'s wrong.',
        msg: 'This doesn\'t exist, try another page?',
    })
})


app.listen(port, () => {
    console.log('Server is up on the port.' + port)
})