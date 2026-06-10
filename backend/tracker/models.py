from django.db import models
import uuid


class Jet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    callsign = models.CharField(max_length=20)
    registration = models.CharField(max_length=20)
    aircraft_type = models.CharField(max_length=50, default='Gulfstream G650')
    origin_name = models.CharField(max_length=100)
    destination_name = models.CharField(max_length=100)
    origin_iata = models.CharField(max_length=4)
    destination_iata = models.CharField(max_length=4)
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'Scheduled'),
            ('taxiing',   'Taxiing'),
            ('airborne',  'Airborne'),
            ('cruising',  'Cruising'),
            ('descending','Descending'),
            ('landed',    'Landed'),
        ],
        default='scheduled',
    )
    progress = models.FloatField(default=0.0)
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    altitude_ft = models.IntegerField(default=0)
    speed_kts = models.IntegerField(default=0)
    heading = models.FloatField(default=0.0)
    simulation_speed = models.FloatField(default=1.0)
    is_playing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.callsign} {self.origin_iata}→{self.destination_iata}'


class RoutePoint(models.Model):
    jet = models.ForeignKey(Jet, on_delete=models.CASCADE, related_name='route_points')
    order = models.PositiveIntegerField()
    lat = models.FloatField()
    lng = models.FloatField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.jet.callsign} pt{self.order}'


class FlightEvent(models.Model):
    jet = models.ForeignKey(Jet, on_delete=models.CASCADE, related_name='events')
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=30)
    message = models.TextField()
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
