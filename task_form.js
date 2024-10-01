// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSzTbYhygkAEratuYSLjziC8dAHxm_0kM",
    authDomain: "primetask-3b148.firebaseapp.com",
    databaseURL: "https://primetask-3b148-default-rtdb.firebaseio.com",
    projectId: "primetask-3b148",
    storageBucket: "primetask-3b148.appspot.com",
    messagingSenderId: "914891090322",
    appId: "1:914891090322:web:832ef0efe1205b8f33f94b",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference your database
let primeTaskDB = firebase.database().ref("task-details-form");

// Save data to Firebase
const saveData = (taskName, taskDescription, taskType, taskPriority, taskStoryPoint, taskProjectStage, taskTag, assigneeSelected, assigneeID) => {
    let newTaskDetailsForm = primeTaskDB.push();

    newTaskDetailsForm.set({
        taskName: taskName,
        taskDescription: taskDescription,
        taskType: taskType,
        taskPriority: taskPriority,
        taskStoryPoint: taskStoryPoint,
        taskProjectStage: taskProjectStage,
        taskTag: taskTag,
        assigneeSelected: assigneeSelected,
        assigneeID: assigneeID,
        status: "Not Started",
        createdTime: Date.now(),
        inSprint: false,
        taskTimeHr: 0,
        taskTimeMin: 0,
        taskAccumulatedHr: 0,
        taskAccumulatedMin: 0
    });
};

// Clear any previous error messages
const clearErrorMessages = () => {
    document.getElementById('error-messages').style.display = 'none';
    document.getElementById('error-messages').innerHTML = '';

    let formFields = document.querySelectorAll('.form-row input, .form-row select');
    formFields.forEach(field => {
        field.classList.remove('error');
    });
};

// Show error messages using pop up
const showPopUpErrors = (errors) => {
    let container = document.querySelector('.form-container')

    const popupBox = document.createElement('div');
    popupBox.classList.add('popup');

    //create the <h2> tag for Error Message title
    const titleShow = document.createElement('h2');
    titleShow.textContent = 'Error Message';
    titleShow.classList.add('popup-h2');

    //create the <ul> tag
    let totalErrors = document.createElement('ul')
    errors.forEach((error) => {
        let li = document.createElement('li');
        li.textContent = error;

        totalErrors.appendChild(li);
    })

    // Create the <button> element for closing pop up
    const button = document.createElement('button');
    button.classList.add('popup-button');
    button.textContent = 'Ok';
    button.addEventListener('click',(e) => {
        popupBox.remove()
    })

    popupBox.appendChild(titleShow);
    popupBox.appendChild(totalErrors);
    popupBox.appendChild(button)

    container.appendChild(popupBox);

};

// Form Validation and Submission
document.getElementById('done-button').addEventListener('click', function(event) {
    event.preventDefault();

    // Clear previous error messages
    clearErrorMessages();

    // Get values from the form fields
    let taskName = document.getElementById("task-name").value.trim();
    let taskDescription = document.getElementById("description").value.trim();
    let taskType = document.getElementById("task-type").value.toLowerCase().trim();
    let taskPriority = document.getElementById("priority").value.toLowerCase().trim();
    let taskStoryPoint = document.getElementById("story-point").innerHTML;
    let taskProjectStage = document.getElementById("project-stage").value.toLowerCase().trim();
    let taskTag = document.getElementById("tag").value.toLowerCase().trim();
    let assigneeSelected = document.getElementById("select-name").value;
    let assigneeDropDown = document.getElementById("select-name");
    let assigneeID = assigneeDropDown.options[assigneeDropDown.selectedIndex].id;

    let formValid = true;
    let errors = [];

    // Validate Task Name (it should not be empty)
    if (taskName === "") {
        errors.push("Task Name cannot be empty.");
        document.getElementById("task-name").classList.add("error");
        formValid = false;
    }

    // Validate Task Description (it should not be empty)
    if (taskDescription === "") {
        errors.push("Description cannot be empty.");
        document.getElementById("description").classList.add("error");
        formValid = false;
    }

    // Validate Task Type
    const validTaskTypes = ["user story", "bug"];
    if (!validTaskTypes.includes(taskType)) {
        errors.push("Task Type must be 'user story' or 'bug'.");
        document.getElementById("task-type").classList.add("error");
        formValid = false;
    }

    // Validate Priority
    const validPriorities = ["low", "medium", "important", "urgent"];
    if (!validPriorities.includes(taskPriority)) {
        errors.push("Priority must be 'low', 'medium', 'important', or 'urgent'.");
        document.getElementById("priority").classList.add("error");
        formValid = false;
    }

    // Validate Story Point
    const storyPointNumber = parseInt(taskStoryPoint);
    if (isNaN(storyPointNumber) || storyPointNumber < 1 || storyPointNumber > 10) {
        errors.push("Story Point must be a number between 1 and 10.");
        document.getElementById("story-point").classList.add("error");
        formValid = false;
    }

    // Validate Project Stage
    const validStages = ["planning", "development", "testing", "integration"];
    if (!validStages.includes(taskProjectStage)) {
        errors.push("Project Stage must be 'planning', 'development', 'testing', or 'integration'.");
        document.getElementById("project-stage").classList.add("error");
        formValid = false;
    }

    // Validate Tags (can be comma-separated)
    const validTags = ["front-end", "back-end", "api", "ui/ux", "framework", "testing", "database"];
    const taskTagsArray = taskTag.split(",").map(tag => tag.trim());
    for (let tag of taskTagsArray) {
        if (!validTags.includes(tag)) {
            errors.push("Tags must be one or more of: 'front-end', 'back-end', 'API', 'UI/UX', 'framework', 'testing', or 'database'.");
            document.getElementById("tag").classList.add("error");
            formValid = false;
            break;
        }
    }

    // Validate Assignee - Ensure a person is selected
    if (assigneeSelected === "") {
        errors.push("You must select an assignee.");
        document.getElementById("select-name").classList.add("error");
        formValid = false;
    }

    // If there are errors, show them at the top
    if (!formValid) {
        showPopUpErrors(errors);
    } else {
        // If the form is valid, save the data
        saveData(taskName, taskDescription, taskType, taskPriority, taskStoryPoint, taskProjectStage, taskTag, assigneeSelected, assigneeID);
        alert("Task saved successfully!");
        window.location.href = "product_backlog.html";
    }
});

// reference to team members in the database
let teamMembersDB = firebase.database().ref('team-members')//.once('value');


// function to update the team members in the dropdown
function updateDropDown(){
    const dropdown = document.getElementById("select-name");

    
    // get the team members from the database
    teamMembersDB.on("value",(snapshot) => {
        let teamMembers = snapshot.val();

        if (teamMembers) {

            // remove old options
            dropdown.innerHTML = '<option value="" disabled selected>Select name</option>';

            // loop through the team members and add them as options
            Object.keys(teamMembers).forEach((key) => {
                let teamMember = teamMembers[key];
                let option = document.createElement("option");
                option.id = key;
                // option.value = key;
                option.value = teamMember.memberName;
                //option.textContent = key;
                option.textContent = teamMember.memberName; 
                dropdown.appendChild(option);
            });
        }
        
    }).catch((error) => {
        console.error("Error fetching team members:", error);
    });
}

document.addEventListener("DOMContentLoaded", updateDropDown);
