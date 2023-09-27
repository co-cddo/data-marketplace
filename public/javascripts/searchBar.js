function clearSearchResults() {
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('searchForm');

    if (searchInput && searchForm) {
        searchInput.addEventListener('blur', function() {
            searchForm.submit();
        });
    }
});
}

clearSearchResults();