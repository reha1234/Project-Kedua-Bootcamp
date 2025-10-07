// Project management functionality
class ProjectManager {
  constructor() {
    this.currentEditId = null;
    this.baseUrl = window.location.origin; // Get current origin
  }

  async loadProjects() {
    try {
      const response = await fetch("/api/projects");
      return await response.json();
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  }

  async saveProject(formData) {
    const url = this.currentEditId
      ? `/api/projects/${this.currentEditId}`
      : "/api/projects";
    const method = this.currentEditId ? "PUT" : "POST";

    try {
      console.log("Sending request to:", url, "Method:", method);

      const response = await fetch(url, {
        method: method,
        body: formData, // Send as FormData
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response result:", result);

      if (result.success) {
        alert(
          "Project " +
            (this.currentEditId ? "updated" : "added") +
            " successfully!"
        );
        window.location.reload();
      } else {
        alert("Failed to save project: " + result.message);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Error saving project: " + error.message);
    }
  }

  async deleteProject(projectId) {
    if (!confirm("Apakah Anda yakin ingin menghapus project ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("Project deleted successfully!");
        window.location.reload();
      } else {
        alert("Failed to delete project: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project: " + error.message);
    }
  }

  async getProject(projectId) {
    try {
      const projects = await this.loadProjects();
      return projects.find((p) => p.id === projectId);
    } catch (error) {
      console.error("Error getting project:", error);
      return null;
    }
  }
}

// Initialize project manager
const projectManager = new ProjectManager();

// Image preview functionality
function setupImagePreview() {
  const imageInput = document.getElementById("projectImage");
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImage = document.getElementById("imagePreview");

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        // Validate file type
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          alert("Please select a valid image file (JPEG, PNG, GIF, WebP)");
          this.value = "";
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size too large. Maximum size is 5MB.");
          this.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewContainer.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = "none";
      }
    });
  }
}

function removeImagePreview() {
  const imageInput = document.getElementById("projectImage");
  const previewContainer = document.getElementById("imagePreviewContainer");

  imageInput.value = "";
  previewContainer.style.display = "none";
}

// Form validation and submission
document.addEventListener("DOMContentLoaded", function () {
  setupImagePreview();

  const projectForm = document.getElementById("projectForm");

  if (projectForm) {
    projectForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Form submitted");

      if (!validateForm()) {
        console.log("Form validation failed");
        return;
      }

      console.log("Form validation passed, preparing form data");

      const formData = new FormData(this);

      // Log form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key + ": " + value);
      }

      await projectManager.saveProject(formData);
    });
  }
});

// Edit project functionality
window.editProject = async function (projectId) {
  console.log("Editing project:", projectId);
  const project = await projectManager.getProject(projectId);
  if (!project) {
    alert("Project not found!");
    return;
  }

  // Fill edit form
  document.getElementById("editProjectId").value = project.id;
  document.getElementById("editProjectName").value = project.name;
  document.getElementById("editStartDate").value = project.start;
  document.getElementById("editEndDate").value = project.end;
  document.getElementById("editDescription").value = project.desc;

  // Check technologies
  document.getElementById("editTechNode").checked =
    project.techs.includes("Node JS");
  document.getElementById("editTechNext").checked =
    project.techs.includes("Next JS");
  document.getElementById("editTechReact").checked =
    project.techs.includes("React JS");
  document.getElementById("editTechTypeScript").checked =
    project.techs.includes("TypeScript");

  // Show current image
  const currentImageDiv = document.getElementById("currentImage");
  if (project.img) {
    currentImageDiv.innerHTML = `
            <label class="form-label">Current Image:</label>
            <div>
                <img src="${project.img}" alt="Current project image" class="img-fluid rounded" style="max-height: 150px;">
            </div>
        `;
  } else {
    currentImageDiv.innerHTML = '<p class="text-muted">No image uploaded</p>';
  }

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("editProjectModal")
  );
  modal.show();
};

// Update project
window.updateProject = async function () {
  const form = document.getElementById("editProjectForm");
  const formData = new FormData(form);
  const projectId = document.getElementById("editProjectId").value;

  console.log("Updating project:", projectId);
  projectManager.currentEditId = parseInt(projectId);
  await projectManager.saveProject(formData);
};

// Delete project
window.deleteProject = function (projectId) {
  console.log("Deleting project:", projectId);
  projectManager.deleteProject(projectId);
};

// Reset form
window.resetForm = function () {
  document.getElementById("projectForm").reset();
  removeImagePreview();
  projectManager.currentEditId = null;
  document.querySelector('#projectForm button[type="submit"]').innerHTML =
    '<i class="fas fa-plus me-2"></i>Add Project';
};

// Form validation function
function validateForm() {
  let isValid = true;

  // Reset alerts
  document.querySelectorAll(".alert").forEach((alert) => {
    alert.style.display = "none";
  });

  // Validate project name
  const projectName = document.getElementById("projectName").value;
  if (!projectName.trim()) {
    document.getElementById("nameAlert").style.display = "block";
    isValid = false;
  }

  // Validate dates
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate) {
    document.getElementById("startDateAlert").style.display = "block";
    isValid = false;
  }

  if (!endDate) {
    document.getElementById("endDateAlert").style.display = "block";
    isValid = false;
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    document.getElementById("dateValidationAlert").style.display = "block";
    isValid = false;
  }

  // Validate description
  const description = document.getElementById("description").value;
  if (!description.trim()) {
    document.getElementById("descAlert").style.display = "block";
    isValid = false;
  }

  // Validate technologies
  const techs = Array.from(
    document.querySelectorAll('input[name="techs"]:checked')
  );
  if (techs.length === 0) {
    document.getElementById("techAlert").style.display = "block";
    isValid = false;
  }

  // Image is optional for both new and edit
  const imageInput = document.getElementById("projectImage");
  if (imageInput && imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      document.getElementById("imageAlert").textContent =
        "Please select a valid image file (JPEG, PNG, GIF, WebP)";
      document.getElementById("imageAlert").style.display = "block";
      isValid = false;
    }

    if (file.size > 5 * 1024 * 1024) {
      document.getElementById("imageAlert").textContent =
        "File size too large. Maximum size is 5MB.";
      document.getElementById("imageAlert").style.display = "block";
      isValid = false;
    }
  }

  return isValid;
}

// Debug: Test API connection
window.testAPI = async function () {
  try {
    const response = await fetch("/api/projects");
    console.log("API test response:", response);
    const data = await response.json();
    console.log("API test data:", data);
    alert("API connection successful!");
  } catch (error) {
    console.error("API test failed:", error);
    alert("API connection failed: " + error.message);
  }
};
