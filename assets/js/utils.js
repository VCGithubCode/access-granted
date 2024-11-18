let currentDate = new Date();

// Function to update the calendar view
function updateCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Set the calendar title
    document.getElementById("calendar-title").textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    // Get the first day of the month and the number of days in the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Generate the days in the calendar
    let daysHTML = '';
    let day = 1;

    // Add empty boxes for days of the previous month if the month doesn't start on Sunday
    for (let i = 0; i < startingDay; i++) {
        daysHTML += `<div class="day-box disabled"></div>`;
    }

    // Add the days of the current month
    for (let i = startingDay; i < 7; i++) {
        daysHTML += `<div class="day-box" data-day="${day}">${day}</div>`;
        day++;
    }

    while (day <= daysInMonth) {
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            daysHTML += `<div class="day-box" data-day="${day}">${day}</div>`;
            day++;
        }
    }

    // Add the generated days to the calendar
    document.getElementById("days-container").innerHTML = daysHTML;

    // Highlight the current day
    const currentDayElement = document.querySelector(`.day-box[data-day="${currentDate.getDate()}"]`);
    if (currentDayElement) {
        currentDayElement.classList.add("current-day");
    }

    // Add event listeners for day clicks
    const dayBoxes = document.querySelectorAll('.day-box');
    dayBoxes.forEach(dayBox => {
        dayBox.addEventListener('click', function () {
            if (!this.classList.contains('disabled')) {
                alert(`Selected date: ${this.getAttribute('data-day')} ${currentDate.toLocaleString('default', { month: 'long' })} ${year}`);
            }
        });
    });
}

// Event listeners for navigating between months
document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});
// Function to check if location data is available in localStorage and fetch weather
function checkStoredLocationAndDisplayWeather() {
    const locationPermissionGranted = localStorage.getItem("locationPermissionGranted") === "true";

    if (locationPermissionGranted) {
        // Get stored location from localStorage
        const storedLocation = JSON.parse(localStorage.getItem("userLocation"));

        if (storedLocation && storedLocation.lat && storedLocation.lon) {
            // Call the function to fetch and display the weather
            getWeather(storedLocation.lat, storedLocation.lon);
        } else {
            alert("Location not available in storage.");
        }
    } else {
        alert("Location permission is not granted.");
    }
}

// Function to get weather for the stored location
function getWeather(lat, lon) {
    const apiKey = '4fb33bce49ef9d94bba072c08df1596f';  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    // Fetch current weather data from OpenWeatherMap API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description;
                const temperature = data.main.temp;
                const cityName = data.name;

                // Display the weather data on the page
                document.getElementById("displayed-weather").innerHTML =
                    `The current weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`;

                // Optional: Use responsiveVoice to speak the weather message
                const weatherMessage = `The current weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`;

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

// Call the function to check stored location and display weather
checkStoredLocationAndDisplayWeather();
// Function to update current time every second
function updateTime() {
    const timeElement = document.getElementById("current-time");
    setInterval(() => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = `Current Time: ${formattedTime}`;
    }, 1000);
}

// Function to update current time every second
function updateTime() {
    const timeElement = document.getElementById("current-time");
    setInterval(() => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = `Current Time: ${formattedTime}`;
    }, 1000);
}


// Initialize the calendar on page load
updateCalendar();
updateTime();

document.addEventListener('DOMContentLoaded', () => {
    const instructionsContainer = document.getElementById('instructions-container');
    const toggleButton = document.getElementById('toggle-instructions-btn');
    
    // Initially hide the instructions container
    instructionsContainer.style.display = 'none';
    
    // Add click event to toggle visibility
    toggleButton.addEventListener('click', () => {
        if (instructionsContainer.style.display === 'none') {
            instructionsContainer.style.display = 'flex'; // Show instructions
        } else {
            instructionsContainer.style.display = 'none'; // Hide instructions
        }
    });

    // Attach event listeners to speak buttons

});