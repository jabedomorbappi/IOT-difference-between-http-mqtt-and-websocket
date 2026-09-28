from rest_framework import serializers
from .models import Device, DeviceChannel, ChannelReading

class ChannelReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelReading
        fields = ["id", "value", "timestamp"]


class DeviceChannelSerializer(serializers.ModelSerializer):
    recent_readings = serializers.SerializerMethodField()

    class Meta:
        model = DeviceChannel
        fields = [
            "id", "label", "pin", "direction", "signal_type",
            "state", "unit", "latency_ms", "updated_at", "recent_readings",
        ]

    def get_recent_readings(self, obj):
        if obj.direction != "input":
            return []
        readings = obj.readings.all()[:10]
        return ChannelReadingSerializer(readings, many=True).data


class DeviceSerializer(serializers.ModelSerializer):
    channels = DeviceChannelSerializer(many=True, read_only=True)

    class Meta:
        model = Device
        fields = ["id", "device_id", "name", "is_online", "last_seen", "channels"]