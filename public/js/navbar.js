document.addEventListener('DOMContentLoaded', function () {
    var servicesDropdown = document.getElementById('servicesDropdown');

    servicesDropdown.addEventListener('click', function (event) {
        if (!servicesDropdown.classList.contains('show') && window.innerWidth > 992) {
            window.location.href = '/services'; // Replace with the URL you want to redirect to
        }
    });
});