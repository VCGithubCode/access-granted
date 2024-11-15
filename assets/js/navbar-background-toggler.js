   // Event Listener for navbar background toggling on scroll
    window.addEventListener('scroll', (event) => {
        const navBar = document.getElementsByTagName('header')[0];
        if (window.scrollY > 0) {
            navBar.classList.add('header-background');
            navBar.classList.add('shadow');
        } else {
            navBar.classList.remove('header-background');
            navBar.classList.remove('shadow');
        }
    });

    // Event Listener for toggler background toggling on click
    document.getElementsByClassName('navbar-toggler')[0].addEventListener('click', (event) => {
        if (window.scrollY == 0) {
            const navBar = document.getElementsByTagName('header')[0];
            if (navBar.classList.contains('header-background')) {
                navBar.classList.remove('header-background');
                navBar.classList.remove('shadow');
            } else {
                navBar.classList.add('header-background');
                navBar.classList.add('shadow');
            }
        }
    });;