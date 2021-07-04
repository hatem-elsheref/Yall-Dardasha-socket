const os = require('os');
const server = require('http').createServer();
const io = require("socket.io")(server, { serveClient: false });

io.on('connection', function(socket) {

    socket.on('create', function (info){
        try{
            const data = JSON.parse(info)
            socket.join(data.roomId)
            socket.emit('room_created', {message: 'room created successfully'})
        }catch(e){
            socket.emit('error', {message: 'couldn\'t perform requested action'});
        }
    })

    socket.on('join', function (info){
        try{
            const data = JSON.parse(info)
            socket.join(data.roomId)
            socket.emit('joined_room',  {message: 'joined successfully'})
            io.to(data.roomId).emit('refresh', {message: 'new member joined so try to refresh the view'})
        }catch(e){
            socket.emit('error', {message: 'couldn\'t perform requested action'});
        }
    })

    socket.on('leave',function(info){
        try{
            const data = JSON.parse(info)
            socket.leave(data.roomId);
            io.to(data.roomId).emit('refresh', {message: "there is member left the room so try to refresh the view"});
        }catch(e){
            socket.emit('error', {message: 'couldn\'t perform requested action'});
        }
    })

    socket.on('want_to_speak', function(info) {
        const data = JSON.parse(info)
        // moderator or room admin only can see this event
        socket.to(data.roomId).emit('listen_if_member_want_to_speak', {username: data.username, socketId: io.sockets.sessionId});
    })

    socket.on('allow_member_to_speak', function(info) {
        const data = JSON.parse(info)
        // the member who try to rise hand to speak => change state from audience to speaker
        socket.to(data.memberSocketId).emit('if_i_can_speak', {message: "you are speaker now"});
        io.to(data.roomId).emit('refresh', {message: "there is member changed his state from audience to speaker so try to refresh the view"});
    })

    socket.on('dis_allow_member_to_speak', function(info) {
        const data = JSON.parse(info)
        // moderator or room admin only can see this event
        socket.to(data.memberSocketId).emit('listen_if_moderator_cancel_my_request', {message: "your request to be speaker refused by admin"});
    })

    socket.on('move_to_audience', function(info) {
        const data = JSON.parse(info)
        io.to(data.roomId).emit('refresh', {message: "there is a member moved to audience"});
    })


    socket.on('member_open_mic', function(info) {
        const data = JSON.parse(info)
        io.to(data.roomId).emit('refresh_mic', {message: "there is a member opened his mic", userId: data.userId});
    })

    socket.on('member_closed_mic', function(info) {
        const data = JSON.parse(info)
        io.to(data.roomId).emit('refresh_mic', {message: "there is a member opened his mic", userId: data.userId});
    })




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


});


server.listen(process.env.PORT || 3000);
