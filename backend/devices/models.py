from django.db import models

# Create your models here.

class Device(models.Model):
    device_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    is_online=models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name

class LEDOutput(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='led_outputs')
    label = models.CharField(max_length=100)
    pin = models.IntegerField()
    state = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    command_issued_at = models.DateTimeField(null=True, blank=True)
    command_applied_at = models.DateTimeField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.device.name} - {self.label}"
    

class SensorReading(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='sensor_readings')
    sensor_type=models.CharField(max_length=50)
    
    value=models.FloatField()
    unit=models.CharField(max_length=20)
    timestamp=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.device.name} - {self.sensor_type} - {self.value} "