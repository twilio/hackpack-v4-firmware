const express = require('express')
const app = express()
const port = 3000



var net = require('net')
var fs = require('fs')
var connections = {}
var server
var client
var mode

var SOCKETFILE = '/dev/hackpack_input_driver'


var interval = setInterval(function(){
	var unix = require('unix-dgram')

	var msg = Buffer("0")
	var client = unix.createSocket('unix_dgram')
	client.on('error', console.error)
	client.send(msg, 0, msg.length, SOCKETFILE)
	client.close()
}, 1000);




app.get('/', (req,res) => res.send('Hello world'))

app.listen(port, () => console.log('Example  app listening on port $(port)!'))
