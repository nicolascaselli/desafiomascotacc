// Estado global de la presentación
let currentSlide = 0;
const totalSlides = 9;

// Elementos del DOM
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const logoInput = document.getElementById('logoInput');
const mascotaInput = document.getElementById('mascotaInput');
const logoPlaceholder = document.getElementById('logoPlaceholder');
const mascotaPlaceholder = document.getElementById('mascotaPlaceholder');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    updateSlide();
    setupEventListeners();
    setupImageUploads();
    setupChecklist();
});

// Configurar event listeners
function setupEventListeners() {
    // Navegación con botones
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Navegación con teclado
    document.addEventListener('keydown', handleKeyboard);
    
    // Navegación con dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Prevenir scroll en el body
    document.body.addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// Manejo de teclado
function handleKeyboard(e) {
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            prevSlide();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextSlide();
            break;
        case 'Home':
            e.preventDefault();
            goToSlide(0);
            break;
        case 'End':
            e.preventDefault();
            goToSlide(totalSlides - 1);
            break;
        case ' ':
            e.preventDefault();
            nextSlide();
            break;
    }
}

// Navegación de slides
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlide();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlide();
    }
}

function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        updateSlide();
    }
}

// Actualizar slide activo
function updateSlide() {
    // Actualizar slides
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index === currentSlide) {
            slide.classList.add('active');
        } else if (index < currentSlide) {
            slide.classList.add('prev');
        }
    });
    
    // Actualizar dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
        dot.setAttribute('aria-selected', index === currentSlide);
    });
    
    // Actualizar botones de navegación
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;
    
    // Actualizar ARIA
    updateARIA();
    
    // Anunciar cambio de slide para lectores de pantalla
    announceSlideChange();
}

// Actualizar atributos ARIA
function updateARIA() {
    slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index !== currentSlide);
        if (index === currentSlide) {
            slide.setAttribute('tabindex', '0');
            // Enfocar el slide activo para lectores de pantalla
            setTimeout(() => {
                const title = slide.querySelector('h1, h2');
                if (title) {
                    title.focus();
                }
            }, 100);
        } else {
            slide.setAttribute('tabindex', '-1');
        }
    });
}

// Anunciar cambio de slide
function announceSlideChange() {
    const slideTitle = slides[currentSlide].querySelector('h1, h2')?.textContent || `Slide ${currentSlide + 1}`;
    const announcement = `${slideTitle}. Slide ${currentSlide + 1} de ${totalSlides}`;
    
    // Crear elemento para anuncio
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    
    document.body.appendChild(announcer);
    
    // Remover después de anunciar
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

// Configurar subida de imágenes
function setupImageUploads() {
    // Logo upload
    logoInput.addEventListener('change', function(e) {
        handleImageUpload(e, logoPlaceholder, 'Logo del colegio cargado');
    });
    
    // Mascota upload
    mascotaInput.addEventListener('change', function(e) {
        handleImageUpload(e, mascotaPlaceholder, 'Mascota cargada');
    });
}

// Manejar subida de imagen
function handleImageUpload(event, placeholder, altText) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Crear elemento de imagen
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = altText;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            // Reemplazar contenido del placeholder
            const span = placeholder.querySelector('span');
            if (span) {
                span.style.display = 'none';
            }
            
            // Remover imagen anterior si existe
            const existingImg = placeholder.querySelector('img');
            if (existingImg) {
                existingImg.remove();
            }
            
            placeholder.appendChild(img);
            
            // Cambiar estilo del placeholder
            placeholder.style.border = '3px solid var(--primary)';
            placeholder.style.background = 'var(--white)';
            
            // Anunciar carga exitosa
            showNotification(`${altText} exitosamente`);
        };
        reader.readAsDataURL(file);
    } else {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    }
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Configurar checklist (Slide 7)
function setupChecklist() {
    const checkboxes = document.querySelectorAll('#slide-6 input[type="checkbox"]');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (checkboxes.length > 0 && progressFill && progressText) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateProgress);
        });
    }
    
    function updateProgress() {
        const checkedCount = document.querySelectorAll('#slide-6 input[type="checkbox"]:checked').length;
        const totalCount = checkboxes.length;
        const percentage = Math.round((checkedCount / totalCount) * 100);
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% completado`;
        
        // Celebrar cuando se complete todo
        if (percentage === 100) {
            showNotification('¡Excelente! Checklist completado 🎉');
            // Agregar efecto visual
            progressFill.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        }
    }
}

// Copiar prompt (Slide 6)
function copyPrompt() {
    const promptText = document.getElementById('promptText');
    if (promptText) {
        promptText.select();
        document.execCommand('copy');
        showNotification('Prompt copiado al portapapeles 📋');
        
        // Efecto visual en el botón
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'var(--primary)';
        }, 2000);
    }
}

// Copiar URL (Slide 8)
function copyUrl() {
    const urlInput = document.getElementById('projectUrl');
    if (urlInput && urlInput.value.trim()) {
        urlInput.select();
        document.execCommand('copy');
        showNotification('URL copiada al portapapeles 🔗');
        
        // Efecto visual en el botón
        const copyBtn = document.querySelector('.copy-url-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'var(--primary)';
        }, 2000);
    } else {
        showNotification('Por favor ingresa una URL válida', 'error');
        urlInput.focus();
    }
}

// Copiar URL de la mascota (Slide 1)
function copyMascotUrl() {
    const urlInput = document.getElementById('mascotaUrl');
    if (urlInput) {
        urlInput.select();
        document.execCommand('copy');
        showNotification('URL de la mascota copiada 🎭');
        
        // Efecto visual en el botón
        const copyBtn = document.querySelector('.copy-mascot-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'var(--primary)';
        }, 2000);
    }
}

// Funciones globales para uso en HTML
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
window.copyPrompt = copyPrompt;
window.copyUrl = copyUrl;
window.copyMascotUrl = copyMascotUrl;

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;
document.head.appendChild(style);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la presentación:', e.error);
    showNotification('Ha ocurrido un error. Por favor recarga la página.', 'error');
});

// Prevenir zoom con Ctrl+scroll
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

// Prevenir zoom con gestos táctiles
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Soporte para swipe en móviles
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            prevSlide();
        }
    }
}

// Optimización de rendimiento
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce a eventos que pueden dispararse frecuentemente
const debouncedResize = debounce(() => {
    // Reajustar elementos si es necesario
    updateSlide();
}, 250);

window.addEventListener('resize', debouncedResize);

// Precargar imágenes si es necesario
function preloadImages() {
    const imageUrls = [
        // Agregar URLs de imágenes que se quieran precargar
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Llamar a precargar imágenes cuando la página esté lista
document.addEventListener('DOMContentLoaded', preloadImages);