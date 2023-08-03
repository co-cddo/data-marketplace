/* global document */
document.addEventListener('DOMContentLoaded', function () {
    var toggleButtons = document.querySelectorAll('.js-result-list-toggle-height');
    toggleButtons.forEach(function (button) {
        // Check if content is overflowing
        var parent = button.parentElement;
        var limitedHeightElements = parent.querySelectorAll('.result-list__limit-height');
        var isOverflowing = Array.from(limitedHeightElements).some(function(element) {
            return element.scrollHeight > element.clientHeight;
        });
        if (!isOverflowing) {
            button.style.display = 'none';
        } else {
            button.addEventListener('click', function (e) {
                let toggleValue = 'true'
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
                limitedHeightElements.forEach(function (elem) {
                    elem.classList.toggle('theres-no-limit');
                });
            });
        }
    });

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
})


// Put FilterOrganisation param script in here for now, doesn't seem to work on its own

// Retrieve existing search parameters
var searchParams = new URLSearchParams(window.location.search);
var initialSelectedOrganisations = searchParams.get('organisationFilter') || '';
var organisationsArray = new Set(initialSelectedOrganisations ? initialSelectedOrganisations.split(',') : []);
var checkboxes = document.querySelectorAll('input[name="organisationFilters"]');

if (initialSelectedOrganisations) {
    Array.from(organisationsArray).forEach(function(organisation) { // Use Array.from() to iterate over the Set
        // Render the tag for this organisation
        updateTags(organisation);
    });
}


checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
        checkboxes.forEach(function(c) { c.disabled = true; });
        checkbox.disabled = false;

        // Add or remove the selected organisation from the array
        var organisation = checkbox.value;
        if (checkbox.checked) {
            organisationsArray.add(organisation); // Adds the organisation to the set
        } else {
            organisationsArray.delete(organisation); // Removes the organisation from the set if it exists
        }

        var selectedOrganisations = Array.from(organisationsArray).join(',');

        // Set or delete the organisation filter as needed
        if (selectedOrganisations) {
            searchParams.set('organisationFilter', selectedOrganisations);
        } else {
            searchParams.delete('organisationFilter');
        }

        var newUrl = window.location.pathname + '?' + searchParams.toString();

        // Redirect to the updated URL only if it's different from the current URL
        if (newUrl !== window.location.href) {
            window.location.href = newUrl;
        }

        // Added this part to update the tags
        updateTags(selectedOrganisations);
    });
});

    function updateTags(selectedOrganisations) {
        var tagsContainer = document.querySelector('.moj-override--selected-tags');
        tagsContainer.innerHTML = ""; // clear existing tags
        selectedOrganisations.split(',').forEach(function(organisation) {
            var tagElement = document.createElement('span');
            tagElement.className = "tag-class"; 
            tagElement.textContent = organisation;
            tagsContainer.appendChild(tagElement);
        });
    }
    window.addEventListener('load', function() {
        checkboxes.forEach(function(checkbox) { checkbox.disabled = false; });
    });
});
    