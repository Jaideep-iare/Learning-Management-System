

document.getElementById('editCourse').addEventListener('click', function() {
    // Make a GET request to the server-side route /addchapter
    fetch('/addchapter')
        .then(response => response.text()) // If you're expecting HTML in the response
        .then(data => {
            // Handle the response from the server (HTML content)
            document.body.innerHTML = data; // Replace the body content with the rendered page
        })
        .catch(error => {
            console.error('Error:', error);
        });
});