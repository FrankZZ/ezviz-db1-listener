# ezviz-db1-listener
Using this Node.js application, you can get the PIR and button press events in your MQTT server.

NOTE: If you are looking to use this software, be aware that the events will not be delivered to the EZViz Cloud. 

In other words: **you won't get notified in the EZViz app**.

![image](https://user-images.githubusercontent.com/1036887/169587830-b7f51d58-910b-4ab8-a943-711627c1e924.png)

## Usage
- Configure the MQTT credentials in [index.js](./index.js)
- Needs root to run as we bind to UDP port 53 to trick the doorbell DNS lookups
- Set the DNS server of the DB1 doorbell to the IP of the device you are running this application on with [Batch Configuration](https://www.hikvision.com/en/support/tools/hitools/cl25143e034aab161b/)
