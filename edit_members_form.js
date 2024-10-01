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

function editLogDateNames(key, updatedData) 
{
    let logTimeDBTest =  firebase.database().ref('log-time-dates/' + key).once('value');

    logTimeDBTest.then((snapshot) => {
        snapshot.forEach((date) => {
            firebase.database().ref('log-time-dates/'+ key +'/' + date).update(updatedData)
        });
    });
}

function editTasks(key, updatedData) 
{
    let tasks =  firebase.database().ref('task-details-form').once('value');

    tasks.then((snapshot) => {
        snapshot.forEach((taskID) => {
            let value = taskID.val()
            if (key === value.assigneeID) {
                firebase.database().ref('task-details-form/'+ taskID).update(updatedData)
            }
        });
    });
}

function editSprintTasks(key, updatedData) 
{
    let tasks =  firebase.database().ref('sprints').once('value');

    tasks.then((snapshot) => {
        snapshot.forEach((sprintID) => {
            sprintID.forEach((taskForm) => {
                taskForm.forEach((taskID) => {
                    let value = taskID.val()
                    if (key === value.assigneeID) {
                        firebase.database().ref('sprints/' + sprintID + '/' + taskID + '/' + taskID).update(updatedData)
                    }
                })
            })
        });
    });
}

// Function to edit a team member
function editTeamMember(key, member) 
{
    window.location.href = 'add_members_form.html'
    let teamMember = firebase.database().ref('team-members/' + key).once('value');
    let name = ""
    let email = ""
    let password = ""

    teamMember.then((snapshot) => 
    {
        let value = snapshot.val()

        name = value.memberName
        email = value.memberEmail
        password = value.memberPassword
    })

    const updatedMember = {
        memberName: name,
        memberEmail: email,
        memberPassword: password
    }
    
    const updatedTask = {
        assigneeSelected: name
    }

    const updatedMemberDate = {
        assigneeName: name
    }

    // Update Firebase
    firebase.database().ref('team-members/' + key).update(updatedMember)
        .then(() => 
        {
            editLogDateNames(key, updatedMemberDate)
                .then(() => 
                {
                    editTasks(key, updatedTask)
                        .then(() => 
                        {
                            editSprintTasks(key, updatedTask)
                            .then(() => 
                            {
                                alert("Member edited successfully!");
                                window.location.href = "team_dashboard_admin.html";
                            })
                        })
                })
        })
}