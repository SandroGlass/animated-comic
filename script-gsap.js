// INTEGRATED COMIC SYSTEM WITH LAYERED TRANSITIONS
let currentPanel = 0; // START AT PANEL 0
const totalPanels = 6; // NOW 6 PANELS (0-5)
let currentMorphStage = 0;
let bubbleFloatAnimation = null;

// TRANSITION TYPES
const TRANSITION_TYPES = {
    SLIDE_HORIZONTAL: 'slideHorizontal',
    PAGE_FLIP: 'pageFlip', 
    ZOOM_MORPH: 'zoomMorph',
    IRIS_WIPE: 'irisWipe',
    COMIC_BURST: 'comicBurst',
    LAYER_PEEL: 'layerPeel',
    SMOOTH_MORPH: 'smoothMorph',
    PARALLAX_SLIDE: 'parallaxSlide'
};

// LAYER SELECTORS - FIXED TO MATCH ACTUAL ELEMENTS
const LAYERS = {
    BACKGROUND: '#backgroundImg',
    CHARACTERS: '#characters', 
    SPEECH: '#speechBubble',
    STAGE: '#comicStage'
};

// Panel configuration - defines exactly what each panel should look like
const panelConfig = {
    0: {
        background: 'images/background0.png',
        characters: null, // NO characters in panel 0
        speechBubble: 'images/speechbubble0.png',
        showSpeechBubble: true,
        characterSize: null, // No characters
        characterPosition: null, // No characters
        speechBubblePosition: { top: "5%", left: "5%", width: "70%", height: "50%" }, // BIGGER and TOP LEFT
        hasFloating: false,
        hasPulsating: true, // NEW: Pulsating background effect
        morphStages: {
            1: { 
                background: 'images/background0-1.png',
                speechBubble: 'images/speechbubble0-1.png'
            }
        }
    },
    1: {
        background: 'images/background.png',
        characters: 'images/characters.png',
        speechBubble: 'images/speechbubble.png',
        showSpeechBubble: true,
        characterSize: { width: "80%", height: "70%" },
        characterPosition: { bottom: "0%", left: "0%" },
        speechBubblePosition: { top: "10%", left: "55%", width: "45%", height: "30%" },
        hasFloating: false // Set to false - floating will be triggered by special transition
    },
    2: {
        background: 'images/background2.png',
        characters: 'images/characters2.png',
        speechBubble: 'images/speechbubble2.png',
        showSpeechBubble: true,
        characterSize: { width: "48%", height: "42%" },
        characterPosition: { bottom: "0%", left: "52%" },
        speechBubblePosition: { top: "2%", left: "10%", width: "58%", height: "39%" },
        hasFloating: false,
        specialAnimation: 'panel2CharacterFadeIn' // NEW: Character fade in
    },
    3: {
        background: 'images/background2.png',
        characters: 'images/characters2.png',
        speechBubble: 'images/speechbubble3.png',
        showSpeechBubble: true,
        characterSize: { width: "48%", height: "42%" },
        characterPosition: { bottom: "0%", left: "52%" }, // FIXED: Use left positioning
        speechBubblePosition: { top: "30%", left: "40%", width: "45%", height: "30%" },
        hasFloating: false,
        morphStages: {
            1: { overlay1: 'images/background3.png' },
            2: { overlay1: 'images/background3.png', overlay2: 'images/background4.png' }
        }
    },
    4: {
        background: 'images/background4.png',
        characters: 'images/characters3.png',
        speechBubble: 'images/speechbubble4.png',
        showSpeechBubble: false,
        characterSize: { width: "20%", height: "20%" },
        characterPosition: { bottom: "40%", left: "40%" },
        speechBubblePosition: { top: "30%", left: "40%", width: "45%", height: "30%" },
        hasFloating: false,
        specialAnimation: 'character3Running'
    },
    5: {
        background: null, // NULL means NO background
        characters: 'images/characters4.png',
        speechBubble: null, // NULL means NO speech bubble
        showSpeechBubble: false,
        characterSize: { width: "60%", height: "60%" },
        characterPosition: { bottom: "20%", left: "20%" },
        hasFloating: false,
        specialAnimation: 'panel5FadeIn'
    }
};

// LAYERED TRANSITION SCENARIOS
const layeredTransitions = {
    
    // 1. SLIDE HORIZONTAL - No animation on current elements
    [TRANSITION_TYPES.SLIDE_HORIZONTAL]: {
        name: "Clean Horizontal Slide",
        description: "Stage slides, current elements stay static",
        duration: 1.2,
        execute: (direction = 'next', onPanelChange) => {
            const slideDirection = direction === 'next' ? '-100%' : '100%';
            const enterDirection = direction === 'next' ? '100%' : '-100%';
            
            const timeline = gsap.timeline();
            
            return timeline
                // Simply slide the stage - current elements stay in place
                .to(LAYERS.STAGE, {
                    duration: 0.6,
                    x: slideDirection,
                    ease: "power2.inOut"
                })
                .call(() => {
                    if (onPanelChange) onPanelChange();
                    gsap.set(LAYERS.STAGE, { x: enterDirection });
                })
                // Slide stage back with new content
                .to(LAYERS.STAGE, {
                    duration: 0.6,
                    x: "0%",
                    ease: "power2.inOut"
                });
        }
    },

    // 2. PARALLAX SLIDE - No animation on current elements
    [TRANSITION_TYPES.PARALLAX_SLIDE]: {
        name: "Simple Parallax Effect", 
        description: "Stage-based transition, current elements static",
        duration: 1.4,
        execute: (direction = 'next', onPanelChange) => {
            const slideDirection = direction === 'next' ? '-100%' : '100%';
            const enterDirection = direction === 'next' ? '100%' : '-100%';
            
            const timeline = gsap.timeline();
            
            return timeline
                // Just slide the stage - current elements untouched
                .to(LAYERS.STAGE, {
                    duration: 0.8,
                    x: slideDirection,
                    ease: "power2.inOut"
                })
                .call(() => {
                    if (onPanelChange) onPanelChange();
                    gsap.set(LAYERS.STAGE, { x: enterDirection });
                })
                // Slide stage back
                .to(LAYERS.STAGE, {
                    duration: 0.8,
                    x: "0%",
                    ease: "power2.out"
                });
        }
    },

    // 3. SMOOTH MORPH - No animation on current elements
    [TRANSITION_TYPES.SMOOTH_MORPH]: {
        name: "Independent Layer Morph",
        description: "Cross-fade without animating current elements",
        duration: 1.2,
        execute: (direction = 'next', onPanelChange) => {
            const timeline = gsap.timeline();
            
            return timeline
                // Simple fade out of entire stage
                .to(LAYERS.STAGE, {
                    duration: 0.6,
                    opacity: 0,
                    ease: "power1.inOut"
                })
                .call(() => {
                    if (onPanelChange) onPanelChange();
                })
                // Simple fade in with new content
                .to(LAYERS.STAGE, {
                    duration: 0.6,
                    opacity: 1,
                    ease: "power1.inOut"
                });
        }
    },

    // 4. COMIC BURST - No animation on current elements
    [TRANSITION_TYPES.COMIC_BURST]: {
        name: "Comic Book Burst",
        description: "Explosive transition without animating current elements",
        duration: 1.8,
        execute: (direction = 'next', onPanelChange) => {
            const timeline = gsap.timeline();
            
            return timeline
                // Quick scale down of entire stage
                .to(LAYERS.STAGE, {
                    duration: 0.4,
                    scale: 0.8,
                    opacity: 0.7,
                    ease: "power2.in"
                })
                .to(LAYERS.STAGE, {
                    duration: 0.3,
                    scale: 0,
                    opacity: 0,
                    ease: "power2.inOut"
                })
                .call(() => {
                    if (onPanelChange) onPanelChange();
                    gsap.set(LAYERS.STAGE, { scale: 0, opacity: 0 });
                })
                // Heroic arrival with bounce
                .to(LAYERS.STAGE, {
                    duration: 1.1,
                    scale: 1,
                    opacity: 1,
                    ease: "bounce.out"
                });
        }
    },

    // 5. ZOOM MORPH - No animation on current elements (except vibration for 4->5)
    [TRANSITION_TYPES.ZOOM_MORPH]: {
        name: "Zoom Morph with Optional Character Vibration",
        description: "Stage zooms, current elements stay static (vibration only for 4->5)",
        duration: 2.2,
        execute: (direction = 'next', onPanelChange) => {
            const timeline = gsap.timeline();
            
            // Only vibrate characters if transitioning from panel 4 to 5
            if (currentPanel === 4) {
                timeline
                    // Character vibration effect - manual shake
                    .set(LAYERS.CHARACTERS, { x: 5 })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: -5, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 8, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: -8, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 5, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: -3, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 6, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: -6, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 3, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: -2, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 4, ease: "none" })
                    .to(LAYERS.CHARACTERS, { duration: 0.05, x: 0, ease: "none" });
            }
            
            return timeline
                // Stage zoom out with blur - current elements stay in place
                .to(LAYERS.STAGE, {
                    duration: 0.8,
                    scale: 0.3,
                    opacity: 0.7,
                    filter: "blur(15px)",
                    ease: "power2.in"
                }, currentPanel === 4 ? "-=0.4" : "+=0")
                
                // PANEL CHANGE
                .call(() => {
                    if (onPanelChange) onPanelChange();
                    gsap.set(LAYERS.STAGE, {
                        scale: 0.2,
                        filter: "blur(20px)"
                    });
                    gsap.set(LAYERS.CHARACTERS, { x: 0, y: 0 }); // Reset character position
                })
                
                // Elastic zoom in with new content
                .to(LAYERS.STAGE, {
                    duration: 1.2,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    ease: "elastic.out(1, 0.8)"
                });
        }
    }
};

// LAYERED TRANSITION MANAGER
class LayeredTransitionManager {
    constructor() {
        this.currentTransition = null;
        this.isTransitioning = false;
    }

    async executeTransition(transitionType, direction = 'next', onPanelChange = null) {
        if (this.isTransitioning) return false;
        
        this.isTransitioning = true;
        const transition = layeredTransitions[transitionType];
        
        if (!transition) {
            console.error(`Transition type ${transitionType} not found`);
            this.isTransitioning = false;
            return false;
        }

        console.log(`🎬 Executing: ${transition.name}`);
        
        try {
            // Hide navigation during transition
            hideNavigationButtons();
            
            // Execute the layered transition
            this.currentTransition = transition.execute(direction, onPanelChange);
            await this.currentTransition;
            
            // Show navigation when complete
            showNavigationButtons();
            
        } catch (error) {
            console.error('❌ Transition error:', error);
        } finally {
            this.isTransitioning = false;
            this.currentTransition = null;
        }
        
        return true;
    }

    killCurrentTransition() {
        if (this.currentTransition) {
            this.currentTransition.kill();
            this.currentTransition = null;
        }
        
        // Reset stage position (most important)
        gsap.set(LAYERS.STAGE, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1
        });
        
        // Reset individual layers without interfering with CSS positioning
        gsap.set([LAYERS.BACKGROUND, LAYERS.SPEECH], {
            scale: 1,
            rotation: 0,
            opacity: 1,
            filter: "none",
            clipPath: "none",
            transformPerspective: "none"
        });
        
        // Only reset transforms that don't conflict with CSS positioning
        gsap.set(LAYERS.SPEECH, {
            x: 0,
            y: 0
        });
        
        // Characters: ensure proper visibility based on current panel
        if (currentPanel !== 0) {
            gsap.set(LAYERS.CHARACTERS, {
                scale: 1,
                rotation: 0,
                opacity: 1,
                filter: "none",
                display: "block",
                visibility: "visible"
            });
            const charactersElement = document.getElementById('characters');
            charactersElement.style.display = "block";
            charactersElement.style.opacity = "1";
            charactersElement.style.visibility = "visible";
        }
        
        this.isTransitioning = false;
    }

    getRandomTransition(exclude = []) {
        const available = Object.keys(layeredTransitions).filter(
            type => !exclude.includes(type)
        );
        return available[Math.floor(Math.random() * available.length)];
    }
}

// PANEL TRANSITION ASSIGNMENTS
const panelTransitionMap = {
    0: TRANSITION_TYPES.SLIDE_HORIZONTAL,    // Panel 0 intro
    1: TRANSITION_TYPES.SLIDE_HORIZONTAL,    // Clean intro
    2: TRANSITION_TYPES.PARALLAX_SLIDE,      // Add depth
    3: TRANSITION_TYPES.SMOOTH_MORPH,        // For morphing backgrounds
    4: TRANSITION_TYPES.COMIC_BURST,         // Action sequence
    5: TRANSITION_TYPES.SLIDE_HORIZONTAL,    // Final panel (unless from 4, which uses special vibration)
};

// Initialize transition manager
const transitionManager = new LayeredTransitionManager();

// SIMPLIFIED PANEL LOADING
function loadPanel(panelNumber, morphStage = 0) {
    const config = panelConfig[panelNumber];
    if (!config) return;

    console.log(`Loading Panel ${panelNumber}, morph stage: ${morphStage}`);
    console.log('Panel config:', config);

    // Get all elements
    const backgroundImg = document.getElementById('backgroundImg');
    const charactersImg = document.getElementById('charactersImg');
    const speechBubbleImg = document.querySelector('#speechBubble img');
    const charactersLayer = document.getElementById('characters');
    const speechBubbleLayer = document.getElementById('speechBubble');
    const overlay1 = document.getElementById('backgroundOverlay1');
    const overlay2 = document.getElementById('backgroundOverlay2');

    // CLEAR EVERYTHING FIRST
    backgroundImg.src = '';
    charactersImg.src = '';
    speechBubbleImg.src = '';
    gsap.set([overlay1, overlay2], { opacity: 0, display: "none" });

    // SET BACKGROUND
    if (config.background) {
        backgroundImg.src = config.background;
        gsap.set(LAYERS.BACKGROUND, { opacity: 1, display: "block" });
    } else {
        // NO BACKGROUND - completely hide it
        gsap.set(LAYERS.BACKGROUND, { opacity: 0, display: "none" });
    }

    // SET CHARACTERS
    if (config.characters) {
        console.log('Loading characters:', config.characters);
        charactersImg.src = config.characters;
        
        // ENSURE characters layer is visible and positioned
        const charactersElement = document.getElementById('characters');
        charactersElement.style.display = "block";
        charactersElement.style.opacity = "1";
        charactersElement.style.visibility = "visible";
        
        // POSITION CHARACTERS
        const characterStyles = {
            width: config.characterSize.width,
            height: config.characterSize.height,
            bottom: config.characterPosition.bottom,
            left: config.characterPosition.left,
            position: "absolute",
            display: "block",
            opacity: "1",
            visibility: "visible"
        };
        
        console.log('Applying character styles:', characterStyles);
        
        // Apply positioning to both CSS and GSAP
        Object.assign(charactersElement.style, characterStyles);
        gsap.set(LAYERS.CHARACTERS, {
            width: config.characterSize.width,
            height: config.characterSize.height,
            bottom: config.characterPosition.bottom,
            left: config.characterPosition.left,
            opacity: 1,
            display: "block",
            visibility: "visible"
        });
    } else {
        console.log('No characters for panel', panelNumber);
        // NO CHARACTERS - hide completely (only for Panel 0)
        charactersImg.src = '';
        const charactersElement = document.getElementById('characters');
        charactersElement.style.display = "none";
        charactersElement.style.opacity = "0";
        charactersElement.style.visibility = "hidden";
        gsap.set(LAYERS.CHARACTERS, { opacity: 0, display: "none", visibility: "hidden" });
    }

    // HANDLE SPEECH BUBBLE
    if (config.showSpeechBubble && config.speechBubble) {
        console.log('Loading speech bubble:', config.speechBubble);
        console.log('Speech bubble position:', config.speechBubblePosition);
        
        speechBubbleImg.src = config.speechBubble;
        
        // FORCE speech bubble positioning
        const bubbleStyles = {
            opacity: "1",
            display: "block",
            position: "absolute",
            top: config.speechBubblePosition.top,
            left: config.speechBubblePosition.left,
            width: config.speechBubblePosition.width,
            height: config.speechBubblePosition.height,
            zIndex: "3",
            visibility: "visible"
        };
        
        console.log('Applying bubble styles:', bubbleStyles);
        
        // Apply to both CSS and GSAP to ensure it takes effect
        Object.assign(speechBubbleLayer.style, bubbleStyles);
        gsap.set(LAYERS.SPEECH, { 
            opacity: 1, 
            display: "block",
            visibility: "visible"
        });
        
        // FORCE positioning with GSAP as well
        gsap.set(speechBubbleLayer, {
            top: config.speechBubblePosition.top,
            left: config.speechBubblePosition.left,
            width: config.speechBubblePosition.width,
            height: config.speechBubblePosition.height
        });
    } else {
        console.log('No speech bubble for panel', panelNumber);
        // HIDE SPEECH BUBBLE
        const hiddenStyles = {
            opacity: "0",
            display: "none",
            visibility: "hidden"
        };
        Object.assign(speechBubbleLayer.style, hiddenStyles);
        gsap.set(LAYERS.SPEECH, { opacity: 0, display: "none", visibility: "hidden" });
    }

    // HANDLE PANEL 0 AND PANEL 3 MORPHING
    if ((panelNumber === 0 || panelNumber === 3) && config.morphStages) {
        const stage = config.morphStages[morphStage];
        if (stage) {
            if (stage.background) {
                overlay1.src = stage.background;
                gsap.set(overlay1, { display: "block", opacity: morphStage > 0 ? 1 : 0 });
            }
            if (stage.speechBubble && morphStage > 0) {
                // For Panel 0 stage 1, update speech bubble
                speechBubbleImg.src = stage.speechBubble;
            }
            if (stage.overlay2) {
                overlay2.src = stage.overlay2;
                gsap.set(overlay2, { display: "block", opacity: 1 });
            }
        }
    }

    // START PULSATING FOR PANEL 0
    if (config.hasPulsating) {
        setTimeout(() => {
            startPulsatingAnimation();
        }, 800);
    }

    // START FLOATING FOR PANEL 1 (was Panel 1 before)
    if (config.hasFloating) {
        setTimeout(() => {
            startFloatingAnimation();
        }, 1200);
    }

    // START SPECIAL ANIMATIONS
    if (config.specialAnimation) {
        setTimeout(() => {
            if (config.specialAnimation === 'character3Running') {
                startCharacter3RunningAnimation();
            } else if (config.specialAnimation === 'panel5FadeIn') {
                startPanel5FadeIn();
            } else if (config.specialAnimation === 'panel2CharacterFadeIn') {
                startPanel2CharacterFadeIn();
            }
        }, 100);
    }

    updateNavigationStates();
}

// ENHANCED TRANSITION SYSTEM
function transitionToPanel(targetPanel, targetMorphStage = 0) {
    // Determine direction based on current vs target panel
    const direction = targetPanel > currentPanel ? 'next' : 'prev';
    
    // Kill any current animations first and reset all properties
    transitionManager.killCurrentTransition();
    killAllAnimations();
    
    // CRITICAL: Reset stage and key properties before transition
    gsap.set(LAYERS.STAGE, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1
    });
    
    gsap.set([LAYERS.BACKGROUND, LAYERS.SPEECH], {
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: "none"
    });
    
    // For characters, only reset safe properties
    gsap.set(LAYERS.CHARACTERS, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: "none"
    });
    
    // SPECIAL CASE: Panel 1 to Panel 0 - Stop floating and transition back
    if (currentPanel === 1 && targetPanel === 0) {
        // Kill floating animation
        if (bubbleFloatAnimation) {
            bubbleFloatAnimation.kill();
            bubbleFloatAnimation = null;
        }
        // Use normal transition
    }

    // SPECIAL CASE: Panel 0 to Panel 1 - Character slide-in animation
    if (currentPanel === 0 && targetPanel === 1) {
        currentPanel = targetPanel;
        currentMorphStage = targetMorphStage;
        specialTransitionToPanel1();
        return;
    }

    // SPECIAL CASE: Panel 2 to Panel 3 keeps characters in place (still Panel 2 to 3)
    if (currentPanel === 2 && targetPanel === 3) {
        currentPanel = targetPanel;
        currentMorphStage = 1;
        smoothTransitionToPanel3();
        return;
    }

    // SPECIAL CASE: Panel 4 to 5 uses vibration zoom morph
    if (currentPanel === 4 && targetPanel === 5) {
        transitionManager.executeTransition(
            TRANSITION_TYPES.ZOOM_MORPH,
            direction,
            () => {
                currentPanel = targetPanel;
                currentMorphStage = targetMorphStage;
                loadPanel(currentPanel, currentMorphStage);
            }
        );
        return;
    }

    // Get transition type for this panel (excluding 4->5 which is handled above)
    const transitionType = panelTransitionMap[targetPanel] || TRANSITION_TYPES.SLIDE_HORIZONTAL;
    
    // Execute the layered transition with correct direction
    transitionManager.executeTransition(
        transitionType,
        direction,
        () => {
            // This callback runs at the perfect moment during transition
            currentPanel = targetPanel;
            currentMorphStage = targetMorphStage;
            loadPanel(currentPanel, currentMorphStage);
        }
    );
}

// PANEL 3 SMOOTH TRANSITION (characters stay in place) - Still works for Panel 3
function smoothTransitionToPanel3() {
    const overlay1 = document.getElementById('backgroundOverlay1');
    
    const timeline = gsap.timeline();
    
    timeline
        .to(LAYERS.SPEECH, {
            duration: 0.3,
            opacity: 0,
            ease: "power2.out"
        })
        .call(() => {
            loadPanel(currentPanel, currentMorphStage);
            overlay1.src = 'images/background3.png';
            gsap.set(overlay1, { display: "block", opacity: 0 });
        })
        .to(overlay1, {
            duration: 0.6,
            opacity: 1,
            ease: "power2.out"
        })
        .to(LAYERS.SPEECH, {
            duration: 0.4,
            opacity: 1,
            ease: "power2.out"
        })
        .call(() => {
            showNavigationButtons();
        });
}

// SPECIAL TRANSITION TO PANEL 1 - Character slide-in animation
function specialTransitionToPanel1() {
    hideNavigationButtons();
    
    const timeline = gsap.timeline();
    
    timeline
        // Fade out Panel 0 content
        .to(LAYERS.SPEECH, {
            duration: 0.4,
            opacity: 0,
            ease: "power2.out"
        })
        .to(LAYERS.BACKGROUND, {
            duration: 0.6,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.2")
        
        .call(() => {
            // Load Panel 1 content
            loadPanel(1, 0);
            
            // Set initial positions for slide-in animation
            gsap.set("#background", { x: "100%", opacity: 0 });
            gsap.set(LAYERS.CHARACTERS, { x: "-100%" });
            gsap.set(LAYERS.SPEECH, { opacity: 0, scale: 0.8, y: -20 });
        })
        
        // Panel 1 slide-in sequence (recreating original animation)
        .to("#background", {
            duration: 1.8,
            x: "0%",
            opacity: 1,
            ease: "power3.out"
        })
        .to(LAYERS.CHARACTERS, {
            duration: 1.8,
            x: "0%",
            ease: "power3.out"
        }, "-=1.4")
        .to(LAYERS.SPEECH, {
            duration: 1.0,
            opacity: 1,
            scale: 1,
            y: 0,
            ease: "back.out(1.7)"
        }, "-=0.4")
        .to(".nav-button", {
            duration: 0.8,
            opacity: 0.7,
            ease: "power2.out"
        }, "+=0.5")
        .call(() => {
            // Start floating animation for Panel 1
            startFloatingAnimation();
        });
}

// PANEL 0 MORPHING SYSTEM
function morphPanel0(direction) {
    const overlay1 = document.getElementById('backgroundOverlay1');
    const speechBubbleImg = document.querySelector('#speechBubble img');
    
    if (direction === 'next' && currentMorphStage < 1) {
        currentMorphStage++;
        
        hideNavigationButtons();
        
        const timeline = gsap.timeline();
        
        timeline
            // Shrink current background
            .to(LAYERS.BACKGROUND, {
                duration: 0.6,
                scale: 0.3,
                opacity: 0,
                ease: "power2.in"
            })
            // Fade out current speech bubble
            .to(LAYERS.SPEECH, {
                duration: 0.4,
                opacity: 0,
                ease: "power2.inOut"
            }, "-=0.3")
            .call(() => {
                // Load new background
                overlay1.src = 'images/background0-1.png';
                gsap.set(overlay1, { display: "block", opacity: 0, scale: 1 });
                
                // Load new speech bubble
                speechBubbleImg.src = 'images/speechbubble0-1.png';
                gsap.set(LAYERS.SPEECH, { opacity: 0, scale: 1 });
            })
            // Fade in new background
            .to(overlay1, {
                duration: 0.8,
                opacity: 1,
                ease: "power2.out"
            })
            // Fade in new speech bubble
            .to(LAYERS.SPEECH, {
                duration: 0.6,
                opacity: 1,
                ease: "power2.out"
            }, "-=0.3")
            .call(() => {
                showNavigationButtons();
            });
            
    } else if (direction === 'prev' && currentMorphStage > 0) {
        currentMorphStage--;
        
        hideNavigationButtons();
        
        const timeline = gsap.timeline();
        
        timeline
            .to(overlay1, {
                duration: 0.6,
                opacity: 0,
                ease: "power2.out"
            })
            .to(LAYERS.SPEECH, {
                duration: 0.4,
                opacity: 0,
                ease: "power2.inOut"
            }, "-=0.3")
            .call(() => {
                gsap.set(overlay1, { display: "none" });
                speechBubbleImg.src = 'images/speechbubble0.png';
                gsap.set(LAYERS.BACKGROUND, { scale: 1, opacity: 1 });
                gsap.set(LAYERS.SPEECH, { opacity: 0 });
            })
            .to(LAYERS.SPEECH, {
                duration: 0.6,
                opacity: 1,
                ease: "power2.out"
            })
            .call(() => {
                startPulsatingAnimation(); // Restart pulsating
                showNavigationButtons();
            });
    }
}

// PANEL 3 MORPHING SYSTEM
function morphPanel3(direction) {
    const overlay1 = document.getElementById('backgroundOverlay1');
    const overlay2 = document.getElementById('backgroundOverlay2');
    
    if (direction === 'next' && currentMorphStage < 2) {
        currentMorphStage++;
        
        if (currentMorphStage === 1) {
            overlay1.src = 'images/background3.png';
            gsap.set(overlay1, { display: "block", opacity: 0 });
            gsap.to(overlay1, {
                duration: 0.8,
                opacity: 1,
                ease: "power2.out",
                onComplete: showNavigationButtons
            });
        } else if (currentMorphStage === 2) {
            overlay2.src = 'images/background4.png';
            gsap.set(overlay2, { display: "block", opacity: 0 });
            gsap.to(overlay2, {
                duration: 0.8,
                opacity: 1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(LAYERS.SPEECH, {
                        duration: 0.6,
                        opacity: 1,
                        ease: "power2.out",
                        onComplete: showNavigationButtons
                    });
                }
            });
        }
    } else if (direction === 'prev' && currentMorphStage > 0) {
        if (currentMorphStage === 2) {
            gsap.to(overlay2, {
                duration: 0.8,
                opacity: 0,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set(overlay2, { display: "none" });
                    currentMorphStage--;
                    showNavigationButtons();
                }
            });
        } else if (currentMorphStage === 1) {
            gsap.to(overlay1, {
                duration: 0.8,
                opacity: 0,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set(overlay1, { display: "none" });
                    currentMorphStage--;
                    showNavigationButtons();
                }
            });
        }
    }
}

// PANEL 2 CHARACTER FADE IN
function startPanel2CharacterFadeIn() {
    // Start character invisible
    gsap.set(LAYERS.CHARACTERS, { opacity: 0 });
    
    // Fade in character gracefully
    gsap.to(LAYERS.CHARACTERS, {
        duration: 1.2,
        opacity: 1,
        ease: "power2.out",
        onComplete: showNavigationButtons
    });
}

// CHARACTER 3 RUNNING ANIMATION
function startCharacter3RunningAnimation() {
    const overlay1 = document.getElementById('backgroundOverlay1');
    
    const timeline = gsap.timeline();
    
    timeline
        .to(LAYERS.CHARACTERS, {
            duration: 2.5,
            width: "80%",
            height: "70%",
            bottom: "0%",
            left: "10%",
            ease: "power2.out"
        })
        .call(() => {
            overlay1.src = 'images/background5.png';
            gsap.set(overlay1, { display: "block", opacity: 0 });
            gsap.to(overlay1, {
                duration: 1.5,
                opacity: 1,
                ease: "power2.out",
                onComplete: showNavigationButtons
            });
        }, [], "-=1");
}

// SIMPLE PANEL 5 FADE IN
function startPanel5FadeIn() {
    // Start character invisible
    gsap.set(LAYERS.CHARACTERS, { opacity: 0 });
    
    // Fade in character
    gsap.to(LAYERS.CHARACTERS, {
        duration: 1.5,
        opacity: 1,
        ease: "power2.out",
        onComplete: showNavigationButtons
    });
}

// PULSATING ANIMATION FOR PANEL 0
function startPulsatingAnimation() {
    if (currentPanel === 0 && currentMorphStage === 0) {
        // Kill any existing pulsating animation
        gsap.killTweensOf(LAYERS.BACKGROUND);
        
        // Create pulsating animation
        gsap.to(LAYERS.BACKGROUND, {
            duration: 2.0,
            scale: 1.05,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1
        });
    }
}

// FLOATING ANIMATION FOR PANEL 1 - FIXED
function startFloatingAnimation() {
    if (currentPanel === 1) {
        // Kill any existing floating animation first
        if (bubbleFloatAnimation) {
            bubbleFloatAnimation.kill();
        }
        
        // Ensure speech bubble starts at normal scale
        gsap.set(LAYERS.SPEECH, { scale: 1, rotation: 0, y: 0 });
        
        // Create floating timeline that ONLY animates y and rotation, NOT scale
        bubbleFloatAnimation = gsap.timeline({ repeat: -1 });
        
        bubbleFloatAnimation
            .to(LAYERS.SPEECH, {
                duration: 1.2,
                y: -5,
                rotation: 1,
                ease: "power2.inOut"
            })
            .to(LAYERS.SPEECH, {
                duration: 1.2,
                y: 5,
                rotation: -1,
                ease: "power2.inOut"
            });
    }
}

// KILL ALL ANIMATIONS - ENHANCED AND FIXED
function killAllAnimations() {
    // Kill all GSAP animations using correct selectors
    gsap.killTweensOf(LAYERS.SPEECH);
    gsap.killTweensOf(LAYERS.CHARACTERS);
    gsap.killTweensOf(LAYERS.BACKGROUND);
    gsap.killTweensOf("#backgroundOverlay1");
    gsap.killTweensOf("#backgroundOverlay2");
    gsap.killTweensOf(LAYERS.STAGE);
    
    // Kill specific animations
    if (bubbleFloatAnimation) {
        bubbleFloatAnimation.kill();
        bubbleFloatAnimation = null;
    }
    
    // Reset stage transform (most important)
    gsap.set(LAYERS.STAGE, { 
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: "none"
    });
    
    // Reset speech bubble (safe to reset x/y as it's positioned absolutely)
    gsap.set(LAYERS.SPEECH, { 
        rotation: 0, 
        y: 0, 
        x: 0,
        scale: 1,
        opacity: 1,
        filter: "none"
    });
    
    // Reset background image (including pulsating scale)
    gsap.set(LAYERS.BACKGROUND, { 
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: "none"
    });
    
    // For characters, only reset safe properties and ensure visibility
    if (currentPanel !== 0) { // Don't show characters on Panel 0
        gsap.set(LAYERS.CHARACTERS, { 
            scale: 1,
            rotation: 0,
            opacity: 1,
            filter: "none",
            display: "block",
            visibility: "visible"
        });
        document.getElementById('characters').style.display = "block";
        document.getElementById('characters').style.opacity = "1";
        document.getElementById('characters').style.visibility = "visible";
    } else {
        // Hide characters on Panel 0
        gsap.set(LAYERS.CHARACTERS, { 
            opacity: 0,
            display: "none",
            visibility: "hidden"
        });
        document.getElementById('characters').style.display = "none";
    }
    
    // Reset overlays
    gsap.set(["#backgroundOverlay1", "#backgroundOverlay2"], { 
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0
    });
}

// NAVIGATION FUNCTIONS - ENHANCED
function goToNextPanel() {
    if (currentPanel === 0 && currentMorphStage < 1) {
        hideNavigationButtons();
        morphPanel0('next');
    } else if (currentPanel === 3 && currentMorphStage < 2) {
        hideNavigationButtons();
        morphPanel3('next');
    } else if (currentPanel < totalPanels - 1) { // Changed to totalPanels - 1 since we now have 6 panels (0-5)
        // CRITICAL: Kill all animations and reset transforms before transition
        killAllAnimations();
        transitionManager.killCurrentTransition();
        transitionToPanel(currentPanel + 1);
    }
}

function goToPreviousPanel() {
    if (currentPanel === 0 && currentMorphStage > 0) {
        hideNavigationButtons();
        morphPanel0('prev');
    } else if (currentPanel === 3 && currentMorphStage > 0) {
        hideNavigationButtons();
        morphPanel3('prev');
    } else if (currentPanel > 0) { // Changed to 0 since Panel 0 is now the first panel
        // CRITICAL: Kill all animations and reset transforms before transition
        killAllAnimations();
        transitionManager.killCurrentTransition();
        transitionToPanel(currentPanel - 1);
    }
}

// NAVIGATION BUTTON HELPERS
function showNavigationButtons() {
    gsap.to(".nav-button", {
        duration: 0.5,
        opacity: 0.7,
        ease: "power2.out"
    });
}

function hideNavigationButtons() {
    gsap.to(".nav-button", {
        duration: 0.3,
        opacity: 0,
        ease: "power2.out"
    });
}

function updateNavigationStates() {
    const leftButton = document.getElementById('navLeft');
    const rightButton = document.getElementById('navRight');
    
    // Update button visibility
    if (currentPanel === 0 && currentMorphStage === 0) {
        gsap.to(leftButton, { duration: 0.3, opacity: 0.3 });
    } else {
        gsap.to(leftButton, { duration: 0.3, opacity: 0.7 });
    }
    
    if (currentPanel === totalPanels - 1) { // Updated for 6 panels (0-5)
        gsap.to(rightButton, { duration: 0.3, opacity: 0.3 });
    } else {
        gsap.to(rightButton, { duration: 0.3, opacity: 0.7 });
    }
}

// MAIN TIMELINE AND INITIALIZATION
let mainTimeline;

function initializeElements() {
    gsap.set(LAYERS.BACKGROUND, { opacity: 0 }); // Start invisible for Panel 0
    gsap.set(LAYERS.SPEECH, { opacity: 0 }); // Start invisible for Panel 0
    gsap.set(".nav-button", { opacity: 0 });
    // DON'T set characters to hidden globally - let each panel control this
}

function createMainTimeline() {
    mainTimeline = gsap.timeline({ paused: true });
    
    mainTimeline
        .to("#startScreen", {
            duration: 0.6,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                document.getElementById('startScreen').classList.add('hidden');
            }
        })
        .call(() => {
            // FORCE Load Panel 0 after start screen fades
            console.log('Loading Panel 0 from main timeline');
            currentPanel = 0;
            currentMorphStage = 0;
            loadPanel(0, 0);
        })
        // PANEL 0 SEQUENCE: Speech bubble fades in first
        .to(LAYERS.SPEECH, {
            duration: 1.0,
            opacity: 1,
            ease: "power2.out"
        }, "+=0.3")
        // Background fades in
        .to(LAYERS.BACKGROUND, {
            duration: 1.2,
            opacity: 1,
            ease: "power2.out"
        }, "+=0.5")
        // Show navigation buttons
        .to(".nav-button", {
            duration: 0.8,
            opacity: 0.7,
            ease: "power2.out"
        }, "+=0.8")
        .call(() => {
            // Start pulsating animation
            startPulsatingAnimation();
        });
}

function startAnimation() {
    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    
    gsap.to(startButton, {
        duration: 0.1,
        scale: 0.95,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            mainTimeline.play();
        }
    });
}

// HEADLINE SEQUENCE
function playHeadlineSequence() {
    const timeline = gsap.timeline();
    
    timeline
        .to("#headline1", {
            duration: 1.2,
            opacity: 1,
            ease: "power2.out"
        })
        .to("#headline2", {
            duration: 1.2,
            opacity: 1,
            ease: "power2.out"
        }, "+=0.8")
        .to("#startButton", {
            duration: 1.0,
            opacity: 1,
            scale: 1,
            ease: "back.out(1.7)"
        }, "+=0.6");
}

// RESTART FUNCTION
function restartAnimation() {
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    
    currentPanel = 0; // RESET TO PANEL 0
    currentMorphStage = 0;
    
    // Kill any running transitions
    transitionManager.killCurrentTransition();
    killAllAnimations();
    
    startScreen.classList.remove('hidden');
    startButton.disabled = false;
    gsap.set("#startScreen", { opacity: 1 });
    gsap.set("#startButton", { opacity: 0 });
    
    initializeElements();
    loadPanel(0); // LOAD PANEL 0
    createMainTimeline();
    playHeadlineSequence();
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Comic system with layered transitions initialized');
    
    // FORCE Set initial panel 0 state
    currentPanel = 0;
    currentMorphStage = 0;
    
    // Initialize elements first
    initializeElements();
    
    // Load Panel 0 explicitly
    console.log('Initial load of Panel 0');
    loadPanel(0, 0);
    
    // Create timeline and play headline sequence
    createMainTimeline();
    playHeadlineSequence();
    
    // Event listeners
    document.getElementById('startButton').addEventListener('click', startAnimation);
    document.getElementById('navLeft').addEventListener('click', goToPreviousPanel);
    document.getElementById('navRight').addEventListener('click', goToNextPanel);
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'r') {
            restartAnimation();
        }
        if (e.key === 'ArrowLeft') {
            goToPreviousPanel();
        }
        if (e.key === 'ArrowRight') {
            goToNextPanel();
        }
    });
    
    console.log('🚀 Enhanced comic system ready!');
});