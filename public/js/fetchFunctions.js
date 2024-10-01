
// eslint-disable-next-line no-unused-vars
function updatePageStatus(id){
    const checkbox = document.getElementById(`page-checkbox-${id}`);
    const isCompleted = checkbox.checked;

    fetch(`/setPageStatus/${id}`,{
        method:"post",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({ completed: isCompleted })  // Sending the checkbox status
    })
    .then((res)=>{
        if(res.ok){
            // window.location.reload();
            console.log("Page status updated successfully!");
        } else {
            console.log("Error updating status");
        }
    })
    .catch((err)=>{
        console.log(err)
    })
}