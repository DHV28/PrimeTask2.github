 // Initialise Firebase
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

// Reference to the database
const database = firebase.database();

// Store default admin credentials
const adminCredentialsRef = database.ref('admin-credentials');

// Set admin username and password in the database
adminCredentialsRef.set({
    username: "admin",
    password: "admin12345"
}, (error) => {
    if (error) {
        console.error("Error saving admin credentials:", error);
    } else {
        console.log("Admin credentials saved successfully!");
    }
});

// Rest of your login form code
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginButton.addEventListener("click", (e) => 
{
    e.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    if (username === "" || password === "") 
    {
        alert("Username and password fields cannot be empty.");
        return;
    }

    // Retrieve admin credentials from the database
    adminCredentialsRef.once('value', (snapshot) => 
    {
        const credentials = snapshot.val();
        const storedUsername = credentials.username;
        const storedPassword = credentials.password;

        if (username === storedUsername && password === storedPassword)
        {
            alert("You have successfully logged in.");
            location.reload();
            window.location.href = "admin_view.html";
        } 
        else 
        {
            loginErrorMsg.style.opacity = 1;
            alert("Please enter the correct username and password.");
        }
    }).catch((error) => 
    {
        console.error("Error fetching admin credentials:", error);
    });
});
