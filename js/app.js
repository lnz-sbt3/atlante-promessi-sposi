/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * Main Application JavaScript
 * Interactive map visualization of places and illustrations from Manzoni's work
 */

// ==========================================
// GLOBAL VARIABLES & INITIALIZATION
// ==========================================

// Map initialization
const map = L.map('map', {
  zoomControl: false
}).setView([45.5, 9.3], 8);

// Zoom control
const zoomControl = L.control.zoom({
  position: 'bottomright'
}).addTo(map);

// Tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// SVG overlay for city areas
const svg = d3.select(map.getPanes().overlayPane).append("svg")
  .style("overflow", "visible");
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Global data structures
const featureMap = new Map();
const chapterMap = new Map();
const chapterGroupMap = new Map();
const pointMap = new Map();
const placePointsMap = new Map();
const cityData = new Map();

// DOM elements
const timeline = document.getElementById('timeline');
const timelineGrid = document.getElementById('timeline-grid');
const timelineStats = document.getElementById('timeline-stats');
const placeIndicator = document.getElementById('place-indicator');
const fabContainer = document.getElementById('fab-container');
const breadcrumbContainer = document.getElementById('breadcrumb-container');
const projectLogo = document.getElementById('project-logo');

// FAB elements
const fabToggle = document.getElementById('fab-toggle');
const fabTimeline = document.getElementById('fab-timeline');
const fabFilters = document.getElementById('fab-filters');
const timelinePanel = document.getElementById('timeline-panel');
const filtersPanel = document.getElementById('filters-panel');
const btnPromessi = document.getElementById('btnPromessi');
const btnColonna = document.getElementById('btnColonna');
const btnResetFilters = document.getElementById('btnResetFilters');

// Dropdown elements
const dropdownChapter = document.getElementById('dropdown-chapter');
const dropdownPlace = document.getElementById('dropdown-place');
const dropdownAuthor = document.getElementById('dropdown-author');
const dropdownCharacter = document.getElementById('dropdown-character');

// Page slider elements
const pageSliderMin = document.getElementById('page-slider-min');
const pageSliderMax = document.getElementById('page-slider-max');
const pageRangeDisplay = document.getElementById('page-range-display');

// State variables
let currentTimeline = null;
let sortedFeatures = [];
let fabOpen = false;
let currentHoveredPlace = null;
let currentSpiderGraph = null;
let currentItemCard = null;
let activeSpiderPlace = null;
let isProjectInfoOpen = false;
let currentSpiderSort = 'sequence';
let isSpiderGraphLoading = false;
let isDragging = false;

// Logo state management
let originalLogoSrc = 'assets/AtlanteManzoni_Logo.png';
let minimizedLogoSrc = 'assets/AtlanteManzoni_Miniatura.png'; // Update this with the new logo filename

// Global variables for page range
let minPageNumber = 0;
let maxPageNumber = 1000;

// Color palette for places
const colorPalette = [
  '#b3ecff', '#99d6ff', '#80bfff', '#66a3ff', '#4d88ff',
  '#3366ff', '#1a53ff', '#0040ff', '#0033cc', '#001a80'
];

const placeColorMap = new Map();
let placeIndex = 0;

// ==========================================
// VIEWPORT STATE MANAGEMENT
// ==========================================

function updateViewportState() {
  const isBusy = timeline.classList.contains('active') || 
                 currentSpiderGraph !== null || 
                 currentItemCard !== null ||
                 timelinePanel.classList.contains('visible') ||
                 filtersPanel.classList.contains('visible');
  
  const logoImg = projectLogo.querySelector('img');
  
  if (isBusy) {
    document.body.classList.add('viewport-busy');
    projectLogo.classList.add('minimized');
    fabContainer.classList.add('minimized');
    breadcrumbContainer.classList.add('logo-minimized');
    
    // Change logo to minimized version
    if (logoImg && logoImg.src.includes(originalLogoSrc.split('/').pop())) {
      logoImg.src = minimizedLogoSrc;
    }
  } else {
    document.body.classList.remove('viewport-busy');
    projectLogo.classList.remove('minimized');
    fabContainer.classList.remove('minimized');
    breadcrumbContainer.classList.remove('logo-minimized');
    
    // Change logo back to original
    if (logoImg && !logoImg.src.includes(originalLogoSrc.split('/').pop())) {
      logoImg.src = originalLogoSrc;
    }
  }
}

function isMobile() {
  return window.innerWidth <= 768;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getColorForPlace(place) {
  if (!placeColorMap.has(place)) {
    placeColorMap.set(place, colorPalette[placeIndex % colorPalette.length]);
    placeIndex++;
  }
  return placeColorMap.get(place);
}

function getAvailableViewportBounds() {
  const mapContainer = map.getContainer();
  const mapBounds = mapContainer.getBoundingClientRect();
  
  const marginPercent = 0.1;
  const horizontalMargin = mapBounds.width * marginPercent;
  const verticalMargin = mapBounds.height * marginPercent;
  
  return {
    width: mapBounds.width - (horizontalMargin * 2),
    height: mapBounds.height - (verticalMargin * 2),
    centerX: mapBounds.width / 2,
    centerY: mapBounds.height / 2
  };
}

function latLngToLayerPoint(latlng) {
  return map.latLngToLayerPoint(L.latLng(latlng));
}

function layerPointToLatLng(point) {
  return map.layerPointToLatLng(L.point(point.x, point.y));
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <h3>⚠️ Errore</h3>
    <p>${message}</p>
    <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 15px; background: white; color: red; border: none; border-radius: 5px; cursor: pointer;">Chiudi</button>
  `;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
}

// ==========================================
// URL/PERMALINK MANAGEMENT
// ==========================================

function encodeFiltersToURL() {
  const params = new URLSearchParams();
  
  if (dropdownChapter.value) params.set('chapter', dropdownChapter.value);
  if (dropdownPlace.value) params.set('place', dropdownPlace.value);
  if (dropdownAuthor.value) params.set('author', dropdownAuthor.value);
  if (dropdownCharacter.value) params.set('character', dropdownCharacter.value);
  
  const minPage = parseInt(pageSliderMin.value);
  const maxPage = parseInt(pageSliderMax.value);
  if (minPage !== minPageNumber || maxPage !== maxPageNumber) {
    params.set('pageMin', minPage.toString());
    params.set('pageMax', maxPage.toString());
  }
  
  if (currentTimeline) params.set('timeline', currentTimeline);
  
  const newURL = window.location.pathname + (params.toString() ? '#' + params.toString() : '');
  window.history.replaceState(null, '', newURL);
}

function loadFiltersFromURL() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;
  
  const params = new URLSearchParams(hash);
  
  if (params.get('chapter')) dropdownChapter.value = params.get('chapter');
  if (params.get('place')) dropdownPlace.value = params.get('place');
  if (params.get('author')) dropdownAuthor.value = params.get('author');
  if (params.get('character')) dropdownCharacter.value = params.get('character');
  
  if (params.get('pageMin')) {
    pageSliderMin.value = params.get('pageMin');
  }
  if (params.get('pageMax')) {
    pageSliderMax.value = params.get('pageMax');
  }
  
  updatePageRangeDisplay();
  updateBreadcrumbs();
  
  // Apply timeline if specified
  if (params.get('timeline')) {
    const timelineType = params.get('timeline');
    setTimeout(() => {
      if (timelineType === 'promessi') {
        toggleTimeline(chapter => !chapter.startsWith('CI_'), 'promessi');
      } else if (timelineType === 'colonna') {
        toggleTimeline(chapter => chapter.startsWith('CI_'), 'colonna');
      }
    }, 500);
  }
  
  // Apply filters
  setTimeout(() => {
    applyFilters();
  }, 100);
}

// ==========================================
// BREADCRUMB MANAGEMENT
// ==========================================

function updateBreadcrumbs() {
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  
  // Clear existing chips (except label)
  const chips = breadcrumbContainer.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.remove());
  
  let hasActiveFilters = false;
  
  // Add filter chips
  if (dropdownChapter.value) {
    addFilterChip(dropdownChapter.value, () => {
      dropdownChapter.value = '';
      applyFiltersAndUpdateURL();
    });
    hasActiveFilters = true;
  }
  
  if (dropdownPlace.value) {
    addFilterChip(dropdownPlace.value, () => {
      dropdownPlace.value = '';
      applyFiltersAndUpdateURL();
    });
    hasActiveFilters = true;
  }
  
  if (dropdownAuthor.value) {
    addFilterChip(dropdownAuthor.value, () => {
      dropdownAuthor.value = '';
      applyFiltersAndUpdateURL();
    });
    hasActiveFilters = true;
  }
  
  if (dropdownCharacter.value) {
    addFilterChip(dropdownCharacter.value, () => {
      dropdownCharacter.value = '';
      applyFiltersAndUpdateURL();
    });
    hasActiveFilters = true;
  }
  
  const minPage = parseInt(pageSliderMin.value);
  const maxPage = parseInt(pageSliderMax.value);
  if (minPage !== minPageNumber || maxPage !== maxPageNumber) {
    addFilterChip(`${minPage}-${maxPage}`, () => {
      pageSliderMin.value = minPageNumber;
      pageSliderMax.value = maxPageNumber;
      updatePageRangeDisplay();
      applyFiltersAndUpdateURL();
    });
    hasActiveFilters = true;
  }
  
  // Show/hide breadcrumb container
  if (hasActiveFilters) {
    breadcrumbContainer.classList.add('visible');
  } else {
    breadcrumbContainer.classList.remove('visible');
  }
  
  updateViewportState();
}

function addFilterChip(text, removeCallback) {
  const chip = document.createElement('div');
  chip.className = 'filter-chip';
  chip.innerHTML = `
    ${text}
    <span class="filter-chip-remove">×</span>
  `;
  
  const removeBtn = chip.querySelector('.filter-chip-remove');
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeCallback();
  });
  
  breadcrumbContainer.appendChild(chip);
}

// ==========================================
// FILTER FUNCTIONS
// ==========================================

function resetAllFilters() {
  dropdownChapter.value = '';
  dropdownPlace.value = '';
  dropdownAuthor.value = '';
  dropdownCharacter.value = '';
  pageSliderMin.value = minPageNumber;
  pageSliderMax.value = maxPageNumber;
  
  updatePageRangeDisplay();
  applyFiltersAndUpdateURL();
}

function applyFiltersAndUpdateURL() {
  applyFilters();
  updateBreadcrumbs();
  encodeFiltersToURL();
}

function applyFilters() {
  const selectedChapter = dropdownChapter.value;
  const selectedPlace = dropdownPlace.value;
  const selectedAuthor = dropdownAuthor.value;
  const selectedCharacter = dropdownCharacter.value;
  
  const minPage = parseInt(pageSliderMin.value);
  const maxPage = parseInt(pageSliderMax.value);

  closeSpiderGraph();

  const visibleChapters = new Map();

  for (const [seq, feature] of featureMap.entries()) {
    const props = feature.properties;
    const chapter = props.chapter || "Capitolo sconosciuto";
    const place = (props.place || "Luogo sconosciuto").trim().replace(/\s+/g, ' ');
    const authors = props.authors || [];
    const characters = props.characters || [];
    const pageNumber = props.page_number || 0;
    
    const matchChapter = !selectedChapter || chapter === selectedChapter;
    const matchPlace = !selectedPlace || place === selectedPlace;
    const matchAuthor = !selectedAuthor || (authors && authors.includes(selectedAuthor));
    const matchCharacter = !selectedCharacter || (characters && characters.includes(selectedCharacter));
    const matchPage = pageNumber >= minPage && pageNumber <= maxPage;

    const visible = matchChapter && matchPlace && matchAuthor && matchCharacter && matchPage;
    
    if (visible) {
      visibleChapters.set(chapter, (visibleChapters.get(chapter) || 0) + 1);
    }

    const point = pointMap.get(seq);
    if (point) {
      if (visible) {
        point.classList.remove('hidden');
        point.style.display = 'block';
      } else {
        point.classList.add('hidden');
        point.style.display = 'none';
      }
    }
  }

  for (const [chapter, group] of chapterGroupMap.entries()) {
    const hasVisiblePoints = visibleChapters.has(chapter) && visibleChapters.get(chapter) > 0;
    if (hasVisiblePoints) {
      group.classList.remove('hidden');
      group.style.display = 'block';
    } else {
      group.classList.add('hidden');
      group.style.display = 'none';
    }
  }

  updateCityData();
  createCityAreas();
  
  if (activeSpiderPlace && cityData.has(activeSpiderPlace) && cityData.get(activeSpiderPlace).visibleCount > 0) {
    setTimeout(() => {
      const cityInfo = cityData.get(activeSpiderPlace);
      showSpiderGraph(activeSpiderPlace, cityInfo);
    }, 100);
  }

  clearHighlights();
  updateTimelineStats();
  map.invalidateSize();
}

// ==========================================
// CONTROL POSITIONING
// ==========================================

function updateControlPositions() {
  const isActive = timeline.classList.contains('active');
  const newBottom = isActive ? '320px' : '30px';
  
  const zoomEl = document.querySelector('.leaflet-control-zoom');
  if (zoomEl) {
    zoomEl.style.bottom = newBottom;
  }
  
  fabContainer.style.bottom = isActive ? '300px' : '20px';
  updateViewportState();
}

// ==========================================
// PLACE HIGHLIGHTING SYSTEM
// ==========================================

function highlightPlacePoints(place, hoveredPoint) {
  clearHighlights();
  
  if (!place) return;
  
  currentHoveredPlace = place;
  const points = placePointsMap.get(place) || [];
  const visiblePoints = points.filter(p => p.style.display !== 'none' && !p.classList.contains('hidden'));
  
  if (visiblePoints.length < 2) return;
  
  visiblePoints.forEach(point => {
    point.classList.add('highlighted');
  });
  
  placeIndicator.textContent = `${place} (${visiblePoints.length} punti)`;
  placeIndicator.classList.add('visible');
}

function clearHighlights() {
  document.querySelectorAll('.timeline-point.highlighted').forEach(point => {
    point.classList.remove('highlighted', 'show-connections');
  });
  
  placeIndicator.classList.remove('visible');
  currentHoveredPlace = null;
}

// ==========================================
// FAB MENU MANAGEMENT
// ==========================================

function closeFABPanels() {
  timelinePanel.classList.remove('visible');
  filtersPanel.classList.remove('visible');
  fabTimeline.classList.remove('active');
  fabFilters.classList.remove('active');
  updateViewportState();
}

function closeFABCompletely() {
  if (fabOpen) {
    fabOpen = false;
    fabToggle.classList.remove('active');
    fabTimeline.style.display = 'none';
    fabFilters.style.display = 'none';
    fabToggle.innerHTML = '&#9776;';
    closeFABPanels();
  }
}

function toggleFAB() {
  fabOpen = !fabOpen;
  
  if (fabOpen) {
    fabToggle.classList.add('active');
    fabTimeline.style.display = 'flex';
    fabFilters.style.display = 'flex';
    fabToggle.innerHTML = '&#10005;';
  } else {
    fabToggle.classList.remove('active');
    fabTimeline.style.display = 'none';
    fabFilters.style.display = 'none';
    fabToggle.innerHTML = '&#9776;';
    
    closeFABPanels();
    
    if (timeline.classList.contains('active')) {
      timeline.classList.remove('active');
      currentTimeline = null;
      chapterGroupMap.clear();
      clearHighlights();
      timelineStats.textContent = '';
      timelineGrid.innerHTML = '';
      
      btnPromessi.classList.remove('active');
      btnColonna.classList.remove('active');
      
      updateControlPositions();
      map.invalidateSize();
      encodeFiltersToURL();
    }
  }
  
  updateViewportState();
}

function showTimelinePanel() {
  if (!fabOpen) return;
  
  const isVisible = timelinePanel.classList.contains('visible');
  
  filtersPanel.classList.remove('visible');
  fabFilters.classList.remove('active');
  
  if (isVisible) {
    timelinePanel.classList.remove('visible');
    fabTimeline.classList.remove('active');
  } else {
    timelinePanel.classList.add('visible');
    fabTimeline.classList.add('active');
  }
  
  updateViewportState();
}

function showFiltersPanel() {
  if (!fabOpen) return;
  
  const isVisible = filtersPanel.classList.contains('visible');
  
  timelinePanel.classList.remove('visible');
  fabTimeline.classList.remove('active');
  
  if (isVisible) {
    filtersPanel.classList.remove('visible');
    fabFilters.classList.remove('active');
  } else {
    filtersPanel.classList.add('visible');
    fabFilters.classList.add('active');
  }
  
  updateViewportState();
}

// ==========================================
// PAGE RANGE SLIDER FUNCTIONS
// ==========================================

function updatePageRangeDisplay() {
  const minVal = parseInt(pageSliderMin.value);
  const maxVal = parseInt(pageSliderMax.value);
  
  if (minVal >= maxVal) {
    if (event.target === pageSliderMin) {
      pageSliderMax.value = minVal + 1;
    } else {
      pageSliderMin.value = maxVal - 1;
    }
  }
  
  const finalMin = parseInt(pageSliderMin.value);
  const finalMax = parseInt(pageSliderMax.value);
  
  pageRangeDisplay.textContent = `${finalMin} - ${finalMax}`;
}

function initializePageSliders() {
  pageSliderMin.min = minPageNumber;
  pageSliderMin.max = maxPageNumber;
  pageSliderMin.value = minPageNumber;
  
  pageSliderMax.min = minPageNumber;
  pageSliderMax.max = maxPageNumber;
  pageSliderMax.value = maxPageNumber;
  
  updatePageRangeDisplay();
}

// ==========================================
// TIMELINE FUNCTIONS
// ==========================================

function updateTimelineStats() {
  let visiblePoints = 0;
  let totalChapters = 0;
  
  for (const [chapter, group] of chapterGroupMap.entries()) {
    if (group.style.display !== 'none' && !group.classList.contains('hidden')) {
      totalChapters++;
      const points = group.querySelectorAll('.timeline-point:not(.hidden)');
      visiblePoints += points.length;
    }
  }
  
  timelineStats.textContent = `${visiblePoints} punti • ${totalChapters} capitoli`;
}

function renderTimeline(filterFn) {
  timelineGrid.innerHTML = '';
  chapterGroupMap.clear();
  
  for (const [chapter, points] of chapterMap.entries()) {
    if (!filterFn(chapter)) continue;
    
    const group = document.createElement('div');
    group.className = 'chapter-group';
    group.dataset.chapter = chapter;

    const label = document.createElement('div');
    label.className = 'chapter-label';
    label.dataset.chapter = chapter;
    label.textContent = chapter;

    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'chapter-group-points';
    
    points.forEach(point => {
      pointsContainer.appendChild(point);
    });

    group.appendChild(label);
    group.appendChild(pointsContainer);
    timelineGrid.appendChild(group);
    
    chapterGroupMap.set(chapter, group);
  }
  
  updateTimelineStats();
}

function toggleTimeline(filterFn, key) {
  btnPromessi.classList.remove('active');
  btnColonna.classList.remove('active');

  if (currentTimeline === key) {
    timeline.classList.remove('active');
    timelineGrid.innerHTML = '';
    currentTimeline = null;
    chapterGroupMap.clear();
    clearHighlights();
    timelineStats.textContent = '';
  } else {
    timeline.classList.add('active');
    currentTimeline = key;
    
    if (key === 'promessi') btnPromessi.classList.add('active');
    if (key === 'colonna') btnColonna.classList.add('active');
    
    renderTimeline(filterFn);
    
    setTimeout(() => {
      applyFilters();
    }, 200);
  }

  updateControlPositions();
  map.invalidateSize();
  encodeFiltersToURL();
}

// ==========================================
// CITY DATA & AREAS
// ==========================================

function updateCityData() {
  for (const [place, data] of cityData.entries()) {
    data.visibleCount = 0;
  }
  
  const placeCounts = new Map();
  for (const [seq, point] of pointMap.entries()) {
    if (!point.classList.contains('hidden') && point.style.display !== 'none') {
      const place = point.dataset.place;
      placeCounts.set(place, (placeCounts.get(place) || 0) + 1);
    }
  }
  
  for (const [place, count] of placeCounts.entries()) {
    if (cityData.has(place)) {
      cityData.get(place).visibleCount = count;
    }
  }
}

function createCityAreas() {
  g.selectAll("*").remove();
  
  if (cityData.size === 0) return;
  
  const maxItems = Math.max(...Array.from(cityData.values()).map(city => city.visibleCount));
  const minRadius = 15;
  const maxRadius = 80;
  
  for (const [place, data] of cityData.entries()) {
    if (data.visibleCount === 0) continue;
    
    const center = latLngToLayerPoint(data.coords);
    const proportion = data.visibleCount / maxItems;
    const radius = minRadius + (maxRadius - minRadius) * Math.sqrt(proportion);
    const color = getColorForPlace(place);
    
    const circle = g.append("circle")
      .attr("class", "city-area")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", radius)
      .attr("fill", color)
      .attr("stroke", d3.rgb(color).darker(0.5))
      .attr("data-place", place)
      .style("cursor", "pointer")
      .on("click", () => showSpiderGraph(place, data));
    
    g.append("text")
      .attr("class", "city-label")
      .attr("x", center.x)
      .attr("y", center.y - 5)
      .text(place);
    
    g.append("text")
      .attr("class", "city-count")
      .attr("x", center.x)
      .attr("y", center.y + 8)
      .text(`(${data.visibleCount})`);
  }
}

// ==========================================
// SPIDER GRAPH FUNCTIONS
// ==========================================

function sortSpiderGraphItems(items, sortType = 'sequence') {
  const sortedItems = [...items];
  
  switch (sortType) {
    case 'page':
      return sortedItems.sort((a, b) => {
        const pageA = parseInt(a.page) || 0;
        const pageB = parseInt(b.page) || 0;
        return pageA - pageB;
      });
    
    case 'title':
      return sortedItems.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'type':
      return sortedItems.sort((a, b) => {
        const featureA = featureMap.get(a.sequence);
        const featureB = featureMap.get(b.sequence);
        const typeA = featureA?.properties?.type || '';
        const typeB = featureB?.properties?.type || '';
        return typeA.localeCompare(typeB);
      });
    
    case 'sequence':
    default:
      return sortedItems.sort((a, b) => parseFloat(a.sequence) - parseFloat(b.sequence));
  }
}

function createResponsiveGridLayout(center, items, minSpacing = 25) {
  const sortedItems = sortSpiderGraphItems(items, currentSpiderSort);
  const itemCount = sortedItems.length;
  if (itemCount === 0) return [];

  const viewport = getAvailableViewportBounds();
  
  const aspectRatio = viewport.width / viewport.height;
  let cols = Math.ceil(Math.sqrt(itemCount * aspectRatio));
  let rows = Math.ceil(itemCount / cols);
  
  let maxCols = Math.floor(viewport.width / minSpacing);
  let maxRows = Math.floor(viewport.height / minSpacing);
  
  if (cols > maxCols) {
    cols = maxCols;
    rows = Math.ceil(itemCount / cols);
  }
  
  if (rows > maxRows) {
    rows = maxRows;
    cols = Math.ceil(itemCount / rows);
  }
  
  const effectiveSpacingX = Math.max(minSpacing, viewport.width / Math.max(cols, 1));
  const effectiveSpacingY = Math.max(minSpacing, viewport.height / Math.max(rows, 1));
  const spacing = Math.min(effectiveSpacingX, effectiveSpacingY);
  
  const totalWidth = (cols - 1) * spacing;
  const totalHeight = (rows - 1) * spacing;
  const startX = center.x - totalWidth / 2;
  const startY = center.y - totalHeight / 2;
  
  return sortedItems.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    return {
      id: item.sequence,
      x: startX + col * spacing,
      y: startY + row * spacing,
      data: item
    };
  });
}

function createCircularLayout(center, items, radius) {
  return items.map((item, i) => {
    const angle = (2 * Math.PI * i) / items.length;
    return {
      id: item.sequence,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      data: item
    };
  });
}

function createDoubleRingLayout(center, items, innerRadius, outerRadius) {
  const half = Math.ceil(items.length / 2);
  return items.map((item, i) => {
    const isInner = i < half;
    const radius = isInner ? innerRadius : outerRadius;
    const count = isInner ? half : items.length - half;
    const index = isInner ? i : i - half;
    const angle = (2 * Math.PI * index) / count;
    
    return {
      id: item.sequence,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      data: item
    };
  });
}

function showSpiderGraph(placeName, placeData) {
  // Prevent new spider graphs if one is loading and not dragging
  if (isSpiderGraphLoading && !isDragging) return;
  
  closeSpiderGraph();
  
  const visibleItems = placeData.items.filter(item => {
    const point = pointMap.get(item.sequence);
    return point && !point.classList.contains('hidden') && point.style.display !== 'none';
  });
  
  if (visibleItems.length === 0) return;
  
  activeSpiderPlace = placeName;
  isSpiderGraphLoading = true;
  createIntegratedSpiderGraph(placeName, placeData, visibleItems);
}

function createIntegratedSpiderGraph(placeName, placeData, visibleItems) {
  const center = latLngToLayerPoint(placeData.coords);
  
  g.selectAll(".spider-element").remove();
  
  const itemCount = visibleItems.length;
  let layout;
  
  if (itemCount <= 6) {
    const sortedItems = sortSpiderGraphItems(visibleItems, currentSpiderSort);
    layout = createCircularLayout(center, sortedItems, 100);
  } else if (itemCount <= 12) {
    const sortedItems = sortSpiderGraphItems(visibleItems, currentSpiderSort);
    layout = createDoubleRingLayout(center, sortedItems, 80, 140);
  } else {
    layout = createResponsiveGridLayout(center, visibleItems, 30);
  }
  
  const centerNode = {
    id: 'center',
    x: center.x,
    y: center.y,
    type: 'center',
    label: `${placeName} (${itemCount})`
  };
  
  const nodes = [centerNode, ...layout];
  
  const links = visibleItems.map(item => ({ 
    source: 'center', 
    target: item.sequence 
  }));
  
  const link = g.selectAll(".spider-link")
    .data(links)
    .enter().append("line")
    .attr("class", "spider-link spider-element")
    .attr("stroke", "#66a3ff")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.4)
    .attr("stroke-dasharray", "2,2");
  
  const viewport = getAvailableViewportBounds();
  const clusterRadius = Math.min(viewport.width, viewport.height) * 0.4;
  g.append("circle")
    .attr("class", "spider-background spider-element")
    .attr("cx", center.x)
    .attr("cy", center.y)
    .attr("r", clusterRadius)
    .attr("fill", "rgba(102, 163, 255, 0.1)")
    .attr("stroke", "rgba(102, 163, 255, 0.3)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");
  
  const itemNodes = g.selectAll(".spider-node-item")
    .data(layout)
    .enter().append("circle")
    .attr("class", "spider-node spider-element spider-node-item")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 6)
    .attr("fill", d => {
      const point = pointMap.get(d.id);
      return point ? point.style.backgroundColor : "#66a3ff";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer");
  
  const centerNodeEl = g.append("circle")
    .attr("class", "spider-node spider-element spider-node-center")
    .attr("cx", center.x)
    .attr("cy", center.y)
    .attr("r", 12)
    .attr("fill", "#ffa500")
    .attr("stroke", "#ff8c00")
    .attr("stroke-width", 3)
    .style("cursor", "pointer");
  
  const centerLabel = g.append("text")
    .attr("class", "spider-center-label spider-element")
    .attr("x", center.x)
    .attr("y", center.y + 20)
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .attr("fill", "#ffa500")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .text(centerNode.label);
  
  link
    .attr("x1", center.x)
    .attr("y1", center.y)
    .attr("x2", d => {
      const target = layout.find(n => n.id === d.target);
      return target ? target.x : center.x;
    })
    .attr("y2", d => {
      const target = layout.find(n => n.id === d.target);
      return target ? target.y : center.y;
    });
  
  itemNodes
    .on("click", (event, d) => {
      const mapPoint = layerPointToLatLng({x: d.x, y: d.y});
      showItemCardLinked(d.data, mapPoint);
      
      const point = pointMap.get(d.id);
      if (point) {
        point.classList.add('active');
        setTimeout(() => point.classList.remove('active'), 2000);
      }
    })
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 8)
        .attr("stroke-width", 3);
      
      showQuickTooltip(event, d.data.title);
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 6)
        .attr("stroke-width", 2);
      
      hideQuickTooltip();
    });
  
  centerNodeEl.on("click", () => {
    closeSpiderGraph();
  });
  
  // Immediate click availability - no animation delays
  itemNodes.style("opacity", 1).attr("r", 6);
  link.style("opacity", 0.4);
  centerNodeEl.style("opacity", 1).attr("r", 12);
  
  // Animate appearance for visual feedback
  itemNodes
    .style("opacity", 0)
    .attr("r", 0)
    .transition()
    .delay((d, i) => i * 20) // Reduced delay
    .duration(200) // Reduced duration
    .style("opacity", 1)
    .attr("r", 6);
  
  link
    .style("opacity", 0)
    .transition()
    .delay(100) // Reduced delay
    .duration(200) // Reduced duration
    .style("opacity", 0.4);
  
  centerNodeEl
    .style("opacity", 0)
    .attr("r", 0)
    .transition()
    .duration(200) // Reduced duration
    .style("opacity", 1)
    .attr("r", 12);
  
  currentSpiderGraph = { placeName, nodes, links };
  
  // Mark loading as complete
  setTimeout(() => {
    isSpiderGraphLoading = false;
  }, 300);
  
  updateViewportState();
}

function closeSpiderGraph() {
  if (currentSpiderGraph) {
    g.selectAll(".spider-element")
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
    
    currentSpiderGraph = null;
    activeSpiderPlace = null;
    isSpiderGraphLoading = false;
  }
  closeItemCard();
  updateViewportState();
}

// ==========================================
// TOOLTIP FUNCTIONS
// ==========================================

let quickTooltip = null;

function showQuickTooltip(event, text) {
  hideQuickTooltip();
  
  quickTooltip = document.createElement('div');
  quickTooltip.className = 'quick-tooltip';
  quickTooltip.textContent = text;
  quickTooltip.style.position = 'fixed';
  quickTooltip.style.background = 'rgba(0,0,0,0.8)';
  quickTooltip.style.color = 'white';
  quickTooltip.style.padding = '5px 10px';
  quickTooltip.style.borderRadius = '4px';
  quickTooltip.style.fontSize = '12px';
  quickTooltip.style.zIndex = '3000';
  quickTooltip.style.pointerEvents = 'none';
  quickTooltip.style.maxWidth = '200px';
  quickTooltip.style.left = event.pageX + 10 + 'px';
  quickTooltip.style.top = event.pageY - 30 + 'px';
  
  document.body.appendChild(quickTooltip);
}

function hideQuickTooltip() {
  if (quickTooltip) {
    quickTooltip.remove();
    quickTooltip = null;
  }
}

// ==========================================
// ITEM CARD FUNCTIONS
// ==========================================

function showItemCardDirect(item) {
  closeItemCard();
  closeFABPanels();
  
  if (isMobile()) {
    closeFABCompletely();
  }
  
  if (timeline.classList.contains('active')) {
    timeline.classList.remove('active');
    updateControlPositions();
    map.invalidateSize();
  }
  
  console.log('Showing direct card for item:', item);
  
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <h3>${item.title || 'Titolo non disponibile'}</h3>
    ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : ''}
    <div class="meta"><strong>Luogo:</strong> ${item.place || 'Non specificato'}</div>
    <div class="meta"><strong>Capitolo:</strong> ${item.chapter || 'Non specificato'}</div>
    <div class="meta"><strong>Pagina:</strong> ${item.page || 'Non specificata'}</div>
    <div class="meta"><strong>Autori:</strong> ${(item.authors && item.authors.length > 0) ? item.authors.join(', ') : 'Non specificati'}</div>
    <div class="meta"><strong>Personaggi:</strong> ${(item.characters && item.characters.length > 0) ? item.characters.join(', ') : 'Non specificati'}</div>
    <a href="${item.link || '#'}" target="_blank" class="link">Vai alla scheda</a>
    <div class="card-close" onclick="closeItemCard()">×</div>
  `;
  
  if (!isMobile()) {
    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();
    
    card.style.position = 'fixed';
    card.style.right = Math.min(50, (window.innerWidth - mapRect.width) / 2 + 50) + 'px';
    card.style.top = Math.max(80, mapRect.top + 80) + 'px';
    card.style.maxWidth = '320px';
  }
  
  if (item.place) {
    card.style.borderLeft = '4px solid ' + getColorForPlace(item.place);
  }
  
  document.body.appendChild(card);
  currentItemCard = card;
  
  adjustCardPosition(card);
  updateViewportState();
  
  setTimeout(() => {
    document.addEventListener('click', closeItemCardOnClickOutside);
  }, 100);
}

function showItemCardLinked(item, mapCenter) {
  closeItemCard();
  closeFABPanels();
  
  if (isMobile()) {
    closeFABCompletely();
  }
  
  if (timeline.classList.contains('active')) {
    timeline.classList.remove('active');
    updateControlPositions();
    map.invalidateSize();
  }
  
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <h3>${item.title || 'Titolo non disponibile'}</h3>
    ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : ''}
    <div class="meta"><strong>Luogo:</strong> ${item.place || 'Non specificato'}</div>
    <div class="meta"><strong>Capitolo:</strong> ${item.chapter || 'Non specificato'}</div>
    <div class="meta"><strong>Pagina:</strong> ${item.page || 'Non specificata'}</div>
    <div class="meta"><strong>Autori:</strong> ${(item.authors && item.authors.length > 0) ? item.authors.join(', ') : 'Non specificati'}</div>
    <div class="meta"><strong>Personaggi:</strong> ${(item.characters && item.characters.length > 0) ? item.characters.join(', ') : 'Non specificati'}</div>
    <a href="${item.link || '#'}" target="_blank" class="link">Vai alla scheda</a>
    <div class="card-close" onclick="closeItemCard()">×</div>
  `;
  
  if (!isMobile()) {
    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();
    
    const cardWidth = 320;
    const padding = 80;
    const availableWidth = window.innerWidth - cardWidth - padding * 2;
    const leftPosition = Math.max(padding, Math.min(availableWidth, mapRect.right - cardWidth - padding));
    
    card.style.position = 'fixed';
    card.style.left = leftPosition + 'px';
    card.style.top = Math.max(80, mapRect.top + 80) + 'px';
    card.style.maxWidth = cardWidth + 'px';
  }
  
  card.linkedCenter = mapCenter;
  
  if (item.place) {
    card.style.borderLeft = '4px solid ' + getColorForPlace(item.place);
  }
  
  document.body.appendChild(card);
  currentItemCard = card;
  
  if (mapCenter && !isMobile()) {
    createConnectionLine(mapCenter, card);
  }
  
  adjustCardPosition(card);
  updateViewportState();
  
  setTimeout(() => {
    document.addEventListener('click', closeItemCardOnClickOutside);
  }, 100);
}

function adjustCardPosition(card) {
  const img = card.querySelector('img');
  const adjustPosition = () => {
    const cardRect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 20;
    
    if (!isMobile() && cardRect.bottom > viewportHeight - margin) {
      const newTop = Math.max(margin, viewportHeight - cardRect.height - margin);
      card.style.top = newTop + 'px';
      
      if (newTop < margin) {
        card.style.top = margin + 'px';
        card.style.maxHeight = (viewportHeight - margin * 2) + 'px';
      }
    }
    
    if (card.connectionLine && card.linkedCenter) {
      updateConnectionLine(card);
    }
  };
  
  if (img && !img.complete) {
    img.onload = adjustPosition;
    img.onerror = adjustPosition;
    setTimeout(adjustPosition, 500);
  } else {
    setTimeout(adjustPosition, 50);
  }
}

function updateConnectionLine(card) {
  if (!card.connectionLine || !card.linkedCenter) return;
  
  const mapPoint = map.latLngToContainerPoint(card.linkedCenter);
  const mapContainer = map.getContainer();
  const mapRect = mapContainer.getBoundingClientRect();
  
  card.connectionLine.style.left = (mapRect.left + mapPoint.x) + 'px';
  card.connectionLine.style.top = (mapRect.top + mapPoint.y) + 'px';
}

function createConnectionLine(mapCenter, card) {
  removeConnectionLine();
  
  const mapPoint = map.latLngToContainerPoint(mapCenter);
  const mapContainer = map.getContainer();
  const mapRect = mapContainer.getBoundingClientRect();
  
  const line = document.createElement('div');
  line.className = 'connection-line';
  line.style.position = 'fixed';
  line.style.left = (mapRect.left + mapPoint.x) + 'px';
  line.style.top = (mapRect.top + mapPoint.y) + 'px';
  line.style.width = '300px';
  line.style.height = '2px';
  line.style.background = 'linear-gradient(90deg, #66a3ff, transparent)';
  line.style.zIndex = '400';
  line.style.pointerEvents = 'none';
  line.style.transformOrigin = '0 0';
  
  document.body.appendChild(line);
  currentItemCard.connectionLine = line;
}

function removeConnectionLine() {
  const existingLine = document.querySelector('.connection-line');
  if (existingLine) {
    existingLine.remove();
  }
}

function closeItemCard() {
  if (currentItemCard) {
    document.removeEventListener('click', closeItemCardOnClickOutside);
    removeConnectionLine();
    currentItemCard.remove();
    currentItemCard = null;
    updateViewportState();
  }
}

function closeItemCardOnClickOutside(event) {
  if (currentItemCard && !currentItemCard.contains(event.target)) {
    closeItemCard();
  }
}

// Make closeItemCard available globally for inline onclick
window.closeItemCard = closeItemCard;

// ==========================================
// PROJECT INFO MODAL
// ==========================================

function toggleProjectInfo() {
  if (isProjectInfoOpen) {
    closeProjectInfo();
  } else {
    showProjectInfo();
  }
}

function showProjectInfo() {
  if (isProjectInfoOpen) return;
  
  isProjectInfoOpen = true;
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'project-info-modal';
  infoDiv.id = 'project-info-modal';
  infoDiv.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(29, 43, 47, 0.98);
  color: #eee;
  border: 2px solid #66a3ff;
  border-radius: 16px;
  padding: 20px;
  max-width: min(500px, 90vw);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 3000;
  backdrop-filter: blur(15px);
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
  line-height: 1.6;
  animation: fadeIn 0.3s ease;
  box-sizing: border-box;
`;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    @media (max-width: 768px) {
      .project-info-modal {
        padding: 15px !important;
        max-width: 95vw !important;
        border-radius: 12px !important;
      }
      .project-info-modal h2 {
        font-size: 20px !important;
        margin-bottom: 15px !important;
      }
      .project-info-modal p {
        font-size: 14px !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  infoDiv.innerHTML = `
    <h2 style="color: #ffa500; margin-bottom: 20px; font-size: 24px;">Atlante Illustrato dei Promessi Sposi</h2>
    <p style="margin-bottom: 15px; font-size: 16px;">Una mappa interattiva per esplorare i luoghi e le illustrazioni dell'opera di Alessandro Manzoni.</p>
    <p style="margin-bottom: 15px; color: #a0d4f3;">Naviga tra i capitoli, filtra per luoghi e personaggi, e scopri le connessioni geografiche della narrazione.</p>
    <div style="margin: 20px 0; padding: 15px; background: rgba(255, 165, 0, 0.1); border-radius: 8px; border-left: 4px solid #ffa500;">
      <strong style="color: #ffa500;">💡 Suggerimento:</strong> Clicca sui cerchi colorati sulla mappa per vedere i dettagli delle illustrazioni
    </div>
    <button id="close-project-info" style="
      background: linear-gradient(135deg, #ffa500, #ff8c00);
      color: #1d2b2f;
      border: none;
      border-radius: 25px;
      padding: 12px 24px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
      font-size: 14px;
    " onmouseover="this.style.background='linear-gradient(135deg, #ffb933, #ffa500)'" onmouseout="this.style.background='linear-gradient(135deg, #ffa500, #ff8c00)'">
      Inizia l'esplorazione
    </button>
  `;
  
  document.body.appendChild(infoDiv);
  
  document.getElementById('close-project-info').addEventListener('click', closeProjectInfo);
  
  setTimeout(() => {
    closeProjectInfo();
  }, 10000);
}

function closeProjectInfo() {
  const infoDiv = document.getElementById('project-info-modal');
  if (infoDiv) {
    infoDiv.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      if (infoDiv.parentElement) {
        infoDiv.remove();
      }
      isProjectInfoOpen = false;
    }, 300);
  } else {
    isProjectInfoOpen = false;
  }
}

// ==========================================
// DATA LOADING & PROCESSING
// ==========================================

function loadDemoData() {
  console.log('Caricamento dati demo...');
  
  const demoData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "sequence": "1",
          "title": "Demo: Lecco e il suo territorio",
          "chapter": "Cap. I",
          "page_number": 5,
          "place": "Lecco",
          "authors": ["A. Manzoni"],
          "characters": ["Narratore"],
          "type": "Altre illustrazioni",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.3933, 45.8566]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "2",
          "title": "Demo: La casa di Lucia",
          "chapter": "Cap. II",
          "page_number": 12,
          "place": "Lecco",
          "authors": ["A. Manzoni"],
          "characters": ["Lucia Mondella", "Agnese"],
          "type": "Capolettera",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.3933, 45.8566]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "3",
          "title": "Demo: Milano - L'Innominato",
          "chapter": "Cap. XX",
          "page_number": 267,
          "place": "Milano",
          "authors": ["A. Manzoni"],
          "characters": ["Innominato"],
          "type": "Altre illustrazioni",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.1900, 45.4642]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "4",
          "title": "Demo: Bergamo",
          "chapter": "Cap. XV",
          "page_number": 189,
          "place": "Bergamo",
          "authors": ["A. Manzoni"],
          "characters": ["Renzo Tramaglino"],
          "type": "Intestazione",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.6696, 45.6983]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "5",
          "title": "Demo: La Colonna Infame",
          "chapter": "CI_Cap. I",
          "page_number": 1,
          "place": "Milano",
          "authors": ["A. Manzoni"],
          "characters": ["Piazza, Guglielmo"],
          "type": "Altre illustrazioni",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.1900, 45.4642]
        }
      }
    ]
  };
  
  processGeoJSONData(demoData);
}

function processGeoJSONData(data) {
  console.log('Processing GeoJSON data:', data);
  
  if (!data.features || data.features.length === 0) {
    throw new Error('No features found in GeoJSON');
  }
  
  sortedFeatures = data.features.sort(
    (a, b) => Number(a.properties.sequence) - Number(b.properties.sequence)
  );

  const chapterSet = new Set();
  const placeSet = new Set();
  const authorSet = new Set();
  const characterSet = new Set();
  let pageNumbers = [];

  sortedFeatures.forEach((feature, i) => {
    const props = feature.properties;
    const baseCoords = feature.geometry.coordinates.slice().reverse();
    const sequence = String(props.sequence);
    const chapter = props.chapter || "Capitolo sconosciuto";
    const place = props.place || "Luogo sconosciuto";
    const authors = props.authors || [];
    const characters = props.characters || [];
    const pageNumber = props.page_number || 0;

    chapterSet.add(chapter);
    placeSet.add(place);
    authors.forEach(author => authorSet.add(author));
    characters.forEach(character => characterSet.add(character));
    if (pageNumber > 0) pageNumbers.push(pageNumber);

    featureMap.set(sequence, feature);

    if (!cityData.has(place)) {
      cityData.set(place, {
        coords: baseCoords,
        items: [],
        visibleCount: 0
      });
    }
    
    const cityInfo = cityData.get(place);
    const item = {
      sequence: sequence,
      title: props.title || "Senza titolo",
      chapter: chapter,
      page: props.page_number || "?",
      place: place,
      authors: authors,
      characters: characters,
      image: props.image || "",
      link: props.link || "#"
    };
    
    cityInfo.items.push(item);

    const color = getColorForPlace(place);
    const point = document.createElement('div');
    point.className = 'timeline-point';
    point.title = `${props.title} (pag. ${props.page_number})`;
    point.dataset.sequence = sequence;
    point.dataset.chapter = chapter;
    point.dataset.place = place;
    point.style.backgroundColor = color;

    point.addEventListener('click', (e) => {
      e.stopPropagation();
      clearHighlights();
      
      closeSpiderGraph();
      
      // Close FAB panels on mobile
      if (isMobile()) {
        closeFABCompletely();
      }
      
      if (timeline.classList.contains('active')) {
        timeline.classList.remove('active');
        updateControlPositions();
        map.invalidateSize();
      }
      
      const cityInfo = cityData.get(place);
      if (cityInfo) {
        const center = L.latLng(cityInfo.coords);
        map.setView(center, 13);
      }
      
      setTimeout(() => {
        showItemCardDirect(item);
      }, 300);
      
      point.classList.add('active');
      setTimeout(() => point.classList.remove('active'), 2000);
    });

    let hoverTimeout;
    point.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        highlightPlacePoints(place, point);
      }, 300);
    });
    
    point.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      setTimeout(() => {
        if (currentHoveredPlace === place && !point.matches(':hover')) {
          clearHighlights();
        }
      }, 200);
    });

    if (!chapterMap.has(chapter)) {
      chapterMap.set(chapter, []);
    }
    chapterMap.get(chapter).push(point);
    pointMap.set(sequence, point);

    if (!placePointsMap.has(place)) {
      placePointsMap.set(place, []);
    }
    placePointsMap.get(place).push(point);
  });

  if (pageNumbers.length > 0) {
    minPageNumber = Math.min(...pageNumbers);
    maxPageNumber = Math.max(...pageNumbers);
  }

  updateCityData();
  createCityAreas();

  // Populate dropdowns
  Array.from(chapterSet).sort().forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    dropdownChapter.appendChild(opt);
  });

  Array.from(placeSet).sort().forEach(pl => {
    const opt = document.createElement('option');
    opt.value = pl;
    opt.textContent = pl;
    dropdownPlace.appendChild(opt);
  });

  Array.from(authorSet).sort().forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    dropdownAuthor.appendChild(opt);
  });

  Array.from(characterSet).sort().forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    dropdownCharacter.appendChild(opt);
  });

  initializePageSliders();

  console.log('Mappa geosemiotica caricata con successo:', {
    features: sortedFeatures.length,
    chapters: chapterSet.size,
    places: placeSet.size,
    authors: authorSet.size,
    characters: characterSet.size,
    cities: cityData.size,
    pageRange: `${minPageNumber} - ${maxPageNumber}`
  });

  loadFiltersFromURL();
}

// ==========================================
// EVENT LISTENERS & MAP EVENTS
// ==========================================

// Map drag detection
map.on('dragstart', () => {
  isDragging = true;
});

map.on('dragend', () => {
  setTimeout(() => {
    isDragging = false;
  }, 100);
});

// Map events
map.on('zoomend moveend', () => {
  createCityAreas();
  
  if (currentSpiderGraph && activeSpiderPlace && cityData.has(activeSpiderPlace)) {
    const cityInfo = cityData.get(activeSpiderPlace);
    const visibleItems = cityInfo.items.filter(item => {
      const point = pointMap.get(item.sequence);
      return point && !point.classList.contains('hidden') && point.style.display !== 'none';
    });
    
    if (visibleItems.length > 0) {
      // Don't close/reopen during dragging - just update positions
      if (!isDragging) {
        closeSpiderGraph();
        setTimeout(() => {
          createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
        }, 100);
      } else {
        // Just update positions during drag
        const center = latLngToLayerPoint(cityInfo.coords);
        g.selectAll(".spider-element").remove();
        setTimeout(() => {
          createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
        }, 50);
      }
    }
  }
  
  if (currentItemCard && currentItemCard.linkedCenter) {
    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();
    
    if (!isMobile()) {
      const cardWidth = 320;
      const padding = 80;
      const availableWidth = window.innerWidth - cardWidth - padding * 2;
      const leftPosition = Math.max(padding, Math.min(availableWidth, mapRect.right - cardWidth - padding));
      
      currentItemCard.style.left = leftPosition + 'px';
      currentItemCard.style.top = Math.max(80, mapRect.top + 80) + 'px';
    }
    
    adjustCardPosition(currentItemCard);
  }
});

window.addEventListener('resize', () => {
  if (currentSpiderGraph && activeSpiderPlace && cityData.has(activeSpiderPlace)) {
    const cityInfo = cityData.get(activeSpiderPlace);
    const visibleItems = cityInfo.items.filter(item => {
      const point = pointMap.get(item.sequence);
      return point && !point.classList.contains('hidden') && point.style.display !== 'none';
    });
    
    if (visibleItems.length > 0) {
      setTimeout(() => {
        createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
      }, 300);
    }
  }
  
  if (currentItemCard) {
    adjustCardPosition(currentItemCard);
  }
  
  updateViewportState();
});

map.on('click', (e) => {
  if (!e.originalEvent.target.closest('.city-area') && 
      !e.originalEvent.target.closest('.spider-element')) {
    closeSpiderGraph();
  }
});

// FAB Menu Events
fabToggle.addEventListener('click', toggleFAB);
fabTimeline.addEventListener('click', showTimelinePanel);
fabFilters.addEventListener('click', showFiltersPanel);

document.addEventListener('click', (e) => {
  if (!fabContainer.contains(e.target)) {
    if (fabOpen) {
      closeFABPanels();
    }
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  loadFiltersFromURL();
});

// ==========================================
// INITIALIZATION
// ==========================================

// Load GeoJSON data with error handling
fetch('data/dl_quarantana.geojson')
  .then(response => {
    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    processGeoJSONData(data);
  })
  .catch(error => {
    console.error('Errore nel caricamento del file GeoJSON:', error);
    showError('Impossibile caricare il file GeoJSON. Utilizzo dati demo per testare l\'applicazione.');
    loadDemoData();
  });

// Initialize event listeners after DOM is loaded
setTimeout(() => {
  if (btnPromessi && btnColonna) {
    btnPromessi.addEventListener('click', () => {
      toggleTimeline(chapter => !chapter.startsWith('CI_'), 'promessi');
    });

    btnColonna.addEventListener('click', () => {
      toggleTimeline(chapter => chapter.startsWith('CI_'), 'colonna');
    });
  }

  // Reset button event
  btnResetFilters.addEventListener('click', resetAllFilters);

  // Logo click event
  const logoElement = document.querySelector('.project-logo');
  if (logoElement) {
    logoElement.addEventListener('click', () => {
      toggleProjectInfo();
    });
  }

  // Dropdown events
  [dropdownChapter, dropdownPlace, dropdownAuthor, dropdownCharacter].forEach(dropdown => {
    if (dropdown) {
      dropdown.addEventListener('change', applyFiltersAndUpdateURL);
    }
  });

  // Page slider events
  pageSliderMin.addEventListener('input', () => {
    updatePageRangeDisplay();
    applyFiltersAndUpdateURL();
  });

  pageSliderMax.addEventListener('input', () => {
    updatePageRangeDisplay();
    applyFiltersAndUpdateURL();
  });

  document.addEventListener('click', (e) => {
    if (!timeline.contains(e.target) && !e.target.closest('.spider-popup')) {
      clearHighlights();
    }
  });
}, 1000);
