from django.urls import path

from . import views

urlpatterns = [
    path("", views.generic("index.html"), name="index"),
    path("home", views.generic("home.html"), name="index"),
    path("settings", views.generic("settings.html"), name="settings"),
    path("multiplayer", views.generic("multiplayer.html"), name="multiplayer"),
    path("1v1", views.generic("1v1.html"), name="1v1"),
    path("2v2", views.generic("2v2.html"), name="2v2"),
]
