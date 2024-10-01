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

firebase.initializeApp(firebaseConfig);

const taskKey = localStorage.getItem("taskEdit");

// Reference the Firebase database
firebase.database().ref('task-details-form/' + taskKey).on('value', (snapshot) => {
    let taskDetails = snapshot.val();

    document.getElementById('task-key').value = taskKey;
    document.getElementById('name-of-task').value = taskDetails.taskName || '';
    document.getElementById('description-of-task').value = taskDetails.taskDescription || '';
    document.getElementById('type-of-task').value = taskDetails.taskType || '';
    document.getElementById('priority-of-task').value = taskDetails.taskPriority || '';

    const storyPointValue = taskDetails.taskStoryPoint || 0;
    document.getElementById('story-point-range').value = storyPointValue;
    document.getElementById('story-point-of-task').innerHTML = storyPointValue;

    document.getElementById('project-stage-of-task').value = taskDetails.taskProjectStage || '';
    document.getElementById('tag-of-task').value = taskDetails.taskTag || '';
    updateDropDown(taskDetails.assigneeSelected);
});

// Clear any previous error messages
const clearErrorMessages = () => {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('error-message').innerHTML = '';

    let formFields = document.querySelectorAll('.form-row input, .form-row select');
    formFields.forEach(field => {
        field.classList.remove('error');
    });
};

// Show error messages using popup
const showPopUpErrors = (errors) => {
    let container = document.querySelector('.form-container')

    const popupBox = document.createElement('div');
    popupBox.classList.add('popup');

    //create the <h2> tag for Error Message title
    const titleShow = document.createElement('h2');
    titleShow.textContent = 'Error Message';
    titleShow.classList.add('popup-h2')

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
document.getElementById('done-button').addEventListener('click', function(event) 
{
    event.preventDefault();

    // Clear previous error messages
    clearErrorMessages();

    // Get values from the form fields
    let taskName = document.getElementById("name-of-task").value.trim();
    let taskDescription = document.getElementById("description-of-task").value.trim();
    let taskType = document.getElementById("type-of-task").value.toLowerCase().trim();
    let taskPriority = document.getElementById("priority-of-task").value.toLowerCase().trim();
    let taskStoryPoint = document.getElementById("story-point-of-task").innerHTML;
    let taskProjectStage = document.getElementById("project-stage-of-task").value.toLowerCase().trim();
    let taskTag = document.getElementById("tag-of-task").value.toLowerCase().trim();
    let assigneeSelected = document.getElementById("assignees-of-task").value;
    let assigneeDropDown = document.getElementById("assignees-of-task");
    let assigneeID = assigneeDropDown.options[assigneeDropDown.selectedIndex].id;

    let formValid = true;
    let errors = [];

    // Validate Task Name (it should not be empty)
    if (taskName === "") {
        errors.push("Task Name cannot be empty.");
        document.getElementById("name-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Task Description (it should not be empty)
    if (taskDescription === "") {
        errors.push("Description cannot be empty.");
        document.getElementById("description-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Task Type
    const validTaskTypes = ["user story", "bug"];
    if (!validTaskTypes.includes(taskType)) {
        errors.push("Task Type must be 'user story' or 'bug'.");
        document.getElementById("type-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Priority
    const validPriorities = ["low", "medium", "important", "urgent"];
    if (!validPriorities.includes(taskPriority)) {
        errors.push("Priority must be 'low', 'medium', 'important', or 'urgent'.");
        document.getElementById("priority-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Story Point
    const storyPointNumber = parseInt(taskStoryPoint);
    if (isNaN(storyPointNumber) || storyPointNumber < 1 || storyPointNumber > 10) {
        errors.push("Story Point must be a number between 1 and 10.");
        document.getElementById("story-point-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Project Stage
    const validStages = ["planning", "development", "testing", "integration"];
    if (!validStages.includes(taskProjectStage)) {
        errors.push("Project Stage must be 'planning', 'development', 'testing', or 'integration'.");
        document.getElementById("project-stage-of-task").classList.add("error");
        formValid = false;
    }

    // Validate Tags (can be comma-separated)
    const validTags = ["front-end", "back-end", "api", "ui/ux", "framework", "testing", "database"];
    const taskTagsArray = taskTag.split(",").map(tag => tag.trim());
    for (let tag of taskTagsArray) {
        if (!validTags.includes(tag)) {
            errors.push("Tags must be one or more of: 'front-end', 'back-end', 'API', 'UI/UX', 'framework', 'testing', or 'database'.");
            document.getElementById("tag-of-task").classList.add("error");
            formValid = false;
            break;
        }
    }

    // Validate Assignee - Ensure a person is selected
    if (assigneeSelected === "") {
        errors.push("You must select an assignee.");
        document.getElementById("assignees-of-task").classList.add("error");
        formValid = false;
    }

    // If there are errors, show them at the top
    if (!formValid) 
    {
        showPopUpErrors(errors);
    } 
    else 
    {
        // If the form is valid, save the data
        const updatedTask = {
            taskName: taskName,
            taskDescription: taskDescription,
            taskType: taskType,
            taskPriority: taskPriority,
            taskStoryPoint: taskStoryPoint,
            taskProjectStage: taskProjectStage,
            taskTag: taskTag,
            assigneeSelected: assigneeSelected,
            assigneeID: assigneeID
        };

        let taskInSprint = true;
        let taskSprint = "";

        firebase.database().ref('task-details-form/' + taskKey).once('value', (snapshot) => 
        {
            let taskDetails = snapshot.val();

            taskInSprint = taskDetails.inSprint;

            if (taskInSprint) 
            {
                taskSprint = taskDetails.sprintID;
            }

            firebase.database().ref('task-details-form/' + taskKey).update(updatedTask, function(error) 
            {
                if (error) 
                {
                    console.error('Error updating task:', error);
                } 
                else 
                {
                    alert("Task edited successfully!");

                    if (taskInSprint) 
                    {
                        const sprintID = taskSprint;
                        const sprintTaskDB = firebase.database().ref(`sprints/${sprintID}/task-details-form`);
                        sprintTaskDB.child(taskKey).update(updatedTask); 
                    }

                    window.history.back();
                }
            });
        });

    }
});

let teamMembersDB = firebase.database().ref('team-members').once('value');

// function to update the team members in the dropdown
function updateDropDown(assigneeSelected){
    const dropdown = document.getElementById("assignees-of-task");
    
    // get the team members from the database
    teamMembersDB.then((snapshot) => {
        let teamMembers = snapshot.val();

        if (teamMembers){
            Object.keys(teamMembers).forEach((key) => {
                let teamMember = teamMembers[key];
                let option = document.createElement("option");
                option.id = key;
                option.value = teamMember.memberName;
                option.textContent = teamMember.memberName; 
                option.selected = (teamMember.memberName === assigneeSelected);

                dropdown.appendChild(option);
            });
        }
    }).catch((error) => {
        console.error("Error fetching team members:", error);
    });
}

