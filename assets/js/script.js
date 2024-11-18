// Back to top button
document.addEventListener("scroll", function () {
  const backToTopButton = document.querySelector(".back-to-top");
  if (window.scrollY > 200) {
    backToTopButton.classList.add("d-block");
    backToTopButton.classList.remove("d-none");
  } else {
    backToTopButton.classList.add("d-none");
    backToTopButton.classList.remove("d-block");
  }
});

// Ensure keyboard navigation works correctly with dropdowns
document.querySelectorAll(".dropdown-toggle").forEach((item) => {
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      item.click();
    }
  });
});

const preferences = {
  fontSize: null,
  dyslexicFont: null,
  highContrast: null,
};

function savePreferences() {
  preferences.fontSize = document.getElementById("fontSize").value;
  preferences.dyslexicFont = document.getElementById("dyslexicFont").checked;
  preferences.highContrast = document.getElementById("highContrast").checked;
  localStorage.setItem("accessibilityPreferences", JSON.stringify(preferences));
}

document.querySelectorAll("#fontSize, #dyslexicFont, #highContrast")
  .forEach((input) => {
    input.addEventListener("change", savePreferences);
  });