var server = require('http').createServer();
var io = require('socket.io')(server);
server.listen(8085);

var waiting = [];
var sessions = {};
var connections = {};

io.on('connection', function(socket) {    
    var clientId = socket.id.substr(2);
    waiting.push(clientId);
    
    if (waiting.length >= 2) {
        var p1 = waiting.shift();
        var p2 = waiting.shift();
        var sessionId = 'SESSION_'+p1+p2;
        
        connections[sessionId] = 0;
        sessions[sessionId] = io.of('/' + sessionId);
        sessions[sessionId].on('connection', function(socket) {            
            socket.on('init-1', function(m) { console.log('init-1'); sessions[sessionId].emit('init-1',m); });
            socket.on('init-2', function(m) { console.log('init-2'); sessions[sessionId].emit('init-2',m); });
            socket.on('turn-1', function(m) { console.log('turn-1'); sessions[sessionId].emit('turn-1',m); });
            socket.on('turn-2', function(m) { console.log('turn-2'); sessions[sessionId].emit('turn-2',m); });            
        
            connections[sessionId]++;
            if (connections[sessionId] >= 2) {
                sessions[sessionId].emit('game-start');
            }
        });
        
        io.emit('session', {
            p1 : p1 ,
            p2 : p2 ,
            sessionId : sessionId
        });        
    }    
});

