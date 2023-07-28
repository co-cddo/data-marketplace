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
});
