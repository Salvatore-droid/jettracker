import math


def interpolate_route(points, t):
    if not points:
        return None, None, 0.0
    if len(points) == 1:
        return points[0].lat, points[0].lng, 0.0
    t = max(0.0, min(1.0, t))
    total = len(points) - 1
    idx = min(int(t * total), total - 1)
    frac = t * total - idx
    a, b = points[idx], points[idx + 1]
    lat = a.lat + (b.lat - a.lat) * frac
    lng = a.lng + (b.lng - a.lng) * frac
    heading = bearing(a.lat, a.lng, b.lat, b.lng)
    return round(lat, 6), round(lng, 6), round(heading, 1)


def bearing(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def altitude_for_progress(p):
    if p < 0.05:
        return int(p / 0.05 * 2000)
    if p < 0.15:
        return int(2000 + (p - 0.05) / 0.10 * 33000)
    if p < 0.85:
        return 35000
    if p < 0.95:
        return int(35000 - (p - 0.85) / 0.10 * 33000)
    return int(2000 - (p - 0.95) / 0.05 * 2000)


def speed_for_progress(p):
    if p < 0.05:
        return int(p / 0.05 * 250)
    if p < 0.15:
        return int(250 + (p - 0.05) / 0.10 * (490 - 250))
    if p < 0.85:
        return 490
    if p < 0.95:
        return int(490 - (p - 0.85) / 0.10 * (490 - 150))
    return int(max(0, 150 - (p - 0.95) / 0.05 * 150))


def status_for_progress(p):
    if p == 0:
        return 'scheduled'
    if p < 0.03:
        return 'taxiing'
    if p < 0.15:
        return 'airborne'
    if p < 0.85:
        return 'cruising'
    if p < 0.97:
        return 'descending'
    if p < 1.0:
        return 'airborne'
    return 'landed'
