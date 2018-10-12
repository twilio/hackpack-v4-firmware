Twilio Sync JavaScript client library
===============
Twilio Sync is Twilio's state synchronization service, offering two-way real-time communication between browsers, mobiles, and the cloud.
Visit our official site for more details: [https://www.twilio.com/sync](https://www.twilio.com/sync)

Installation
------------

### NPM
```
npm install --save twilio-sync
```
Using this method, you can `require` twilio-sync.js like so:
```
var SyncClient = require('twilio-sync');
var syncClient = new SyncClient(token);
```

### CDN
Releases of twilio-sync.js are hosted on a CDN, and you can include these
directly in your web app using a &lt;script&gt; tag.
```
<script type="text/javascript" src="//media.twiliocdn.com/sdk/js/sync/v0.8/twilio-sync.min.js"></script>
```
Using this method, twilio-sync.js will set a browser global:
```
var syncClient = new Twilio.Sync.Client(token);
```


Usage
-----
To use the library, you need to generate an [Access Token](https://www.twilio.com/docs/sync/identity-and-access-tokens) and pass it to the Sync Client constructor.
The Twilio SDK Starter applications for [Node.js](https://github.com/TwilioDevEd/sdk-starter-node), [Java](https://github.com/TwilioDevEd/sdk-starter-java), [PHP](https://github.com/TwilioDevEd/sdk-starter-php), [Ruby](https://github.com/TwilioDevEd/sdk-starter-ruby), [Python](https://github.com/TwilioDevEd/sdk-starter-python), [C#](https://github.com/TwilioDevEd/sdk-starter-csharp) provide an easy way to set up a token generator locally.
Alternatively, you can set up a [Twilio Function based on the _Sync Access Token_ template](https://www.twilio.com/console/runtime/functions/manage).    

```
// Obtain a JWT access token: https://www.twilio.com/docs/sync/identity-and-access-tokens
var token = '<your-access-token-here>';
var syncClient = new Twilio.Sync.Client(token);

// Open a Document by unique name and update its value
syncClient.document('MyDocument')
  .then(function(document) {
    // Listen to updates on the Document
    document.on('updated', function(event) {
      console.log('Received Document update event. New value:', event.value);
    });

    // Update the Document value
    var newValue = { temperature: 23 };
    return document.set(newValue);
  })
  .then(function(updateResult) {
    console.log('The Document was successfully updated', updateResult)
  })
  .catch(function(error) {
    console.error('Unexpected error', error)
  });
```

For more code examples for Documents and other Sync objects, refer to the [SDK API Docs](https://media.twiliocdn.com/sdk/js/sync/v0.8/docs):
* [Documents](https://media.twiliocdn.com/sdk/js/sync/v0.8/docs/Document.html)
* [Lists](https://media.twiliocdn.com/sdk/js/sync/v0.8/docs/List.html)
* [Maps](https://media.twiliocdn.com/sdk/js/sync/v0.8/docs/Map.html)
* [Message Streams](https://media.twiliocdn.com/sdk/js/sync/v0.8/docs/Stream.html)

Changelog
---------
See this [link](https://www.twilio.com/docs/sync/javascript-sdk-changelog#version-history-changelog).
