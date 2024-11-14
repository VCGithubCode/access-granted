// Global variables for speech recognition
let recognition;
let isListening = false;

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
    "time": "I can tell you the current time. Just ask 'what's the time?'",
    "date": "I can tell you today's date. Just ask 'what's the date?'"
};

// Function to handle recognized speech and respond
function handleSpeechRecognition(transcript) {
    // Check if greeting keyword exists and respond with time-based greeting
    if (transcript.includes("hello") || transcript.includes("hi") || transcript.includes("hey")) {
        const greeting = `${getTimeBasedGreeting()}! How can I assist you today?`;
        responsiveVoice.speak(greeting, "UK English Male");
        console.log(`Help Buddy: ${greeting}`);
        return;
    }

    // Check for "weather" in the transcript and get weather if location permission exists
    if (transcript.includes("weather")) {
        getWeather();
        return;
    }

    // Check for "thank you" in the transcript and respond with "You're welcome"
    if (transcript.includes("thank you") || transcript.includes("thanks")) {
        const thankYouResponse = "You're welcome!";
        responsiveVoice.speak(thankYouResponse, "UK English Male");
        console.log(`Help Buddy: ${thankYouResponse}`);
        return;
    }

    // Check for other questions in the transcript and respond accordingly
    for (const [question, answer] of Object.entries(questionAnswerPairs)) {
        if (transcript.includes(question)) {
            responsiveVoice.speak(answer, "UK English Male");
            console.log(`Help Buddy Answer: ${answer}`);
            return;
        }
    }

    // Ignore unclear statements and prevent unnecessary clarification
    if (transcript.trim().length === 0 || transcript.includes("it's you, don't hear buddy")) {
        // Do nothing for these cases, or add a custom message if needed
        console.log("Help Buddy: No clarification needed.");
        return;
    }

    // Default response if no match is found
    const fallbackResponse = "I'm here to help! Could you please clarify your request?";
    responsiveVoice.speak(fallbackResponse, "UK English Male");
    console.log(`Help Buddy Fallback: ${fallbackResponse}`);
}

// Function to get weather for the current location
function getWeather() {
    if (userLocation.lat && userLocation.lon) {
        console.log("Fetching weather for Latitude: " + userLocation.lat + " Longitude: " + userLocation.lon);
        fetchWeather(userLocation.lat, userLocation.lon);  // Use stored location if available
    } else {
        alert("Location not available. Please allow location access.");
    }
}

// Function to fetch weather data from OpenWeatherMap API
function fetchWeather(latitude, longitude) {
    const apiKey = '4fb33bce49ef9d94bba072c08df1596f';  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description;
                const temperature = data.main.temp;
                const cityName = data.name;

                // Display weather information
                const weatherMessage = `The current weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`;
                document.getElementById("weather-output").innerHTML = weatherMessage;

                // Speak the weather information
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

// Function to request voice (speech recognition) permission
function requestVoicePermission() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        console.log("Help Buddy is now listening...");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log("Recognized phrase:", transcript);
        handleSpeechRecognition(transcript);
    };

    recognition.onerror = (error) => {
        console.error("Speech recognition error:", error);
        stopListening();
    };

    recognition.onend = () => {
        if (isListening) recognition.start(); // Restart for continuous listening
    };

    // Start recognition
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
    requestLocationPermission();
    document.getElementById("permissionOverlay").style.display = "none";
    const initialGreeting = `${getTimeBasedGreeting()}, I'm your help buddy. How can I assist you today?`;
    responsiveVoice.speak(initialGreeting, "UK English Male");
}
