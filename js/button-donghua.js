(function() {

    const arrOpts = [
        {},
        {
            type: 'triangle',
            easing: 'easeOutQuart',
            size: 6,
            particlesAmountCoefficient: 4,
            oscillationCoefficient: 2,
            color: function() {
                return Math.random() < 0.5 ? '#000000' : '#ffffff'; 
            }
        },
        {
            type: 'rectangle',
            duration: 500,
            easing: 'easeOutQuad',
            color: '#091388',
            direction: 'top',
            size: 8
        },
        {
            direction: 'right',
            size: 4,
            speed: 1,
            color: '#e85577',
            particlesAmountCoefficient: 1.5,
            oscillationCoefficient: 1
        },
        {
            duration: 1300,
            easing: 'easeInExpo',
            size: 3,
            speed: 1,
            particlesAmountCoefficient: 10,
            oscillationCoefficient: 1
        },
        {
            direction: 'bottom',
            duration: 1000,
            easing: 'easeInExpo',
        },
        {
            type: 'rectangle',
            style: 'stroke',
            size: 15,
            color: '#e87084',
            duration: 600,
            easing: [0.2,1,0.7,1],
            oscillationCoefficient: 5,
            particlesAmountCoefficient: 2,
            direction: 'right'
        },
        {
            type: 'triangle',
            style: 'stroke',
            direction: 'top',
            size: 5,
            color: 'blue',
            duration: 1400,
            speed: 1.5,
            oscillationCoefficient: 15,
            direction: 'right'
        },
        {
            duration: 500,
            easing: 'easeOutQuad',
            speed: .1,
            particlesAmountCoefficient: 10,
            oscillationCoefficient: 80
        },
        {
            direction: 'right',
            size: 4,
            color: '#969696',
            duration: 1200,
            easing: 'easeInCubic',
            particlesAmountCoefficient: 8,
            speed: 0.4,
            oscillationCoefficient: 1
        },
        {
            style: 'stroke',
            color: '#1b81ea',
            direction: 'bottom',
            duration: 1200,
            easing: 'easeOutSine',
            speed: .7,
            oscillationCoefficient: 5
        },
        {
            type: 'triangle',
            easing: 'easeOutSine',
            size: 3,
            duration: 800,
            particlesAmountCoefficient: 7,
            speed: 3,
            oscillationCoefficient: 1
        }
    ];
    
    const items = document.querySelectorAll('.grid__item');
    items.forEach((el, pos) => {
        const bttn = el.querySelector('button.particles-button');
        const bttnBack = el.querySelector('button.action');
        
        let particlesOpts = arrOpts[pos];
        particlesOpts.complete = () => {
            if ( !buttonVisible ) {
                anime.remove(bttnBack);
                anime({
                    targets: bttnBack,
                    duration: 300,
                    easing: 'easeOutQuint',
                    opacity: 1,
                    scale: [0,1]
                });
                bttnBack.style.pointerEvents = 'auto';
            }
        };
        const particles = new Particles(bttn, particlesOpts);
        
        let buttonVisible = true;
        bttn.addEventListener('click', () => {
            if ( !particles.isAnimating() && buttonVisible ) {
                particles.disintegrate();
                buttonVisible = !buttonVisible;
            }
        });
        bttnBack.addEventListener('click', () => {
            if ( !particles.isAnimating() && !buttonVisible ) {
                anime.remove(bttnBack);
                anime({
                    targets: bttnBack,
                    duration: 300,
                    easing: 'easeOutQuint',
                    opacity: 0,
                    scale: 0
                });
                bttnBack.style.pointerEvents = 'none';

                particles.integrate({
                    duration: 800,
                    easing: 'easeOutSine'
                });
                buttonVisible = !buttonVisible;
            }
        });
    });

})();
