from pypdf import PdfReader
import cv2
import numpy as np
import json
import os

pdf_path = r"C:\Users\Steve\.gemini\antigravity\brain\e12ba03d-6109-4675-81d3-a29c59eafd6d\scratch\armendaris_ranch.pdf"
output_json = "raw_digitized_boundaries.json"

# 1. Extract image from PDF page 3
print("Extracting map image from PDF...")
reader = PdfReader(pdf_path)
page = reader.pages[2] # Page 3

img_data = page.images[0].data
img_np = np.frombuffer(img_data, np.uint8)
img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
h, w, c = img.shape
print(f"Map image loaded: {w}x{h}")

# 2. Extract contours
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY_INV)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv2.contourArea, reverse=True)

# Identify contours
ladder_raw = contours[0].reshape(-1, 2) # Contour 0
c2 = contours[2].reshape(-1, 2)         # Contour 2
c3 = contours[3].reshape(-1, 2)         # Contour 3

# 3. Merge Armendaris contours (Option 1 splicing)
# Left: c2[211] to c3[0]
# Right: c2[541] to c3[298]
part_c2 = c2[211:542]
part_c3 = c3[298::-1]
armendaris_raw = np.vstack([part_c2, part_c3])

print(f"Ladder extracted: {len(ladder_raw)} points")
print(f"Armendaris merged: {len(armendaris_raw)} points")

# 4. Georeference via Affine Transformation
# lon = a0 + a1 * x + a2 * y
# lat = b0 + b1 * x + b2 * y
coeff_lon = np.array([-1.07918053e+02,  1.90453240e-03, -1.86106510e-04])
coeff_lat = np.array([ 3.91169935e+01, -9.59085752e-05, -1.31356371e-03])

def project_points(pts):
    coords = []
    for pt in pts:
        x, y = pt[0], pt[1]
        lon = coeff_lon[0] + coeff_lon[1] * x + coeff_lon[2] * y
        lat = coeff_lat[0] + coeff_lat[1] * x + coeff_lat[2] * y
        # Limit precision to 5 decimal places (~1.1 meter resolution is plenty)
        coords.append([round(float(lon), 5), round(float(lat), 5)])
    
    # Ensure polygon is closed (first point equals last point)
    if coords[0] != coords[-1]:
        coords.append(coords[0])
    return coords

ladder_geojson_coords = project_points(ladder_raw)
armendaris_geojson_coords = project_points(armendaris_raw)

# 5. Output raw coordinates to JSON
output_data = {
    "ladder": ladder_geojson_coords,
    "armendaris": armendaris_geojson_coords
}

with open(output_json, "w") as f:
    json.dump(output_data, f, indent=4)

print(f"\nSuccessfully digitized ranch boundaries and saved raw coordinates to {output_json}!")
