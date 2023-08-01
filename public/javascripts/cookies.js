const cookieForm = document.getElementById("cookieForm");
const cookieHideAccept = document.querySelector(".hide-cookie-message-accept");
const cookieHideReject = document.querySelector(".hide-cookie-message-reject");

if (cookieForm) {
  cookieForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const cookiesButtonValue = event.submitter.value;
    fetch("/cookie-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `cookies=${cookiesButtonValue}`,
    })
      .then(function () {
        document.querySelector(".govuk-cookie-banner").style.display = "none";
        cookiesButtonValue === "accept"
          ? (document.getElementById("cookies-accept").style.display = "block")
          : (document.getElementById("cookies-reject").style.display = "block");
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  });
}
if (cookieHideAccept) {
  cookieHideAccept.addEventListener("click", (event) => {
    event.preventDefault();
    const cookiesAcceptDiv = document.getElementById("cookies-accept");
    if (cookiesAcceptDiv) {
      cookiesAcceptDiv.style.display = "none";
    }
  });
}
if (cookieHideReject) {
  cookieHideReject.addEventListener("click", (event) => {
    event.preventDefault();
    const cookiesRejectDiv = document.getElementById("cookies-reject");
    if (cookiesRejectDiv) {
      cookiesRejectDiv.style.display = "none";
    }
  });
}
