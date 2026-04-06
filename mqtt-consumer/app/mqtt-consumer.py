import os
import json
import requests
import paho.mqtt.client as mqtt
from datetime import datetime
import pendulum

local_tz = pendulum.timezone('Europe/Warsaw')

MQTT_HOST:  str = "mqtt-server"
MQTT_PORT:  int = 1883
MQTT_TOPIC: str = "esp32/climate"
LOG_FORMAT: str = '%d.%m.%Y %H:%M:%S'
API_URL:    str = "http://db-api:8000/api/v1/climate"

def on_connect(client, userdata, flags, reason_code, properties=None) -> None:
    if reason_code == 0:
        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Connected to MQTT")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Connection failed: {reason_code}")


def on_message(client, userdata, msg) -> None:
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)

        temp:     float = data.get("temp")
        humidity: float = data.get("hum")

        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Temperature: {temp} °C")
        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Humidity: {humidity} %")

        # --- SEND TO API ---
        if temp is not None:
            response = requests.post(
                API_URL,
                json={
                    "temperature": temp,
                    "humidity": humidity
                },
                timeout=3
            )

            if response.status_code != 200:
                print(f"[API ERROR] {response.status_code} {response.text}")
            else:
                print(f"[API OK] {response.json()}")

    except Exception as e:
        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Error processing message: {e}")


def on_disconnect(client, userdata, reason_code, properties=None) -> None:
    print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Disconnected (reason: {reason_code})")
    try:
        client.reconnect()
    except Exception as e:
        print(f"[{datetime.now(tz=local_tz).strftime(LOG_FORMAT)}] Reconnect failed: {e}")


# ---- CLIENT (v2 API) ----
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)

client.loop_forever()