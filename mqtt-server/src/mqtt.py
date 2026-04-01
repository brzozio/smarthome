import os
import json
from dotenv import load_dotenv
import paho.mqtt.client as mqtt

load_dotenv('./.env')

MQTT_HOST:     str = os.getenv("MQTT_HOST")
MQTT_PORT:     str = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC:    str = os.getenv("MQTT_TOPIC")
MQTT_USERNAME: str = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD: str = os.getenv("MQTT_PASSWORD")

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Connection failed: {rc}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)

        temp = data.get("temp")

        print(f"Temperature: {temp} °C")

        """
            Uploading to database.
        """

    except Exception as e:
        print(f"Error processing message: {e}")

def on_disconnect(client, userdata, rc):
    print("Disconnected, trying to reconnect...")
    try:
        client.reconnect()
    except:
        pass


client = mqtt.Client()

if MQTT_USERNAME:
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect


client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)

client.loop_forever()