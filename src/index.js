if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const mapboxKey = process.env.MAPBOX_KEY
const darkskyKey = process.env.DARKSKY_KEY

const path = require('path')
const http = require('http')
const express = require('express')
const hbs = require('hbs')
const socketio = require('socket.io')
const Filter = require('bad-words')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/chatusers')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

// static pages to serve
app.use(express.static(path.join(__dirname, '../public')))

//handlebar engine and views location
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '../templates/views'))
hbs.registerPartials(path.join(__dirname, '../templates/partials'))

//The chat room with socket.io
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const {error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`)) 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

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
        title: 'Meowlo Games'
    })
})

app.get('/products/tools', (req, res) => {
    res.render('tools', {
        title: 'Meowlo Tools'
    })
})

app.get('/products/chat-login', (req, res) => {
    res.render('chat-login', {
        title: 'Meowlo Chat'
    })
})

app.get('/weather', async (req, res) => {
    if (!req.query.address){
        return res.send({
            error: 'You must provide an address.'
        })
    }

    try {
        const { latitude, longitude, location } = await geocode(req.query.address, mapboxKey)
        const forecastData = await forecast(latitude, longitude, darkskyKey)
        res.send({
            forecast: forecastData,
            location,
            address: req.query.address
        })
    } catch(error) {
        res.send({ error })
    }
})


app.get('*', (req, res) => {
    res.render('404', {
        title: "Oops, something's wrong.",
        msg: "This doesn't exist, try another page?",
    })
})

app.listen(port, () => {
    console.log('Server is up on the port ' + port)
})