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

// Accessibility feature toggles
document.getElementById("dyslexicFont").addEventListener("change", function () {
  document.body.classList.toggle("dyslexic-font");
});

document.getElementById("highContrast").addEventListener("change", function () {
  document.body.classList.toggle("high-contrast");
});

document
  .getElementById("colorblindMode")
  .addEventListener("change", function () {
    document.body.className = document.body.className.replace(
      /deuteranopia|protanopia|tritanopia/g,
      ""
    );
    if (this.value) {
      document.body.classList.add(this.value);
    }
  });

// Voice control and text-to-speech
let recognition;
let synth = window.speechSynthesis;

document.getElementById("voiceControl").addEventListener("change", function () {
  if (this.checked) {
    if ("webkitSpeechRecognition" in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = function (event) {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (transcript.includes("read")) {
              const section = transcript.split("read")[1].trim();
              readSection(section);
            }
          }
        }
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  } else {
    if (recognition) {
      recognition.stop();
    }
  }
});

function readSection(section) {
  let textToRead = "";
  switch (section) {
    case "header":
      textToRead = document.querySelector("h1").textContent;
      break;
    case "features":
      textToRead = Array.from(document.querySelectorAll(".card-text"))
        .map((el) => el.textContent)
        .join(". ");
      break;
    default:
      textToRead = "Section not found";
  }

  let utterance = new SpeechSynthesisUtterance(textToRead);
  synth.speak(utterance);
}

// Ensure keyboard navigation works correctly with dropdowns
document.querySelectorAll(".dropdown-toggle").forEach((item) => {
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      item.click();
    }
  });
});
document.getElementById("fontSize").addEventListener("input", function () {
  document.body.style.fontSize = this.value + "px";
});

// Load saved preferences
window.addEventListener("load", function () {
  const savedPreferences =
    JSON.parse(localStorage.getItem("accessibilityPreferences")) || {};

  if (savedPreferences.fontSize) {
    document.getElementById("fontSize").value = savedPreferences.fontSize;
    document.body.style.fontSize = savedPreferences.fontSize + "px";
  }
  if (savedPreferences.dyslexicFont) {
    document.getElementById("dyslexicFont").checked = true;
    document.body.classList.add("dyslexic-font");
  }
  if (savedPreferences.highContrast) {
    document.getElementById("highContrast").checked = true;
    document.body.classList.add("high-contrast");
  }
  if (savedPreferences.colorblindMode) {
    document.getElementById("colorblindMode").value =
      savedPreferences.colorblindMode;
    document.body.classList.add(savedPreferences.colorblindMode);
  }
});

// Save preferences
function savePreferences() {
  const preferences = {
    fontSize: document.getElementById("fontSize").value,
    dyslexicFont: document.getElementById("dyslexicFont").checked,
    highContrast: document.getElementById("highContrast").checked,
    simplifiedLayout: document.getElementById("simplifiedLayout").checked,
    colorblindMode: document.getElementById("colorblindMode").value,
  };
  localStorage.setItem("accessibilityPreferences", JSON.stringify(preferences));
}

// Add event listeners to save preferences
document.getElementById("fontSize").addEventListener("change", savePreferences);
document
  .getElementById("dyslexicFont")
  .addEventListener("change", savePreferences);
document
  .getElementById("highContrast")
  .addEventListener("change", savePreferences);
document
  .getElementById("simplifiedLayout")
  .addEventListener("change", savePreferences);
document
  .getElementById("colorblindMode")
  .addEventListener("change", savePreferences);
