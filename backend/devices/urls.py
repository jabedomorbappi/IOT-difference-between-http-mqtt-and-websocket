from django.urls import path
from . import views

urlpatterns = [
    # Frontend-facing
    path("devices/", views.list_devices),
    path("devices/<str:device_id>/", views.device_detail),
    path("devices/<str:device_id>/led/<int:led_id>/toggle/", views.toggle_led),

    # ESP32-facing (or phone simulating ESP32)
    path("devices/<str:device_id>/led-states/", views.esp_get_led_states),
    path("devices/<str:device_id>/sensor-data/", views.esp_post_sensor_data),

    path("devices/<str:device_id>/led/<int:led_id>/confirm/", views.esp_confirm_led),
]