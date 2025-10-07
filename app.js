const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const port = 3000;

// Set view engine dengan konfigurasi yang benar
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Konfigurasi HBS untuk partials
const hbs = require("hbs");
hbs.registerPartials(path.join(__dirname, "views/partials"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads/";
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "project-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Data file path
const projectsDataPath = path.join(__dirname, "data", "projects.json");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to read projects data
function readProjectsData() {
  try {
    if (!fs.existsSync(projectsDataPath)) {
      // Create empty array if file doesn't exist
      writeProjectsData([]);
      return [];
    }
    const data = fs.readFileSync(projectsDataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading projects data:", error);
    return [];
  }
}

// Helper function to write projects data
function writeProjectsData(data) {
  try {
    fs.writeFileSync(projectsDataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing projects data:", error);
    return false;
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home - My Portfolio",
    activePage: "home",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Me - My Portfolio",
    activePage: "contact",
  });
});

app.get("/myproject", (req, res) => {
  const projects = readProjectsData();
  res.render("myproject", {
    title: "My Project - My Portfolio",
    activePage: "myproject",
    projects: projects,
  });
});

app.get("/project/:id", (req, res) => {
  const projects = readProjectsData();
  const projectId = parseInt(req.params.id);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).render("404", { title: "Project Not Found" });
  }

  res.render("project-detail", {
    title: `${project.name} - My Portfolio`,
    project: project,
  });
});

// API Routes for projects - GET all projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = readProjectsData();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes for projects - POST new project
app.post("/api/projects", upload.single("projectImage"), (req, res) => {
  try {
    console.log("Received project data:", req.body);
    console.log("Received file:", req.file);

    const projects = readProjectsData();
    const newProject = {
      id: projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1,
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
      desc: req.body.description,
      techs: Array.isArray(req.body.techs) ? req.body.techs : [req.body.techs],
      img: req.file
        ? "/uploads/" + req.file.filename
        : "/asset/default-project.jpg",
      createdAt: new Date().toISOString(),
    };

    console.log("New project to save:", newProject);

    projects.push(newProject);

    if (writeProjectsData(projects)) {
      res.json({ success: true, project: newProject });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to save project" });
    }
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes for projects - PUT update project
app.put("/api/projects/:id", upload.single("projectImage"), (req, res) => {
  try {
    console.log("Updating project:", req.params.id);
    console.log("Update data:", req.body);
    console.log("Update file:", req.file);

    const projects = readProjectsData();
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const updatedProject = {
      ...projects[projectIndex],
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
      desc: req.body.description,
      techs: Array.isArray(req.body.techs) ? req.body.techs : [req.body.techs],
      updatedAt: new Date().toISOString(),
    };

    // If new image uploaded, update the image path
    if (req.file) {
      // Delete old image if exists and it's not the default image
      if (
        projects[projectIndex].img &&
        !projects[projectIndex].img.includes("default-project.jpg")
      ) {
        const oldImagePath = path.join(
          __dirname,
          "public",
          projects[projectIndex].img
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedProject.img = "/uploads/" + req.file.filename;
    }

    projects[projectIndex] = updatedProject;

    if (writeProjectsData(projects)) {
      res.json({ success: true, project: updatedProject });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to update project" });
    }
  } catch (error) {
    console.error("Error in PUT /api/projects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes for projects - DELETE project
app.delete("/api/projects/:id", (req, res) => {
  try {
    const projects = readProjectsData();
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Delete associated image file if it's not the default image
    if (
      projects[projectIndex].img &&
      !projects[projectIndex].img.includes("default-project.jpg")
    ) {
      const imagePath = path.join(
        __dirname,
        "public",
        projects[projectIndex].img
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    projects.splice(projectIndex, 1);

    if (writeProjectsData(projects)) {
      res.json({ success: true, message: "Project deleted successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete project" });
    }
  } catch (error) {
    console.error("Error in DELETE /api/projects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
    }
  }
  console.error("Multer error:", error);
  res.status(500).json({ success: false, message: error.message });
});

// Register Handlebars helpers
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

hbs.registerHelper("formatDate", function (dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
});

hbs.registerHelper("truncate", function (str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
});

hbs.registerHelper("calculateDuration", function (startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} hari`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} bulan`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} tahun ${
      remainingMonths > 0 ? remainingMonths + " bulan" : ""
    }`;
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`My Project page: http://localhost:${port}/myproject`);
});
