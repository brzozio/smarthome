#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ==== CONFIG ====
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";

const char* MQTT_SERVER = "192.168.1.154";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "esp32/climate";

// ==== DHT11 ====
#define DHTPIN 8
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// ==== MQTT ====
WiFiClient espClient;
PubSubClient client(espClient);

// ==== FUNCTIONS ====

void connectWiFi() {
    Serial.println("WiFi start");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        Serial.println("Connecting WiFi...");
        delay(500);
    }

    Serial.println("WiFi OK");
    Serial.printf(
        "IP: %s\nGW: %s\nRSSI: %d\nMAC: %s\n",
        WiFi.localIP().toString().c_str(),
        WiFi.gatewayIP().toString().c_str(),
        WiFi.RSSI(),
        WiFi.macAddress().c_str()
    );
}

void connectMQTT() {
    while (!client.connected()) {
        String clientId = "ESP32-" + String(random(0xffff), HEX);

        if (client.connect(clientId.c_str())) {
            Serial.println("MQTT CONNECTED");
        } else {
            Serial.printf("Connecting to MQTT server: %s:%d, topic: %s\n",
              MQTT_SERVER,
              MQTT_PORT,
              MQTT_TOPIC
            );
            Serial.print("MQTT FAIL, state=");
            Serial.println(client.state());
            delay(2000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    delay(2000);

    Serial.println("BOOT OK");

    dht.begin();

    connectWiFi();
    client.setServer(MQTT_SERVER, MQTT_PORT);

}

void loop() {
    if (!client.connected()) {
        connectMQTT();
    }

    client.loop();

    float tempC = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (!isnan(tempC) && !isnan(humidity)) {
        char payload[50];
        sprintf(payload, "{\"temp\":%.2f,\"hum\":%.2f}", tempC, humidity);

        client.publish(MQTT_TOPIC, payload);

        Serial.print("Temp: ");
        Serial.print(tempC);
        Serial.print(" °C | Hum: ");
        Serial.println(humidity);
    } else {
        Serial.println("DHT read error");
    }

    delay(2000);
}