// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCSzTbYhygkAEratuYSLjziC8dAHxm_0kM",
    authDomain: "primetask-3b148.firebaseapp.com",
    databaseURL: "https://primetask-3b148-default-rtdb.firebaseio.com",
    projectId: "primetask-3b148",
    storageBucket: "primetask-3b148.appspot.com",
    messagingSenderId: "914891090322",
    appId: "1:914891090322:web:832ef0efe1205b8f33f94b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}

// Get task details elements
const taskName = document.getElementById("name-of-task");
const taskDescription = document.getElementById("description-of-task");
const taskType = document.getElementById("type-of-task");
const taskPriority = document.getElementById("priority-of-task");
const taskStoryPoint = document.getElementById("story-point-of-task");
const taskProjectStage = document.getElementById("project-stage-of-task");
const taskTag = document.getElementById("tag-of-task");
const taskAssignees = document.getElementById("assignees-of-task");
const taskStatus = document.getElementById("status-of-task");

document.addEventListener('DOMContentLoaded', function () {
    const doneButton = document.getElementById('done-button');

    // When done button is clicked, save the task details
    doneButton.addEventListener('click', saveTaskDetails);

    // Load task details from Firebase
    loadTaskDetails();
});

// Retrieve the target task card key
const retrievedDetails = localStorage.getItem("taskDetails");

function loadTaskDetails() {
    // Check if the retrievedDetails exists
    if (!retrievedDetails) {
        console.error("No task key found in localStorage.");
        alert("No task selected.");
        return;
    }

    // Fetch task details from Firebase using the task key
    firebase.database().ref('task-details-form/' + retrievedDetails).once('value').then((snapshot) => {
        const value = snapshot.val();

        // Check if any task data is returned
        if (!value) {
            console.error("No task found with the provided key.");
            alert("Task details not found.");
            return;
        }

        // Populate the form with task details
        taskName.value = value.taskName || ""; // Use empty string if undefined
        taskDescription.value = value.taskDescription || "";
        taskType.value = value.taskType || "";
        taskPriority.value = value.taskPriority || "";
        taskStoryPoint.value = value.taskStoryPoint || "";
        taskProjectStage.value = value.taskProjectStage || "";
        taskTag.value = value.taskTag || "";
        taskStatus.value = value.status || "N/A"; 

        // Populate the assignees dropdown
        updateDropDown(value.assigneeID);

    }).catch((error) => {
        console.error("Error fetching task details:", error);
        alert("Error retrieving task details.");
    });
}

// Update the assignees dropdown with team members
function updateDropDown(assigneeSelected) {
    const dropdown = document.getElementById("assignees-of-task");

    // Reference the Firebase database for team members
    firebase.database().ref('team-members').once('value').then(snapshot => {
        const members = snapshot.val();

        // Clear any existing options in the dropdown
        dropdown.innerHTML = "";

        // Loop through team members and create an option for each
        Object.keys(members).forEach(memberId => {
            const option = document.createElement('option');
            option.value = memberId;  // Store the member ID as the value
            option.text = members[memberId].memberName;  // Display the member's name

            // If the current member is the assignee, set it as selected
            if (memberId === assigneeSelected) {
                option.selected = true;
            }

            dropdown.appendChild(option);
        });

    }).catch(error => {
        console.error("Error fetching team members:", error);
    });
}

// Function to save task details when "Done" button is clicked
function saveTaskDetails() {
    let assigneeSelected = document.getElementById("assignees-of-task").value;
    const assigneeName = taskAssignees.options[taskAssignees.selectedIndex].text;

    const updatedTask = {
        taskName: taskName.value,
        taskDescription: taskDescription.value,
        taskType: taskType.value,
        taskPriority: taskPriority.value,
        taskStoryPoint: taskStoryPoint.value,
        taskProjectStage: taskProjectStage.value,
        taskTag: taskTag.value,
        assigneeID: assigneeSelected,  // Update assigneeID
        assigneeSelected: assigneeName // Update the assignee's name
    };

    // Update Firebase
    firebase.database().ref('task-details-form/' + retrievedDetails).update(updatedTask, function(error) {
        if (error) {
            console.error('Error updating task:', error);
        } else {
            console.log("Task updated successfully in Firebase.");
            showConfirmationPopup();
        }
    });
}

// Function to show a confirmation popup
function showConfirmationPopup() 
{
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.textContent = 'Assignee updated successfully!';

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove(); // Remove popup after 3 seconds
    }, 3000);
}
