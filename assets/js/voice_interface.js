// Global variables for speech recognition
let recognition;
let isListening = false;
let isProcessing = false; // Flag to indicate if an operation is in progress
 // Global variable to store the current expression in the calculator
 let currentExpression = "";

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

 // Handle voice commands for the calculator
 function handleSpeechRecognition(transcript) {
     // Simple calculator commands: number and operators
     if (transcript.includes("add")) {
         appendOperator('+');
     } else if (transcript.includes("subtract")) {
         appendOperator('-');
     } else if (transcript.includes("multiply")) {
         appendOperator('*');
     } else if (transcript.includes("divide")) {
         appendOperator('/');
     } else if (transcript.includes("clear")) {
         clearDisplay();
     } else if (transcript.includes("equals") || transcript.includes("calculate")) {
         calculateResult();
     } else {
         // Recognize numbers in speech
         const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
         const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
         for (let i = 0; i < numbers.length; i++) {
             if (transcript.includes(numbers[i])) {
                 appendNumber(i.toString());
             }
         }
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


// Function to handle recognized speech and respond
function handleSpeechRecognition(transcript) {
    // If an operation is in progress, suppress fallback response
    if (isProcessing) {
        console.log("Help Buddy: Currently processing, no fallback needed.");
        return;
    }

    // Check if greeting keyword exists and respond with time-based greeting
    if (transcript.includes("hello") || transcript.includes("hi") || transcript.includes("hey")) {
        const greeting = `${getTimeBasedGreeting()}! How can I assist you today?`;
        responsiveVoice.speak(greeting, "UK English Male");
        console.log(`Help Buddy: ${greeting}`);
        return;
    }

    // Handle general weather queries
    if (transcript.includes("weather")) {
        if (transcript.includes("tomorrow") || transcript.includes("next day") || transcript.includes("tomorrow's weather")) {
            const weatherTomorrowMessage = "Let me fetch the weather forecast for tomorrow.";
            responsiveVoice.speak(weatherTomorrowMessage, "UK English Male");
            console.log(`Help Buddy: ${weatherTomorrowMessage}`);
            getWeather('forecast'); // Fetch forecast for tomorrow
        } else {
            getWeather('current'); // Fetch current weather
        }
        return;
    }

    // Check for "thank you" in the transcript and respond with "You're welcome"
    if (transcript.includes("thank you") || transcript.includes("thanks")) {
        const thankYouResponse = "You're welcome!";
        responsiveVoice.speak(thankYouResponse, "UK English Male");
        console.log(`Help Buddy: ${thankYouResponse}`);
        return;
    }

    // Handle other questions
    for (const [question, answer] of Object.entries(questionAnswerPairs)) {
        if (transcript.includes(question)) {
            responsiveVoice.speak(answer, "UK English Male");
            console.log(`Help Buddy Answer: ${answer}`);
            return;
        }
    }

    // Default response if no match is found
    const fallbackResponse = "I'm here to help! Could you please clarify your request?";
    responsiveVoice.speak(fallbackResponse, "UK English Male");
    console.log(`Help Buddy Fallback: ${fallbackResponse}`);
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
