// The sorting tasks drop down list listener (single select)
document.querySelectorAll('.dropdown').forEach(dropdown =>
    {
        const button = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        const items = content.querySelectorAll('li');

        button.addEventListener('click', () =>
        {
            dropdown.classList.toggle('active');

            document.querySelectorAll('.dropdown').forEach(otherDropdown =>
            {
                if (otherDropdown !== dropdown) otherDropdown.classList.remove('active');
            });
        });

        window.addEventListener('click', (e) =>
        {
            if (!dropdown.contains(e.target))
            {
                dropdown.classList.remove('active');
            }
        });

        // Checking which drop down list option is selected
        items.forEach(item =>
        {
            item.addEventListener('click', () =>
            {
                const selectedValue = item.dataset.value;

                // can use this to determine whether which kind to sort

                button.innerHTML = `${button.textContent.split(':')[0]}: ${item.textContent} <span class="caret"></span>`;

                items.forEach(i => i.classList.remove('selected'));

                item.classList.add('selected');

                dropdown.classList.remove('active');

                // Call your tasks filtering or sorting functions here
                if (dropdown.id === 'sort-dropdown')
                {
                    sortTasks(selectedValue);
                }
            });
        });
    });

// The filtering dropdown list (multi select)
document.querySelectorAll('.filter-dropdown').forEach(multidropdown => {

    const multibutton = multidropdown.querySelector('.filter-dropdown-btn');
    const multicontent = multidropdown.querySelector('.filter-dropdown-content');
    const multiitems = multicontent.querySelectorAll('li input[type="checkbox"]');

    multibutton.addEventListener('click', () => {
        multidropdown.classList.toggle('active');

        document.querySelectorAll('.filter-dropdown').forEach(multiotherDropdown => {
            if (multiotherDropdown !== multidropdown) multiotherDropdown.classList.remove('active');
        });
    });

    window.addEventListener('click', (multie) => {
        if (!multidropdown.contains(multie.target)) {
            multidropdown.classList.remove('active');
        }
    });

    multiitems.forEach(multiitem => {
        multiitem.addEventListener('change', () => {
            let selectedValues = [];
            multiitems.forEach(multiinput => {
                if (multiinput.checked) {
                    selectedValues.push(multiinput.dataset.value);
                }
            });

            if (multidropdown.id === 'filter-dropdown') {
                multibutton.innerHTML = `Filter by: ${selectedValues.length ? selectedValues.join(', ') : 'All'} <span class="caret"></span>`;
                filterTasks(selectedValues);
            }
        });
    });
});

// A function for implementing the tasks sorting functionality 
const sortTasks = (selectedValue) => {
    let container = document.querySelector('.backlog')

    // Gather all the task cards HTML elements except of the add task button
    let displayedTask = Array.from(container.querySelectorAll('.task-card')).filter(elem => !(elem.classList.contains('add-task')));

    if (selectedValue == 'old-new' || selectedValue == 'default'){
        displayedTask.sort((elem1,elem2) => Number(elem1.getAttribute('data-custom')) - Number(elem2.getAttribute('data-custom')))
        displayedTask.forEach(item => container.appendChild(item))
        
        // Add add-task button after removing the old one to avoid duplicated button, and make sure the button is in correct position.
        container.removeChild(document.querySelector('.add-task'))
        container.appendChild(createAddTaskButton())
    }
    else if (selectedValue == 'new-old'){
        displayedTask.sort((elem1,elem2) => Number(elem2.getAttribute('data-custom')) - Number(elem1.getAttribute('data-custom')))
        displayedTask.forEach(item => container.appendChild(item))
        
        container.removeChild(document.querySelector('.add-task'))
        container.appendChild(createAddTaskButton())
    }

    else if (selectedValue == 'priority-high-low') {
        displayedTask.sort((elem1, elem2) => priorityValue(elem1) - priorityValue(elem2));
    }

    else if (selectedValue == 'priority-low-high'){
        displayedTask.sort((elem1,elem2) => priorityValue(elem2) - priorityValue(elem1));
    }

    displayedTask.forEach(item => container.appendChild(item));

    container.removeChild(document.querySelector('.add-task'));
    container.appendChild(createAddTaskButton());
};

const priorityValue = (taskElement) => {
    let priorityClass = taskElement.querySelector('.priority').classList[1];  // Get the second class name of the priority element
    switch (priorityClass) {
        case 'urgent':
            return 1;
        case 'important':
            return 2;
        case 'medium':
            return 3;
        case 'low':
        default:
            return 4;
    }
};

// filter for multiple tags
const filterTasks = (tags) => {
    let container = document.querySelector('.backlog');
    let displayedTask = Array.from(container.querySelectorAll('.task-card')).filter(elem => !(elem.classList.contains('add-task')));

    // Go back to default when 'All' is chosen or no tags are selected
    if (tags.length === 0) {
        displayedTask.forEach(elem => elem.style.display = '');
    } else {
        displayedTask.forEach(elem => {
            let taskTags = elem.getAttribute('data-tag').split(' ');
            if (tags.every(tag => taskTags.includes(tag))) {
                elem.style.display = '';
            } else {
                elem.style.display = 'none';
            }
        });
    }

    // Handle the add-task button
    let addTaskButton = container.querySelector('.add-task');
    if (addTaskButton) {
        addTaskButton.style.display = '';
    } else {
        container.appendChild(createAddTaskButton());
    }
};  

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
let primeTaskDB = firebase.database().ref("task-details-form");

// Retrieve task data from Firebase and create task cards
primeTaskDB.on("value", (snapshot) => {

    let tasks = snapshot.val();
    
    // Clear existing task cards before adding new ones
    const backlogElement = document.getElementById("backlog");
    backlogElement.innerHTML = '';

    if (tasks){
        let keys = Object.keys(tasks);

        // Loop through each task and create task cards
        keys.forEach((key) => {
            let task = tasks[key];
            createTaskCard(task, key);
        });
    }

    // append back the add task button
    backlogElement.appendChild(createAddTaskButton());
});

function createAddTaskButton() 
{
    // Create the main container for the add task button
    const addTaskButton = document.createElement('div');
    addTaskButton.classList.add('task-card', 'add-task');

    // Create the <a> tag
    const link = document.createElement('a');
    link.href = 'task_form.html';

    // Create the <button> element
    const button = document.createElement('button');
    button.classList.add('add-button');

    // Create the icon
    const icon = document.createElement('i');
    icon.classList.add('fa', 'fa-plus');

    // Append everything the button need to the container again
    button.appendChild(icon);
    link.appendChild(button);
    addTaskButton.appendChild(link);

    return addTaskButton;
}

// Function to create task cards dynamically
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

    
    let editIcon = document.createElement('i');

    // Only the task card in 'Not started' or 'Active' status can be edited
    if (task.status != 'Completed'){
        
        // Edit icon 
        editIcon.className = 'fa-regular fa-pen-to-square';
        editIcon.style.cursor = 'pointer';
        taskCard.appendChild(editIcon);

        // Add edit functionality
        editIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the card click from triggering

            localStorage.setItem("taskEdit", key);
            window.location.href = "task_details_edit.html";
        });
    }

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

    // Only the task card in 'Not started' or 'Active' status can be deleted
    if (task.status != 'Completed' ){
        deleteIcon.className = 'fa-regular fa-trash-can delete-icon';
        deleteIcon.style.cursor = 'pointer';
        taskCard.appendChild(deleteIcon);

        // Add delete functionality
        deleteIcon.addEventListener('click', (e) =>
        {
            e.stopPropagation(); // Prevent the card click from triggering

            taskCard.remove();
            primeTaskDB.child(key).remove(); // Removing the task from prime database

            // Removing the task from sprint database
            if(task.inSprint)
            {
                const sprintID = task.sprintID;
                const sprintTaskDB = firebase.database().ref(`sprints/${sprintID}/task-details-form`);
                sprintTaskDB.child(key).remove(); 
            }
        });
    }
    
    taskCard.addEventListener('click', (e) => {
        localStorage.setItem("taskDetails", key);
        window.location.href = "task_details_view.html";
    });

    // Append task card to the backlog
    document.getElementById('backlog').appendChild(taskCard);
};
