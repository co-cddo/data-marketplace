function clearSearchResults() {
  document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const searchForm = document.getElementById('searchForm');

  searchInput.addEventListener('input', function() {
      if (!this.value.trim()) {
          searchForm.submit();
      }
  });
});
}
clearSearchResults();