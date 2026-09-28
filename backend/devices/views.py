from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Device, DeviceChannel, ChannelReading, KnownPerson, FaceSample, DoorEvent
from .serializers import DeviceSerializer
from .face_service import get_face_encoding, match_face

channel_layer = get_channel_layer()
ACTION_CONFIDENCE_THRESHOLD = 60


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


@api_view(["POST"])
def set_channel_state(request, device_id, channel_id):
    """Generic control endpoint — works for ANY output channel (LED, relay, motor, etc.)"""
    new_state = request.data.get("state")
    try:
        channel = DeviceChannel.objects.get(
            id=channel_id, device__device_id=device_id, direction="output"
        )
    except DeviceChannel.DoesNotExist:
        return Response({"error": "Output channel not found"}, status=404)

    channel.state = new_state
    channel.command_issued_at = timezone.now()
    channel.command_applied_at = None
    channel.latency_ms = None
    channel.save()

    async_to_sync(channel_layer.group_send)(
        f"device_{device_id}",
        {
            "type": "channel_command",
            "channel_id": channel.id,
            "pin": channel.pin,
            "signal_type": channel.signal_type,
            "state": new_state,
        },
    )

    return Response({"success": True, "state": channel.state})


@api_view(["POST"])
def simulate_channel_reading(request, device_id, channel_id):
    """
    TEST-ONLY endpoint: manually push a value into an input channel,
    simulating what a real sensor would send. Useful until real hardware exists.
    """
    value = request.data.get("value")
    try:
        channel = DeviceChannel.objects.get(
            id=channel_id, device__device_id=device_id, direction="input"
        )
    except DeviceChannel.DoesNotExist:
        return Response({"error": "Input channel not found"}, status=404)

    channel.state = value
    channel.save()
    ChannelReading.objects.create(channel=channel, value=value)

    return Response({"success": True, "value": channel.state})



@api_view(["POST"])
def door_camera_upload(request, device_id):
    image_file = request.FILES.get("image")
    if not image_file:
        return Response({"error": "image file required"}, status=400)

    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        device, _ = Device.objects.get_or_create(device_id=device_id, defaults={"name": device_id})

    event = DoorEvent.objects.create(device=device, image=image_file)

    encoding = get_face_encoding(event.image.path)
    face_detected = encoding is not None
    best_distance = None
    action_triggered = False

    if face_detected:
        samples = FaceSample.objects.exclude(face_encoding__isnull=True).select_related("person")
        matched_person, confidence, best_distance = match_face(encoding, samples)
        if matched_person:
            event.is_known = True
            event.matched_person = matched_person
            event.confidence = confidence
            event.save()

            if confidence > ACTION_CONFIDENCE_THRESHOLD and device.unlock_channel:
                channel = device.unlock_channel
                channel.state = 1
                channel.command_issued_at = timezone.now()
                channel.save()

                async_to_sync(channel_layer.group_send)(
                    f"device_{device.device_id}",
                    {
                        "type": "channel_command",
                        "channel_id": channel.id,
                        "pin": channel.pin,
                        "signal_type": channel.signal_type,
                        "state": 1,
                    },
                )
                action_triggered = True
        else:
            event.is_known = False
            event.save()

    async_to_sync(channel_layer.group_send)(
        f"device_{device_id}",
        {
            "type": "door_event",
            "is_known": event.is_known,
            "matched_person": event.matched_person.name if event.matched_person else None,
            "image_url": event.image.url,
            "timestamp": event.timestamp.isoformat(),
        },
    )

    return Response({
        "success": True,
        "face_detected": face_detected,
        "best_distance": round(best_distance, 3) if best_distance is not None else None,
        "is_known": event.is_known,
        "matched_person": event.matched_person.name if event.matched_person else None,
        "confidence": event.confidence,
        "action_triggered": action_triggered,
        "action_threshold": ACTION_CONFIDENCE_THRESHOLD,
    })

@api_view(["GET"])
def list_door_events(request, device_id):
    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({"error": "Device not found"}, status=404)

    events = device.door_events.all()[:20]
    data = [
        {
            "id": e.id,
            "is_known": e.is_known,
            "matched_person": e.matched_person.name if e.matched_person else None,
            "confidence": e.confidence,
            "image_url": e.image.url,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in events
    ]
    return Response(data)
@api_view(["POST"])
def register_known_person(request):
    name = request.data.get("name")
    image_file = request.FILES.get("image")
    if not name or not image_file:
        return Response({"error": "name and image are required"}, status=400)

    person, _ = KnownPerson.objects.get_or_create(name=name)
    sample = FaceSample.objects.create(person=person, image=image_file)

    encoding = get_face_encoding(sample.image.path)
    if encoding is None:
        sample.delete()
        return Response({"error": "No face detected in image"}, status=400)

    sample.face_encoding = encoding
    sample.save()
    return Response({"success": True, "person": person.name, "samples": person.samples.count()})    
