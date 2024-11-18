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