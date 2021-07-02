const os = require('os');
const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET"],
        credentials: true
    }
});

io.sockets.on('connection', function(socket) {
    // convenience function to log server messages on the client
    function log() {
        const array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }

    socket.on('message', function(message) {
        log('Client said: ', message);
        // for a real app, would be room-only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function(room) {
        log('Received request to create or join room ' + room);

        const numClients = io.sockets.sockets.length;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);

        } else if (numClients > 0) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
        } else { // if max or error
            socket.emit('full', room);
        }
    });

    socket.on('ipaddr', function() {
        const ifaces = os.networkInterfaces();
        for (const dev in ifaces) {
            ifaces[dev].forEach(function(details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });


    socket.on('bye', function(){
        console.log('received bye');
    });
});


http.listen(process.env.PORT || 3000);
