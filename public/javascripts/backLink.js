function backLink() {
  document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("history-back-link");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.back();
    });
  }
  }
)}

backLink();