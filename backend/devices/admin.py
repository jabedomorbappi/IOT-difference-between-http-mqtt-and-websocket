from django.contrib import admin

# # Register your models here.

# from django.contrib import admin
# from .models import Device, DeviceChannel, ChannelReading

# admin.site.register(Device)
# admin.site.register(DeviceChannel)
# admin.site.register(ChannelReading)



# from django.contrib import admin
# from .models import Device, DeviceChannel, ChannelReading, KnownPerson, DoorEvent



# admin.site.register(DoorEvent)



from django.contrib import admin, messages
from .models import Device, DeviceChannel, ChannelReading, KnownPerson, FaceSample, DoorEvent
from .face_service import get_face_encoding


class FaceSampleInline(admin.TabularInline):
    model = FaceSample
    extra = 3
    fields = ["image"]


@admin.register(KnownPerson)
class KnownPersonAdmin(admin.ModelAdmin):
    inlines = [FaceSampleInline]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        for sample in form.instance.samples.filter(face_encoding__isnull=True):
            encoding = get_face_encoding(sample.image.path)
            if encoding:
                sample.face_encoding = encoding
                sample.save()
            else:
                self.message_user(
                    request,
                    f"No face found in {sample.image.name}. It will be ignored.",
                    level=messages.WARNING,
                )


admin.site.register(Device)
admin.site.register(DeviceChannel)
admin.site.register(ChannelReading)
admin.site.register(DoorEvent)