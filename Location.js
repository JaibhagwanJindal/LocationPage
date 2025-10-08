document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const imageUploadInput = document.getElementById('imageUpload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const linkTabBtn = document.getElementById('link-tab-btn');
    const mapTabBtn = document.getElementById('map-tab-btn');
    const linkInputContainer = document.getElementById('link-input-container');
    const mapContainer = document.getElementById('map-container');
    const locationLinkInput = document.getElementById('locationLink');
    const postForm = document.getElementById('post-form');

    // --- Leaflet Map Variables ---
    let map = null;
    let marker = null;
    let selectedCoordinates = [28.4595, 77.0266]; // Default: Gurugram, India

    // --- Image Preview Functionality ---
    imageUploadInput.addEventListener('change', (event) => {
        imagePreviewContainer.innerHTML = ''; // Clear previous previews
        const files = event.target.files;

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
    });

    // --- Tab Switching Logic ---
    linkTabBtn.addEventListener('click', () => {
        linkTabBtn.classList.add('active');
        mapTabBtn.classList.remove('active');
        linkInputContainer.style.display = 'block';
        mapContainer.style.display = 'none';
    });

    mapTabBtn.addEventListener('click', () => {
        mapTabBtn.classList.add('active');
        linkTabBtn.classList.remove('active');
        linkInputContainer.style.display = 'none';
        mapContainer.style.display = 'block';

        // Initialize map only on the first click
        if (!map) {
            initializeMap();
        } else {
            // If map already exists, invalidate its size to ensure it renders correctly
            map.invalidateSize();
        }
    });

    // --- Leaflet Map Initialization ---
    function initializeMap() {
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
    }

    // --- Form Submission Handling ---
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const postData = {
            images: Array.from(imageUploadInput.files).map(f => f.name),
            location: null,
        };

        // Check which location tab is active
        if (linkTabBtn.classList.contains('active')) {
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
});