import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from asgiref.sync import sync_to_async


class DeviceConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.device_id = self.scope["url_route"]["kwargs"]["device_id"]
        self.group_name = f"device_{self.device_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.set_online_status(True)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.set_online_status(False)

    @sync_to_async
    def set_online_status(self, is_online):
        from .models import Device
        Device.objects.filter(device_id=self.device_id).update(
            is_online=is_online, last_seen=timezone.now()
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "confirm":
            await self.save_confirmation(data.get("channel_id"))

        elif msg_type == "reading":
            await self.save_reading(data.get("channel_id"), data.get("value"))

        elif msg_type == "heartbeat":
            await self.set_online_status(True)

    @sync_to_async
    def save_confirmation(self, channel_id):
        from .models import DeviceChannel
        try:
            channel = DeviceChannel.objects.get(id=channel_id)
        except DeviceChannel.DoesNotExist:
            return
        if channel.command_issued_at is None:
            return
        channel.command_applied_at = timezone.now()
        delta = channel.command_applied_at - channel.command_issued_at
        channel.latency_ms = int(delta.total_seconds() * 1000)
        channel.command_issued_at = None
        channel.save()

    @sync_to_async
    def save_reading(self, channel_id, value):
        from .models import DeviceChannel, ChannelReading
        try:
            channel = DeviceChannel.objects.get(id=channel_id, direction="input")
        except DeviceChannel.DoesNotExist:
            return
        channel.state = value
        channel.save()
        ChannelReading.objects.create(channel=channel, value=value)

    async def channel_command(self, event):
        await self.send(text_data=json.dumps({
            "type": "channel_cmd",
            "channel_id": event["channel_id"],
            "pin": event["pin"],
            "signal_type": event["signal_type"],
            "state": event["state"],
        }))

async def door_event(self, event):
    await self.send(text_data=json.dumps({
        "type": "door_event",
        "is_known": event["is_known"],
        "matched_person": event["matched_person"],
        "image_url": event["image_url"],
        "timestamp": event["timestamp"],
    }))        