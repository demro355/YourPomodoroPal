let tasks = []

//update time retrieves data from chrome storage local then
//updates timer with remaining time. 
/*textContent updates the HTML element with id "time" 
and the textContent property of the startTimerBtn element updates the button text. */
function updateTime() {
    chrome.storage.local.get(["timer", "timeOption", "isRunning"], (res) => {
        const time = document.getElementById("time")
        const minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(2, "0")
        let seconds = "00"
        if (res.timer % 60 != 0) {
            seconds = `${60 - res.timer % 60}`.padStart(2, "0")
        }
        time.textContent = `${minutes}:${seconds}`
        startTimerBtn.textContent = res.isRunning ? "Pause Timer" : "Start Timer"
    })
}

/*set interval update time calls the updateTime() function every 
1000 milliseconds (1 second), causing the timer to update in real-time.*/
updateTime()
setInterval(updateTime, 1000)

/* startTimerBtn is a reference to the "Start Timer" button in HTML.
The code sets an event listener on this button, so that once clicked, 
the function inside the listener is executed. 
This function uses Chrome local storage to toggle the state of the timer 
between running and paused, and updates the text of the button to reflect the new state.*/
const startTimerBtn = document.getElementById("start-timer-btn")
startTimerBtn.addEventListener("click", () => {
    chrome.storage.local.get(["isRunning"], (res) => {
        chrome.storage.local.set({
            isRunning: !res.isRunning,
        }, () => {
            startTimerBtn.textContent = !res.isRunning ? "Pause Timer" : "Start Timer"
        })
    })
})

/*The resetTimerBtn variable refers to the HTML button element with ID "reset-timer-btn".
It then adds a click event listener to the button that resets the timer 
and sets the isRunning flag to false in Chrome local storage when clicked.
It then updates the text content of the start timer button to "Start Timer". */
const resetTimerBtn = document.getElementById("reset-timer-btn")
resetTimerBtn.addEventListener("click", () => {
    chrome.storage.local.set({
        timer: 0,
        isRunning: false,
    }, () => {
        startTimerBtn.textContent = "Start Timer"
    })
})

const addTaskBtn = document.getElementById("add-task-btn")
addTaskBtn.addEventListener("click", () => addTask())

chrome.storage.sync.get(["tasks"], (res) => {
    tasks = res.tasks ? res.tasks : []
    renderTasks()
})

function saveTasks() {
    chrome.storage.sync.set({
        tasks,
    })
}

function renderTask(taskNum) {
    const taskRow = document.createElement("div")

    const text = document.createElement("input")
    text.type = "text"
    text.placeholder = "Enter a task..."
    text.value = tasks[taskNum]
    text.className = "task-input"
    text.addEventListener("change", () => {
        tasks[taskNum] = text.value
        saveTasks()
    })

    const deleteBtn = document.createElement("input")
    deleteBtn.type = "button"
    deleteBtn.value = "X"
    deleteBtn.className = "task-delete"
    deleteBtn.addEventListener("click", () => {
        deleteTask(taskNum)
    })

    taskRow.appendChild(text)
    taskRow.appendChild(deleteBtn)

    const taskContainer = document.getElementById("task-container")
    taskContainer.appendChild(taskRow)
}

function addTask() {
    const taskNum = tasks.length
    tasks.push("")
    renderTask(taskNum)
    saveTasks()
}

function deleteTask(taskNum) {
    tasks.splice(taskNum, 1)
    renderTasks()
    saveTasks()
}

function renderTasks() {
    const taskContainer = document.getElementById("task-container")
    taskContainer.textContent = ""
    tasks.forEach((taskText, taskNum) => {
        renderTask(taskNum)
    })
}

const timeOption = document.getElementById("time-option")
timeOption.addEventListener("change", (event) => {
    const val = event.target.value
    if (val < 1 || val > 60) {
        timeOption.value = 25
    }
})

const saveBtn = document.getElementById("save-btn")
saveBtn.addEventListener("click", () => {
    chrome.storage.local.set({
        timer: 0,
        timeOption: timeOption.value,
        isRunning: false,
    })
})

chrome.storage.local.get(["timeOption"], (res) => {
    timeOption.value = res.timeOption
})

const startBtn = document.getElementById("start-timer-btn")
startBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({action: "startTimer"})
})

const stopBtn = document.getElementById("stop-timer-btn")
stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({action: "stopTimer"})
})

const resetBtn = document.getElementById("reset-timer-btn")
resetBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({action: "resetTimer"})
})
