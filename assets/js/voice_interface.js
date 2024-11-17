// Global variables for speech recognition
let recognition;
let isListening = false;
let isProcessing = false;
let fallbackTriggered = false;

let currentExpression = "";
let isStandbyMode = false;
let lastSpokenPhrase = "";
let recognitionActive = true;
let noteDetails = {
    content: '',
    date: '',
    time: '',
    remind: false,
    id: null // Adding ID to noteDetails
};
let notes = []; 
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


// Function to speak a response and manage listening state
function speakResponse(responseText) {
    console.log("Response Text:", responseText);

    // Disable recognition while the assistant speaks
    recognitionActive = false;

    // Use responsiveVoice to speak the response
    responsiveVoice.speak(responseText, "UK English Male", {
        onstart: () => {
            recognitionActive = false;  // Ensure recognition is off when assistant starts speaking
            console.log("Assistant is speaking...");
        },
        onend: () => {
            // Re-enable recognition after the assistant finishes speaking
            recognitionActive = true;  // Reactivate recognition once speaking is done
            console.log("Assistant finished speaking. Listening again...");
            // Restart recognition after speaking
            if (recognition && !recognitionActive) {
                recognition.start();  // Ensure recognition starts again after speaking
            }
        }
    });

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

    if (isCreatingNote) {
        if (noteDetails.content === '') {
            noteDetails.content = recognizedPhrase; // First input is assumed to be the note content
            const currentDate = new Date();
            noteDetails.date = currentDate.toLocaleDateString();
            noteDetails.time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            noteDetails.id = Date.now(); // Unique ID based on the timestamp
    
            speakResponse("Got it. Do you want to add a reminder to this note?");
        } else if (recognizedPhrase.includes("yes") && !noteDetails.remind) {
            noteDetails.remind = true;
            noteDetails.step = 'askDay'; // Start with asking for the day
            speakResponse("What day of the month should I set the reminder for?");
        } else if (noteDetails.remind) {
            // Handle each step of the reminder setup
            if (noteDetails.step === 'askDay') {
                const day = parseInt(recognizedPhrase, 10);
                if (!isNaN(day) && day > 0 && day <= 31) {
                    noteDetails.reminderDay = day;
                    noteDetails.step = 'askMonth';
                    speakResponse("Got it. What month?");
                } else {
                    speakResponse("I didn't catch that. Please provide a valid day of the month.");
                }
            } else if (noteDetails.step === 'askMonth') {
                const month = parseInt(recognizedPhrase, 10);
                if (!isNaN(month) && month > 0 && month <= 12) {
                    noteDetails.reminderMonth = month - 1; // Months are zero-based in JavaScript Date
                    noteDetails.step = 'askYear';
                    speakResponse("Got it. What year?");
                } else {
                    speakResponse("I didn't catch that. Please provide a valid month number between 1 and 12.");
                }
            } else if (noteDetails.step === 'askYear') {
                const year = parseInt(recognizedPhrase, 10);
                if (!isNaN(year) && year >= new Date().getFullYear()) {
                    noteDetails.reminderYear = year;
                    noteDetails.step = 'askHour';
                    speakResponse("Got it. What hour?");
                } else {
                    speakResponse("I didn't catch that. Please provide a valid year.");
                }
            } else if (noteDetails.step === 'askHour') {
                const hour = parseInt(recognizedPhrase, 10);
                if (!isNaN(hour) && hour >= 0 && hour <= 23) {
                    noteDetails.reminderHour = hour;
                    noteDetails.step = 'askMinute';
                    speakResponse("Got it. What minute?");
                } else {
                    speakResponse("I didn't catch that. Please provide a valid hour between 0 and 23.");
                }
            } else if (noteDetails.step === 'askMinute') {
                const minute = parseInt(recognizedPhrase, 10);
                if (!isNaN(minute) && minute >= 0 && minute <= 59) {
                    noteDetails.reminderMinute = minute;
    
                    // Construct the final reminder date and time
                    noteDetails.reminderDateTime = new Date(
                        noteDetails.reminderYear,
                        noteDetails.reminderMonth,
                        noteDetails.reminderDay,
                        noteDetails.reminderHour,
                        noteDetails.reminderMinute
                    ).toISOString();
    
                    // Save and finalize the note
                    isCreatingNote = false;
                    saveNoteToLocalStorage({ ...noteDetails });
                    displayNotes();
                    speakResponse(`Your note has been saved with a reminder on ${new Date(noteDetails.reminderDateTime).toLocaleString()}.`);
                    console.log("Note created with reminder:", noteDetails);
                } else {
                    speakResponse("I didn't catch that. Please provide a valid minute between 0 and 59.");
                }
            }
        } else if (recognizedPhrase.includes("no")) {
            noteDetails.remind = false;
            isCreatingNote = false; // Note creation process ends
            saveNoteToLocalStorage({ ...noteDetails });
            speakResponse(`Your note has been saved: "${noteDetails.content}" on ${noteDetails.date} at ${noteDetails.time}.`);
            console.log("Note created:", noteDetails);
        } else {
            speakResponse("I didn't catch that. Please say 'yes' to add a reminder or 'no' to skip it.");
        }
        return;
    }
    
    const notesKeywords = [
        "show me notes",
        "read notes",
        "get my notes",
        "what are my notes",
        "my notes for today",
        "show me my reminders",
        "what are my reminders",
        "tell me my notes",
        "tell me my reminders",
        "reminders for today",
        "plans for today",
        "do I have any reminders",
        "do I have any notes",
        "what are my plans for today",
        "reminder list",
        "show me my plans",
        "what's on my schedule today",
        "what do I have planned for today",
        "are there any reminders today",
        "do I have notes or reminders",
        "do I have anything scheduled today",
        "do I have any tasks for today",
        "what's on my to-do list",
        "what should I do today",
        "tell me my schedule for today",
        "any plans for today",
        "do I have any tasks",
        "reminder for today",
        "what's planned for today",
        "is there anything planned for today",
        "show my to-do list",
        "remind me what I have today",
        "give me a list of notes",
        "do I have anything to remember",
        "what's on my agenda today"
    ];
    

// Check if the recognized phrase matches any of the "brief me" related commands
if (notesKeywords.some(keyword => recognizedPhrase.includes(keyword))) {
    giveMeNotes(); 
    return;
}

// Trigger note creation mode
if (
    recognizedPhrase.includes("create a note") ||
    recognizedPhrase.includes("start a note") ||
    recognizedPhrase.includes("make a note") ||
    recognizedPhrase.includes("write a note") ||
    recognizedPhrase.includes("add a note") ||
    recognizedPhrase.includes("take a note") ||
    recognizedPhrase.includes("set a note") ||
    recognizedPhrase.includes("jot down a note") ||
    recognizedPhrase.includes("add a reminder") ||
    recognizedPhrase.includes("set a reminder") ||
    recognizedPhrase.includes("create a reminder") ||
    recognizedPhrase.includes("make a reminder") ||
    recognizedPhrase.includes("add a plan") ||
    recognizedPhrase.includes("make a plan") ||
    recognizedPhrase.includes("create a plan") ||
    recognizedPhrase.includes("set a plan") ||
    recognizedPhrase.includes("make note") ||
    recognizedPhrase.includes("write down a plan") ||
    recognizedPhrase.includes("create a task") ||
    recognizedPhrase.includes("add a task") ||
    recognizedPhrase.includes("set a task") ||
    recognizedPhrase.includes("write down a reminder") ||
    recognizedPhrase.includes("plan for today") ||
    recognizedPhrase.includes("set my plans") ||
    recognizedPhrase.includes("schedule a note") ||
    recognizedPhrase.includes("create the note") ||
    recognizedPhrase.includes("start the note") ||
    recognizedPhrase.includes("make the note") ||
    recognizedPhrase.includes("write the note") ||
    recognizedPhrase.includes("add the note") ||
    recognizedPhrase.includes("take the note") ||
    recognizedPhrase.includes("set the note") ||
    recognizedPhrase.includes("jot down the note") ||
    recognizedPhrase.includes("add the reminder") ||
    recognizedPhrase.includes("set the reminder") ||
    recognizedPhrase.includes("create the reminder") ||
    recognizedPhrase.includes("make the reminder") ||
    recognizedPhrase.includes("add the plan") ||
    recognizedPhrase.includes("make the plan") ||
    recognizedPhrase.includes("create the plan") ||
    recognizedPhrase.includes("set the plan") ||
    recognizedPhrase.includes("write down the plan") ||
    recognizedPhrase.includes("set the plans") ||
    recognizedPhrase.includes("schedule the note")
   
) {
    isCreatingNote = true; // Enter note creation mode
    noteDetails = {
        content: '',
        date: '',
        time: '',
        remind: false,
        id: null
    }; // Reset note details
    speakResponse("Sure, what would you like to note down?");
    return;
}

// Handle other commands (e.g., reading notes)
if (
    recognizedPhrase.includes("show notes") ||
    recognizedPhrase.includes("list notes") ||
    recognizedPhrase.includes("read my notes")
) {
    if (notes.length === 0) {
        speakResponse("You don't have any saved notes.");
    } else {
        const notesSummary = notes
            .map((note, index) => `Note ${index + 1}: ${note.content}, recorded on ${note.date} at ${note.time}. Reminder: ${note.remind ? "Yes" : "No"}.`)
            .join(" ");
        speakResponse(`Here are your notes: ${notesSummary}`);
        console.log("Notes list:", notes);
    }
    return;
}

// Handle greetings
if (recognizedPhrase.includes("hello") || recognizedPhrase.includes("hi") || recognizedPhrase.includes("hey")) {
    recognitionActive = false; // Pause recognition while speaking
    const greeting = `${getTimeBasedGreeting()}! How can I assist you today?`;
    
    speakResponse(greeting);

    // Resume recognition after speaking
    setTimeout(() => {
        recognitionActive = false;
        console.log("Recognition reactivated after greeting.");
    }, 2000); // Adjust timeout duration to match speaking time
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


if (recognizedPhrase.includes("need instructions") || recognizedPhrase.includes("need help") || recognizedPhrase.includes("give me instructions")) {
    // Provide a prompt with examples of common tasks
    speakResponse("Sure! I can help with several things. You can ask me to: \n" +
        "- Make a note or reminder\n" +
        "- Show your existing notes or reminders\n" +
        "- Check the current weather or tomorrow's weather\n" +
        "- Open the calculator\n" +
        "- Help with scheduling or setting reminders\n" +
        "- Show today's date or time\n" 
    );
    
    return; // Wait for the user’s response at this point
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
    recognitionActive = true;  // Mark recognition as inactive
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


function requestVoicePermission() {
    // Check if SpeechRecognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;  // Keeps listening for commands until stopped
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
        if (error.error !== 'not-allowed') {
            recognition.start();  // Restart recognition if it fails (except for "not-allowed")
        }
    };

    recognition.onend = () => {
        if (recognitionActive) {
            console.log("Recognition ended. Restarting...");
            recognition.start();  // Restart recognition if needed
        }
    };

    // Start recognition only if it's not already active
    if (recognition && recognition.state !== "active") {
        recognition.start();
        console.log("SpeechRecognition started.");
    }
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
// Function to get weather for the current location or forecast
async function getWeatherForBriefing(type) {
    if (userLocation.lat && userLocation.lon) {
        console.log("Fetching weather for Latitude: " + userLocation.lat + " Longitude: " + userLocation.lon);

        // Fetch the current weather or forecast based on the type
        if (type === 'forecast') {
            return fetchForecast(userLocation.lat, userLocation.lon);  // Get forecast (assumes a promise-returning function)
        } else {
            return fetchCurrentWeather(userLocation.lat, userLocation.lon);  // Get current weather (assumes a promise-returning function)
        }
    } else {
        alert("Location not available. Please allow location access.");
        return null; // Return null if no location
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




function saveNoteToLocalStorage(note) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Assign a unique ID to the note
    note.id = notes.length + 1;
    notes.push(note); // Add the new note to the array
    localStorage.setItem('notes', JSON.stringify(notes)); // Save the updated array back to localStorage
}

// Function to display all notes dynamically
function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || []; // Retrieve notes from localStorage or initialize an empty array

    // Get current date and start/end of today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Filter and sort notes
    const notesForToday = notes.filter(note => {
        if (note.reminderDateTime) {
            const reminderDate = new Date(note.reminderDateTime);
            return reminderDate >= startOfDay && reminderDate < endOfDay;
        }
        return false;
    });

    const otherNotesWithReminders = notes.filter(note => {
        if (note.reminderDateTime) {
            const reminderDate = new Date(note.reminderDateTime);
            return reminderDate < startOfDay || reminderDate >= endOfDay;
        }
        return false;
    });

    const notesWithoutReminders = notes.filter(note => !note.reminderDateTime);

    // Function to render notes as list items
    const renderNotes = (notesGroup, groupTitle) => {
        if (notesGroup.length === 0) return ''; // Skip empty groups
        return `
            <h3>${groupTitle}</h3>
            <ul class="notes-list">
                ${notesGroup.map(note => `
                    <li style="margin-bottom: 15px; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
                        <p>
                            <strong>Note #${note.id}:</strong><br>
                            <strong>Content:</strong> ${note.content}<br>
                            <strong>Created on:</strong> ${note.date} at ${note.time}<br>
                            ${note.reminderDateTime ? `<strong>Reminder:</strong> ${new Date(note.reminderDateTime).toLocaleString()}<br>` : ''}
                        </p>
                        <button onclick="editNote(${note.id})" style="margin-right: 10px;">Edit</button>
                        <button onclick="deleteNote(${note.id})">Delete</button>
                    </li>
                `).join('')}
            </ul>
        `;
    };

    // Combine the notes groups into the organizer output
    const organizerOutput = `
        ${renderNotes(notesForToday, 'Reminders for Today')}
        ${renderNotes(otherNotesWithReminders, 'Upcoming Reminders')}
        ${renderNotes(notesWithoutReminders, 'Notes without Reminders')}
    `;

    // Update the DOM
    document.getElementById('organizer-output').innerHTML = organizerOutput || '<p>No notes available. Create one to get started!</p>';
}
// Function to delete a note
function deleteNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const updatedNotes = notes.filter(note => note.id !== noteId); // Remove the note with the matching ID
    localStorage.setItem('notes', JSON.stringify(updatedNotes)); // Save the updated notes array back to localStorage
    displayNotes(); // Refresh the notes list
}

// Initially load and display all notes when the page is loaded
window.onload = function () {

    displayNotes(); 
};

function giveMeNotes() {
    // Retrieve notes from localStorage
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Get current date and start/end of today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Function to format time (e.g., 2:30 PM)
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;  // Convert 24-hour time to 12-hour
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;  // Add leading zero for minutes
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    // Filter notes for today that have reminders
    const notesForToday = notes.filter(note => {
        if (note.reminderDateTime) {
            const reminderDate = new Date(note.reminderDateTime);
            return reminderDate >= startOfDay && reminderDate < endOfDay;
        }
        return false;
    });

    // Process reminders: If any, speak them, otherwise tell the user no reminders.
    let reminderText;
    if (notesForToday.length > 0) {
        // Map over notes and include formatted reminder time
        reminderText = `You have reminders for today: `;
        reminderText += notesForToday.map(note => {
            const reminderDate = new Date(note.reminderDateTime);
            const formattedTime = formatTime(reminderDate);
            return `${note.content} at ${formattedTime}`;
        }).join(", ");
        reminderText += ".";
    } else {
        reminderText = "You have no reminders for today.";
    }

    // Log the reminder text for debugging
    console.log("Reminder Text: " + reminderText);

    // Speak the reminder text (assuming speakResponse is defined elsewhere)
    speakResponse(reminderText);  // Assuming speakResponse function exists for speech output
}


function checkRemindersForToday() {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];  // Retrieve notes from localStorage
    const today = new Date().toDateString();  // Get today's date in string format (YYYY-MM-DD)

    // Filter notes that have a reminder and match today's date
    const todaysReminders = notes.filter(note => {
        // Ensure that `note.date` is correctly parsed into a Date object
        const noteDate = new Date(note.date).toDateString();  // Convert reminder date into string format

        // Log date comparison for debugging
        console.log(`Comparing note date: ${noteDate} with today's date: ${today}`);

        // Check if the reminder's date matches today and if `remind` is true
        return note.remind && noteDate === today;  
    }).map(note => note.content); // Map to extract just the content of the reminders

    return todaysReminders;  // Return today's reminders
}