const restify = require('restify');
const fs = require('fs');
const bunyan = require('bunyan');
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://xxx.xxx', { username: 'xxx', password: 'xxx', qos: 2 });
const MQTT_BUTTON_PRESS_TOPIC = 'sensor/doorbell/button';
const MQTT_PIR_TOPIC = 'sensor/doorbell/pir';
const LOCAL_IP = '1.1.1.1';

setInterval(() => mqttClient.publish(MQTT_BUTTON_PRESS_TOPIC, 'not_pressed'), 55*1000);
setInterval(() => mqttClient.publish(MQTT_PIR_TOPIC, 'off'), 55*1000);
mqttClient.publish(MQTT_BUTTON_PRESS_TOPIC, 'not_pressed');
function respond(req, res, next) {
          console.dir(req.headers);
          next();
}

// doorbell press handling, the DB11 tries to POST to https://alarm.eu.s3.amazonaws.com
// // of course we don't have the certificates for amazonaws.com, but at least we can intercept
// // the socket open, and we know it's a doorbell press
// // note: the app will not show the alert, since we are not proxying to ezviz cloud
var server = restify.createServer({
          key: fs.readFileSync('server-key.pem'),
          cert: fs.readFileSync('server-cert.pem')
});

server.on('pre', (data) => {
          console.log(`${new Date().toISOString()}: doorbell pressed`);
          console.log(`publishing to ${MQTT_BUTTON_PRESS_TOPIC}`);
          mqttClient.publish(MQTT_BUTTON_PRESS_TOPIC, 'pressed');
          setTimeout(() => mqttClient.publish(MQTT_BUTTON_PRESS_TOPIC, 'not_pressed'), 5*1000);
});

server.get('/', respond);

server.listen(443, function() {
          console.log('%s listening at %s', server.name, server.url);
});
// PIR event handling, the DB11 starts a TCP connection to port 7400 on alarmeu.ezvizlife.com
// // intercept the incoming tcp request and trigger a PIR motion event
// // note: the app will not show the alert, since we are not proxying to ezviz cloud
//
const net = require('net');

const pirEventServer = net.createServer(function(socket) {
                console.log(`${new Date().toISOString()}: motion detected`);
          socket.destroy();
          console.log(`publishing to ${MQTT_PIR_TOPIC}`);
          mqttClient.publish(MQTT_PIR_TOPIC, 'on');
          setTimeout(() => mqttClient.publish(MQTT_PIR_TOPIC, 'off'), 5*1000);
});

pirEventServer.listen(7400);

console.log('pirEventServer listening on tcp 7400');

// dns server
var named = require('node-named');
console.dir(named);
var server = named.createServer();

server.listen(53, '::0:0.0.0.0', function() {
          console.log('DNS server started on port 53');
});

server.on('query', function(query) {
  var domain = query.name();
  console.log('DNS Query: %s', domain)
  if (domain.endsWith('ntp.org') || domain === 'litedev.eu.ezvizlife.com') {
    var dns = require('dns');
    dns.lookup(domain, function (err, addresses, family) {
      console.log(addresses);
      query.addAnswer(domain, new named.ARecord(addresses), 300);
      server.send(query);
    });
  } else {
    var target = new named.ARecord(LOCAL_IP);
    console.log(LOCAL_IP);
    query.addAnswer(domain, target, 300);
    server.send(query);
  }
});

