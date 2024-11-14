// Global variable to track if permission for responsiveVoice has been granted
let voicePermissionGranted = true;

// Function to start speech recognition, called once by user action
function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    // Request permission for responsiveVoice if not granted yet
    if (!voicePermissionGranted) {
        responsiveVoice.speak("I'm listening. Please state your calculation.", "UK English Male");
        voicePermissionGranted = true; // Set flag to true after first call
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Recognized command:", transcript);
        handleCalculatorCommand(transcript);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = function() {
        console.log("Stopped listening.");
        recognition.start(); // Restart listening automatically
    };

    recognition.start();
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

window.onload = function() {
    startListening(); // Start listening automatically
};
