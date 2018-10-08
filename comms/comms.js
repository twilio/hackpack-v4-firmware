
var mosca = require('mosca');
const request = require('request');

var TwilioSync = require('./libs/twilio-sync/lib/client.js');

// *************************
// SYNC PIPELINE BOOT
// *************************

var syncClient;
var syncDoc;
var syncToken;

var syncChannelName = 'hackpack-andres-dev';

startSyncPipeline();

function startSyncPipeline(){
  request(
    'https://eggplant-oyster-2859.twil.io/sync-token',

    {
      json: true,
      qs: {
        deviceID: '123454321'
      }
    },

    (err, res, body) => {
      if( err ){
        console.log('Error requesting Sync token: ', err);
      } else {
        syncToken = body.token;
        setupSyncServer()
      }
    }
  );
}

// Subscribe to MessageStream for device

function setupSyncServer(){
  syncClient = new TwilioSync.Client(syncToken, {logLevel: 'info'});

  syncClient.stream(syncChannelName)
    .then(function(stream){
      stream.on('messagePublished', function(args){
        console.log('a MessageStream msg was published: ', args);

        console.log('Publishing msg to mqtt backbone.');

        var msg = {
          topic: '/signal',
          payload: JSON.stringify(args.message.value),

          qos: 0,
          retain: false
        };

        // NEED TO ADD A TIMEOUT

        server.publish(msg, function(){
          console.log('sent an everyone-blast.');
        });
      });
    })
    .catch(function(err){
      console.log('unexpected error with sync', err);
    });
}

// Publish a test message into device's MessageStream

function publishSyncMessage(){
  syncClient.stream(syncChannelName)
    .then(function(stream){
      stream.publishMessage({x:42, y:123})
        .then(function(msg){
          console.log('Publishing successful, msgsid: ' + msg.sid);
        })
        .catch(function(err){
          console.log('Stream publishMessage() failed', err);
        });
    });
}


// *************************
// MQTT SERVER BOOT
// *************************

var moscaSettings = {
  port: 1883,
}

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client){
  console.log('client connected: ', client.id);

  var msg = {
    topic: '/clients',
    payload: 'client added',
    qos: 0,
    retain: false
  };

  server.publish(msg, function(){});
});

// server.publish(message, function(){
//   console.log('sent an everyone-blast.');
// });

server.on('published', function(packet, client){
  console.log('Published', packet.payload);
});

function setup(){
  console.log('Mosca server is up and running');
}
