document.querySelector('form').addEventListener('submit', function(event) 
{
    event.preventDefault();

    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    // Validate that the end date is after the start date
    if (new Date(endDate) < new Date(startDate)) 
    {
        alert("End date cannot be earlier than the start date.");
        return;
    }

    localStorage.setItem("startDate",startDate)
    localStorage.setItem("endDate",endDate)
        
    window.location.href = "team_dashboard_admin.html"
});