

 // Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const addCourseButton = document.getElementById("addCourse");
    const popupContainer = document.getElementsByClassName("popup-container")[0];
    const closeButton = document.getElementById("closeButton");
    const profileDetails = document.getElementsByClassName("profile-details")[0];
    const chapters = document.querySelectorAll(".chapter-name");

    // Toggle the add course option visibility
    function displayAddCourse() {
        popupContainer.classList.toggle("show");
    }

    // Attach event listener to the 'Add Course' button to display the popup
    if (addCourseButton) {
        addCourseButton.addEventListener('click', displayAddCourse);
    }

    // Attach event listener to the 'Cancel' button to hide the popup
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            popupContainer.classList.remove("show");
        });
    }

    //show the profile box
    function showProfile() {
        profileDetails.style.visibility = 'visible';
    }
    
    function hideProfile() {
        profileDetails.style.visibility = 'hidden';
    }
    
    // Hide the profile box when clicking outside
    document.addEventListener('click', function(event) {
        if (!document.getElementsByClassName("profile-logo")[0].contains(event.target) && 
            !profileDetails.contains(event.target)) {
            hideProfile();
        }
    });
    
    // Toggle profile details on logo click
    document.getElementsByClassName("profile-logo")[0].addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent event from bubbling up to the document
        const isVisible = profileDetails.style.visibility === 'visible';
        if (isVisible) {
            hideProfile();
        } else {
            showProfile();
        }
    });


    // Toggle visibility of all pages below the clicked chapter
    function togglePages(chapterElement) {
        let nextElement = chapterElement.nextElementSibling;

        // Loop through siblings to find all "chapter-name-page" elements
        while (nextElement) {
            if (nextElement.classList.contains("chapter-name-page")) {
                // Toggle the hidden class
                nextElement.classList.toggle("hidden-to-show");
            } else if (nextElement.classList.contains("chapter-name")) {
                // Stop if we encounter another chapter
                break;
            }
            nextElement = nextElement.nextElementSibling; // Move to the next sibling
        }
    }

    // Attach event listener to each chapter for toggling pages
    chapters.forEach(chapter => {
        chapter.addEventListener('click', function() {
            togglePages(this); // Pass the clicked chapter element to togglePages function
        });
    });
});
