/* global document */
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(
    ".js-result-list-toggle-height",
  );
  toggleButtons.forEach(function (button) {
    button.addEventListener("click", () => {
      let toggleValue = "true";
      let text = "Show more";
      if (this.getAttribute("aria-expanded") === "true") {
        toggleValue = "false";
        text = "Show more";
        this.querySelector(".govuk-accordion-nav__chevron").classList.remove(
          "govuk-accordion-nav__chevron--up",
        );
        this.querySelector(".govuk-accordion-nav__chevron").classList.add(
          "govuk-accordion-nav__chevron--down",
        );
      } else {
        toggleValue = "true";
        text = "Show less";
        this.querySelector(".govuk-accordion-nav__chevron").classList.remove(
          "govuk-accordion-nav__chevron--down",
        );
        this.querySelector(".govuk-accordion-nav__chevron").classList.add(
          "govuk-accordion-nav__chevron--up",
        );
      }
      this.setAttribute("aria-expanded", toggleValue);
      this.querySelector(".govuk-accordion__section-toggle-text").textContent =
        text;
      const parent = this.parentElement;
      const limitedHeightElements = parent.querySelectorAll(
        ".result-list__limit-height",
      );
      limitedHeightElements.forEach((elem) => {
        elem.classList.toggle("theres-no-limit");
      });
    });
  });
});
