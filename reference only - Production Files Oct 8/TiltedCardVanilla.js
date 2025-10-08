class TiltedCardVanilla {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            imageSrc: options.imageSrc || '',
            altText: options.altText || 'Tilted card image',
            captionText: options.captionText || '',
            containerHeight: options.containerHeight || '300px',
            containerWidth: options.containerWidth || '100%',
            imageHeight: options.imageHeight || '300px',
            imageWidth: options.imageWidth || '300px',
            scaleOnHover: options.scaleOnHover || 1.1,
            rotateAmplitude: options.rotateAmplitude || 14,
            showMobileWarning: options.showMobileWarning !== false,
            showTooltip: options.showTooltip !== false,
            overlayContent: options.overlayContent || null,
            displayOverlayContent: options.displayOverlayContent || false
        };
        
        this.lastY = 0;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.createHTML();
        this.bindEvents();
    }
    
    createHTML() {
        const { 
            imageSrc, 
            altText, 
            captionText, 
            containerHeight, 
            containerWidth, 
            imageHeight, 
            imageWidth,
            showMobileWarning,
            showTooltip,
            overlayContent,
            displayOverlayContent
        } = this.options;
        
        this.container.innerHTML = `
            <figure class="tilted-card-figure" style="height: ${containerHeight}; width: ${containerWidth};">
                ${showMobileWarning ? '<div class="tilted-card-mobile-alert">This effect is not optimized for mobile. Check on desktop.</div>' : ''}
                
                <div class="tilted-card-inner" style="width: ${imageWidth}; height: ${imageHeight};">
                    <img 
                        src="${imageSrc}" 
                        alt="${altText}" 
                        class="tilted-card-img" 
                        style="width: ${imageWidth}; height: ${imageHeight};"
                    />
                    
                    ${displayOverlayContent && overlayContent ? `<div class="tilted-card-overlay">${overlayContent}</div>` : ''}
                </div>
                
                ${showTooltip ? `<figcaption class="tilted-card-caption">${captionText}</figcaption>` : ''}
            </figure>
        `;
        
        this.figure = this.container.querySelector('.tilted-card-figure');
        this.inner = this.container.querySelector('.tilted-card-inner');
        this.caption = this.container.querySelector('.tilted-card-caption');
    }
    
    bindEvents() {
        this.figure.addEventListener('mousemove', this.handleMouse.bind(this));
        this.figure.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.figure.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    handleMouse(e) {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationFrame = requestAnimationFrame(() => {
            const rect = this.figure.getBoundingClientRect();
            const offsetX = e.clientX - rect.left - rect.width / 2;
            const offsetY = e.clientY - rect.top - rect.height / 2;
            
            const rotationX = (offsetY / (rect.height / 2)) * -this.options.rotateAmplitude;
            const rotationY = (offsetX / (rect.width / 2)) * this.options.rotateAmplitude;
            
            this.inner.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${this.options.scaleOnHover})`;
            
            if (this.caption) {
                const velocityY = offsetY - this.lastY;
                const captionRotation = -velocityY * 0.6;
                
                this.caption.style.left = `${e.clientX - rect.left}px`;
                this.caption.style.top = `${e.clientY - rect.top}px`;
                this.caption.style.transform = `rotate(${captionRotation}deg)`;
                this.caption.style.opacity = '1';
            }
            
            this.lastY = offsetY;
        });
    }
    
    handleMouseEnter() {
        this.inner.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
        this.inner.style.transform = `scale(${this.options.scaleOnHover})`;
        
        if (this.caption) {
            this.caption.style.transition = 'opacity 0.3s ease';
            this.caption.style.opacity = '1';
        }
    }
    
    handleMouseLeave() {
        this.inner.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        this.inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        
        if (this.caption) {
            this.caption.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            this.caption.style.opacity = '0';
            this.caption.style.transform = 'rotate(0deg)';
        }
        
        this.lastY = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.figure.removeEventListener('mousemove', this.handleMouse.bind(this));
        this.figure.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.figure.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiltedCardVanilla;
}

// Make available globally
window.TiltedCardVanilla = TiltedCardVanilla;