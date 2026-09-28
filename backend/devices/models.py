from django.db import models

class Device(models.Model):
    device_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # NEW: which output channel to trigger when a known face is recognized at this device's camera
    unlock_channel = models.ForeignKey(
        "DeviceChannel", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+"
    )

    def __str__(self):
        return self.name


class DeviceChannel(models.Model):
    DIRECTION_CHOICES = [
        ("output", "Output"),
        ("input", "Input"),
    ]
    SIGNAL_CHOICES = [
        ("digital", "Digital"),
        ("analog", "Analog"),
    ]

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="channels")
    label = models.CharField(max_length=100)              # "Red LED", "Soil Moisture"
    pin = models.IntegerField()                             # GPIO number
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    signal_type = models.CharField(max_length=10, choices=SIGNAL_CHOICES)

    # Current value: for digital output/input, 0 or 1; for analog, raw float
    state = models.FloatField(default=0)
    unit = models.CharField(max_length=20, blank=True, default="")  # only meaningful for analog input

    command_issued_at = models.DateTimeField(null=True, blank=True)
    command_applied_at = models.DateTimeField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.device.name} - {self.label} ({self.direction}/{self.signal_type})"


class ChannelReading(models.Model):
    """History log for input channels (sensors) — output channels don't need this."""
    channel = models.ForeignKey(DeviceChannel, on_delete=models.CASCADE, related_name="readings")
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.channel.label}: {self.value}"


class KnownPerson(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

from django.utils.text import slugify

def face_sample_path(instance, filename):
    person = instance.person
    return f"known_faces/{person.id}_{slugify(person.name)}/{filename}"
class FaceSample(models.Model):
    person = models.ForeignKey(KnownPerson, on_delete=models.CASCADE, related_name="samples")
    image = models.ImageField(upload_to=face_sample_path)
    face_encoding = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.person.name} sample {self.id}"

class DoorEvent(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="door_events")
    image = models.ImageField(upload_to="door_events/")
    is_known = models.BooleanField(default=False)
    matched_person = models.ForeignKey(
        KnownPerson, on_delete=models.SET_NULL, null=True, blank=True
    )
    confidence = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        status = self.matched_person.name if self.matched_person else "Unknown"
        return f"{self.device.name} - {status} - {self.timestamp}"        