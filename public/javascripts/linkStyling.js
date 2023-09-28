const addGovukClassToLinks = () => {
  document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('.asset-description a');
    if(links) {
      links.forEach(link => {
          link.classList.add('govuk-link');
      });
    }
  });
}

addGovukClassToLinks()