function removeFilter() {
  document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".moj-filter__tag");

    filterButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.target;
        const filterValue = target.getAttribute("data-filter-value");
        const filterCategory = target.getAttribute("data-filter-category");

        // Find the corresponding checkbox and uncheck it
        const checkbox = document.querySelector(
          `input[name="${filterCategory}"][value="${filterValue}"]`,
        );
        if (checkbox) {
          checkbox.checked = false;
        }

        // Re-submit the form
        const form = document.getElementById("searchForm");
        if (form) {
          form.submit();
        }
      });
    });
  });
}

removeFilter();
