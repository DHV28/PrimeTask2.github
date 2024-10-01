// Firebase configuration
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

// Retrieve the selected start date and end date
let startDate = localStorage.getItem("startDate");
let endDate = localStorage.getItem("endDate");

// Reference the Firebase database
let teamMemberDB = firebase.database().ref('team-members/');
let taskDB = firebase.database().ref('task-details-form/');
let logDateDB = firebase.database().ref('log-time-dates/');

// Normalize the date to ignore time components
const normalizedDate = (date) => 
{
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Function to calculate average time worked
function calculateAverageTimeWorked(hour, minute, totalDays) 
{
    let averageHour = 0;
    let averageMinute = 0;
    hour = Number(hour);
    minute = Number(minute);
    totalDays = Number(totalDays);

    minute += (hour * 60);
    averageMinute = (minute / totalDays);

    if (averageMinute >= 60) 
    {
        averageHour += Math.floor(averageMinute / 60);
        averageMinute %= 60;
    }

    return [averageHour, averageMinute];
}

// Listen for changes in log-time-dates and process them
logDateDB.on("value", function(snapshot) 
{
    let assignees = snapshot.val();
    let backlogElement = document.getElementById('backlog');
    backlogElement.innerHTML = ''; // Clear existing cards

    if (assignees) 
    {
        let members = Object.keys(assignees);

        members.forEach((key) => 
        {
            let validLogTime = [0, 0, 0]; // hour, minute, totalDays

            firebase.database().ref('log-time-dates/' + key + '/').on("value", function(snapshot) 
            {
                let logDates = snapshot.val();
                
                if (logDates) 
                {
                    let dates = Object.keys(logDates);
                    
                    dates.forEach((date) => 
                    {
                        if (normalizedDate(new Date(date)) >= normalizedDate(new Date(startDate)) &&
                            normalizedDate(new Date(date)) <= normalizedDate(new Date(endDate))) 
                        {
                            validLogTime = [
                                validLogTime[0] + logDates[date].dailyAccumulatedHr,
                                validLogTime[1] + logDates[date].dailyAccumulatedMin,
                                validLogTime[2] + 1
                            ];
                        }
                    });
                }
            });

            if (validLogTime[0] > 0 || validLogTime[1] > 0) 
            {
                createTeamMemberCard(key, validLogTime);
            }
        });
    }
});

// Function to create a team member card with edit and delete buttons
function createTeamMemberCard(key, logTime) 
{
    teamMemberDB.child(key).on("value", function(snapshot) 
    {
        let member = snapshot.val();

        if (member) 
        {
            let memberBox = document.createElement('div');
            memberBox.classList.add('member-box');
            memberBox.id = key;

            let memberInfo = document.createElement('div');
            memberInfo.classList.add('member-info');

            let memberName = document.createElement('span');
            memberName.className = 'member-name';
            memberName.textContent = member.memberName;

            let averageTime = calculateAverageTimeWorked(logTime[0], logTime[1], logTime[2]);
            let averageTimeCalc = document.createElement('span');
            averageTimeCalc.className = 'average-time';
            averageTimeCalc.textContent = `Avg Time/Day: ${averageTime[0]}h ${averageTime[1]}m`;

            let editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-pencil-alt');
            editIcon.addEventListener('click', () => editTeamMember(key, member));

            let actions = document.createElement('div');
            actions.classList.add('actions');

            memberInfo.appendChild(memberName);
            memberInfo.appendChild(averageTimeCalc);

            actions.appendChild(editIcon);
            actions.append(createCrossButton(key));

            memberBox.appendChild(memberInfo);
            memberBox.appendChild(actions);

            document.getElementById('backlog').appendChild(memberBox);
        }
    });
}

// Function to create cross (delete) button
function createCrossButton(key) 
{
    let crossButton = document.createElement('button');
    crossButton.classList.add('btn');
    let crossIcon = document.createElement('i');
    crossIcon.classList.add('fas', 'fa-times', 'cross-icon');
    crossButton.appendChild(crossIcon);

    // Add event listener to load tasks and trigger deletion if applicable
    crossButton.addEventListener('click', () => {

        deletedMember = key
        loadTasksForPopup(key);
    });

    return crossButton;
}

let deletedMember = ""

let doneButton = document.getElementById('done-button');

doneButton.addEventListener('click', (e) => 
{
    e.stopPropagation();  

    taskDB.orderByChild('assigneeID').equalTo(deletedMember).once('value', snapshot => 
    {
        const tasks = snapshot.val();
        
        let activeTask = 0;
        if (tasks) 
        {
            // Display tasks and allow reassignment
            Object.entries(tasks).forEach(([taskId, task]) => 
            {
                const status = task.status;

                if (status != 'Completed') 
                {
                    activeTask = activeTask + 1
                }
            });
        }
        if (activeTask == 0)
        {
            deleteMember(deletedMember); // Delete the member
            popupOverlay.style.display = 'none'; // Close the popup
        }
        else
        {
            alert("There are still tasks need to be assigned.")
        }
    })
});


// Function to load tasks for a team member and check if deletion is possible
function loadTasksForPopup(memberId) 
{
    popupOverlay.style.display = 'block';
    const taskList = document.querySelector('.task-card-list ul');
    taskList.innerHTML = '';

    taskDB.orderByChild('assigneeID').equalTo(memberId).once('value', snapshot => 
    {
        const tasks = snapshot.val();
        
        if (tasks) 
        {
            let activeTask = 0;
            // Display tasks and allow reassignment
            Object.entries(tasks).forEach(([taskId, task]) => 
            {
                const status = task.status;

                if (status != 'Completed') 
                {
                    activeTask = activeTask + 1;
                    const taskCard = createTaskCard(task, taskId);
                    taskList.appendChild(taskCard);
                }
            });
            if (activeTask == 0)
            {
                // No tasks assigned, allow direct deletion
                const noTasksMessage = document.createElement('li');
                noTasksMessage.textContent = 'No tasks assigned to this member.';
                taskList.appendChild(noTasksMessage);
            }
        } 
        else 
        {
            // No tasks assigned, allow direct deletion
            const noTasksMessage = document.createElement('li');
            noTasksMessage.textContent = 'No tasks assigned to this member.';
            taskList.appendChild(noTasksMessage);
        }
    });
}

// Function to reassign tasks to other members
function reassignTasks(memberId, callback) 
{
    taskDB.orderByChild('assigneeID').equalTo(memberId).once('value', snapshot => {
        const tasks = snapshot.val();
        if (tasks) {
            Object.keys(tasks).forEach(taskId => 
            {
                // Assign tasks to a new member or handle reassignment logic
                taskDB.child(taskId).update({ assigneeID: 'newMemberId' }); // Update to new member's ID
            });
        }

        // Once all tasks are reassigned, invoke callback
        callback();
    });

}

// Function to delete the team member
function deleteMember(memberId) 
{
    teamMemberDB.child(memberId).remove()
        .then(() => {
            logDateDB.child(memberId).remove()
                .then(() => {
                    alert('Team member successfully deleted.');
                    popupOverlay.style.display = 'none'; // Close the popup
                })
        })
        .catch(error => {
            console.error('Error deleting team member:', error);
        });
    deletedMember = ""
}



// Function to create task cards dynamically
function createTaskCard(task, taskId) 
{
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');

    taskCard.addEventListener('click', () => 
    {
        localStorage.setItem("taskDetails", taskId);
        window.location.href = `only_edit_assignee.html?taskId=${taskId}`;
    });

    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');
    const taskName = document.createElement('span');
    taskName.className = 'task-name';
    taskName.textContent = task.taskName;

    const taskPriority = document.createElement('span');
    taskPriority.className = `priority ${task.taskPriority.toLowerCase()}`;
    taskPriority.textContent = task.taskPriority.charAt(0).toUpperCase() + task.taskPriority.slice(1);

     // Add horizontal line
    let hr = document.createElement('hr');

    // Define the valid tags and ensure they are displayed in uppercase
    const validTags = ['front-end', 'back-end', 'api', 'ui/ux', 'framework', 'testing', 'database'];
    let taskTags = task.taskTag ? task.taskTag.toLowerCase().split(',').map(tag => tag.trim()) : [];  // Handle multiple tags
 
    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    // Story point
    const storyPoint = document.createElement('p');
    storyPoint.textContent = `Story Point: ${task.taskStoryPoint || 'N/A'}`;

    // Task type
    const taskType = document.createElement('p');
    taskType.textContent = `Type: ${task.taskType || 'General'}`;
    
    taskHeader.appendChild(taskName);
    taskHeader.appendChild(taskPriority);
    taskCard.appendChild(taskHeader);
    taskCard.appendChild(hr);
    taskCard.appendChild(storyPoint);
    taskCard.appendChild(taskType);
    taskCard.appendChild(taskInfo);

    // Task tags (Display only valid tags in uppercase)
    if (taskTags.length > 0 && taskTags[0] !== 'none') 
    {  // CHANGED: Only display tags if they exist and are not 'none'
        let taskTagsElem = document.createElement('p');
        taskTagsElem.innerHTML = 'Tags: ';
 
        taskTags.forEach(tag => {
            let tagElem = document.createElement('span');
            tagElem.className = `tag ${tag.replace(/\//g, '-')}`;  // Sanitize tag classes
 
            // Check if the tag is one of the predefined valid tags, then convert to uppercase
            if (validTags.includes(tag)) 
            {
                tagElem.textContent = tag.toUpperCase();
            } 
            else 
            {
                // If not predefined, still convert to uppercase for display consistency
                tagElem.textContent = tag.toUpperCase();
            }
 
            taskTagsElem.appendChild(tagElem);
            taskTagsElem.innerHTML += ' ';  // Add space between tags
        });
 
        taskCard.appendChild(taskTagsElem);
    }

    return taskCard;
}

// Function to edit a team member
function editTeamMember(key, member) 
{
    const editUrl = `edit_members_form.html?key=${key}&name=${member.memberName}&email=${member.memberEmail}&password=${member.memberPassword}`;
    window.location.href = editUrl;
}

// Popup event listeners
const popupOverlay = document.getElementById('popupOverlay');
const closePopup = document.getElementById('closePopup');

closePopup.addEventListener('click', () => popupOverlay.style.display = 'none');

popupOverlay.addEventListener('click', (event) => 
{
    if (event.target === popupOverlay) 
    {
        popupOverlay.style.display = 'none';
    }
});


