// Global variables for speech recognition
let recognition;
let isListening = false;
let isProcessing = false;
let fallbackTriggered = false;
let currentExpression = "";
let isStandbyMode = false;
let lastSpokenPhrase = ""; 
let recognitionActive = false;
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

function speakResponse(responseText) {
    // Log the response text being spoken
    console.log("Response Text:", responseText);

    // Log the last spoken phrase before speaking the new response
    console.log("Last Spoken Phrase:", lastSpokenPhrase);

    // Use responsiveVoice to speak the response
    responsiveVoice.speak(responseText, "UK English Male", {
        onstart: () => {
            // Update lastSpokenPhrase at the start of speaking
            lastSpokenPhrase = responseText; 
        },
    });

    // Log that the response has been spoken
    console.log(`Help Buddy Response: ${responseText}`);
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
        "hey buddy, let's go","hi buddy",
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
        recognizedPhrase.includes("see you")
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
         recognizedPhrase.includes("what's") || 
         recognizedPhrase.includes("what’s") || 
         recognizedPhrase.includes("calculate for") ||
         recognizedPhrase.includes("do the math") ||
         recognizedPhrase.includes("solve") ||
         recognizedPhrase.includes("find the result") ||
         recognizedPhrase.includes("what's the answer") ||
         recognizedPhrase.includes("tell me the result")) &&
        isCalculatorDisplayed()
    ) {
        handleCalculatorCommand(recognizedPhrase);
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
    responsiveVoice.speak("System is now in standby mode. Please say 'wake up' to reactivate.", "UK English Male");
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
    
    responsiveVoice.speak("System is now active. Please say a command.", "UK English Male");
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
// Handle calculator commands, using the flag to avoid repeat permissions
function handleCalculatorCommand(command) {
    const calcResultElement = document.getElementById("calc-result");
    voicePermissionGranted = true
    command = command
        .replace(/add|plus|sum|and|together|in addition/g, "+")
        .replace(/subtract|minus|less|take away|deduct/g, "-")
        .replace(/multiply|times|product|by|multiplied|times as much|of|times more|multiplied by|multiplied with|double/g, "*")
        .replace(/divide|divided by|over|into|per/g, "/");

    command = command.replace(/^(calculate|how much is|what is|what's|find out|what’s)/, '').trim();

    if (/million|billion|trillion|quadrillion|quintillion/.test(command)) {
        command = command.replace(/(\d+)(\s+)(million|billion|trillion|quadrillion|quintillion)/g, (match, p1, p2, p3) => {
            return (parseInt(p1) * convertLargeNumbers(p3)).toString();
        });
    }

    console.log("Normalized command:", command);

    const numbers = command.match(/(\d+(\.\d+)?)/g);
    const operator = command.match(/[+\-*/]/);

    if (numbers && numbers.length >= 2 && !operator) {
        let result = parseFloat(numbers[0]) + parseFloat(numbers[1]);
        calcResultElement.textContent = `Result: ${numbers[0]} + ${numbers[1]} = ${result}`;

        if (voicePermissionGranted) {
            voicePermissionGranted = true
            responsiveVoice.speak("The result is " + result, "UK English Male");
        }
        return;
    }

    if (!numbers || numbers.length < 2 || !operator) {
        calcResultElement.textContent = "Error";
        if (voicePermissionGranted) {
            responsiveVoice.speak("I'm sorry, I couldn't understand that. Please try again.", "UK English Male");
        }
        return;
    }

    const num1 = parseFloat(numbers[0]);
    const num2 = parseFloat(numbers[1]);
    let result;

    if (operator[0] === "+") {
        result = num1 + num2;
    } else if (operator[0] === "-") {
        result = num1 - num2;
    } else if (operator[0] === "*") {
        result = num1 * num2;
    } else if (operator[0] === "/") {
        result = num2 === 0 ? "Error (divide by zero)" : num1 / num2;
    }

    calcResultElement.textContent = `Result: ${num1} ${operator[0]} ${num2} = ${result}`;

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