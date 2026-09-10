from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Device, LEDOutput, SensorReading
from .serializers import DeviceSerializer, SensorReadingSerializer


# ---------- Frontend-facing endpoints ----------

@api_view(["GET"])
def list_devices(request):
    devices = Device.objects.all()
    return Response(DeviceSerializer(devices, many=True).data)


@api_view(["GET"])
def device_detail(request, device_id):
    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({"error": "Device not found"}, status=404)
    return Response(DeviceSerializer(device).data)


from django.utils import timezone

@api_view(["POST"])
def toggle_led(request, device_id, led_id):
    new_state = request.data.get("state")
    try:
        led = LEDOutput.objects.get(id=led_id, device__device_id=device_id)
    except LEDOutput.DoesNotExist:
        return Response({"error": "LED not found"}, status=404)

    led.state = new_state
    led.command_issued_at = timezone.now()
    led.command_applied_at = None
    led.latency_ms = None
    led.save()
    return Response({"success": True, "state": led.state})


# ---------- ESP32-facing endpoints (device polls these) ----------

@api_view(["GET"])
def esp_get_led_states(request, device_id):
    """
    ESP32 calls this every few seconds (polling) to find out
    what state each of its LEDs SHOULD be in, based on frontend commands.
    """
    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({"error": "Device not found"}, status=404)

    device.is_online = True
    device.last_seen = timezone.now()
    device.save()

    leds = device.led_outputs.all()
    data = [{"led_id": led.id, "pin": led.pin, "state": led.state} for led in leds]
    return Response({"leds": data})


@api_view(["POST"])
def esp_post_sensor_data(request, device_id):
    """
    ESP32 (or your test phone acting as ESP32) POSTs sensor readings here.
    Body example: { "type": "temperature", "value": 26.5, "unit": "C" }
    """
    device, _ = Device.objects.get_or_create(
        device_id=device_id, defaults={"name": device_id}
    )
    device.is_online = True
    device.last_seen = timezone.now()
    device.save()

    reading = SensorReading.objects.create(
        device=device,
        sensor_type=request.data.get("type", "generic"),
        value=request.data.get("value"),
        unit=request.data.get("unit", ""),
    )
    return Response(SensorReadingSerializer(reading).data, status=201)



@api_view(["POST"])
def esp_confirm_led(request, device_id, led_id):
    try:
        led = LEDOutput.objects.get(id=led_id, device__device_id=device_id)
    except LEDOutput.DoesNotExist:
        return Response({"error": "LED not found"}, status=404)

    if led.command_issued_at is None:
        # No pending command — ignore (prevents stale/duplicate confirms)
        return Response({"success": True, "latency_ms": led.latency_ms})

    led.command_applied_at = timezone.now()
    delta = led.command_applied_at - led.command_issued_at
    led.latency_ms = int(delta.total_seconds() * 1000)
    led.command_issued_at = None  # consume it — prevents re-triggering on next poll
    led.save()
    return Response({"success": True, "latency_ms": led.latency_ms})