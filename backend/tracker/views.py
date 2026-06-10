from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Jet, RoutePoint, FlightEvent
from .serializers import JetSerializer, JetCreateSerializer, JetListSerializer
from .utils import interpolate_route, altitude_for_progress, speed_for_progress, status_for_progress
import math


def push_update(jet):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'jet_{jet.id}',
        {
            'type': 'jet.update',
            'data': {
                'id': str(jet.id),
                'status': jet.status,
                'progress': round(jet.progress, 5),
                'lat': jet.current_lat,
                'lng': jet.current_lng,
                'altitude_ft': jet.altitude_ft,
                'speed_kts': jet.speed_kts,
                'heading': jet.heading,
                'is_playing': jet.is_playing,
            },
        },
    )


@api_view(['GET'])
def jet_list(request):
    jets = Jet.objects.all().order_by('-created_at')
    return Response(JetListSerializer(jets, many=True).data)


@api_view(['POST'])
def jet_create(request):
    s = JetCreateSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    jet = s.save()
    FlightEvent.objects.create(
        jet=jet, event_type='created',
        message=f'Flight {jet.callsign} created: {jet.origin_iata} → {jet.destination_iata}',
        lat=jet.current_lat, lng=jet.current_lng,
    )
    return Response(JetSerializer(jet).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def jet_detail(request, pk):
    try:
        jet = Jet.objects.prefetch_related('route_points', 'events').get(pk=pk)
    except Jet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(JetSerializer(jet).data)


@api_view(['DELETE'])
def jet_delete(request, pk):
    try:
        jet = Jet.objects.get(pk=pk)
        jet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Jet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def jet_control(request, pk):
    try:
        jet = Jet.objects.prefetch_related('route_points').get(pk=pk)
    except Jet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')
    points = list(jet.route_points.all())

    if action == 'play':
        if jet.progress >= 1.0:
            jet.progress = 0.0
        jet.is_playing = True
        jet.status = status_for_progress(jet.progress)
        FlightEvent.objects.create(jet=jet, event_type='play',
            message=f'Simulation started at {jet.progress*100:.0f}%',
            lat=jet.current_lat, lng=jet.current_lng)

    elif action == 'pause':
        jet.is_playing = False
        FlightEvent.objects.create(jet=jet, event_type='pause',
            message=f'Simulation paused at {jet.progress*100:.0f}%',
            lat=jet.current_lat, lng=jet.current_lng)

    elif action == 'reset':
        jet.is_playing = False
        jet.progress = 0.0
        jet.status = 'scheduled'
        jet.altitude_ft = 0
        jet.speed_kts = 0
        if points:
            jet.current_lat = points[0].lat
            jet.current_lng = points[0].lng
            jet.heading = 0
        FlightEvent.objects.create(jet=jet, event_type='reset',
            message='Flight reset to departure gate', lat=jet.current_lat, lng=jet.current_lng)

    elif action == 'jump':
        p = max(0.0, min(1.0, float(request.data.get('progress', 0))))
        jet.progress = p
        lat, lng, hdg = interpolate_route(points, p)
        jet.current_lat = lat
        jet.current_lng = lng
        jet.heading = hdg
        jet.altitude_ft = altitude_for_progress(p)
        jet.speed_kts = speed_for_progress(p)
        jet.status = status_for_progress(p)
        FlightEvent.objects.create(jet=jet, event_type='jump',
            message=f'Position jumped to {p*100:.0f}% of route',
            lat=lat, lng=lng)

    elif action == 'set_speed':
        spd = max(0.1, min(20.0, float(request.data.get('simulation_speed', 1.0))))
        jet.simulation_speed = spd
        FlightEvent.objects.create(jet=jet, event_type='speed_change',
            message=f'Simulation speed set to {spd}x', lat=jet.current_lat, lng=jet.current_lng)

    else:
        return Response({'error': 'Unknown action'}, status=400)

    jet.save()
    push_update(jet)
    return Response(JetSerializer(jet).data)


@api_view(['POST'])
def jet_tick(request, pk):
    """Advance flight by one simulation tick. Called by the frontend timer."""
    try:
        jet = Jet.objects.prefetch_related('route_points').get(pk=pk)
    except Jet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not jet.is_playing or jet.progress >= 1.0:
        return Response({'skipped': True})

    points = list(jet.route_points.all())
    delta = 0.001 * jet.simulation_speed
    new_p = min(jet.progress + delta, 1.0)

    lat, lng, hdg = interpolate_route(points, new_p)
    old_status = jet.status
    new_status = status_for_progress(new_p)

    jet.progress = new_p
    jet.current_lat = lat
    jet.current_lng = lng
    jet.heading = hdg
    jet.altitude_ft = altitude_for_progress(new_p)
    jet.speed_kts = speed_for_progress(new_p)
    jet.status = new_status

    if new_p >= 1.0:
        jet.is_playing = False
        FlightEvent.objects.create(jet=jet, event_type='landed',
            message=f'{jet.callsign} has landed at {jet.destination_iata}',
            lat=lat, lng=lng)

    elif old_status != new_status:
        messages = {
            'taxiing': f'{jet.callsign} is taxiing at {jet.origin_iata}',
            'airborne': f'{jet.callsign} is airborne',
            'cruising': f'{jet.callsign} reached cruise altitude — {jet.altitude_ft:,} ft',
            'descending': f'{jet.callsign} beginning descent to {jet.destination_iata}',
        }
        if new_status in messages:
            FlightEvent.objects.create(jet=jet, event_type=new_status,
                message=messages[new_status], lat=lat, lng=lng)

    jet.save()
    push_update(jet)

    return Response({
        'progress': new_p, 'lat': lat, 'lng': lng,
        'altitude_ft': jet.altitude_ft, 'speed_kts': jet.speed_kts,
        'heading': hdg, 'status': new_status,
    })


PRESET_ROUTES = [
    {
        'callsign': 'GTF001', 'registration': 'N1JT', 'aircraft_type': 'Gulfstream G650ER',
        'origin_name': 'New York JFK', 'destination_name': 'London Heathrow',
        'origin_iata': 'JFK', 'destination_iata': 'LHR',
        'route_points': [
            {'order':0,'lat':40.6413,'lng':-73.7781},
            {'order':1,'lat':43.0,'lng':-65.0},
            {'order':2,'lat':47.0,'lng':-52.0},
            {'order':3,'lat':51.0,'lng':-35.0},
            {'order':4,'lat':53.0,'lng':-20.0},
            {'order':5,'lat':52.5,'lng':-10.0},
            {'order':6,'lat':51.4775,'lng':-0.4614},
        ],
    },
    {
        'callsign': 'GTF002', 'registration': 'VP-BAR', 'aircraft_type': 'Bombardier Global 7500',
        'origin_name': 'Dubai', 'destination_name': 'Singapore Changi',
        'origin_iata': 'DXB', 'destination_iata': 'SIN',
        'route_points': [
            {'order':0,'lat':25.2528,'lng':55.3644},
            {'order':1,'lat':22.0,'lng':60.0},
            {'order':2,'lat':18.0,'lng':68.0},
            {'order':3,'lat':12.0,'lng':74.0},
            {'order':4,'lat':6.0,'lng':80.0},
            {'order':5,'lat':1.3644,'lng':103.9915},
        ],
    },
    {
        'callsign': 'GTF003', 'registration': 'M-ANGO', 'aircraft_type': 'Dassault Falcon 8X',
        'origin_name': 'Paris Le Bourget', 'destination_name': 'Nairobi Wilson',
        'origin_iata': 'LBG', 'destination_iata': 'WIL',
        'route_points': [
            {'order':0,'lat':48.9694,'lng':2.4414},
            {'order':1,'lat':44.0,'lng':8.0},
            {'order':2,'lat':38.0,'lng':14.0},
            {'order':3,'lat':30.0,'lng':20.0},
            {'order':4,'lat':22.0,'lng':28.0},
            {'order':5,'lat':12.0,'lng':34.0},
            {'order':6,'lat':4.0,'lng':36.0},
            {'order':7,'lat':-1.3192,'lng':36.8147},
        ],
    },
    {
        'callsign': 'GTF004', 'registration': 'N400AX', 'aircraft_type': 'Gulfstream G700',
        'origin_name': 'Los Angeles', 'destination_name': 'Tokyo Haneda',
        'origin_iata': 'LAX', 'destination_iata': 'HND',
        'route_points': [
            {'order':0,'lat':33.9425,'lng':-118.4081},
            {'order':1,'lat':38.0,'lng':-135.0},
            {'order':2,'lat':45.0,'lng':-155.0},
            {'order':3,'lat':52.0,'lng':-170.0},
            {'order':4,'lat':55.0,'lng':175.0},
            {'order':5,'lat':50.0,'lng':160.0},
            {'order':6,'lat':40.0,'lng':145.0},
            {'order':7,'lat':35.5533,'lng':139.7811},
        ],
    },
]


@api_view(['GET'])
def preset_routes(request):
    return Response(PRESET_ROUTES)
