let recognition;
let isListening = false;
let hasLocationPermission = false;
let userLocation = { lat: null, lon: null };  // To store the user's location

// Function to initialize and start speech recognition
function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    const listenButton = document.getElementById("listenButton");
    listenButton.textContent = "Listening...";
    listenButton.classList.add("listening");

    // Provide audio feedback to user
    responsiveVoice.speak("I am listening. Please say a command like 'Calculator', 'Weather', 'Time', etc.", "UK English Male");

    // Check if location is already stored in localStorage
    if (!hasLocationPermission) {
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
            // If location exists in localStorage, use it
            userLocation = JSON.parse(storedLocation);
            hasLocationPermission = true;
            console.log("Using stored location:", userLocation);
            startSpeechRecognition();  // Continue with speech recognition
        } else {
            requestLocationPermission();  // Request location permission if not stored
        }
    } else {
        startSpeechRecognition();  // Start speech recognition if permission already granted
    }
}

// Function to request geolocation permission
function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            userLocation = { lat: latitude, lon: longitude };
            hasLocationPermission = true; // Mark location permission as granted

            // Store the location in localStorage
            localStorage.setItem('userLocation', JSON.stringify(userLocation));

            console.log("Location granted and stored:", userLocation);

            // Start speech recognition after location permission is granted
            startSpeechRecognition();
        }, function(error) {
            console.error("Geolocation error:", error);
            alert("Could not get your location. Please allow location access.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to initialize and start speech recognition
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        isListening = true;
        console.log("Listening...");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized command:", transcript);
        handleVoiceCommand(transcript);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
        stopListening();
        alert("Sorry, there was an error. Please try again.");
    };

    recognition.onend = function() {
        isListening = false;
        stopListening();
    };

    recognition.start();
}

// Function to stop listening and reset button state
function stopListening() {
    const listenButton = document.getElementById("listenButton");
    listenButton.textContent = "Start Listening";
    listenButton.classList.remove("listening");
}

// Handle voice commands based on the spoken text
function handleVoiceCommand(command) {
    const outputElement = document.getElementById("output");

    if (command.includes("calculator")) {
        window.location.href = "calculator.html";  // Redirect to calculator.html
    } else if (command.includes("weather")) {
        getWeather(); // Fetch and speak the weather
    } else if (command.includes("time")) {
        navigateTo('time');
    } else if (command.includes("planner")) {
        window.location.href = "planner.html";  // Redirect to planner.html
    } else if (command.includes("reminder")) {
        window.location.href = "reminder.html";  // Redirect to reminder.html
    } else {
        outputElement.innerHTML = "Command not recognized. Please try again.";
        responsiveVoice.speak("Command not recognized. Please try again.", "UK English Male");
    }
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

// Ask if the user needs more help and listen again
function listenAgain() {
    responsiveVoice.speak("Can I assist you with anything else?", "UK English Male");
    startListening(); // Continue listening for additional commands
}
