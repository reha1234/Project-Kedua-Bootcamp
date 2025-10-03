const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS sebagai template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Setup static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Portofolio Sederhana",
    page: "home",
  });
});

app.get("/coba", (req, res) => {
  res.render("coba", {
    title: "Coba - Portofolio",
    page: "coba",
  });
});

app.get("/myproject", (req, res) => {
  res.render("myproject", {
    title: "My Project - Portofolio",
    page: "myproject",
  });
});

app.get("/contactme", (req, res) => {
  res.render("contactme", {
    title: "Contact Me - Portofolio",
    page: "contactme",
  });
});

// API route untuk form contact (contoh)
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  // Di sini Anda bisa menambahkan logika untuk menyimpan data atau mengirim email
  console.log("Pesan dari:", name, email, message);
  res.json({ success: true, message: "Pesan berhasil dikirim!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
