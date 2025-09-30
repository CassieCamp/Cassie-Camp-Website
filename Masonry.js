class VanillaMasonry {
    constructor(container, options = {}) {
        this.container = container;
        this.items = options.items || [];
        this.ease = options.ease || 'power3.out';
        this.duration = options.duration || 0.6;
        this.stagger = options.stagger || 0.05;
        this.animateFrom = options.animateFrom || 'bottom';
        this.scaleOnHover = options.scaleOnHover !== false;
        this.hoverScale = options.hoverScale || 0.95;
        this.blurToFocus = options.blurToFocus !== false;
        this.colorShiftOnHover = options.colorShiftOnHover || false;
        
        this.width = 0;
        this.imagesReady = false;
        this.hasMounted = false;
        this.grid = [];
        
        this.init();
    }
    
    // Get number of columns based on screen width
    getColumns() {
        const width = window.innerWidth;
        if (width >= 1500) return 5;
        if (width >= 1000) return 4;
        if (width >= 600) return 3;
        if (width >= 400) return 2;
        return 1;
    }
    
    // Preload images
    async preloadImages(urls) {
        const promises = urls.map(src => new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = img.onerror = () => resolve();
        }));
        await Promise.all(promises);
    }
    
    // Calculate grid layout
    calculateGrid() {
        const containerWidth = this.container.offsetWidth;
        if (!containerWidth) return;
        
        this.width = containerWidth;
        const columns = this.getColumns();
        const colHeights = new Array(columns).fill(0);
        const columnWidth = containerWidth / columns;
        
        this.grid = this.items.map(item => {
            const col = colHeights.indexOf(Math.min(...colHeights));
            const x = columnWidth * col;
            const height = item.height / 2;
            const y = colHeights[col];
            
            colHeights[col] += height;
            
            return { ...item, x, y, w: columnWidth, h: height };
        });
        
        this.render();
        this.animateItems();
    }
    
    // Render DOM elements
    render() {
        this.container.innerHTML = '';
        this.container.className = 'list';
        
        this.grid.forEach(item => {
            const itemWrapper = document.createElement('div');
            itemWrapper.className = 'item-wrapper';
            itemWrapper.setAttribute('data-key', item.id);
            itemWrapper.style.cssText = `
                position: absolute;
                left: ${item.x}px;
                top: ${item.y}px;
                width: ${item.w}px;
                height: ${item.h}px;
                cursor: pointer;
            `;
            
            const itemImg = document.createElement('div');
            itemImg.className = 'item-img';
            itemImg.style.cssText = `
                width: 100%;
                height: 100%;
                background-image: url(${item.img});
                background-size: cover;
                background-position: center;
                border-radius: 8px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            `;
            
            if (this.colorShiftOnHover) {
                const colorOverlay = document.createElement('div');
                colorOverlay.className = 'color-overlay';
                colorOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5));
                    opacity: 0;
                    pointer-events: none;
                    border-radius: 8px;
                `;
                itemImg.appendChild(colorOverlay);
            }
            
            itemWrapper.appendChild(itemImg);
            
            // Event listeners
            itemWrapper.addEventListener('click', () => {
                if (item.url) {
                    window.open(item.url, '_blank', 'noopener');
                }
            });
            
            itemWrapper.addEventListener('mouseenter', (e) => {
                this.handleMouseEnter(e, item);
            });
            
            itemWrapper.addEventListener('mouseleave', (e) => {
                this.handleMouseLeave(e, item);
            });
            
            this.container.appendChild(itemWrapper);
        });
        
        // Set container height
        const maxHeight = Math.max(...this.grid.map(item => item.y + item.h));
        this.container.style.height = `${maxHeight}px`;
    }
    
    // Get initial position for animation
    getInitialPosition(item) {
        switch (this.animateFrom) {
            case 'top':
                return { x: item.x, y: -200 };
            case 'bottom':
                return { x: item.x, y: window.innerHeight + 200 };
            case 'left':
                return { x: -200, y: item.y };
            case 'right':
                return { x: window.innerWidth + 200, y: item.y };
            case 'center':
                return {
                    x: this.width / 2 - item.w / 2,
                    y: 200
                };
            default:
                return { x: item.x, y: item.y + 100 };
        }
    }
    
    // Animate items
    animateItems() {
        if (!window.gsap || !this.imagesReady) return;
        
        this.grid.forEach((item, index) => {
            const element = document.querySelector(`[data-key="${item.id}"]`);
            if (!element) return;
            
            const finalProps = {
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h
            };
            
            if (!this.hasMounted) {
                const initialPos = this.getInitialPosition(item);
                
                gsap.fromTo(element, 
                    {
                        opacity: 0,
                        x: initialPos.x,
                        y: initialPos.y,
                        width: item.w,
                        height: item.h,
                        ...(this.blurToFocus && { filter: 'blur(10px)' })
                    },
                    {
                        opacity: 1,
                        ...finalProps,
                        ...(this.blurToFocus && { filter: 'blur(0px)' }),
                        duration: 0.8,
                        ease: 'power3.out',
                        delay: index * this.stagger
                    }
                );
            } else {
                gsap.to(element, {
                    ...finalProps,
                    duration: this.duration,
                    ease: this.ease,
                    overwrite: 'auto'
                });
            }
        });
        
        this.hasMounted = true;
    }
    
    // Handle mouse enter
    handleMouseEnter(e, item) {
        if (!window.gsap) return;
        
        const element = e.currentTarget;
        
        if (this.scaleOnHover) {
            gsap.to(element, {
                scale: this.hoverScale,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
        
        if (this.colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay');
            if (overlay) {
                gsap.to(overlay, {
                    opacity: 0.3,
                    duration: 0.3
                });
            }
        }
    }
    
    // Handle mouse leave
    handleMouseLeave(e, item) {
        if (!window.gsap) return;
        
        const element = e.currentTarget;
        
        if (this.scaleOnHover) {
            gsap.to(element, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
        
        if (this.colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay');
            if (overlay) {
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        }
    }
    
    // Initialize
    async init() {
        console.log('Initializing VanillaMasonry with', this.items.length, 'items');
        
        // Set up container
        this.container.style.position = 'relative';
        this.container.style.width = '100%';
        
        // Preload images
        await this.preloadImages(this.items.map(i => i.img));
        this.imagesReady = true;
        console.log('Images preloaded');
        
        // Initial layout
        this.calculateGrid();
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.calculateGrid();
            }, 100);
        });
        
        console.log('VanillaMasonry initialized');
    }
    
    // Update items
    updateItems(newItems) {
        this.items = newItems;
        this.hasMounted = false;
        this.calculateGrid();
    }
    
    // Destroy
    destroy() {
        window.removeEventListener('resize', this.calculateGrid);
    }
}

// Export for global use
window.VanillaMasonry = VanillaMasonry;