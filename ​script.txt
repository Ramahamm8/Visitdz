
const firebaseConfig = {
    apiKey: "AIzaSyB9urygXT0zXJpyZR5kw7K0_CoRahiewSU",
    authDomain: "visitdz.firebaseapp.com",
    projectId: "visitdz",
    storageBucket: "visitdz.firebasestorage.app",
    messagingSenderId: "874236120088",
    appId: "1:874236120088:web:c076f4f0f09557c08dc76d"
};

// Initialisation de Firebase Engine
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Application memory storage database
let destinationsData = [];
let currentWilaya = 'all';
let currentType = 'all';

// 1. Sidebar Toggle Mechanics
const menuToggle = document.getElementById('menuToggle');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
    menuToggle.classList.toggle('open');
    sidebarMenu.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}
if(menuToggle) menuToggle.onclick = toggleSidebar;
if(sidebarOverlay) sidebarOverlay.onclick = toggleSidebar;

// 2. Fetch Live Cloud Database Engine
async function fetchCloudData() {
    const spinner = document.getElementById('loadingSpinner');
    try {
        const snapshot = await db.collection('destinations').get();
        destinationsData = [];
        
        snapshot.forEach(doc => {
            destinationsData.push({ id: doc.id, ...doc.data() });
        });

        if (spinner) spinner.style.display = 'none';
        filterAndDisplay(); 

    } catch (error) {
        console.error("Erreur Cloud Firestore Database :", error);
        if (spinner) spinner.innerHTML = "<i class='fa-solid fa-triangle-exclamation' style='color:#e74c3c'></i> Échec de connexion Firebase.";
    }
}

// 3. DOM Rendering Layout Filter Combine Engine
function filterAndDisplay() {
    let filtered = destinationsData;
    
    if (currentWilaya !== 'all') {
        filtered = filtered.filter(item => item.wilaya === currentWilaya);
    }
    if (currentType !== 'all') {
        filtered = filtered.filter(item => item.type === currentType);
    }
    
    displayCards(filtered);
}

function displayCards(data) {
    const cardsGrid = document.getElementById('cardsGrid');
    const noResults = document.getElementById('noResults');
    if (!cardsGrid) return;

    cardsGrid.querySelectorAll('.card').forEach(card => card.remove());

    if (data.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }
    if (noResults) noResults.style.display = 'none';

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        const featuredBadge = item.isFeatured ? `<div class="badge-featured">Coup de cœur</div>` : '';

        card.innerHTML = `
            <div class="card-img-wrapper">
                ${featuredBadge}
                <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
                <img src="${item.image}" alt="${item.locationName}" class="card-img">
            </div>
            <div class="card-content">
                <div class="card-title-row">
                    <h3 class="card-title">${item.category} · ${item.locationName}</h3>
                    <div class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating}</div>
                </div>
                <p class="card-text">${item.description ? item.description.substring(0, 45) : ''}...</p>
                <p class="card-price-info">${item.price}</p>
            </div>
        `;
        
        card.onclick = () => openDetailsModal(item);
        cardsGrid.insertBefore(card, noResults);
    });

    cardsGrid.querySelectorAll('.like-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            btn.classList.toggle('liked');
            const icon = btn.querySelector('i');
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('fa-solid');
        };
    });
}

// 4. Carousel Slider Logic Control Engine
const detailsModal = document.getElementById('detailsModal');
const track = document.getElementById('modalImagesTrack');
const dotsContainer = document.getElementById('sliderDots');
let activeIndex = 0;
let totalImages = 0;

function openDetailsModal(item) {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    activeIndex = 0;
    totalImages = item.gallery ? item.gallery.length : 0;

    if(item.gallery) {
        item.gallery.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.classList.add('slider-img');
            track.appendChild(img);

            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        });
    }

    document.getElementById('modalCategory').innerText = item.category;
    document.getElementById('modalTitle').innerText = item.locationName;
    document.getElementById('modalRating').innerText = item.rating;
    document.getElementById('modalDesc').innerText = item.description || '';
    document.getElementById('modalPrice').innerText = item.price;
    
    detailsModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    track.scrollLeft = 0;
}

function updateDots(index) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if(dots[index]) dots[index].classList.add('active');
}

if(track) {
    track.onscroll = () => {
        const width = track.clientWidth;
        if (width === 0) return;
        const newIndex = Math.round(track.scrollLeft / width);
        if (newIndex !== activeIndex && newIndex < totalImages) {
            activeIndex = newIndex;
            updateDots(activeIndex);
        }
    };
}

const nextBtn = document.getElementById('nextImgBtn');
if(nextBtn) {
    nextBtn.onclick = (e) => {
        e.stopPropagation();
        if (activeIndex < totalImages - 1) {
            activeIndex++;
            track.scrollLeft = activeIndex * track.clientWidth;
        }
    };
}

const prevBtn = document.getElementById('prevImgBtn');
if(prevBtn) {
    prevBtn.onclick = (e) => {
        e.stopPropagation();
        if (activeIndex > 0) {
            activeIndex--;
            track.scrollLeft = activeIndex * track.clientWidth;
        }
    };
}

const closeBtn = document.getElementById('closeModalBtn');
if(closeBtn) {
    closeBtn.onclick = () => {
        detailsModal.classList.remove('open');
        document.body.style.overflow = 'auto';
    };
}

// 5. Airbnb Categories Click Filters Setup
const categoryBoxes = document.querySelectorAll('.category-box');
categoryBoxes.forEach(box => {
    box.onclick = () => {
        categoryBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        currentType = box.getAttribute('data-type');
        filterAndDisplay();
    };
});

// 6. Sorting Select Wilaya Setup
const wilayaSelect = document.getElementById('wilayaSelect');
if (wilayaSelect) {
    wilayaSelect.onchange = (e) => {
        currentWilaya = e.target.value;
        filterAndDisplay();
    };
}

// Init App Connection
window.onload = fetchCloudData;
