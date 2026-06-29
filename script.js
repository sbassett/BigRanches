document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. DATA & PITCH CONTENT DEFINITION
       ========================================================================== */
    const comparisonData = {
        'washington-dc': {
            title: "Ranches vs. Washington, DC",
            description: "The combined Ranches cover about 807 square miles of land. This represents **11.8 times** the entire land area of Washington, DC (68.3 sq mi). The federal capital district could fit inside the Ranches' borders over eleven times over.",
            funFact: "The Ladder Ranch alone (244 sq mi) is more than three and a half times the size of Washington, DC!",
            legend: "Washington, DC (68 sq mi)"
        },
        'des-moines': {
            title: "Ranches vs. Des Moines",
            description: "The combined Ranches span 807 square miles, which is nearly **9 times** the size of the city of Des Moines, Iowa (90.6 sq mi). The entire capital city and its municipal borders represent a fraction of this protected wilderness.",
            funFact: "The Armendaris Ranch alone (562 sq mi) is more than six times the size of the city of Des Moines!",
            legend: "Des Moines (90 sq mi)"
        },
        'rhode-island': {
            title: "Ranches vs. Rhode Island",
            description: "The combined Ranches cover about 807 square miles of land. This represents approximately <strong>78%</strong> of the entire land area of Rhode Island (1,034 sq mi). Rather than housing over 1 million residents, this territory is dedicated to pristine habitat, bison herds, and endangered species recovery.",
            funFact: "It would take only 1.3 copies of these Ranches to completely cover the smallest US state!",
            legend: "Rhode Island (1,034 sq mi)"
        },
        'denver': {
            title: "Ranches vs. Denver",
            description: "The combined Ranches cover 807 square miles of land. This represents **5.2 times larger** than the entire municipal land area of the City and County of Denver (155 sq mi). While Denver hosts over 700,000 residents and a bustling downtown, this combined territory is preserved for wilderness corridors, bighorn sheep, and critical grasslands.",
            funFact: "You could fit more than five copies of the entire city of Denver inside the borders of these two Ranches!",
            legend: "Denver (155 sq mi)"
        },
        'nyc': {
            title: "Ranches vs. New York City",
            description: "The combined Ranches span 807 square miles, which is **2.7 times larger** than the land area of all five boroughs of New York City combined (302 sq mi). While NYC holds one of the densest human populations on Earth, these Ranches hold one of the densest bat populations.",
            funFact: "You could fit nearly three New York Cities inside the borders of these two New Mexico Ranches!",
            legend: "New York City (302 sq mi)"
        },
        'yellowstone': {
            title: "Ranches vs. Yellowstone",
            description: "Yellowstone National Park is one of the largest national parks in the United States, spanning 3,471 square miles. The Ladder and Armendaris Ranches combined (807 sq mi) cover an area equal to **23%** of Yellowstone, illustrating the massive scale of private land conservation.",
            funFact: "These two Ranches together are equivalent to nearly a quarter of the entire Yellowstone National Park!",
            legend: "Yellowstone National Park (3,471 sq mi)"
        },
        'sf-bay-area': {
            title: "Ranches vs. SF Bay Area",
            description: "The 9-county San Francisco Bay Area covers approximately 6,900 square miles of land. The Ranches combined represent about **12%** of this massive region, which is larger than the land area of San Francisco, Marin, and San Mateo counties combined.",
            funFact: "While the SF Bay Area is home to 7.7 million people, these Ranches preserve a comparable, contiguous corridor of wilderness for wild species.",
            legend: "SF Bay Area (6,900 sq mi)"
        },
        'new-mexico': {
            title: "True Location (New Mexico)",
            description: "The Ladder and Armendaris Ranches are shown here in their **actual geographic locations** in southern New Mexico, flanking the Rio Grande corridor and Interstate 25. The map shows their real-world spacing, orientation, and shapes relative to New Mexico's desert topography.",
            funFact: "Separated by only 20 miles of land, these two massive reserves protect a crucial wildlife movement corridor between the Gila Mountains and the Jornada del Muerto basin.",
            legend: "True Location"
        }
    };

    const tabButtons = document.querySelectorAll('.tab-btn');
    const compTitle = document.getElementById('comparison-title');
    const compDesc = document.getElementById('comparison-description');
    const compFunFact = document.getElementById('comparison-fun-fact');

    /* ==========================================================================
       2. LEAFLET.JS MAP INITIALIZATION
       ========================================================================== */
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        throw new Error("Map container element '#map' was not found in the HTML DOM. Your browser is likely running a cached version of the older HTML structure. Please perform a Hard Refresh (Ctrl+F5 or Cmd+Shift+R) to force the browser to clear its cache.");
    }

    // Initialize the map centered in New Mexico (between Ladder and Armendaris ranches)
    const map = L.map(mapContainer, {
        zoomControl: true,
        scrollWheelZoom: false, // Prevent page scrolling issues
        dragging: !L.Browser.mobile, // Disable dragging on mobile for better scrolling
        tap: !L.Browser.mobile
    }).setView([33.22, -107.25], 8);

    // Add CartoDB Voyager tiles for a warm spring day aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add native scale control (imperial on top, metric on bottom, positioned bottom-left)
    L.control.scale({
        imperial: true,
        metric: true,
        position: 'bottomleft'
    }).addTo(map);

    // Variables to hold map layer references
    let activeLayers = [];
    let isInitialLoad = true;

    // Switch comparison shape on map and update text
    function switchComparison(key) {
        // Remove current layers from the map
        activeLayers.forEach(layer => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
        activeLayers = [];

        // Get features for the current comparison key
        const features = BOUNDARIES_DATA.features.filter(f => f.properties.parent_id === key);
        
        if (features.length === 0) return;

        const bounds = L.latLngBounds();

        features.forEach(feature => {
            if (feature.properties.type === 'comparison') {
                // Do not display the comparison region, but use its bounds to frame the zoom area
                const tempLayer = L.geoJSON(feature);
                bounds.extend(tempLayer.getBounds());
            } else if (feature.properties.type === 'translated-ranch') {
                const layer = L.geoJSON(feature, {
                    style: {
                        color: 'hsl(135, 45%, 32%)', // Spring Green
                        fillColor: 'hsl(135, 45%, 32%)',
                        fillOpacity: 0.18,
                        weight: 2,
                        dashArray: '5, 5'
                    }
                });
                
                // Add tooltip for each ranch
                layer.eachLayer(ranchLayer => {
                    const name = ranchLayer.feature.properties.name.replace(' (Overlaid)', '');
                    ranchLayer.bindTooltip(name, {
                        permanent: true,
                        direction: 'center',
                        className: 'ranch-tooltip'
                    });
                });

                layer.addTo(map);
                activeLayers.push(layer);
                bounds.extend(layer.getBounds());
            }
        });

        // Zoom map to fit both shapes smoothly with some padding
        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [45, 45],
                maxZoom: 11,
                animate: !isInitialLoad,
                duration: isInitialLoad ? 0 : 0.8
            });
        }
        
        isInitialLoad = false;
    }

    // Recalculate size to handle any initial layout sizing lag
    map.invalidateSize();

    // Set default active comparison (Washington, DC)
    switchComparison('washington-dc');

    /* ==========================================================================
       3. CONTROLS & INTERACTIVE TABS LOGIC
       ========================================================================== */
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state on tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const key = button.getAttribute('data-compare');
            const data = comparisonData[key];

            if (data) {
                // Fade effect on texts
                const factContainer = document.querySelector('.comparison-facts');
                factContainer.style.opacity = 0;
                factContainer.style.transform = 'translateY(5px)';

                setTimeout(() => {
                    compTitle.innerText = data.title;
                    compDesc.innerHTML = data.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    compFunFact.innerText = data.funFact;
                    
                    // Trigger map update
                    switchComparison(key);

                    factContainer.style.opacity = 1;
                    factContainer.style.transform = 'translateY(0)';
                }, 200);
            }
        });
    });

    /* ==========================================================================
       4. SPECIES GRID ACCORDION LOGIC
       ========================================================================== */
    const speciesCards = document.querySelectorAll('.species-card');

    speciesCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;

            const isExpanded = card.classList.contains('expanded');
            
            // Collapse other open cards
            speciesCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('expanded');
                    otherCard.querySelector('.expand-btn').innerHTML = `Read More <span class="arrow">↓</span>`;
                }
            });

            // Toggle current card
            if (isExpanded) {
                card.classList.remove('expanded');
                card.querySelector('.expand-btn').innerHTML = `Read More <span class="arrow">↓</span>`;
            } else {
                card.classList.add('expanded');
                card.querySelector('.expand-btn').innerHTML = `Read Less <span class="arrow">↑</span>`;
                
                // Scroll card into view
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });

    /* ==========================================================================
       5. TNC RESILIENT & CONNECTED NETWORK (RCN) MAP LOGIC
       ========================================================================== */
    const rcnMapContainer = document.getElementById('rcn-map');
    if (rcnMapContainer) {
        // Initialize RCN Map
        const rcnMap = L.map(rcnMapContainer, {
            zoomControl: true,
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: !L.Browser.mobile
        });

        // Voyager Reference Base Layer
        const voyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        // TNC Customized Simple RCN Layer
        const rcnLayer = L.tileLayer('https://tiles.arcgis.com/tiles/F7DSX1DSNSiWmOqh/arcgis/rest/services/Resilient_and_Connected_Network_TNC_Customized_Simple/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.nature.org">The Nature Conservancy (TNC)</a>',
            maxZoom: 15,
            opacity: 0.7
        });

        // Satellite Base Layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });

        // Default: Load Voyager + RCN Layer
        voyagerLayer.addTo(rcnMap);
        rcnLayer.addTo(rcnMap);

        // Scale Control
        L.control.scale({
            imperial: true,
            metric: false,
            position: 'bottomleft'
        }).addTo(rcnMap);

        // Fetch NM features from BOUNDARIES_DATA (parent_id: 'new-mexico')
        const nmFeatures = BOUNDARIES_DATA.features.filter(f => f.properties.parent_id === 'new-mexico');
        
        // Define ranch overlay style
        const ranchOverlay = L.geoJSON(nmFeatures, {
            style: {
                color: 'hsl(135, 45%, 32%)', // Spring Green
                fillColor: 'hsl(135, 45%, 32%)',
                fillOpacity: 0.12,
                weight: 2.5,
                dashArray: '5, 5'
            }
        });

        // Add tooltips
        ranchOverlay.eachLayer(layer => {
            const name = layer.feature.properties.name;
            layer.bindTooltip(name, {
                permanent: true,
                direction: 'center',
                className: 'ranch-tooltip'
            });
        });

        ranchOverlay.addTo(rcnMap);

        // Zoom map to fit the boundaries
        rcnMap.fitBounds(ranchOverlay.getBounds(), {
            padding: [30, 30]
        });

        // Basemap toggles
        const toggleButtons = document.querySelectorAll('.rcn-toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const mode = btn.getAttribute('data-mode');

                // Clear all base layers
                if (rcnMap.hasLayer(voyagerLayer)) rcnMap.removeLayer(voyagerLayer);
                if (rcnMap.hasLayer(rcnLayer)) rcnMap.removeLayer(rcnLayer);
                if (rcnMap.hasLayer(satelliteLayer)) rcnMap.removeLayer(satelliteLayer);

                // Add active layer
                if (mode === 'rcn') {
                    voyagerLayer.addTo(rcnMap);
                    rcnLayer.addTo(rcnMap);
                } else if (mode === 'reference') {
                    voyagerLayer.addTo(rcnMap);
                } else if (mode === 'satellite') {
                    satelliteLayer.addTo(rcnMap);
                }
            });
        });
    }

});
