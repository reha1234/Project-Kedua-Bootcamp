// Smooth scrolling untuk navigasi
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Form submission handling
document
  .getElementById("contactForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    // Di sini Anda bisa menambahkan kode untuk mengirim data ke server
    console.log("Form submitted:", formData);

    // Tampilkan pesan sukses
    alert("Terima kasih! Pesan Anda telah dikirim.");
    this.reset();
  });

// Navbar background change on scroll
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.backdropFilter = "blur(10px)";
  } else {
    navbar.style.background = "#fff";
    navbar.style.backdropFilter = "none";
  }
});
