document.addEventListener('DOMContentLoaded', function () {
    var toggleButtons = document.querySelectorAll('.js-result-list-toggle-height');
    toggleButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            let toggleValue = 'true'
            let text = "Show more";
            let chevronClass = "govuk-accordion-nav__chevron--down";
            if (this.getAttribute('aria-expanded') === 'true') {
                toggleValue = 'false';
                text = 'Show more';
                this.querySelector('.govuk-accordion-nav__chevron').classList.remove('govuk-accordion-nav__chevron--up');
                this.querySelector('.govuk-accordion-nav__chevron').classList.add('govuk-accordion-nav__chevron--down');
            }
            else {
                toggleValue = 'true';
                text = 'Show less';
                this.querySelector('.govuk-accordion-nav__chevron').classList.remove('govuk-accordion-nav__chevron--down');
                this.querySelector('.govuk-accordion-nav__chevron').classList.add('govuk-accordion-nav__chevron--up');
            }
            this.setAttribute('aria-expanded', toggleValue);
            this.querySelector('.govuk-accordion__section-toggle-text').textContent = text;
            var parent = this.parentElement;
            var limitedHeightElements = parent.querySelectorAll('.result-list__limit-height');
            limitedHeightElements.forEach(function (elem) {
                elem.classList.toggle('theres-no-limit');
            });
        });
    });
});
