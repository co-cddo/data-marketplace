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

// Function to update tags
function updateTags(filterId, selectedFilters) {
    var tagsContainer = document.getElementById('tags-container-' + filterId);

    // Find the container for the tags (let's assume it's the next sibling of the h3)
    var tagsWrapper = tagsContainer.querySelector('.moj-filter-tags');
    tagsWrapper.innerHTML = ""; // clear existing tags

    selectedFilters.forEach(function(filter) {
        var tagElement = document.createElement('span');
        tagElement.className = "moj-filter__tag";
        tagElement.textContent = filter;
        tagsWrapper.appendChild(tagElement);
    });

    // Show or hide the specific category based on whether there are any selected filters
    if (selectedFilters.length > 0) {
        tagsContainer.style.display = 'block';
    } else {
        tagsContainer.style.display = 'none';
    }
}

// Function to handle checkbox change for a specific filter type
function handleCheckboxChange(filterName, filterId, checkboxes) {
    var searchParams = new URLSearchParams(window.location.search);
    var initialSelectedFilters = searchParams.get(filterName) || '';
    var filtersArray = new Set(initialSelectedFilters ? initialSelectedFilters.split(',') : []);

    // Define a map to associate filter values with filter texts
    var filterValueToText = {};

    // Build the filterValueToText map
    checkboxes.forEach(function(checkbox) {
        filterValueToText[checkbox.value] = checkbox.parentNode.textContent.trim();
    });

    // Map filter values to their corresponding texts
    var selectedFilters = Array.from(filtersArray).map(filterValue => filterValueToText[filterValue] || filterValue);
    updateTags(filterId, selectedFilters);

    if (!initialSelectedFilters) {
        // Hide the container if there are no initial selected filters for this category
        var tagsContainer = document.getElementById('tags-container-' + filterId);
        tagsContainer.style.display = 'none';
    }

    checkboxes.forEach(function(checkbox) {
        // Check the checkboxes that match the initial selected filters
        if (filtersArray.has(checkbox.value)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener('change', function() {
            checkboxes.forEach(function(c) { c.disabled = true; });
            checkbox.disabled = false;

            var filterValue = checkbox.value;
            if (checkbox.checked) {
                filtersArray.add(filterValue);
            } else {
                filtersArray.delete(filterValue);
            }

            var selectedFilters = Array.from(filtersArray).join(',');

            if (selectedFilters) {
                searchParams.set(filterName, selectedFilters);
            } else {
                searchParams.delete(filterName);
            }

            var newUrl = window.location.pathname + '?' + searchParams.toString();
            if (newUrl !== window.location.href) {
                window.location.href = newUrl;
            }

            // Use the filterValueToText map to translate ids to titles
            updateTags(filterId, Array.from(filtersArray).map(value => filterValueToText[value]));
        });
    });

    window.addEventListener('load', function() {
        checkboxes.forEach(function(checkbox) { checkbox.disabled = false; });
    });
}


    // Call the handleCheckboxChange function for each filter type
    var filterOptions = [
        { filterName: 'organisationFilter', filterId: 'organisationFilters' },
        { filterName: 'typeFilter', filterId: 'typeFilters' },
        // Add more filters here as needed
    ];

    filterOptions.forEach(function(filterOption) {
        var checkboxes = document.querySelectorAll('input[name="' + filterOption.filterId + '"]');
        handleCheckboxChange(filterOption.filterName, filterOption.filterId, checkboxes);
    });
});
    