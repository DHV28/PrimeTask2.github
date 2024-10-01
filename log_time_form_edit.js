// Task details variables
const taskName = document.getElementById("name-of-task");
const taskDescription = document.getElementById("description-of-task");
const taskType = document.getElementById("type-of-task");
const taskPriority = document.getElementById("priority-of-task");
const taskStoryPointRange = document.getElementById("story-point-range");
const taskStoryPoint = document.getElementById("story-point-of-task");
const taskProjectStage = document.getElementById("project-stage-of-task");
const taskTag = document.getElementById("tag-of-task");
const taskAssignees = document.getElementById("assignees-of-task");
const taskTimeHr = document.getElementById("log-time-hr");
const taskTimeMin = document.getElementById("log-time-min");
const taskAccumulatedHr = document.getElementById("accumulated-time-hr");
const taskAccumulatedMin = document.getElementById("accumulated-time-min");
let assigneeID = "";
let dailyAccumulatedHr = "";
let dailyAccumulatedMin = "";
let sprintID = ""
let memberDailyHr = ""
let memberDailyMin = ""
let memberHr = ""
let memberMin = ""

// Retrieve the target task card key
const retrievedDetails = localStorage.getItem("taskEdit")

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

// Reference the Firebase database
let primeTaskDB = firebase.database().ref('task-details-form/' + retrievedDetails).once('value');

primeTaskDB.then((snapshot) => {
    let value = snapshot.val()
    
    taskName.value = value.taskName
    taskDescription.value = value.taskDescription
    taskType.value = value.taskType
    taskPriority.value = value.taskPriority
    taskStoryPointRange.value = value.taskStoryPoint
    taskStoryPoint.innerHTML = value.taskStoryPoint
    taskProjectStage.value = value.taskProjectStage
    taskTag.value = value.taskTag
    taskAssignees.value = value.assigneeSelected
    taskAccumulatedHr.innerText = value.taskAccumulatedHr
    taskAccumulatedMin.innerText = value.taskAccumulatedMin
    sprintID = value.sprintID
    assigneeID = value.assigneeID

    updateDropDown(value.assigneeSelected);
})


function updateDropDown(assigneeSelected)
{
    const dropdown = document.getElementById("assignees-of-task");
    let teamMembersDB = firebase.database().ref('team-members').once('value');
     
     // get the team members from the database
    teamMembersDB.then((snapshot) => 
    {
        let teamMembers = snapshot.val();

        // loop through the team members and add them as options
        Object.keys(teamMembers).forEach((key) => {
            let teamMember = teamMembers[key];
            let option = document.createElement("option");

            option.id = key;
            option.value = teamMember.memberName;
            option.textContent = teamMember.memberName; 
            option.selected = (teamMember.memberName === assigneeSelected);
 
            dropdown.appendChild(option);
        });
    }).catch((error) => {
        console.error("Error fetching team members:", error);
    });
}

// function for adding time for Accumulated Time
function addTime(newHour,newMinute,accHour=0,accMinute=0) 
{
    newHour=Number(newHour)
    newMinute=Number(newMinute)
    accHour=Number(accHour)
    accMinute=Number(accMinute)

    accHour+=newHour
    accMinute+=newMinute

    if (accMinute>=60) {
        accHour+=Math.floor(accMinute/60)
        accMinute%=60
    }

    return [accHour, accMinute]
}

// function to get today's date
function getDate() 
{
    const date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let currentDate = `${year}-${month}-${day}`
    return currentDate
}

// Clear any previous error messages
const clearErrorMessages = () => 
{
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

    clearErrorMessages();

    // Get values from the form fields
    let taskName = document.getElementById("name-of-task").value.trim();
    let taskDescription = document.getElementById("description-of-task").value.trim();
    let taskType = document.getElementById("type-of-task").value.toLowerCase().trim();
    let taskPriority = document.getElementById("priority-of-task").value.toLowerCase().trim();
    let taskStoryPoint = document.getElementById("story-point-of-task").innerHTML;
    let taskProjectStage = document.getElementById("project-stage-of-task").value.toLowerCase().trim();
    let taskTag = document.getElementById("tag-of-task").value.toLowerCase().trim();
    let taskAssignees = document.getElementById("assignees-of-task").value;
    let taskTimeHr = document.getElementById("log-time-hr").value.trim();
    let taskTimeMin = document.getElementById("log-time-min").value.trim();
    let taskAccumulatedHr = document.getElementById("accumulated-time-hr").innerText;
    let taskAccumulatedMin = document.getElementById("accumulated-time-min").innerText;
    let assigneeDropDown = document.getElementById("assignees-of-task");
    assigneeID = assigneeDropDown.options[assigneeDropDown.selectedIndex].id;

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

    // // Validate Story Point
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
    if (taskAssignees === "") {
        errors.push("You must select an assignee.");
        document.getElementById("assignees-of-task").classList.add("error");
        formValid = false;
    }

    // Validate log time - ensure valid hours and minutes are entered
    if (taskTimeHr === "") {
        errors.push("You must enter a number for Hours. Minimum is 0.");
        document.getElementById("accumulated-time-hr").classList.add("error");
        formValid = false;
    }

    if (Number(taskTimeHr) < 0) {
        errors.push("Hours must be at least 0.");
        document.getElementById("accumulated-time-hr").classList.add("error");
        formValid = false;
    }

    if (taskTimeMin === "") {
        errors.push("You must enter a number for Minutes. Minimum is 0. Maximum is 59.")
        document.getElementById("accumulated-time-min").classList.add("error");
        formValid = false;
    }

    if (Number(taskTimeMin) < 0) {
        errors.push("Minutes must be at least 0.")
        document.getElementById("accumulated-time-min").classList.add("error");
        formValid = false;
    }

    if (Number(taskTimeMin) > 59) {
        errors.push("Minutes must be at most 59.")
        document.getElementById("accumulated-time-min").classList.add("error");
        formValid = false;
    }

    // If there are errors, show them at the top
    if (!formValid) {
        showPopUpErrors(errors);
    } else {
        let logTimeDBTest =  firebase.database().ref('log-time-dates').once('value');

        logTimeDBTest.then((snapshot) => {
            snapshot.forEach((memberStore) => {
                memberStore.forEach((timeStore) => {
                const memberData = memberStore.val();
                const dateToCheck = getDate();
                let value = timeStore.val();

                if (memberData[dateToCheck]) {
                    dailyAccumulatedHr = Number(value.dailyAccumulatedHr);
                    dailyAccumulatedMin = Number(value.dailyAccumulatedMin);
                } else {
                    dailyAccumulatedHr = taskTimeHr;
                    dailyAccumulatedMin = taskTimeMin;
                }
                });
            });
        });

        let memberTime = firebase.database().ref('team-members/' + assigneeID).once('value')

        memberTime.then((snapshot) => {
            let value = snapshot.val()

            memberHr = value.memberAccumulatedHr
            memberMin = value.memberAccumulatedMin
            memberDailyHr = value.dailyAccumulatedHr
            memberDailyMin = value.dailyAccumulatedMin

            const newTime = addTime(taskTimeHr, taskTimeMin, taskAccumulatedHr, taskAccumulatedMin)
            const newMemberTime = addTime(taskTimeHr, taskTimeMin, memberHr, memberMin)
            const newDailyTime = addTime(taskTimeHr, taskTimeMin, memberDailyHr, memberDailyMin)

            // If the form is valid, save the data
            const updatedTask = {
                taskName: taskName,
                taskDescription: taskDescription,
                taskType: taskType,
                taskPriority: taskPriority,
                taskStoryPoint: taskStoryPoint,
                taskProjectStage: taskProjectStage,
                taskTag: taskTag,
                assigneeSelected: taskAssignees,
                assigneeID: assigneeID,
                taskTimeHr: Number(taskTimeHr),
                taskTimeMin: Number(taskTimeMin),
                taskAccumulatedHr: Number(newTime[0]),
                taskAccumulatedMin: Number(newTime[1])
            };

            const updatedMember = {
                memberTimeHr: Number(taskTimeHr),
                memberTimeMin: Number(taskTimeMin),
                memberAccumulatedHr: Number(newMemberTime[0]),
                memberAccumulatedMin: Number(newMemberTime[1]),
                dailyAccumulatedHr: Number(newDailyTime[0]),
                dailyAccumulatedMin: Number(newDailyTime[1])
            }

            const updatedMemberDate = {
                assigneeName: taskAssignees,
                memberTimeHr: Number(taskTimeHr),
                memberTimeMin: Number(taskTimeMin),
                memberAccumulatedHr: Number(newMemberTime[0]),
                memberAccumulatedMin: Number(newMemberTime[1]),
                dailyAccumulatedHr: Number(newDailyTime[0]),
                dailyAccumulatedMin: Number(newDailyTime[1])
            }

            // Update Firebase
            firebase.database().ref('task-details-form/' + retrievedDetails).update(updatedTask, function(error) {
                if (error) {
                    console.error('Error updating task:', error);
                } else {
                    firebase.database().ref('team-members/' + assigneeID).update(updatedMember, function(error) {
                        if (error) {
                            console.error('Error updating member:', error);
                        } else {
                            firebase.database().ref('log-time-dates/'+ assigneeID +'/'+ getDate()).update(updatedMemberDate, function(error) {
                                if (error) {
                                    console.error('Error updating dated time log:', error);
                                } else {
                                    firebase.database().ref('sprints/' + sprintID + '/task-details-form/' + retrievedDetails).update(updatedTask, function(error){
                                        if (error){
                                            console.error('Error updating sprints:', error);
                                        } else{
                                            alert("Task edited successfully!");
                                            window.location.href = "sprint_backlog.html";
                                        }
                                    })
                                
                                }
                            })
                        }
                    });
                
                
                }
            });
        })

    }
});
