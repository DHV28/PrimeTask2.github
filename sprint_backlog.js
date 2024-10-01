// Retrieve the target sprint key
const currentSprint = localStorage.getItem("selectedSprint")

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
let sprintDB = firebase.database().ref('sprints/' + currentSprint + '/task-details-form');
let primeTaskDB = firebase.database().ref("task-details-form");

sprintDB.on('value',(snapshot) => {
    let tasks = snapshot.val()

    // Clear existing task cards before adding new ones
    const notStartedColumn = document.getElementById("not-started");
    const inProgressColumn = document.getElementById("in-progress");
    const completedColumn = document.getElementById("completed");
    notStartedColumn.innerHTML = notStartedColumn.querySelector('h2').outerHTML + notStartedColumn.querySelector('hr').outerHTML;;
    inProgressColumn.innerHTML = inProgressColumn.querySelector('h2').outerHTML + inProgressColumn.querySelector('hr').outerHTML;;
    completedColumn.innerHTML = completedColumn.querySelector('h2').outerHTML + completedColumn.querySelector('hr').outerHTML;;

    if (tasks){
        let keys = Object.keys(tasks);

        // Loop through each task and create task cards
        keys.forEach((key) => {
            let task = tasks[key];
            createTaskCard(task, key);
        });
    }
    makeCardsDraggable();
}) 


// Function to create task cards dynamically
function createTaskCard(task, key) {
    // Define the valid tags and ensure they are displayed in uppercase
    const validTags = ['front-end', 'back-end', 'api', 'ui/ux', 'framework', 'testing', 'database'];
 
    // Ensure task properties are defined
    let taskPriority = task.taskPriority ? task.taskPriority.toLowerCase() : 'low';  // Default priority to 'low' if undefined
    let taskTags = task.taskTag ? task.taskTag.toLowerCase().split(',').map(tag => tag.trim()) : [];  // Handle multiple tags
 
    // Create task card container
    let taskCard = document.createElement('div');
    taskCard.className = 'task-card';
 
    // Create task header
    let taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
 
    // Task name
    let taskName = document.createElement('span');
    taskName.className = 'task-name';
    taskName.textContent = `Task Name: ${task.taskName || 'Unnamed Task'}`;  // Fallback to 'Unnamed Task' if no name
 
    // Edit icon 
    let editIcon = document.createElement('i');
    editIcon.className = 'fa-regular fa-pen-to-square edit-icon';
    editIcon.style.cursor = 'pointer';
    taskCard.appendChild(editIcon);

    // Add edit functionality
    editIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the card click from triggering

        localStorage.setItem("taskEdit", key);
        if (task.status == "Not Started"){
            
            window.location.href = "task_details_edit.html";
        }
        else if (task.status == "In Progress" || task.status == "Completed"){
            
            window.location.href = "log_time_form_edit.html";
        }
    });

 
    // Task priority with color coding
    let taskPriorityElem = document.createElement('span');
    taskPriorityElem.className = `priority ${taskPriority}`;  // Use default 'low' priority class if undefined
    taskPriorityElem.textContent = task.taskPriority ? task.taskPriority.toUpperCase() : 'LOW';  // Display priority in uppercase
 
    // Add task name, priority, and edit icon to the task header
    taskHeader.appendChild(taskName);
    taskHeader.appendChild(taskPriorityElem);
    taskHeader.appendChild(editIcon);
 
    // Add task header to the task card
    taskCard.appendChild(taskHeader);
 
    // Add horizontal line
    let hr = document.createElement('hr');
    taskCard.appendChild(hr);
 
    // Story point
    let storyPoint = document.createElement('p');
    storyPoint.textContent = `Story Point: ${task.taskStoryPoint || '0'}`;  // Default story point to '0'
    taskCard.appendChild(storyPoint);
 
    // Task type
    let taskType = document.createElement('p');
    taskType.textContent = `Type: ${task.taskType || 'General'}`;  // Default type to 'General'
    taskCard.appendChild(taskType);

    // Store the task key as id for the created task card html element
    taskCard.id = `task-${key}`;
 
    // Task tags (Display only valid tags in uppercase)
    if (taskTags.length > 0 && taskTags[0] !== 'none') {  // CHANGED: Only display tags if they exist and are not 'none'
        let taskTagsElem = document.createElement('p');
        taskTagsElem.innerHTML = 'Tags: ';
 
        taskTags.forEach(tag => {
            let tagElem = document.createElement('span');
            tagElem.className = `tag ${tag.replace(/\//g, '-')}`;  // Sanitize tag classes
 
            // Check if the tag is one of the predefined valid tags, then convert to uppercase
            if (validTags.includes(tag)) {
                tagElem.textContent = tag.toUpperCase();
            } else {
                // If not predefined, still convert to uppercase for display consistency
                tagElem.textContent = tag.toUpperCase();
            }
 
            taskTagsElem.appendChild(tagElem);
            taskTagsElem.innerHTML += ' ';  // Add space between tags
        });
 
        taskCard.appendChild(taskTagsElem);
    }
 
    // A task card HTML should record its created time for sorting purpose
    taskCard.setAttribute("data-custom",task.createdTime)
 
    // Add data-tag to task card
    taskCard.setAttribute('data-tag', taskTags.join(' '));

    // Delete icon
    let deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-regular fa-trash-can delete-icon';
    deleteIcon.classList.add("delete")
    deleteIcon.style.cursor = 'pointer';
    taskCard.appendChild(deleteIcon);

    // Add delete functionality
    deleteIcon.addEventListener('click', (e) =>
    {
        e.stopPropagation(); // Prevent the card click from triggering

        taskCard.remove();
        
        // Removing the task from Firebase
        primeTaskDB.child(key).remove(); 
        sprintDB.child(key).remove(); 
    });

    taskCard.addEventListener('click', (e) => {
        localStorage.setItem("taskDetails", key);
        if (task.status == "Not Started"){
            
            window.location.href = "task_details_view.html";
        }
        else if (task.status == "In Progress" || task.status == "Completed"){
            window.location.href = "log_time_form_view.html"
        }
    });

    taskCard.setAttribute('draggable', 'true');
    
    // Append task card to the corresponding columns
    if (task.status == "Not Started"){
        document.getElementById('not-started').appendChild(taskCard);
    }
    else if (task.status == "In Progress"){
        document.getElementById('in-progress').appendChild(taskCard);
    }
    else{
        document.getElementById('completed').appendChild(taskCard);
    }
 }; 
 


function makeCardsDraggable() 
{
    let taskCards = document.querySelectorAll('.task-card');

    taskCards.forEach(card => 
    {
        let currentColumn = card.closest('.column').id; // Get the parent column of the card
        if (currentColumn !== 'completed') 
        {
            // Allow dragging only if the card is not in the "Completed" column
            card.addEventListener('dragstart', (e) => 
            {
                e.dataTransfer.setData('text', e.target.id);
            });
        }
    });

    // Allow drop into both not started, in progress and completed containers
    ['not-started','in-progress', 'completed'].forEach(containerId => 
    {
        const container = document.getElementById(containerId);

        container.addEventListener('dragover', (e) => 
        {
            e.preventDefault(); 
        });

        container.addEventListener('drop', async (e) => 
        {
            e.preventDefault();

            const cardId = e.dataTransfer.getData('text'); // Get the ID of the dragged card
            const taskId = cardId.replace('task-', ''); // Extract the task key
            const draggedCard = document.getElementById(cardId);

            if (draggedCard && containerId === 'in-progress') 
            {
                primeTaskDB.child(taskId).update({
                    status: "In Progress"
                })

                sprintDB.child(taskId).update({
                    status: "In Progress"
                })
            } 
            else if (draggedCard && containerId === 'completed') 
            {
                firebase.database().ref('task-details-form/' + taskId).once('value')
                .then((taskSnapshot) => 
                {
                    let taskDetail = taskSnapshot.val();

                    if (taskDetail.status != "Not Started")
                    {
                        primeTaskDB.child(taskId).update({
                            status: "Completed"
                        })
        
                        sprintDB.child(taskId).update({
                            status: "Completed"
                        })
                    }
                });
            }
        });
    });
}