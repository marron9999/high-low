'use strict';

let com = "COM1";
if(process.argv.length >=3)
	com = process.argv[2];
const baudRate = 115200;
console.log("Connect: port=" + com + ",speed=" + baudRate);

const SerialPort = require("serialport");
const name = {};
const pick = {};
const lost = {};
const mbit = [];
for(let i=0; i<=50; i++) mbit[i] = -1;
const thief = [];
const port = new SerialPort(com,
	{ baudRate: baudRate, dataBits: 8, parity: 'none',
    stopBits: 1, flowControl: false });
let buf = Buffer.alloc(256);
let len = 0;
port.on('open', function() { console.log("Open " + com); });
port.on('data', function(data) {
	//console.log(data);
	for(let i=0; i<data.length; i++) {
		if(data[i] == 0x0a) {
			parse();
			len = 0;
			continue;
		}
		buf[len] = data[i];
		len++;
	}
});
function parse() {
	let str = buf.toString("utf8", 0, len);
	str = str.replace(/\r/g, "").trim();
	if(str.length <= 0) return;
	let val = str.replace(/=/g, " ");
	val = val.replace(/,/g, " ");
	val = val.split(" ");
	if(val[0] == "reset") {
		console.log(str);
		for(let n in pick) {
			pick[n] = 0;
		}
		for(let n in lost) {
			lost[n] = 0;
		}
		send_reuslt();
		if(wsc != null) {
			for(let i=0; i<thief.length; i++)
				wsc.send("t " + thief[i] + ":-1");
		}
		if(wsc != null)
			wsc.send("c");
		return;
	}
	if(val[0] == "pick") {
		console.log(str);
		if(pick[val[1]] == undefined)
			pick[val[1]] = 0;
		pick[val[1]] += 1;
		send_reuslt();
		return;
	}
	if(val[0] == "lost") {
		console.log(str);
		if(lost[val[1]] == undefined)
			lost[val[1]] = 0;
		lost[val[1]] += 1;
		send_reuslt();
		return;
	}
	if(val[0] == "t0") {
		console.log(str);
		let i = 0;
		while(i<thief.length) {
			if(thief[i] == val[1]) break;
			i++;
		}
		if(i >= thief.length)
			thief[thief.length] = val[1];
		if(wsc != null)
			wsc.send("t " + val[1] + ":0");
		return;
	}
	if(val[0] == "t1") {
		console.log(str);
		if(wsc != null)
			wsc.send("t " + val[1] + ":1");
		return;
	}
	if(val[0] == "t2") {
		console.log(str);
		if(wsc != null)
			wsc.send("t " + val[1] + ":2");
		return;
	}
	if(val[0][0] == "d") {
		console.log(str);
		let d = parseInt(val[0].substr(1));
		mbit[d] = val[1];
		if(pick[val[1]] == undefined)
			pick[val[1]] = 0;
		if(lost[val[1]] == undefined)
			lost[val[1]] = 0;
		return;
	}
	if(val[0][0] == "n") {
		console.log(str);
		let d = parseInt(val[0].substr(1));
		name[val[1]] = mbit[d];
		send_reuslt();
		return;
	}
	console.log("? " + str);
}


function send_reuslt() {
	let val = "r";
	//console.log(name);
	//console.log(win);
	for(let n in name) {
		val += " " + n
			+ ":" + pick[name[n]]
			+ ":" + lost[name[n]]
			;
	}
	//console.log(val);
	if(wsc != null) wsc.send(val);
}

var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});
var wsc = null;
wss.on('connection', function (ws) {
	wsc = ws;
	ws.on('close', function () { wsc = null; });
	ws.on('message', function (str) {
		if(str == "now") {
			console.log(str);
			send_reuslt();
			if(wsc != null) {
				for(let i=0; i<thief.length; i++)
					wsc.send("t " + thief[i] + ":-1");
			}
			return;
		}
		console.log("? " + str);
    });
});

server.listen(80);
