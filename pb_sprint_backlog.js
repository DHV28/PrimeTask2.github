// Initialize Firebase
const firebaseConfig = 
{
    apiKey: "AIzaSyCSzTbYhygkAEratuYSLjziC8dAHxm_0kM",
    authDomain: "primetask-3b148.firebaseapp.com",
    databaseURL: "https://primetask-3b148-default-rtdb.firebaseio.com",
    projectId: "primetask-3b148",
    storageBucket: "primetask-3b148.appspot.com",
    messagingSenderId: "914891090322",
    appId: "1:914891090322:web:832ef0efe1205b8f33f94b"
};

firebase.initializeApp(firebaseConfig);

const sprintID = localStorage.getItem('sprintID'); 
const primeTaskDB = firebase.database().ref("task-details-form");
const sprintTaskDB = firebase.database().ref(`sprints/${sprintID}/task-details-form`);

primeTaskDB.on("value", (snapshot) => 
{
    let tasks = snapshot.val();
    
    const backlogElement = document.getElementById("product-backlog");

    backlogElement.innerHTML = backlogElement.querySelector('h2').outerHTML + backlogElement.querySelector('hr').outerHTML;

    if (tasks)
    {
        let keys = Object.keys(tasks);

        keys.forEach((key) => 
        {
            let task = tasks[key];
            createTaskCard(task, key);
        });
    }

    makeCardsDraggable();
});

sprintTaskDB.on('value', (snapshot) => 
{
    const tasks = snapshot.val();

    const sprintBacklogElement = document.getElementById('sprint-backlog');

    sprintBacklogElement.innerHTML = sprintBacklogElement.querySelector('h2').outerHTML + sprintBacklogElement.querySelector('hr').outerHTML;

    if (tasks) 
    {
        const keys = Object.keys(tasks);

        keys.forEach((key) => 
        {
            const task = tasks[key];
            createTaskCard2(task, key); 
        });
    }

    makeCardsDraggable();
});

function createTaskCard(task, key) 
{
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
    editIcon.className = 'fa-regular fa-pen-to-square';
    editIcon.style.cursor = 'pointer';
    taskCard.appendChild(editIcon);

    // Add edit functionality
    editIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the card click from triggering

        localStorage.setItem("taskEdit", key);
        window.location.href = "task_details_edit.html";
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
    });
   
    taskCard.addEventListener('click', (e) => {
        localStorage.setItem("taskDetails", key);
        window.location.href = "task_details_view.html";
    });

    taskCard.id = `task-${key}`;  // Ensure the card has a unique ID

    // Only append the task card when the card is not belonged to another card.
    if (!task.inSprint) 
    {
        taskCard.setAttribute('draggable', 'true');
        document.getElementById('product-backlog').appendChild(taskCard);
    }

};

function createTaskCard2(task, key) 
{
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
    editIcon.className = 'fa-regular fa-pen-to-square';
    editIcon.style.cursor = 'pointer';
    taskCard.appendChild(editIcon);

    // Add edit functionality
    editIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the card click from triggering

        localStorage.setItem("taskEdit", key);
        window.location.href = "task_details_edit.html";
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

        // Delete the task card from both the sprint and task-form database
        primeTaskDB.child(key).remove(); 
        sprintTaskDB.child(key).remove(); 
    });

    taskCard.addEventListener('click', (e) => {
        localStorage.setItem("taskDetails", key);
        window.location.href = "task_details_view.html";
    });

    taskCard.id = `task-${key}`;  // Ensure the card has a unique ID
    taskCard.setAttribute('draggable', 'true');

    // Append task card to the backlog
    document.getElementById('sprint-backlog').appendChild(taskCard);
};

function makeCardsDraggable() 
{
    let taskCards = document.querySelectorAll('.task-card');

    taskCards.forEach(card => 
    {
        card.addEventListener('dragstart', (e) => 
        {
            e.dataTransfer.setData('text', e.target.id);
        });
    });

    // Allow drop into both product-backlog and sprint-backlog containers
    ['product-backlog', 'sprint-backlog'].forEach(containerId => 
    {
        const container = document.getElementById(containerId);

        container.addEventListener('dragover', (e) => 
        {
            e.preventDefault(); 
        });

        container.addEventListener('drop', async (e) => {
            e.preventDefault();

            const cardId = e.dataTransfer.getData('text'); // Get the ID of the dragged card
            const taskId = cardId.replace('task-', ''); // Extract the task key
            const draggedCard = document.getElementById(cardId);

            if (draggedCard && containerId === 'product-backlog') 
            {
                container.appendChild(draggedCard);

                if (sprintID) 
                {
                    try 
                    {
                        // Fetch the task from the sprint backlog
                        const snapshot = await sprintTaskDB.child(taskId).once('value');
                        const task = snapshot.val();

                        if (task) 
                        {
                            await primeTaskDB.child(taskId).set({
                                ...task,
                                inSprint: false,
                                sprintID: null
                            });

                            // Remove the task from the sprint backlog
                            await sprintTaskDB.child(taskId).remove();
                        }
                    } 
                    catch (error) 
                    {
                        console.error(error);
                    }
                } 
                else 
                {
                    console.error("Sprint ID not found!");
                }
            } 
            else if (draggedCard && containerId === 'sprint-backlog') 
            {
                container.appendChild(draggedCard);

                if (sprintID) 
                {
                    try 
                    {
                        // Fetch the task from the product backlog
                        const snapshot = await primeTaskDB.child(taskId).once('value');
                        const task = snapshot.val();

                        if (task) 
                        {
                            await primeTaskDB.child(taskId).set({
                                ...task,
                                inSprint: true,
                                sprintID: sprintID
                            });

                            // Add the task to the sprint backlog Firebase
                            await sprintTaskDB.child(taskId).set(task);
                        }
                    } 
                    catch (error) 
                    {
                        console.error("Error moving task:", error);
                    }
                } 
                else 
                {
                    console.error("Sprint ID not found!");
                }
            }
            
        });
    });
}
