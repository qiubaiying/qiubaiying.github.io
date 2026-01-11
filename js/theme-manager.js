// Theme Configuration
const themes = {
    default: {
        name: '默认主题',
        wallpaper: '/img/home-bg.jpg',
        font: 'Arial, sans-serif',
        primaryColor: '#0085a1',
        cursor: 'default',
        uiComponents: {
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
        }
    },
    anime: {
        name: '二次元主题',
        wallpaper: '/img/anime-bg.jpg',
        font: '"Comic Sans MS", cursive, sans-serif',
        primaryColor: '#ff6b9d',
        cursor: 'url(/img/cursor-anime.cur), auto',
        uiComponents: {
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(255, 107, 157, 0.3)',
            backgroundColor: '#fff0f5'
        }
    },
    dark: {
        name: '暗黑主题',
        wallpaper: '/img/dark-bg.jpg',
        font: '"Courier New", monospace',
        primaryColor: '#00ff41',
        cursor: 'url(/img/cursor-matrix.cur), auto',
        uiComponents: {
            borderRadius: '0px',
            boxShadow: '0 2px 4px rgba(0, 255, 65, 0.2)',
            backgroundColor: '#0a0a0a'
        }
    },
    pastel: {
        name: '马卡龙主题',
        wallpaper: '/img/pastel-bg.jpg',
        font: '"Georgia", serif',
        primaryColor: '#b19cd9',
        cursor: 'url(/img/cursor-pastel.cur), auto',
        uiComponents: {
            borderRadius: '20px',
            boxShadow: '0 6px 12px rgba(177, 156, 217, 0.4)',
            backgroundColor: '#f5f0ff'
        }
    }
};

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('selectedTheme') || 'default';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeSwitcher();
    }
    
    applyTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;
        
        // Apply wallpaper
        document.body.style.backgroundImage = `url('${theme.wallpaper}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Apply font
        document.body.style.fontFamily = theme.font;
        
        // Apply primary color
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        
        // Apply cursor
        document.body.style.cursor = theme.cursor;
        
        // Apply UI components styling
        const style = document.createElement('style');
        style.id = 'dynamic-theme-styles';
        style.textContent = `
            .post-preview, .timeline-sidebar, .navbar-custom {
                border-radius: ${theme.uiComponents.borderRadius} !important;
                box-shadow: ${theme.uiComponents.boxShadow} !important;
                background-color: ${theme.uiComponents.backgroundColor} !important;
            }
            .timeline-year-header {
                background-color: ${theme.primaryColor} !important;
            }
            .reading-time i, .site-runtime i {
                color: ${theme.primaryColor} !important;
            }
        `;
        
        // Remove existing dynamic styles
        const existingStyle = document.getElementById('dynamic-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
        
        // Save to localStorage
        localStorage.setItem('selectedTheme', themeName);
        this.currentTheme = themeName;
    }
    
    createThemeSwitcher() {
        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        themeSwitcher.innerHTML = `
            <div class="theme-switcher-toggle">
                <i class="fa fa-paint-brush"></i>
            </div>
            <div class="theme-switcher-panel">
                <h4>选择主题</h4>
                ${Object.keys(themes).map(key => `
                    <div class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                        <div class="theme-preview" style="background-color: ${themes[key].primaryColor}"></div>
                        <span>${themes[key].name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(themeSwitcher);
        
        // Add event listeners
        themeSwitcher.querySelector('.theme-switcher-toggle').addEventListener('click', () => {
            themeSwitcher.classList.toggle('open');
        });
        
        themeSwitcher.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const themeName = option.getAttribute('data-theme');
                this.applyTheme(themeName);
                
                // Update active state
                themeSwitcher.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeSwitcher.contains(e.target)) {
                themeSwitcher.classList.remove('open');
            }
        });
    }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});