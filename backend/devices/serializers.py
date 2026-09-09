from rest_framework import serializers
from .models import Device, LEDOutput, SensorReading


class LEDOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = LEDOutput
        fields = ["id", "label", "pin", "state", "updated_at","latency_ms"]


class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = ["id", "sensor_type", "value", "unit", "timestamp"]


class DeviceSerializer(serializers.ModelSerializer):
    leds = LEDOutputSerializer(source="led_outputs", many=True, read_only=True)
    latest_readings = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = ["id", "device_id", "name", "is_online", "last_seen", "leds", "latest_readings"]

    def get_latest_readings(self, obj):
        readings = obj.sensor_readings.all()[:10]
        return SensorReadingSerializer(readings, many=True).data


# class LEDOutputSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = LEDOutput
#         fields = ["id", "label", "pin", "state", "updated_at", "latency_ms"]        