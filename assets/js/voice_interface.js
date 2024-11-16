// Global variables for speech recognition
let recognition;
let isListening = false;
let isProcessing = false;
let fallbackTriggered = false;
let currentExpression = "";
let isStandbyMode = false;
let lastSpokenPhrase = "";
let recognitionActive = false;
let noteDetails = {
    content: '',
    date: '',
    time: '',
    remind: false,
    id: null // Adding ID to noteDetails
};
let isCreatingNote = false;  // New flag to track note creation process
let isDateTimeRequested = false;
let isNoteSaved = false;

let isNoteProcessActive = false; // Flag to track note creation process
let noteDate = '';
let noteTime = '';




// Append number to the calculator display
function appendNumber(number) {
    currentExpression += number;
    document.getElementById("calculator-display").value = currentExpression;
}

// Append operator to the calculator display
function appendOperator(operator) {
    currentExpression += operator;
    document.getElementById("calculator-display").value = currentExpression;
}

// Clear the calculator display
function clearDisplay() {
    currentExpression = "";
    document.getElementById("calculator-display").value = "";
}

// Calculate the result of the expression
function calculateResult() {
    try {
        currentExpression = eval(currentExpression).toString();
        document.getElementById("calculator-display").value = currentExpression;
    } catch (e) {
        document.getElementById("calculator-display").value = "Error";
        currentExpression = "";
    }
}


// Store user location globally
let userLocation = {};

// Function to get greeting based on the time of day
function getTimeBasedGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
}

// Question-Answer Pairs (adjust as needed)
const questionAnswerPairs = {
    "how are you": "I'm here and ready to assist you!",
    "what's up": "Not much, just here to help you. How about you?",
    "what can you do": "I can assist with various tasks, answer questions, and provide information.",
    "tell me a joke": "Why did the scarecrow win an award? Because he was outstanding in his field!",
};
let isAssistantSpeaking = false; 
// Function to start or stop recognition based on the assistant's speaking state
function speakResponse(responseText) {
    // Disable recognition while the assistant speaks
    recognitionActive = false;
    isAssistantSpeaking = true; // Set the assistant as speaking

    // Log the response text being spoken
    console.log("Response Text:", responseText);

    // Use responsiveVoice to speak the response
    responsiveVoice.speak(responseText, "UK English Male", {
        onstart: () => {
            // Optionally log or take action when speaking starts
            console.log("Assistant is speaking...");
        },
        onend: () => {
            // Re-enable recognition after the assistant finishes speaking
            recognitionActive = true; // Allow recognition to start again
            isAssistantSpeaking = false; // Mark the assistant as done speaking
        }
    });

    // Log that the response has been spoken
    console.log(`Help Buddy Response: ${responseText}`);
}

// Simplified function to stop recognition
function stopRecognition() {
    if (recognitionActive) {
        recognition.stop(); // Stop recognition
        recognitionActive = false; // Set flag to false
        console.log("Speech recognition stopped.");
    }
}

// Simplified function to start recognition again
function startRecognition() {
    if (!recognitionActive) {
        recognition.start(); // Start recognition again
        recognitionActive = true; // Set flag to true
        console.log("Speech recognition started.");
    }
}


function handleSpeechRecognition(transcript) {
    const recognizedPhrase = transcript.trim().toLowerCase();
    console.log("Recognized phrase:", recognizedPhrase);

    // Ignore self-generated responses
    if (recognizedPhrase === lastSpokenPhrase.trim().toLowerCase()) {
        console.log("Ignored self-generated phrase:", recognizedPhrase);
        return;
    }

    // Process standby mode-specific behavior
    if (isStandbyMode) {
        // Define a list of phrases that will activate the system from standby mode
        const wakeUpPhrases = [
            "wake up",
            "hey buddy, wake up",
            "buddy, it's time to wake up",
            "buddy, are you there?",
            "wake up buddy",
            "buddy, start listening",
            "come on buddy",
            "hey buddy, let's go", "hi buddy",
            "buddy, it's time to talk",
            "buddy, reactivate",
            "hello buddy, wake up",
            "buddy, reboot",
            "buddy, let's get started",
            "wake up, buddy!",
            "buddy, time to wake up"
        ];

        // Check if the recognized phrase matches any of the wake-up phrases
        if (wakeUpPhrases.includes(recognizedPhrase)) {
            deactivateStandbyMode(); // Reactivate the system
            return;
        }

        if (lastSpokenPhrase == "currently in standby mode. please say 'wake up' to activate.") {
            const standbyMessage = "Currently in standby mode. Please say 'wake up' to activate.";
            speakResponse(standbyMessage);
        } else {
            console.log("Help Buddy: Standby message already spoken.");
        }
        return;
    }

    console.log("Help Buddy: Processing command:", recognizedPhrase);



    // Handle greetings
    if (recognizedPhrase.includes("hello") || recognizedPhrase.includes("hi") || recognizedPhrase.includes("hey")) {
        const greeting = `${getTimeBasedGreeting()}! How can I assist you today?`;
        speakResponse(greeting);
        recognitionActive = true;
        return;
    }

    // Handle general weather queries
    if (recognizedPhrase.includes("weather")) {
        if (recognizedPhrase.includes("tomorrow") || recognizedPhrase.includes("next day") || recognizedPhrase.includes("tomorrow's weather")) {
            getWeather('forecast'); // Fetch forecast for tomorrow
        } else {
            getWeather('current'); // Fetch current weather
        }
        return;
    }


    // Handle thank-you and goodbye phrases, activate standby mode
    if (
        recognizedPhrase.includes("that is all") ||
        recognizedPhrase.includes("that's all buddy") ||
        recognizedPhrase.includes("bye buddy") ||
        recognizedPhrase.includes("goodbye buddy") ||
        recognizedPhrase.includes("bye") ||
        recognizedPhrase.includes("see you") ||
        recognizedPhrase.includes("thanks") ||          // Adding general thanks
        recognizedPhrase.includes("thank you") ||       // Adding formal "thank you"
        recognizedPhrase.includes("cheers") ||          // Casual thank you
        recognizedPhrase.includes("take care") ||       // Casual goodbye
        recognizedPhrase.includes("catch you later") || // Informal sign-off
        recognizedPhrase.includes("see you later") ||   // Another casual goodbye
        recognizedPhrase.includes("talk soon") ||       // Informal farewell
        recognizedPhrase.includes("peace") ||           // Friendly goodbye
        recognizedPhrase.includes("good night") ||      // Evening sign-off
        recognizedPhrase.includes("have a good one") || // Casual farewell
        recognizedPhrase.includes("goodbye for now") || // Slightly more formal
        recognizedPhrase.includes("later") ||           // Informal way of saying goodbye
        recognizedPhrase.includes("thank you buddy") || // Personalized gratitude with "buddy"
        recognizedPhrase.includes("thanks a lot") ||    // More gratitude variations
        recognizedPhrase.includes("thanks a ton") ||    // Another informal gratitude
        recognizedPhrase.includes("thanks a million") ||    // Another informal gratitude
        recognizedPhrase.includes("much appreciated") || // Formal thank you
        recognizedPhrase.includes("you're the best")    // Positive, casual sign-off

    ) {
        speakResponse("You're welcome!");
        activateStandbyMode(); // Activate standby mode
        return;
    }

    // Handle calculator visibility commands
    if (recognizedPhrase.includes("show calculator") || recognizedPhrase.includes("open calculator") || recognizedPhrase.includes("calculator please")) {
        toggleCalculator(true);
        speakResponse("Calculator displayed.");
        return;
    }

    if (recognizedPhrase.includes("hide calculator") || recognizedPhrase.includes("close calculator") || recognizedPhrase.includes("turn off calculator")) {
        toggleCalculator(false);
        speakResponse("Calculator hidden.");
        return;
    }

    if (
        (recognizedPhrase.includes("calculate") ||
            recognizedPhrase.includes("what is") ||
            recognizedPhrase.includes("find out") ||
            recognizedPhrase.includes("what’s") ||
            recognizedPhrase.includes("how much is") ||       // Added for casual phrasing
            recognizedPhrase.includes("how many times") ||    // Added for informal multiplication requests
            recognizedPhrase.includes("what is the value of") || // Added for formal or longer requests
            recognizedPhrase.includes("what’s the result") ||    // Added for variation of "what's the answer"
            recognizedPhrase.includes("can you figure out") ||  // Added for casual request
            recognizedPhrase.includes("what do you get") ||     // Added for conversational phrasing
            recognizedPhrase.includes("compute") ||             // Added for technical phrasing
            recognizedPhrase.includes("calculate the total") ||  // Added for more specific requests
            recognizedPhrase.includes("find the answer") ||     // Added for natural language phrasing
            recognizedPhrase.includes("how does it add up") ||  // Added for conversational phrasing
            recognizedPhrase.includes("what's the result") ||   // Added for another variation of "what's the answer"
            // Multiplication phrases
            recognizedPhrase.includes("multiply") ||            // Direct use of "multiply"



            // Subtraction phrases
            recognizedPhrase.includes("subtract") ||           // Common for subtraction
            recognizedPhrase.includes("minus") ||              // Common for subtraction
            recognizedPhrase.includes("less") ||               // Casual phrasing for subtraction
            recognizedPhrase.includes("take away") ||          // Informal phrasing for subtraction
            recognizedPhrase.includes("deduct") ||             // Formal subtraction phrasing
            // Division phrases
            recognizedPhrase.includes("divide") ||             // Common for division
            recognizedPhrase.includes("divided by") ||         // Full phrase "divided by"
            recognizedPhrase.includes("over") ||               // Used for division (e.g., "10 over 2")
            recognizedPhrase.includes("into") ||               // Common for division
            recognizedPhrase.includes("per") ||                // For division (e.g., "cost per item")
            recognizedPhrase.includes("split") ||              // Used for division in casual phrasing
            recognizedPhrase.includes("shared by") ||          // Division phrasing
            recognizedPhrase.includes("divided into")          // Another phrasing for division
        ) &&
        isCalculatorDisplayed()
    ) {
        handleCalculatorCommand(recognizedPhrase);
        return;
    }
    // Assuming recognition is already running and we capture the recognizedPhrase
    if (recognizedPhrase.includes("open planner") || recognizedPhrase.includes("run planner") || recognizedPhrase.includes("show planner")) {
        // Open the planner and display it
        openPlanner();
    }



    // Handle asking for the current date with variations
    const dateKeywords = [
        "date today",
        "today's date",
        "what is the date",
        "what's the date",
        "what is today's date",
        "what's today's date",
        "give me the date",
        "tell me the date",
        "date please",
        "today date"
    ];

    // Check if the recognized phrase includes any of the keywords for asking about the date
    if (dateKeywords.some(keyword => recognizedPhrase.includes(keyword))) {
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString(); // Format the date in a readable format
        const dateMessage = `Today's date is ${dateString}.`;
        speakResponse(dateMessage);
        return;
    }

    // Handle asking for the current time with variations
    const timeKeywords = [

        "time now",
        "current time",
        "what is the time",
        "what's the time",
        "what is the current time",
        "what's the current time",
        "give me the time",
        "tell me the time",
        "time please",
        "now time"
    ];

    // Check if the recognized phrase includes any of the keywords for asking about the time
    if (timeKeywords.some(keyword => recognizedPhrase.includes(keyword))) {
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format the time in 12-hour format
        const timeMessage = `The current time is ${timeString}.`;
        speakResponse(timeMessage);
        return;
    }
    // Process note creation
    if (isNoteProcessActive) {
        handleNoteCreationProcess(recognizedPhrase);
        return;
    }

    // Handle "make note", "buddy make note", etc.
    if (
        recognizedPhrase.includes("make note") ||
        recognizedPhrase.includes("make a note") ||
        recognizedPhrase.includes("make a plan") ||
        recognizedPhrase.includes("make a reminder") ||
        recognizedPhrase.includes("buddy make note") ||
        recognizedPhrase.includes("create note") ||
        recognizedPhrase.includes("take note")
    ) {
        startNoteCreation();
        return;
    }

    // Handle predefined question-answer pairs
    for (const [question, answer] of Object.entries(questionAnswerPairs)) {
        if (recognizedPhrase.includes(question)) {
            speakResponse(answer);
            console.log(`Help Buddy Answer: ${answer}`);
            return;
        }
    }

    // If no match is found and fallback has not been triggered yet
    if (!fallbackTriggered && !isStandbyMode) {
        fallbackTriggered = true; // Set the flag to prevent repeated fallback
        speakResponse("I'm here to help! Could you please clarify your request?");

        // Reset the fallback flag after a delay (to allow for the next interaction)
        setTimeout(() => {
            fallbackTriggered = false;
        }, 13000);
    } else {
        console.log("Help Buddy: Waiting for user clarification...");
    }
}



function activateStandbyMode() {
    isStandbyMode = true;  // Set standby mode to true
    recognitionActive = false;  // Mark recognition as inactive
    console.log("Standby Mode: Activated. No voice commands will be processed.");

    // Stop speech recognition or any listening mechanism
    if (recognition && recognition.stop) {
        try {
            recognition.stop();  // Stop speech recognition service
            console.log("SpeechRecognition stopped.");
        } catch (error) {
            console.error("Error stopping SpeechRecognition:", error.message);
        }
    }

    // Optionally, speak a message indicating that the system is in standby mode
    responsiveVoice.speak("I'm going to take nap. Please say wake up buddy or something  to wake me up.", "UK English Male");
}



function deactivateStandbyMode() {
    isStandbyMode = false;
    recognitionActive = true;  // Mark recognition as active
    console.log("Help Buddy: Deactivated standby mode. Ready to listen for commands.");

    // Check if recognition is running
    if (recognition && recognition.state === "active") {
        console.log("SpeechRecognition is already active.");
        responsiveVoice.speak("System is now active. Please say a command.", "UK English Male");
        return;
    }

    // Start recognition only if it isn't already running
    try {
        if (recognition) {
            recognition.start();  // Start the recognition service
            console.log("SpeechRecognition started successfully.");
        }
    } catch (error) {
        console.error("Error starting SpeechRecognition:", error.message);
    }

    responsiveVoice.speak("I m back. How can i help?", "UK English Male");
}

// Function to get weather for the current location or forecast
function getWeather(type) {
    if (userLocation.lat && userLocation.lon) {
        console.log("Fetching weather for Latitude: " + userLocation.lat + " Longitude: " + userLocation.lon);
        if (type === 'forecast') {
            fetchForecast(userLocation.lat, userLocation.lon);  // Get forecast
        } else {
            fetchCurrentWeather(userLocation.lat, userLocation.lon);  // Get current weather
        }
    } else {
        alert("Location not available. Please allow location access.");
    }
}

// Function to fetch current weather data from OpenWeatherMap API
function fetchCurrentWeather(latitude, longitude) {
    const apiKey = '4fb33bce49ef9d94bba072c08df1596f';  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description;
                const temperature = data.main.temp;
                const cityName = data.name;

                document.getElementById("weather-output").innerHTML = `The current weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`;
                const weatherMessage = `The current weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`;
                responsiveVoice.speak(weatherMessage, "UK English Male");
            } else {
                console.error("Error fetching weather data:", data.message);
                alert("Failed to retrieve weather data.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("There was an error fetching the weather.");
        });
}

// Function to fetch 5-day weather forecast data from OpenWeatherMap API
function fetchForecast(latitude, longitude) {
    const apiKey = '4fb33bce49ef9d94bba072c08df1596f';  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "200") {
                const tomorrowForecast = data.list[8]; // Index for 24 hours later (adjust based on time)

                const weatherDescription = tomorrowForecast.weather[0].description;
                const temperature = tomorrowForecast.main.temp;
                const cityName = data.city.name;

                document.getElementById("weather-output").innerHTML = `The weather tomorrow in ${cityName} will be ${weatherDescription} with a temperature of ${temperature}°C.`;
                const weatherMessage = `The weather tomorrow in ${cityName} will be ${weatherDescription} with a temperature of ${temperature}°C.`;
                responsiveVoice.speak(weatherMessage, "UK English Male");
            } else {
                console.error("Error fetching weather forecast:", data.message);
                alert("Failed to retrieve weather forecast.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather forecast:", error);
            alert("There was an error fetching the weather forecast.");
        });
}

// Function to request voice (speech recognition) permission
function requestVoicePermission() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;  // Keep recognition running continuously
    recognition.lang = 'en-US';  // Set language to English

    // Event when speech recognition starts
    recognition.onstart = () => {
        isListening = true;
        console.log("Help Buddy is now listening...");
    };

    // Event when recognition gets a result
    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log("Recognized phrase:", transcript);
        handleSpeechRecognition(transcript);
    };

    // Error handling for speech recognition
    recognition.onerror = (error) => {
        console.error("Speech recognition error:", error);

        // Handle specific error types
        if (error.error === 'no-speech') {
            console.log("No speech detected. Retrying...");
        } else if (error.error === 'audio-capture') {
            console.log("Audio capture failed. Please check your microphone.");
        } else if (error.error === 'not-allowed') {
            console.log("Permission denied for speech recognition.");
        }

        // Restart recognition in case of error, except for 'not-allowed' error
        if (error.error !== 'not-allowed') {
            recognition.start();
        }
    };

    // Event when recognition stops (either due to errors or natural end)
    recognition.onend = () => {
        if (isListening) {
            console.log("Recognition ended. Restarting...");
            recognition.start();  // Automatically restart recognition to keep listening
        }
    };

    // Start the speech recognition process
    recognition.start();
}

// Function to stop listening if needed
function stopListening() {
    if (recognition) {
        isListening = false;
        recognition.stop();
        console.log("Help Buddy stopped listening.");
    }
}

// Function to request location permission and save user location
function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            userLocation = { lat: latitude, lon: longitude }; // Save user location
            localStorage.setItem("locationPermissionGranted", true);
            localStorage.setItem("userLocation", JSON.stringify(userLocation));
            console.log(`Location granted: Lat: ${latitude}, Lon: ${longitude}`);
        }, (error) => {
            console.error("Location permission error:", error);

            alert("Location access is required for weather functionality.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Overlay click to start permissions and initial greeting
function handleOverlayClick() {
    console.log("Overlay clicked - initiating permission requests.");
    requestVoicePermission();
    speakResponse("Press enter to give your geolocation")
    requestLocationPermission();
    document.getElementById("permissionOverlay").style.display = "none";
    const initialGreeting = `${getTimeBasedGreeting()}, I'm your help buddy. How can I assist you today?`;
    responsiveVoice.speak(initialGreeting, "UK English Male");
}
function handleCalculatorCommand(command) {
    const calcResultElement = document.getElementById("calc-result");
    voicePermissionGranted = true;

    // Normalize the command by replacing different variations of operations with symbols
    command = command
        .replace(/add|plus|sum|and|together|in addition/g, "+")          // For addition
        .replace(/subtract|minus|less|take away|deduct/g, "-")            // For subtraction
        .replace(/times|multiply|product|by|multiplied|multiplied by|times as much|of|times more|multiplied by|multiplied with|multiplied wit|multiplied into|times as|x/g, "*")  // For multiplication
        .replace(/divide|divided by|over|into|per/g, "/");                // For division

    // Clean up some unnecessary phrases that may be included in the command
    command = command.replace(/^(calculate|how much is|what is|what's|find out|what’s)/, '').trim();

    // Handle large number units (million, billion, etc.)
    if (/million|billion|trillion|quadrillion|quintillion/.test(command)) {
        command = command.replace(/(\d+)(\s+)(million|billion|trillion|quadrillion|quintillion)/g, (match, p1, p2, p3) => {
            return (parseInt(p1) * convertLargeNumbers(p3)).toString();
        });
    }

    console.log("Normalized command:", command);

    // Match numbers (including decimals) and operators (+, -, *, /)
    const numbers = command.match(/(\d+(\.\d+)?)/g);  // Match numbers
    const operator = command.match(/[+\-*/]/);        // Match operators

    // If the command contains two numbers and no operator, perform simple addition
    if (numbers && numbers.length >= 2 && !operator) {
        let result = parseFloat(numbers[0]) + parseFloat(numbers[1]);
        calcResultElement.textContent = `Result: ${numbers[0]} + ${numbers[1]} = ${result}`;

        if (voicePermissionGranted) {
            responsiveVoice.speak("The result is " + result, "UK English Male");
        }
        return;
    }

    // Handle invalid input (less than 2 numbers or missing operator)
    if (!numbers || numbers.length < 2 || !operator) {
        calcResultElement.textContent = "Error";
        if (voicePermissionGranted) {
            responsiveVoice.speak("I'm sorry, I couldn't understand that. Please try again.", "UK English Male");
        }
        return;
    }

    // Parse the first and second numbers
    const num1 = parseFloat(numbers[0]);
    const num2 = parseFloat(numbers[1]);

    let result;

    // Perform the operation based on the operator found
    if (operator[0] === "+") {
        result = num1 + num2;
    } else if (operator[0] === "-") {
        result = num1 - num2;
    } else if (operator[0] === "*") {
        result = num1 * num2;
    } else if (operator[0] === "/") {
        result = num2 === 0 ? "Error (divide by zero)" : num1 / num2;
    }

    // Display the result
    calcResultElement.textContent = `Result: ${num1} ${operator[0]} ${num2} = ${result}`;

    // Speak the result if voice permission is granted
    if (voicePermissionGranted) {
        responsiveVoice.speak("The result is " + result, "UK English Male");
    }
}


function isCalculatorDisplayed() {
    const calculatorElement = document.getElementById("calculator");
    return calculatorElement && calculatorElement.style.display !== "none";
}

function toggleCalculator(show) {
    const calculatorElement = document.getElementById("calculator");
    if (show) {
        calculatorElement.style.display = "block";
    } else {
        calculatorElement.style.display = "none";
    }
}


/** PLANNER SECTION */

// Start the note creation process
function startNoteCreation() {
    // Only start if a note process is not already active
    if (!isNoteProcessActive) {
        isNoteProcessActive = true;  // Mark the note creation process as active
        isCreatingNote = false;  // Reset the creating note flag to ensure proper flow
        speakResponse("Ok! let's see,...");
    }
}

// Function to handle the note creation process
function handleNoteCreationProcess(recognizedPhrase) {
    if (recognitionActive) {  // Ensure that recognition only happens when it's active
        if (isNoteProcessActive && !isCreatingNote) {
            isCreatingNote = true;
            speakResponse("What would you like to note down?"); // Ask for note content
            return;
        }

        // Step 1: Collect note content
        if (!isNoteSaved && !noteDetails.content) {
            // If no note content is set yet, use the recognized phrase
            noteDetails.content = recognizedPhrase.trim();
            speakResponse(`You said: "${noteDetails.content}". Is that correct?`);
            return;
        }

        // Step 2: Confirm the note content (when recognized phrase is "yes" or "no")
        if (!isNoteSaved) {
            if (recognizedPhrase.toLowerCase().includes("yes")) {
                // If user confirms, save the note
                speakResponse("Note content confirmed.");
                const currentDate = new Date();
                noteDetails.date = currentDate.toLocaleDateString();
                noteDetails.time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                saveNoteToLocalStorage(noteDetails);  // Save to local storage
                displayNotes();  // Update notes display
                isNoteSaved = true;
                //askForDateAndTime(); // Optionally ask for date and time
                return;
            } else if (recognizedPhrase.toLowerCase().includes("no")) {
                // If user says no, reset content and start over
                noteDetails.content = '';  // Reset note content
                speakResponse("Okay, let's start over. What is the note about?");
                return;
            }
        }
    }
}
// Function to ask the user if they want to set the date and time
function askForDateAndTime() {
    isDateTimeRequested = true;
    speakResponse("Do you want to set a date and time for this note? Say 'yes' or 'no'.");
}

// Function to handle the response from the user regarding date and time
function handleDateAndTimeResponse(recognizedPhrase) {
    if (recognizedPhrase.includes("yes")) {
        speakResponse("Please say the date and time you want to set for this note.");
        return;
    } else if (recognizedPhrase.includes("no")) {
        speakResponse("Your note is finalized without a date and time.");
        isDateTimeRequested = false;
        return;
    }
}

// Function to capture and update the date and time
function captureDateAndTime(recognizedPhrase) {
    // Check if the recognized phrase is a date and time (e.g., "second November 10:30")
    const dateTimePattern = /\b(\d{1,2})(st|nd|rd|th)?\s+([a-zA-Z]+)\s+(\d{1,2}:\d{2}|\d{1,2}:\d{2}\s?(AM|PM)?)\b/;
    const match = recognizedPhrase.match(dateTimePattern);

    if (match) {
        // Extract and format the date and time
        const day = match[1];
        const month = match[3];
        const time = match[4];

        // Here, you can add logic to convert "second November" to an actual date format
        const date = `${day} ${month}`;
        updateNoteDateAndTime(date, time);

        speakResponse(`The date and time for your note has been set to ${date} at ${time}.`);
        isDateTimeRequested = false;
        return;
    } else {
        // If no valid date/time is provided, finalize the note
        speakResponse("Your note is finalized without a date and time.");
        isDateTimeRequested = false;
    }
}

// Function to update the note with date and time
function updateNoteDateAndTime(date, time) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    const noteIndex = notes.findIndex(note => note.id === noteDetails.id);
    if (noteIndex !== -1) {
        notes[noteIndex].date = date;
        notes[noteIndex].time = time;
        localStorage.setItem('notes', JSON.stringify(notes)); // Save the updated array
        displayNotes(); // Refresh the displayed notes
    }
}
// Function to save the note to localStorage
function saveNoteToLocalStorage(note) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Assign a unique ID to the note
    note.id = notes.length + 1;
    notes.push(note); // Add the new note to the array
    localStorage.setItem('notes', JSON.stringify(notes)); // Save the updated array back to localStorage
}

// Function to display all notes from localStorage
function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    const notesList = notes.map(note => {
        return `
            <li style="margin-bottom: 15px;">
                <p>
                    <strong>Note #${note.id}:</strong><br>
                    <strong>Content:</strong> ${note.content}<br>
                    <strong>Date:</strong> ${note.date}<br>
                    <strong>Time:</strong> ${note.time}
                </p>
                <button onclick="editNote(${note.id})">Edit</button>
            </li>
        `;
    }).join('');

    document.getElementById('organizer-output').innerHTML = notesList;
}

// Initially load and display all notes when the page is loaded
window.onload = function () {

    displayNotes(); // Display any existing notes from localStorage when the page loads
};

