
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
    'https://jet-hummingbird-7705.twil.io/sync-token',

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
        try {
          syncToken = body.token;
          setupSyncServer();
        } catch(ex){
          console.log('Error in sync token response: ' + ex);
        }
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
