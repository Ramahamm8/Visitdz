document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    // تشغيل وإغلاق القائمة الجانبية عند الضغط على الزر
    if (menuToggle && sidebarMenu && sidebarOverlay) {
        menuToggle.addEventListener("click", function() {
            sidebarMenu.classList.toggle("active");
            sidebarOverlay.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });

        sidebarOverlay.addEventListener("click", function() {
            sidebarMenu.classList.remove("active");
            sidebarOverlay.classList.remove("active");
            menuToggle.classList.remove("open");
        });
    }
});

