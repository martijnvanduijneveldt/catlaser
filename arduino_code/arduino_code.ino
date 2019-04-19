
#include <EEPROM.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Servo.h>
 
// Replace these variables
const char* ssid = "YOUR_SSID_HERE";
const char* password = "YOUR_PASSWORD_HERE";
const char* mqtt_server = "YOUR_MQTT_SERVER_IP_HERE";
 
WiFiClient espClient;
PubSubClient client(espClient);

WiFiEventHandler gotIpEventHandler, disconnectedEventHandler;

Servo myservo1;
Servo myservo2;

int servo1pin = D3;
int servo2pin = D7;

int stringToInt( byte* payload, unsigned int length){
  String inString = "";
  for(int i=0;i<length;i++){
    inString += (char)payload[i];
  }
  return inString.toInt();
}
 
void callback(char* topic, byte* payload, unsigned int length) {
 Serial.print("Message arrived [");
 Serial.print(topic);
 Serial.print("] ");

  int intVal = stringToInt(payload,length);

  Serial.println(intVal);

 if(strcmp(topic,"servo1")== 0){
    if(intVal <= 180){
      myservo1.write(intVal);
      delay(15);
    }
 }else if(strcmp(topic,"servo2")== 0){
    if(intVal <= 180){
      myservo2.write(intVal);
      delay(15);
    }
 }else if(strcmp(topic,"laser") == 0){
    digitalWrite(D5,intVal);
 }
}
 
 
void reconnect() {
 // Loop until we're reconnected
 while (!client.connected()) {
 Serial.print("Attempting MQTT connection...");
 // Attempt to connect
 if (client.connect("ESP8266 Client")) {
  Serial.println("connected");
  // ... and subscribe to topic
  client.subscribe("servo1");
  client.subscribe("servo2");
  client.subscribe("laser");
 } else {
  Serial.print("failed, rc=");
  Serial.print(client.state());
  Serial.println(" try again in 1 seconds");
  // Wait 5 seconds before retrying
  delay(1000);
  }
 }
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.setAutoConnect (true);
  WiFi.setAutoReconnect (true);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");

  gotIpEventHandler = WiFi.onStationModeGotIP([](const WiFiEventStationModeGotIP& event)
  {
    Serial.print("Station connected, IP: ");
    Serial.println(WiFi.localIP());
  });


disconnectedEventHandler = WiFi.onStationModeDisconnected([](const WiFiEventStationModeDisconnected& event)
  {
    Serial.println("Station disconnected");
  });
  
}

 
void setup()
{
 Serial.begin(115200);
 pinMode(D5, OUTPUT);
 digitalWrite(D5,1);

 myservo1.attach(servo1pin);
 myservo2.attach(servo2pin);

 myservo1.write(90);
 myservo2.write(45);

 setup_wifi();

 client.setServer(mqtt_server, 1883);
 client.setCallback(callback);
}
 
void loop()
{
 if (!client.connected()) {
  reconnect();
 }
 client.loop();
}
