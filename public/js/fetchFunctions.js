var token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

// eslint-disable-next-line no-unused-vars
async function updatePageStatus(id) {
  const checkbox = document.getElementById(`page-checkbox-${id}`);
  const isCompleted = checkbox.checked;

  try {
    const res = await fetch(`/setPageStatus/${id}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "X-CSRF-Token": token,
      },
      body: JSON.stringify({
        iscompleted: isCompleted,
        _csrf: token,
      }),
    });

    if (res.ok) {
      window.location.reload();
      console.log("Page status updated successfully!");
    } else {
      console.log("Error updating Page status");
    }
  } catch (err) {
    console.log(err);
  }
}


// eslint-disable-next-line no-unused-vars
function deletePage(id) {
  fetch(`/deletepage/${id}`, {
    method: "delete",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _csrf: token,
    }),
  })
    .then((res) => {
      if (res.ok) {
        window.location.reload();
        console.log("Page deleted successfully!");
      } else {
        console.log("Error deleting page");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// eslint-disable-next-line no-unused-vars
function deleteChapter(id) {
  fetch(`/deletechapter/${id}`, {
    method: "delete",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _csrf: token,
    }),
  })
    .then((res) => {
      if (res.ok) {
        window.location.reload();
        console.log("Chapter deleted successfully!");
      } else {
        console.log("Error deleting Chapter");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// eslint-disable-next-line no-unused-vars
function deleteCourse(id) {
  fetch(`/deletecourse/${id}`, {
    method: "delete",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _csrf: token,
    }),
  })
    .then((res) => {
      if (res.ok) {
        window.location.reload();
        console.log("Course deleted successfully!");
      } else {
        console.log("Error deleting Course");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
