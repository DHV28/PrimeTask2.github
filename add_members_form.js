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
let teamMembersDB = firebase.database().ref("team-members");

const saveData = (memberName, memberEmail, memberPassword) => 
{
    if (memberKey) 
    {
        // If a key exists, update the existing team member
        teamMembersDB.child(memberKey).update({
            memberName: memberName,
            memberEmail: memberEmail,
            memberPassword: memberPassword
        })
        .then(() => {
            window.history.back(); 
        })
        .catch((error) => {
            alert("Failed to update. Try again.");
        });
    } 
    else 
    {
        // Otherwise, create a new team member
        let newMember = teamMembersDB.push();

        newMember.set({
            memberName: memberName,
            memberEmail: memberEmail,
            memberPassword: "password12345",  // Default password but can be changed if user clicks edit.
            memberTimeHr: 0,
            memberTimeMin: 0,
            memberAccumulatedHr: 0,
            memberAccumulatedMin: 0,
            dailyAccumulatedHr: 0,
            dailyAccumulatedMin: 0
        })
        .then(() => {
            window.location.href = "admin_view.html";
        })
        .catch((error) => {
            alert("Failed to save. Try again.");
        });
    }
};


const validateEmail = (email) => 
{
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailPattern.test(email);
};

const saveButton = document.getElementById('saveButton');

saveButton.addEventListener('click', function (event) 
{
    event.preventDefault()

    let memberName = document.getElementById("name").value.trim();
    let memberEmail = document.getElementById("email").value.trim();
    let memberPassword = document.getElementById("password").value.trim(); 

    if (!memberName) 
    {
        alert("Name cannot be empty.");
    } else if (!memberEmail) 
    {
        alert("Email address cannot be empty.");
    } 
    else if (!memberPassword)
    {
        alert("Password cannot be empty.");
    }
    else if (!validateEmail(memberEmail)) 
    {
        alert("Please enter a valid email address.");
    } 
    else 
    {
        saveData(memberName, memberEmail, memberPassword);
    }
});

const urlParameters = new URLSearchParams(window.location.search);
const memberKey = urlParameters.get('key');
const memberName = urlParameters.get('name');
const memberEmail = urlParameters.get('email');
const memberPassword = urlParameters.get('password');

if (memberName)
{
    document.getElementById('name').value = memberName;
    document.getElementById('password').disabled = false; // Enable password field on edit
}

if (memberEmail)
{
    document.getElementById('email').value = memberEmail;
}

if (memberPassword) 
{
    document.getElementById('password').value = memberPassword;
}


