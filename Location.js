document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const imageUploadInput = document.getElementById('imageUpload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageDropZone = document.getElementById('image-drop-zone');
    const linkTabBtn = document.getElementById('link-tab-btn');
    const mapTabBtn = document.getElementById('map-tab-btn');
    const addUrlBtn = document.getElementById('add-url-btn');
    const linkInputContainer = document.getElementById('link-input-container');
    const mapContainer = document.getElementById('map-container');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const locationLinkInput = document.getElementById('locationLink');
    const postForm = document.getElementById('post-form');

    // --- Leaflet Map Variables ---
    let map = null;
    let marker = null;
    let selectedCoordinates = [28.4595, 77.0266]; // Default: Gurugram, India

    // --- Image Handling ---
    function handleFiles(files) {
        imagePreviewContainer.innerHTML = ''; // Clear previous previews
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // --- Drag and Drop Event Listeners ---
    imageDropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        imageDropZone.classList.add('drag-over');
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.classList.remove('drag-over');
    });

    imageDropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        imageDropZone.classList.remove('drag-over');
        const files = event.dataTransfer.files;
        imageUploadInput.files = files;
        handleFiles(files);
    });

    imageUploadInput.addEventListener('change', (event) => {
        const files = event.target.files;
        handleFiles(files);
    });

    // --- Leaflet Map Initialization ---
    function initializeMap() {
        if (map) return; // Already initialized
        map = L.map('map-container').setView(selectedCoordinates, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker(selectedCoordinates, {
            draggable: true
        }).addTo(map);

        // Update coordinates when marker is dragged
        marker.on('dragend', (event) => {
            const position = marker.getLatLng();
            selectedCoordinates = [position.lat, position.lng];
            console.log('New marker position:', selectedCoordinates);
        });

        // Invalidate map size after a short delay to ensure it renders correctly
        setTimeout(() => map.invalidateSize(), 100);
    }

    // --- Geolocation ---
    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                selectedCoordinates = [latitude, longitude];
                map.setView(selectedCoordinates, 13);
                marker.setLatLng(selectedCoordinates);
            }, (error) => {
                console.error('Error getting current location:', error);
                alert('Could not get your current location. Please try again or select a location manually.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    // --- Responsive Logic ---
    function handleResponsiveLayout() {
        const isDesktop = window.innerWidth > 768;

        if (isDesktop) {
            // Desktop: Map is always visible
            mapContainer.style.display = 'block';
            initializeMap();
        } else {
            // Mobile: Tab-based layout
            // Initial state based on active tab
            if (linkTabBtn.classList.contains('active')) {
                linkInputContainer.style.display = 'block';
                mapContainer.style.display = 'none';
            } else {
                linkInputContainer.style.display = 'none';
                mapContainer.style.display = 'block';
                initializeMap();
            }
        }
    }

    // --- UI Event Listeners ---
    addUrlBtn.addEventListener('click', () => {
        const isVisible = linkInputContainer.style.display === 'block';
        linkInputContainer.style.display = isVisible ? 'none' : 'block';
    });

    linkTabBtn.addEventListener('click', () => {
        if (window.innerWidth > 768) return;
        linkTabBtn.classList.add('active');
        mapTabBtn.classList.remove('active');
        linkInputContainer.style.display = 'block';
        mapContainer.style.display = 'none';
    });

    mapTabBtn.addEventListener('click', () => {
        if (window.innerWidth > 768) return;
        mapTabBtn.classList.add('active');
        linkTabBtn.classList.remove('active');
        linkInputContainer.style.display = 'none';
        mapContainer.style.display = 'block';
        initializeMap();
    });

    // --- Form Submission Handling ---
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const postData = {
            images: Array.from(imageUploadInput.files).map(f => f.name),
            location: null,
        };

        // Determine location based on input visibility
        if (linkInputContainer.style.display === 'block' && locationLinkInput.value) {
            postData.location = {
                type: 'link',
                value: locationLinkInput.value
            };
        } else {
            postData.location = {
                type: 'coordinates',
                value: selectedCoordinates
            };
        }

        console.log('Form Submitted. Post Data:', postData);
        alert('Post data has been logged to the console!');
        
        // Here you would typically send postData to a server
        // e.g., using fetch()
    });

    // --- Initial Setup & Event Listeners ---
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
});