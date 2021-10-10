'use strict';

let com = "COM1";
if(process.argv.length >=3)
	com = process.argv[2];
const baudRate = 115200;
console.log("Connect: port=" + com + ",speed=" + baudRate);

const SerialPort = require("serialport");
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
	console.log(str);
}
