#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==== CONFIG ====
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";

const char* MQTT_SERVER = "192.168.1.100"; // your broker IP
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "esp32/temperature";

// ==== DS18B20 ====
#define ONE_WIRE_BUS 4

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ==== MQTT ====
WiFiClient espClient;
PubSubClient client(espClient);

// ==== FUNCTIONS ====

void connectWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
}

void connectMQTT() {
    while (!client.connected()) {
        String clientId = "ESP32-" + String(random(0xffff), HEX);

        if (client.connect(clientId.c_str())) {
            // connected
        } else {
            delay(2000);
        }
    }
}

void setup() {
    Serial.begin(115200);

    connectWiFi();

    client.setServer(MQTT_SERVER, MQTT_PORT);

    sensors.begin();
}

void loop() {
    if (!client.connected()) {
        connectMQTT();
    }

    client.loop();

    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    if (tempC != DEVICE_DISCONNECTED_C) {
        char payload[10];
        dtostrf(tempC, 1, 2, payload);

        client.publish(MQTT_TOPIC, payload);

        Serial.print("Temperature: ");
        Serial.println(payload);
    } else {
        Serial.println("Sensor error");
    }

    delay(5000);
}