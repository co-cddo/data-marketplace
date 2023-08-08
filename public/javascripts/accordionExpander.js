function handleCheckboxes() {
  const checkboxes = document.querySelectorAll(".govuk-checkboxes__input");
  const searchButton = document.querySelector(".gem-c-search__submit");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      searchButton.click(); // Trigger form submission
    });
  });
}

function handleDocumentListAccordion() {
  var toggleButtons = document.querySelectorAll('.js-result-list-toggle-height');
  toggleButtons.forEach(function(button) {
    var parent = button.parentElement;
    var limitedHeightElements = parent.querySelectorAll('.result-list__limit-height');
    var isOverflowing = Array.from(limitedHeightElements).some(function(element) {
      return element.scrollHeight > element.clientHeight;
    });
    if (!isOverflowing) {
      button.style.display = 'none';
    } else {
      button.addEventListener('click', function(e) {
        let toggleValue = 'true';
        let text = "Show more";
        if (this.getAttribute('aria-expanded') === 'true') {
          toggleValue = 'false';
          text = 'Show more';
          this.querySelector('.govuk-accordion-nav__chevron').classList.remove('govuk-accordion-nav__chevron--up');
          this.querySelector('.govuk-accordion-nav__chevron').classList.add('govuk-accordion-nav__chevron--down');
        } else {
          toggleValue = 'true';
          text = 'Show less';
          this.querySelector('.govuk-accordion-nav__chevron').classList.remove('govuk-accordion-nav__chevron--down');
          this.querySelector('.govuk-accordion-nav__chevron').classList.add('govuk-accordion-nav__chevron--up');
        }
        this.setAttribute('aria-expanded', toggleValue);
        this.querySelector('.govuk-accordion__section-toggle-text').textContent = text;
        limitedHeightElements.forEach(function(elem) {
          elem.classList.toggle('theres-no-limit');
        });
      });
    }
  });
}

function handleFilterAccordion() {
  var filterAccordionButton = document.querySelectorAll('.app-c-expander__button');
  filterAccordionButton.forEach(function(accordionButton) {
    accordionButton.addEventListener('click', function() {
      var toggleValue = this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
      this.setAttribute('aria-expanded', toggleValue);
      var content = this.parentNode.nextElementSibling;
      if (content && content.classList.contains('app-c-expander__content')) {
        content.classList.toggle('app-c-expander__content--visible');
      }
    });
  });
}


handleCheckboxes();
handleDocumentListAccordion();
handleFilterAccordion();