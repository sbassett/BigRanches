import shapefile
import pyproj
import json
import os

# Define paths
armendaris_dir = r"c:\Users\Steve\Documents\GitHub\BigRanches\data\ArmendarisRanch_Bnd"
ladder_dir = r"c:\Users\Steve\Documents\GitHub\BigRanches\data\LadderRanch_Bnd"
output_json = r"c:\Users\Steve\Documents\GitHub\BigRanches\raw_digitized_boundaries.json"

def get_outer_boundary(directory, name):
    shp_path = os.path.join(directory, name + ".shp")
    prj_path = os.path.join(directory, name + ".prj")
    
    # Read projection
    with open(prj_path, "r") as f:
        prj_wkt = f.read()
        
    # Set up coordinate transformation
    crs_src = pyproj.CRS.from_wkt(prj_wkt)
    crs_dst = pyproj.CRS.from_epsg(4326)
    transformer = pyproj.Transformer.from_crs(crs_src, crs_dst, always_xy=True)
    
    # Read shapefile
    sf = shapefile.Reader(shp_path)
    shape_rec = sf.shapeRecord(0) # Record 0 contains the main ranch polygon
    shape = shape_rec.shape
    
    # The outer boundary is the first part (starts at index 0)
    start_idx = shape.parts[0]
    end_idx = shape.parts[1] if len(shape.parts) > 1 else len(shape.points)
    
    outer_points = shape.points[start_idx:end_idx]
    
    # Transform coordinates to WGS84
    wgs84_coords = []
    for x, y in outer_points:
        lon, lat = transformer.transform(x, y)
        wgs84_coords.append([round(lon, 6), round(lat, 6)])
        
    # Ensure closed (first point equals last point)
    if wgs84_coords[0] != wgs84_coords[-1]:
        wgs84_coords.append(wgs84_coords[0])
        
    return wgs84_coords

def main():
    print("Processing Armendaris Ranch shapefile...")
    armendaris_coords = get_outer_boundary(armendaris_dir, "ArmendarisRanch")
    print(f"Armendaris outer boundary: {len(armendaris_coords)} points.")
    
    print("Processing Ladder Ranch shapefile...")
    ladder_coords = get_outer_boundary(ladder_dir, "LadderRanch")
    print(f"Ladder outer boundary: {len(ladder_coords)} points.")
    
    output_data = {
        "armendaris": armendaris_coords,
        "ladder": ladder_coords
    }
    
    with open(output_json, "w") as f:
        json.dump(output_data, f, indent=4)
        
    print(f"Successfully saved official ranch boundaries to {output_json}!")

if __name__ == "__main__":
    main()
