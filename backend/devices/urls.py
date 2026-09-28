from django.urls import path
from . import views

urlpatterns = [
    path("devices/", views.list_devices),
    path("devices/<str:device_id>/", views.device_detail),
    path("devices/<str:device_id>/channel/<int:channel_id>/set/", views.set_channel_state),
    path("devices/<str:device_id>/channel/<int:channel_id>/simulate/", views.simulate_channel_reading),

    path("known-people/register/", views.register_known_person),
path("devices/<str:device_id>/door-camera/upload/", views.door_camera_upload),
path("devices/<str:device_id>/door-events/", views.list_door_events),
]