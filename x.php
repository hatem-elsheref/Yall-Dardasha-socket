!<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<h1>Hi Socket io</h1>


<script src="https://cdn.socket.io/4.1.2/socket.io.min.js"></script>
<script>


    let socket = io("http://127.0.0.1:3000");

    socket.emit('join', JSON.stringify({roomId:10}))

    // socket.emit('leave', JSON.stringify({roomId: "224"}))


    socket.on("refresh", function (x){
        console.log(x)
    })
    </script>
</body>
</html>