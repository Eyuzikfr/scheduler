document.addEventListener("DOMContentLoaded", function () {
  const profileToggle = document.querySelector(".profile-toggle");
  const profileMenu = document.querySelector(".profile-options");
  const switchProfileBtn = document.getElementById("switch-profile-btn");
  const profilePhotoInput = document.getElementById("profile-photo-input");
  const profileImg = document.querySelector(".profile-img");
  const profileEmail = document.getElementById("profile-email")?.value;
  const links = document.querySelectorAll("a[data-link]");
  const mainContent = document.getElementById("main-content");

  // Profile menu toggle
  if (profileToggle && profileMenu) {
    profileToggle.addEventListener("click", () => {
      profileMenu.classList.toggle("visible");
    });
  }

  // Switch Profile button click - triggers file input
  if (switchProfileBtn && profilePhotoInput) {
    switchProfileBtn.addEventListener("click", () => {
      profilePhotoInput.click(); // Trigger the hidden file input
    });
  }

  // Handle file input change (when a user selects a file)
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const email = profileEmail;
      const formData = new FormData();
      formData.append("profile_photo", file);
      formData.append("email", email);

      // Send the request to upload the profile photo
      try {
        const response = await fetch("/upload-profile-photo", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          // Update the profile image on the page
          profileImg.src = result.newPhotoUrl;
          alert("Profile photo updated successfully!");
        } else {
          alert("Failed to upload profile photo.");
        }
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        alert("Error uploading profile photo.");
      }
    });
  }

  // Function to load sections dynamically
  async function loadSection(section) {
    console.log(`Loading section: ${section}`);
    if (!mainContent) {
      console.error("Main content element is missing!");
      return;
    }

    // Update active link
    links.forEach((link) => link.classList.remove("active"));
    const activeLink = document.querySelector(`a[data-link="${section}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }

    try {
      // Log request URL for debugging
      console.log(`Fetching content for: /dashboard/${section}`);
      const response = await fetch(`/dashboard/${section}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const html = await response.text();
      console.log("Fetched HTML:", html); // Log the fetched HTML content

      mainContent.innerHTML = html;
      console.log(`Loaded content for section: ${section}`);

      // Initialize section-specific JS
      if (section === "schedule") {
        const { initializeSchedule } = await import(`/static/js/schedule.js`);
        initializeSchedule();
      } else if (section === "calendar") {
        const { initializeCalendar } = await import(`/static/js/calendar.js`)
        initializeCalendar(); // Initialize calendar directly
      }
    } catch (error) {
      console.error("Error loading section:", error);
      mainContent.innerHTML = `<p>Error loading section: ${section}. Please try again later.</p>`;
    }
  }


  // Get the active page from localStorage on page load
  const activePage = localStorage.getItem("activePage");

  // If there's an active page stored, load that section, otherwise default to 'schedule'
  if (activePage && (activePage === "schedule" || activePage === "calendar")) {
    loadSection(activePage); // Load the saved section
  } else {
    loadSection("schedule"); // Default to "schedule" if no section is saved
  }

  // Navigation
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const section = link.getAttribute("data-link");
      loadSection(section);
      // Store the active section in localStorage
      localStorage.setItem("activePage", section);
    });
  });
});
