# ezviz-db1-listener
Using this Node.js application, you can get the PIR and button press events in your MQTT server.

NOTE: If you are looking to use this software, be aware that the events will not be delivered to the EZViz Cloud. 

In other words: **you won't get notified in the EZViz app**.

![image](https://user-images.githubusercontent.com/1036887/169587830-b7f51d58-910b-4ab8-a943-711627c1e924.png)

## Usage
- Configure the MQTT credentials in [index.js](./index.js)
- Needs root to run as we bind to UDP port 53 to trick the doorbell DNS lookups
- Set the DNS server of the DB1 doorbell to the IP of the device you are running this application on with [Batch Configuration](https://www.hikvision.com/en/support/tools/hitools/cl25143e034aab161b/)

## MQTT Topics
```
// payload can be pressed / not_pressed
const MQTT_BUTTON_PRESS_TOPIC = 'sensor/doorbell/button';

// payload can be on / off
const MQTT_PIR_TOPIC = 'sensor/doorbell/pir';
```

## MQTT behaviour
When the doorbell button is pressed, a payload of `pressed` is published to the `MQTT_BUTTON_PRESS_TOPIC`. After 5 seconds `not_pressed` is published again.

When the doorbell PIR trips, a payload of `on` is published to the `MQTT_PIR_TOPIC`. After 5 seconds `off` is published again.


## Home-Assistant YAML
To have Home-Assistant detect when this application has stopped working, it publishes the `not_pressed` and `off` payloads to the `MQTT_BUTTON_PRESS_TOPIC` and `MQTT_PIR_TOPIC` respectively every 55 seconds. 

The `expire_after` setting in the YAML below is set to 60 seconds.


```
- platform: mqtt
  name: doorbell_button_0
  state_topic: "sensor/doorbell/button"
  icon: mdi:alarm-bell
  expire_after: 60

- platform: mqtt
  name: doorbell_pir_0
  state_topic: "sensor/doorbell/pir"
  icon: mdi:alarm-bell
  expire_after: 60
```
