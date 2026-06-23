import json
import math

def calculate_centroid(coords):
    lons = [p[0] for p in coords]
    lats = [p[1] for p in coords]
    return sum(lons) / len(lons), sum(lats) / len(lats)



# 1. REAL RANCH BOUNDARIES (Original New Mexico locations)
# Load high-detail digitized boundaries if available, falling back to simplified approximations
try:
    with open("raw_digitized_boundaries.json", "r") as f:
        digitized = json.load(f)
        armendaris_coords = digitized["armendaris"]
        ladder_coords = digitized["ladder"]
        print(f"Loaded high-detail digitized boundaries: Armendaris ({len(armendaris_coords)} pts), Ladder ({len(ladder_coords)} pts)")
except Exception as e:
    print(f"Could not load digitized boundaries ({e}), falling back to simplified geometries.")
    armendaris_coords = [
        [-106.87, 33.72],
        [-106.76, 33.70],
        [-106.80, 33.45],
        [-106.87, 33.30],
        [-106.92, 33.16],
        [-107.16, 33.13],
        [-107.12, 33.22],
        [-107.03, 33.35],
        [-106.96, 33.52],
        [-106.92, 33.65],
        [-106.87, 33.72]
    ]

    ladder_coords = [
        [-107.64, 33.16],
        [-107.52, 33.16],
        [-107.42, 33.14],
        [-107.40, 33.05],
        [-107.42, 32.94],
        [-107.54, 32.92],
        [-107.65, 32.94],
        [-107.62, 33.05],
        [-107.64, 33.16]
    ]

# Calculate combined centroid of the ranches block in New Mexico
ranches_combined = armendaris_coords + ladder_coords
RANCHES_CENTROID_LON, RANCHES_CENTROID_LAT = calculate_centroid(ranches_combined)

# 2. COMPARISON REGIONS (Original geographic coordinates)
rhode_island_raw = [
    [-71.85, 42.01],
    [-71.12, 42.01],
    [-71.12, 41.65],
    [-71.22, 41.65],
    [-71.15, 41.50],
    [-71.31, 41.47],
    [-71.40, 41.48],
    [-71.60, 41.35],
    [-71.80, 41.35],
    [-71.85, 42.01]
]

nyc_raw = [
    [-74.25, 40.50],
    [-74.20, 40.60],
    [-74.05, 40.60],
    [-74.02, 40.62],
    [-74.02, 40.75],
    [-73.93, 40.87],
    [-73.85, 40.90],
    [-73.76, 40.80],
    [-73.70, 40.75],
    [-73.75, 40.60],
    [-73.95, 40.57],
    [-74.25, 40.50]
]

denver_raw = [
    [-105.10, 39.80],
    [-104.88, 39.80],
    [-104.88, 39.62],
    [-105.10, 39.62],
    [-105.10, 39.80]
]

yellowstone_raw = [
    [-111.15, 45.02],
    [-109.83, 45.02],
    [-109.83, 44.13],
    [-111.15, 44.13],
    [-111.15, 45.02]
]

sf_bay_area_raw = [
    [-122.95, 38.30],
    [-122.60, 38.80],
    [-122.20, 38.70],
    [-121.75, 38.20],
    [-121.55, 37.75],
    [-121.65, 37.10],
    [-122.05, 37.00],
    [-122.25, 37.40],
    [-122.50, 37.75],
    [-122.95, 38.30]
]

def translate_ranches_to_target(comp_coords):
    # Calculate centroid of the target comparison region
    comp_lon, comp_lat = calculate_centroid(comp_coords[:-1] if comp_coords[0] == comp_coords[-1] else comp_coords)
    
    # Calculate scale factor to preserve physical width (meters) across different latitudes
    # 1 degree of longitude = 111.32 km * cos(latitude)
    scale_factor = math.cos(math.radians(RANCHES_CENTROID_LAT)) / math.cos(math.radians(comp_lat))
    
    # Translate both Armendaris and Ladder using the exact same translation vector (rigid block shift) scaled for local latitude
    armendaris_trans = []
    for pt in armendaris_coords:
        new_lon = (pt[0] - RANCHES_CENTROID_LON) * scale_factor + comp_lon
        new_lat = (pt[1] - RANCHES_CENTROID_LAT) + comp_lat
        armendaris_trans.append([new_lon, new_lat])
        
    ladder_trans = []
    for pt in ladder_coords:
        new_lon = (pt[0] - RANCHES_CENTROID_LON) * scale_factor + comp_lon
        new_lat = (pt[1] - RANCHES_CENTROID_LAT) + comp_lat
        ladder_trans.append([new_lon, new_lat])
        
    return armendaris_trans, ladder_trans

# Compile comparison datasets
comparisons = {
    "rhode-island": {"coords": rhode_island_raw, "name": "Rhode Island", "area": 1034},
    "nyc": {"coords": nyc_raw, "name": "New York City", "area": 302},
    "denver": {"coords": denver_raw, "name": "Denver", "area": 155},
    "yellowstone": {"coords": yellowstone_raw, "name": "Yellowstone National Park", "area": 3471},
    "sf-bay-area": {"coords": sf_bay_area_raw, "name": "SF Bay Area", "area": 6900}
}

features = []

# Generate comparison shapes and overlaid translated ranch shapes
for key, data in comparisons.items():
    # 1. The comparison region itself (real location)
    features.append({
        "type": "Feature",
        "properties": {
            "parent_id": key,
            "type": "comparison",
            "name": data["name"],
            "area_sqmi": data["area"]
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [data["coords"]]
        }
    })
    
    # Translate ranches to this region
    arm_trans, lad_trans = translate_ranches_to_target(data["coords"])
    
    # 2. Armendaris translated to this region
    features.append({
        "type": "Feature",
        "properties": {
            "parent_id": key,
            "type": "translated-ranch",
            "name": "Armendaris Ranch (Overlaid)"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [arm_trans]
        }
    })
    
    # 3. Ladder translated to this region
    features.append({
        "type": "Feature",
        "properties": {
            "parent_id": key,
            "type": "translated-ranch",
            "name": "Ladder Ranch (Overlaid)"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [lad_trans]
        }
    })

# 4. Add the True Location (New Mexico) features without translation
features.append({
    "type": "Feature",
    "properties": {
        "parent_id": "new-mexico",
        "type": "translated-ranch",
        "name": "Armendaris Ranch"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [armendaris_coords]
    }
})

features.append({
    "type": "Feature",
    "properties": {
        "parent_id": "new-mexico",
        "type": "translated-ranch",
        "name": "Ladder Ranch"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [ladder_coords]
    }
})

geojson_data = {
    "type": "FeatureCollection",
    "features": features
}

output_path = "boundaries.js"
with open(output_path, "w") as f:
    f.write("const BOUNDARIES_DATA = ")
    json.dump(geojson_data, f, indent=4)
    f.write(";")

print(f"Successfully generated {output_path} with translated ranches overlays for {len(comparisons)} locations.")
