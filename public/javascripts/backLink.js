function backLink() {
  document.addEventListener("DOMContentLoaded", () => {
  // leaving this commented in favour of backend solution
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