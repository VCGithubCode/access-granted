// Function to display the working message
function displayWorkingMessage() {
  const paragraph = document.createElement("p");
  paragraph.textContent = "It's working! Yay!";
  document.body.appendChild(paragraph);

  // Add animation to the paragraph
  setInterval(() => {
    if (!paragraph.style.animation) {
      paragraph.style.animation = "color-change 1s infinite";
    }
  }, 500);
}

// Display the working message
displayWorkingMessage();

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn-confirm',
    cancelButton: 'btn-cancel'
  },
  buttonsStyling: false
});
const jsConfetti = new JSConfetti();

// Trigger the alert and confetti
function showAlertAndConfetti() {
  jsConfetti.addConfetti({
    emojis: ['⭐', '🌟', '💫', '✩', '✮', '🎸'],
    emojiSize: 50,
    confettiNumber: 70,
  });

  swalWithBootstrapButtons.fire({
    title: 'Interested in the source code?',
    text: 'Hey 🎸⭐️ Rockstar ⭐️🎸 Instead of only inspecting my code this way... How about you take a second to fork my repo and give it a star ✩ ? Thanks a ton!!! 😌',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, take me there!',
    cancelButtonText: 'No, thank you.',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem('visitedGithub', 'true'); // Store the user's action
      window.location.href = 'https://github.com/VCGithubCode/vernell-c-new-repo-generator';
    }
  });
}

document.addEventListener('keydown', function(event) {
  // Check for keys used to open DevTools
  if (event.keyCode === 123 || // F12
      (event.ctrlKey && event.shiftKey && event.keyCode === 73) || // Ctrl+Shift+I (Windows/Linux)
      (event.metaKey && event.shiftKey && event.keyCode === 73)) { // Cmd+Shift+I (Mac)
    event.preventDefault();
    showAlertAndConfetti();
    awardBadge('Curiosity');
  }
});

// Listen for right-click context menu
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  showAlertAndConfetti();
});

// Award badges
function awardBadge(badgeName) {
  const badgeContainer = document.createElement('div');
  const words = badgeName.split(' '); // Split the badge name into words
  badgeContainer.className = 'badge-container';
  
  // Create HTML with each word wrapped in a span
  badgeContainer.innerHTML = `<div class="badge">${
    words.map(word => `<span>${word}</span>`).join(' ')
  } Badge Awarded!</div>`;
  
  document.body.appendChild(badgeContainer);
  
  // Increment the badge count in localStorage
  let badgeCount = parseInt(localStorage.getItem('badgeCount')) || 0;
  badgeCount++;
  localStorage.setItem('badgeCount', badgeCount);

  // Remove the badge after some time
  setTimeout(() => {
    badgeContainer.remove();
  }, 5000);
}

// Add touch and dblclick event listeners to badge container
document.addEventListener('touchend', handleBadgeInteraction);
document.addEventListener('dblclick', handleBadgeInteraction);

// Function to handle badge interaction
function handleBadgeInteraction(event) {
  if (event.target.className.includes('badge')) {
    createInputField();
  }
}

// Add mouseup event listener to check for selection
document.addEventListener('mouseup', checkForSelection);
document.addEventListener('touchend', checkForSelection); // For touch devices

// Check for text selection
function checkForSelection() {
  const selection = window.getSelection();
  const interactiveWord = document.getElementById('interactive-word');
  if (selection.containsNode(interactiveWord, true)) {
    awardBadge('World Highlighter');
  }
}

// Create an input field
function createInputField() {
  const inputContainer = document.createElement('div');
  inputContainer.className = 'input-container';
  inputContainer.innerHTML = `
    <label for="secret-code">Enter the password if you know the code:</label>
    <input type="text" id="secret-code" name="secret-code">
    <button id="submit-answer-button">Submit Answer</button>
    <button id="remove-container-button">Inevitable</button>
  `;
  document.body.appendChild(inputContainer);

  const submitAnswerButton = inputContainer.querySelector('#submit-answer-button');
  const removeContainerButton = inputContainer.querySelector('#remove-container-button');

  submitAnswerButton.addEventListener('click', handleSubmitAnswerButtonClick);
  removeContainerButton.addEventListener('click', handleRemoveContainerButtonClick);
}

// Handle submit answer button click
function handleSubmitAnswerButtonClick() {
  checkPasswordAndAwardBadge();
}

// Handle remove container button click
function handleRemoveContainerButtonClick() {
  removeInputContainer();
}

// Handle submit button click
function handleSubmitButtonClick() {
  checkPasswordAndAwardBadge();
}

// Check password entry and award badge
function checkPasswordAndAwardBadge() {
  const inputField = document.getElementById('secret-code');
  const enteredText = inputField.value.trim().toUpperCase();
  const passwords = ['IS THERE', 'ISTHERE', 'IS THERE?', 'ISTHERE?'];

  if (passwords.includes(enteredText)) {
    // Correct password entered
    awardBadge('Question Everything');
    inputField.value = ''; // Clear the input field
    removeInputContainer();
  } else {
    // Incorrect password entered
    inputField.value = ''; // Clear the input field
    showFeedbackMessage("Find the code, find the clue...");
  }
}

// Remove the input container
function removeInputContainer() {
  const inputContainer = document.querySelector('.input-container');
  if (inputContainer) {
    inputContainer.remove();
  }
}

// Show feedback message
function showFeedbackMessage(message) {
  const feedbackMessage = document.createElement('div');
  feedbackMessage.textContent = message;
  feedbackMessage.className = 'feedback-message';
  document.body.appendChild(feedbackMessage);

  // Remove the feedback message after some time
  setTimeout(() => {
    feedbackMessage.remove();
  }, 2000);
}

const konamiSwipeCode = [
  { direction: 'up' },
  { direction: 'up' },
  { direction: 'down' },
  { direction: 'down' },
  { direction: 'left' },
  { direction: 'right' },
  { direction: 'left' },
  { direction: 'right' },
  { direction: 'tap' }, // A tap can be the final action instead of 'KeyB' and 'KeyA'
  { direction: 'tap' }, // A tap can be the final action instead of 'KeyB' and 'KeyA'
  { direction: 'tap' } // A tap can be the final action instead of 'Enter'
];
let swipeIndex = 0;

// Check Konami code entry
function checkKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'Enter'];
  let konamiIndex = 0;

  document.addEventListener('keydown', function (e) {
    if (e.code === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        // Konami code entered successfully
        showHiddenText();
        awardBadge('True Hacker'); // Award the True Hacker badge
        konamiIndex = 0; // Reset index for future use
        updateInputText();
      }
    } else {
      konamiIndex = 0; // Reset index if the wrong key is pressed
    }
  });
}

// Function to handle touch start event
function handleTouchStart(event) {
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
}

// Function to handle touch end event
function handleTouchEnd(event) {
  const touch = event.changedTouches[0];
  const endX = touch.clientX;
  const endY = touch.clientY;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  let direction;

  if (distance < 50) {
    direction = 'tap'; // Consider small movements as taps
  } else {
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    if (angle > -45 && angle <= 45) {
      direction = 'right';
    } else if (angle > 45 && angle <= 135) {
      direction = 'down';
    } else if (angle > -135 && angle <= -45) {
      direction = 'up';
    } else {
      direction = 'left';
    }
  }

  // Check if the current swipe matches the Konami code
  if (konamiSwipeCode[swipeIndex].direction === direction &&
      (!konamiSwipeCode[swipeIndex].distance || distance >= konamiSwipeCode[swipeIndex].distance)) {
    swipeIndex++;
    if (swipeIndex === konamiSwipeCode.length) {
      // Konami code entered successfully
      showHiddenText();
      awardBadge('True Hacker');
      swipeIndex = 0; // Reset index for future use
      updateInputText();
    }
  } else {
    swipeIndex = 0; // Reset index if the wrong swipe is performed
  }
}

// Add event listener for Konami code entry
checkKonamiCode();

// Add event listeners for touch events
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleTouchEnd);

function showHiddenText() {
  const hiddenTextContainer = document.createElement('div');
  hiddenTextContainer.id = 'hidden-text-container';
  hiddenTextContainer.innerHTML = '<p id="hidden-text">THERE IS NO SPOON</p>';
  document.body.appendChild(hiddenTextContainer);

  // Remove the hidden text after 5 seconds
  setTimeout(() => {
    hiddenTextContainer.remove();
  }, 5000);

  const hiddenText = hiddenTextContainer.querySelector('#hidden-text');
  hiddenText.addEventListener('mouseup', function () {
    const selection = window.getSelection().toString();
    if (selection === 'THERE IS NO SPOON') {
      awardBadge('True Hacker');
      // Remove the hidden text container after successfully revealing the hidden message
      hiddenTextContainer.remove();
    }
  });
}

// Update input field text
function updateInputText() {
  const inputLabel = document.querySelector('label[for="secret-code"]');
  if (inputLabel) {
    // Define the initial label text with <span> elements and the "strikeout" class
    const labelText = "YOU KNOW THE !<span class='strikeout'>E</span><span class='strikeout'>D</span>OC";
    // Update the innerHTML of the label with the dynamically generated HTML
    inputLabel.innerHTML = labelText;

    // Declare lastTouchEnd variable
    let lastTouchEnd = 0;

    // Add double click event listener to the label
    inputLabel.addEventListener('dblclick', toggleTextLabel);
    // Add touchend event listener to the label
    inputLabel.addEventListener('touchend', handleTouchEnd);

    // Function to handle touch end event
    function handleTouchEnd(event) {
      // Check if the touch event was triggered twice in a short timeframe
      if (event.timeStamp - lastTouchEnd < 300) {
        // If so, trigger the toggleTextLabel function
        toggleTextLabel.call(this);
      }
      lastTouchEnd = event.timeStamp;
    }

    // Function to toggle the text label
    function toggleTextLabel() {
      // Toggle the 'reverse-strikeout' class on double click or double tap
      this.classList.toggle('reverse-strikeout');
      // Toggle between "EDOC" and "CODE" text
      const currentText = this.textContent;
      if (currentText === "EDOC?") {
        this.textContent = "?CODE";
      } else if (currentText === "?CODE") {
        this.textContent = "ED?OC";
      } else if (currentText === "ED?OC") {
        this.textContent = "CODE";
      } else {
        this.innerHTML = "<span class='strikeout'>E</span><span class='strikeout'>D</span>OC?";
      }
    }
  }
}

// Check if the user has achieved all 5 star badges
const badgeCount = parseInt(localStorage.getItem('badgeCount')) || 0;
const messageAlreadyDisplayed = localStorage.getItem('thankYouMessageDisplayed') === '';

if (badgeCount >= 5 && !messageAlreadyDisplayed) {
  const message = document.createElement("p");
  message.textContent = "Vernell thanks you so much for being a part of his tech journey! Keep in touch!";
  message.style.fontSize = "1em"; // Adjust font size to match paragraph
  message.style.marginTop = "10px"; // Add some margin top for spacing
  document.body.appendChild(message);

  // Set flag to indicate that the message has been displayed
  localStorage.setItem('thankYouMessageDisplayed', 'true');
}

if (localStorage.getItem('visitedGithub') === 'true') {
  awardBadge('Real One');
}