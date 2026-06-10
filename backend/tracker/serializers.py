from rest_framework import serializers
from .models import Jet, RoutePoint, FlightEvent


class RoutePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutePoint
        fields = ['order', 'lat', 'lng']


class FlightEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightEvent
        fields = ['id', 'timestamp', 'event_type', 'message', 'lat', 'lng']


class JetSerializer(serializers.ModelSerializer):
    route_points = RoutePointSerializer(many=True, read_only=True)
    events = FlightEventSerializer(many=True, read_only=True)

    class Meta:
        model = Jet
        fields = [
            'id', 'callsign', 'registration', 'aircraft_type',
            'origin_name', 'destination_name', 'origin_iata', 'destination_iata',
            'status', 'progress', 'current_lat', 'current_lng',
            'altitude_ft', 'speed_kts', 'heading',
            'simulation_speed', 'is_playing',
            'route_points', 'events', 'created_at', 'updated_at',
        ]


class JetCreateSerializer(serializers.ModelSerializer):
    route_points = RoutePointSerializer(many=True)

    class Meta:
        model = Jet
        fields = [
            'callsign', 'registration', 'aircraft_type',
            'origin_name', 'destination_name', 'origin_iata', 'destination_iata',
            'route_points',
        ]

    def create(self, validated_data):
        points_data = validated_data.pop('route_points')
        jet = Jet.objects.create(**validated_data)
        
        for i, pt in enumerate(points_data):
            # Remove the 'order' field from pt to avoid double assignment
            # because we're manually setting order=i
            if 'order' in pt:
                pt.pop('order')
            
            RoutePoint.objects.create(jet=jet, order=i, **pt)
        
        # Set initial position to first route point
        if points_data:
            jet.current_lat = points_data[0]['lat']
            jet.current_lng = points_data[0]['lng']
            jet.save()
        
        return jet


class JetListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jet
        fields = [
            'id', 'callsign', 'registration', 'aircraft_type',
            'origin_name', 'destination_name', 'origin_iata', 'destination_iata',
            'status', 'progress', 'current_lat', 'current_lng',
            'altitude_ft', 'speed_kts', 'heading', 'is_playing',
            'created_at',
        ]