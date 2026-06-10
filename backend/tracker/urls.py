from django.urls import path
from . import views

urlpatterns = [
    path('jets/', views.jet_list),
    path('jets/create/', views.jet_create),
    path('jets/presets/', views.preset_routes),
    path('jets/<uuid:pk>/', views.jet_detail),
    path('jets/<uuid:pk>/delete/', views.jet_delete),
    path('jets/<uuid:pk>/control/', views.jet_control),
    path('jets/<uuid:pk>/tick/', views.jet_tick),
]
