document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'light-mode') {
            themeSwitch.checked = true;
        }
    } else {
        document.body.classList.add('dark-mode');
    }

    themeSwitch.addEventListener('change', function() {
        if(this.checked) {
            document.body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light-mode');
        } else {
            document.body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        }
    });
});
