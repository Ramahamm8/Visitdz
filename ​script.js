document.addEventListener("DOMContentLoaded", function() {
    
    // ⚠️ استبدل هذه الإعدادات بمفاتيح مشروعك الخاصة من Firebase Console
    const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "visitdz-...",
        projectId: "visitdz-...",
        storageBucket: "visitdz-...",
        messagingSenderId: "...",
        appId: "..."
    };

    // تشغيل الفايربيز
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // عناصر الواجهة
    const menuToggle = document.getElementById("menuToggle");
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const cardsGrid = document.getElementById("cardsGrid");
    const loadingContainer = document.getElementById("loadingContainer");
    const categoriesBar = document.getElementById("categoriesBar");
    const wilayaSelect = document.getElementById("wilayaSelect");

    let allDestinations = [];

    // تشغيل القائمة الجانبية
    if (menuToggle && sidebarMenu && sidebarOverlay) {
        menuToggle.addEventListener("click", () => {
            sidebarMenu.classList.toggle("active");
            sidebarOverlay.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });
        sidebarOverlay.addEventListener("click", () => {
            sidebarMenu.classList.remove("active");
            sidebarOverlay.classList.remove("active");
            menuToggle.classList.remove("open");
        });
    }

    // جلب البيانات من Firebase Firestore
    db.collection("destinations").get().then((querySnapshot) => {
        if (loadingContainer) loadingContainer.remove(); // إخفاء الـ Spinner

        querySnapshot.forEach((doc) => {
            allDestinations.push({ id: doc.id, ...doc.data() });
        });

        displayCards(allDestinations);
    }).catch((error) => {
        console.error("Error getting documents: ", error);
        if (loadingContainer) {
            loadingContainer.innerHTML = `<p style="color:red;">Erreur de connexion.</p>`;
        }
    });

    // دالة عرض البطاقات بناءً على البيانات المستلمة
    function displayCards(data) {
        // مسح البطاقات القديمة مع ترك الـ spinner إذا وجد
        const items = cardsGrid.querySelectorAll('.destination-card');
        items.forEach(item => item.remove());

        if (data.length === 0) {
            cardsGrid.innerHTML += `<p class="no-data">Aucune destination trouvée.</p>`;
            return;
        }

        data.forEach(item => {
            const cardHTML = `
                <div class="destination-card" data-type="${item.type}" data-wilaya="${item.wilaya}">
                    <div class="card-image-wrapper">
                        <img src="${item.image}" alt="${item.title}" class="card-main-image">
                        <button class="heart-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                    </div>
                    <div class="card-info-content">
                        <div class="card-meta-top">
                            <span class="card-location-tag"><i class="fa-solid fa-location-dot"></i> Wilaya (${item.wilaya})</span>
                            <div class="card-rating-badge"><i class="fa-solid fa-star"></i> <span>${item.rating}</span></div>
                        </div>
                        <h3 class="card-destination-title">${item.title}</h3>
                        <p class="card-short-description">${item.desc}</p>
                        <div class="card-price-row">
                            <span class="card-price-amount">${item.price === 'Free' ? 'Gratuit' : item.price}</span>
                        </div>
                    </div>
                </div>
            `;
            cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // نظام الفلترة عبر التصنيفات (Tout / Les complexes)
    if (categoriesBar) {
        categoriesBar.addEventListener("click", (e) => {
            const box = e.target.closest('.category-box');
            if (!box) return;

            document.querySelectorAll('.category-box').forEach(b => b.classList.remove('active'));
            box.classList.add('active');

            filterData();
        });
    }

    // نظام الفلترة عبر قائمة الولايات
    if (wilayaSelect) {
        wilayaSelect.addEventListener("change", filterData);
    }

    function filterData() {
        const activeCategory = document.querySelector('.category-box.active').dataset.type;
        const selectedWilaya = wilayaSelect.value;

        let filtered = allDestinations;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(item => item.type === activeCategory);
        }

        if (selectedWilaya !== 'all') {
            filtered = filtered.filter(item => item.wilaya === selectedWilaya);
        }

        displayCards(filtered);
    }
});
