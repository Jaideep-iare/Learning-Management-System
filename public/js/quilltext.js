// Initialize Quill editor
// eslint-disable-next-line no-undef
var quill = new Quill("#editor-container", {
  theme: "snow", // Specify theme
  modules: {
    toolbar: [
      [{ bold: true }, { italic: true }, { underline: true }], // Formatting options
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // Dropdown with defaults from theme
      [{ align: [] }],
    ],
  },
});

// On form submit, transfer content to hidden input
document.getElementById("text-form").onsubmit = function () {
  var htmlContent = quill.root.innerHTML;
  document.getElementById("formattedText").value = htmlContent;
};
