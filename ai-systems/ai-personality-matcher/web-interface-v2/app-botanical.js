/**
 * AI Personal Companion Generator - Botanisk Web App
 * Håndterer personlighetstest med botanisk tema og blomsteranimasjoner
 */

class BotanicalCompanionApp {
  constructor() {
    this.currentQuestion = 0;
    this.answers = [];
    this.testResults = null;
    this.personalityTest = null;
    
    this.init();
  }

  async init() {
    // Load personality test
    this.personalityTest = new PersonalityTest();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize UI with botanical theme
    this.updateGrowthProgress();
    this.displayCurrentQuestion();
    
    // Start botanical animations
    this.initBotanicalAnimations();
  }

  setupEventListeners() {
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Botanical scroll animations
    this.setupBotanicalScrollAnimations();
    
    // Interactive flower hover effects
    this.setupFlowerInteractions();
  }

  setupBotanicalScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) rotateX(0)';
          
          // Special botanical entrance animations
          if (entry.target.classList.contains('companion-flower')) {
            entry.target.style.animation = 'bloomIn 0.8s ease-out forwards';
          }
          if (entry.target.classList.contains('growth-step')) {
            entry.target.style.animation = 'growUp 0.6s ease-out forwards';
          }
        }
      });
    }, observerOptions);

    // Observe botanical elements
    document.querySelectorAll('.companion-flower, .growth-step, .test-container').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) rotateX(15deg)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(el);
    });
  }

  setupFlowerInteractions() {
    // Add interactive petal shedding on hover
    document.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.02) { // 2% chance per mouse move
        this.createFloatingPetal(e.clientX, e.clientY);
      }
    });

    // Add butterfly follow cursor effect
    this.setupButterflyInteraction();
  }

  setupButterflyInteraction() {
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Make butterflies occasionally fly towards cursor
    setInterval(() => {
      const butterflies = document.querySelectorAll('.butterfly');
      butterflies.forEach((butterfly, index) => {
        if (Math.random() < 0.1) { // 10% chance every interval
          const rect = butterfly.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = (mouseX - centerX) * 0.1;
          const deltaY = (mouseY - centerY) * 0.1;
          
          butterfly.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`;
          
          // Reset after a moment
          setTimeout(() => {
            butterfly.style.transform = '';
          }, 2000);
        }
      });
    }, 1000);
  }

  createFloatingPetal(x, y) {
    const petal = document.createElement('div');
    petal.className = 'dynamic-petal';
    petal.style.cssText = `
      position: fixed;
      width: 8px;
      height: 6px;
      background: linear-gradient(45deg, var(--peach), var(--coral));
      border-radius: 50% 40% 60% 35%;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
      animation: petalFall 3s ease-out forwards;
    `;
    
    document.body.appendChild(petal);
    
    // Remove after animation
    setTimeout(() => {
      petal.remove();
    }, 3000);
  }

  initBotanicalAnimations() {
    // Add swaying animation to stems
    const stems = document.querySelectorAll('.stem');
    stems.forEach((stem, index) => {
      stem.style.animation = `stemSway ${3 + index}s ease-in-out infinite`;
      stem.style.animationDelay = `${index * 0.5}s`;
    });

    // Add breathing animation to flowers
    const flowers = document.querySelectorAll('.peony-large, .cosmos-1, .cosmos-2');
    flowers.forEach((flower, index) => {
      flower.style.animation = `flowerBreathe ${4 + index * 0.5}s ease-in-out infinite`;
    });

    // Add CSS for dynamic animations
    if (!document.getElementById('botanical-animations')) {
      const style = document.createElement('style');
      style.id = 'botanical-animations';
      style.textContent = `
        @keyframes petalFall {
          0% { 
            opacity: 1; 
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translateY(100px) rotate(180deg) scale(0.5);
          }
        }
        
        @keyframes bloomIn {
          0% { 
            transform: scale(0.8) rotateY(-20deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.1) rotateY(0deg); 
          }
          100% { 
            transform: scale(1) rotateY(0deg); 
            opacity: 1; 
          }
        }
        
        @keyframes growUp {
          0% { 
            transform: translateY(30px) rotateX(10deg) scale(0.95); 
            opacity: 0; 
          }
          100% { 
            transform: translateY(0) rotateX(0deg) scale(1); 
            opacity: 1; 
          }
        }
        
        @keyframes stemSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes flowerBreathe {
          0%, 100% { transform: scale(1) rotateZ(0deg); }
          50% { transform: scale(1.02) rotateZ(1deg); }
        }
        
        .dynamic-petal {
          box-shadow: 0 2px 4px rgba(196, 137, 107, 0.3);
        }
      `;
      document.head.appendChild(style);
    }
  }

  displayCurrentQuestion() {
    if (!this.personalityTest) return;

    const questions = this.personalityTest.getFormattedQuestions();
    const question = questions[this.currentQuestion];
    
    const container = document.getElementById('questionContainer');
    if (!container) return;

    // Add botanical entrance animation to question container
    container.style.animation = 'questionBloom 0.6s ease-out';

    container.innerHTML = `
      <div class="question">
        <h3>${question.question}</h3>
        <div class="answers">
          ${question.answers.map(answer => `
            <div class="answer-option botanical-option" onclick="botanicalApp.selectAnswer('${answer.key}')" data-key="${answer.key}">
              <span class="option-letter">${answer.key}</span>
              <span class="option-text">${answer.text}</span>
              <div class="option-flower">🌸</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add botanical-specific styling to options
    const options = container.querySelectorAll('.answer-option');
    options.forEach((option, index) => {
      option.style.animationDelay = `${index * 0.1}s`;
      option.style.animation = 'optionGrow 0.4s ease-out forwards';
    });
  }

  selectAnswer(answerKey) {
    // Remove previous selection
    document.querySelectorAll('.answer-option').forEach(option => {
      option.classList.remove('selected');
      option.querySelector('.option-flower').textContent = '🌸';
    });

    // Add selection to clicked option with botanical effect
    const selectedOption = document.querySelector(`[data-key="${answerKey}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      selectedOption.querySelector('.option-flower').textContent = '🌺';
      
      // Add blooming effect
      selectedOption.style.animation = 'selectBloom 0.4s ease-out';
      
      // Create petal burst effect
      this.createPetalBurst(selectedOption);
    }

    // Store answer
    this.answers[this.currentQuestion] = answerKey;

    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.animation = 'buttonGlow 0.5s ease-out';
    }
  }

  createPetalBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 5 petals that burst outward
    for (let i = 0; i < 5; i++) {
      const petal = document.createElement('div');
      const angle = (i / 5) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;

      petal.style.cssText = `
        position: fixed;
        width: 6px;
        height: 4px;
        background: var(--coral);
        border-radius: 50% 40% 60% 35%;
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 1000;
        animation: petalBurst 0.8s ease-out forwards;
        transform-origin: center;
      `;
      
      petal.style.setProperty('--end-x', `${endX - centerX}px`);
      petal.style.setProperty('--end-y', `${endY - centerY}px`);
      
      document.body.appendChild(petal);
      
      setTimeout(() => petal.remove(), 800);
    }

    // Add petal burst keyframes if not exists
    if (!document.querySelector('#petal-burst-styles')) {
      const style = document.createElement('style');
      style.id = 'petal-burst-styles';
      style.textContent = `
        @keyframes petalBurst {
          0% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: translate(var(--end-x), var(--end-y)) scale(0.3) rotate(180deg);
            opacity: 0;
          }
        }
        
        @keyframes selectBloom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes buttonGlow {
          0% { box-shadow: var(--shadow-petal); }
          50% { box-shadow: 0 0 20px var(--coral); }
          100% { box-shadow: var(--shadow-flower); }
        }
        
        @keyframes questionBloom {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes optionGrow {
          0% { 
            opacity: 0; 
            transform: translateY(15px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        
        .option-flower {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }
        
        .answer-option:hover .option-flower {
          transform: translateY(-50%) scale(1.2) rotate(15deg);
        }
        
        .answer-option.selected .option-flower {
          animation: flowerSpin 0.6s ease-out;
        }
        
        @keyframes flowerSpin {
          0% { transform: translateY(-50%) rotate(0deg) scale(1); }
          50% { transform: translateY(-50%) rotate(180deg) scale(1.3); }
          100% { transform: translateY(-50%) rotate(360deg) scale(1.2); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  updateGrowthProgress() {
    const progressGrowth = document.getElementById('progressGrowth');
    const progressBloom = document.getElementById('progressBloom');
    const progressText = document.getElementById('progressText');
    
    if (progressGrowth && progressBloom && progressText) {
      const progress = ((this.currentQuestion + 1) / 8) * 100;
      
      // Update growth stem
      progressGrowth.style.width = `${progress}%;`
      
      // Update flower bloom
      progressBloom.style.width = `${progress}%;`
      
      // Update text with botanical language
      const growthStages = [
        'Planter frø 🌰',
        'Frøspiring 🌱', 
        'Første blader 🍃',
        'Vokser høyt 🌿',
        'Knopper dannes 🟢',
        'Blomsterknopper 🌸',
        'Fullt blomst 🌺',
        'Perfekt hage 🌻'
      ];
      
      progressText.textContent = `Spørsmål ${this.currentQuestion + 1} av 8 - ${growthStages[this.currentQuestion]}`;
    }

    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestion === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = !this.answers[this.currentQuestion];
      nextBtn.textContent = this.currentQuestion === 7 ? '🌺 Se Min Hage' : 'Neste →';
    }
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.displayCurrentQuestion();
      this.updateGrowthProgress();
    }
  }

  nextQuestion() {
    if (this.currentQuestion < 7) {
      this.currentQuestion++;
      this.displayCurrentQuestion();
      this.updateGrowthProgress();
    } else {
      this.showBotanicalResults();
    }
  }

  showBotanicalResults() {
    if (!this.personalityTest) return;

    this.testResults = this.personalityTest.calculateMatch(this.answers);
    
    // Hide test container with fade out
    const testContainer = document.getElementById('testContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (testContainer && resultsContainer) {
      testContainer.style.animation = 'fadeOutDown 0.5s ease-in forwards';
      
      setTimeout(() => {
        testContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.style.animation = 'gardenBloom 1s ease-out forwards';
      }, 500);
    }

    this.displayBotanicalResults();
  }

  displayBotanicalResults() {
    const topMatch = this.testResults.topMatch;
    
    // Display top match with botanical theming
    const topMatchContainer = document.getElementById('topMatchFlower');
    if (topMatchContainer) {
      topMatchContainer.innerHTML = `
        <div class="match-icon">${this.getPersonalityFlower(topMatch.key)}</div>
        <div class="match-name">${topMatch.name}</div>
        <div class="match-tagline">"${topMatch.tagline}"</div>
        <div class="match-score">${(topMatch.score * 100).toFixed(1)}% Kompatibilitet</div>
        <p style="margin-top: 1rem; opacity: 0.9;">🌿 ${topMatch.ideal_for}</p>
        <div class="compatibility-garden">
          <div class="compatibility-flowers">
            ${this.createCompatibilityFlowers(topMatch.score)}
          </div>
        </div>
      `;
    }

    // Display all matches as a garden
    const allMatchesContainer = document.getElementById('allMatchesGarden');
    if (allMatchesContainer) {
      allMatchesContainer.innerHTML = `
        <div class="garden-bed">
          ${this.testResults.top3.map((match, index) => `
            <div class="garden-plot" style="animation-delay: ${index * 0.2}s;">
              <div class="plant-pot">
                <div class="soil"></div>
                <div class="plant-stem"></div>
                <div class="plant-flower">
                  ${this.getPersonalityFlower(match.key)}
                </div>
              </div>
              <div class="plant-label">
                <h4>${match.name}</h4>
                <p class="compatibility-score">${(match.score * 100).toFixed(1)}% match</p>
                <p class="plant-description">${match.ideal_for}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Add garden-specific styles
    this.addGardenStyles();

    // Scroll to results with smooth botanical transition
    setTimeout(() => {
      resultsContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  }

  addGardenStyles() {
    if (!document.querySelector('#garden-results-styles')) {
      const style = document.createElement('style');
      style.id = 'garden-results-styles';
      style.textContent = `
        @keyframes gardenBloom {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(30px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeOutDown {
          0% { 
            opacity: 1; 
            transform: translateY(0);
          }
          100% { 
            opacity: 0; 
            transform: translateY(20px);
          }
        }
        
        .compatibility-garden {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .compatibility-flowers {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .compatibility-flower {
          font-size: 1.5rem;
          animation: flowerPop 0.4s ease-out forwards;
          transform: scale(0);
        }
        
        .garden-bed {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .garden-plot {
          background: var(--warm-white);
          border-radius: var(--radius-organic);
          padding: 1.5rem;
          box-shadow: var(--shadow-flower);
          border: 2px solid rgba(196, 137, 107, 0.1);
          animation: plotGrow 0.6s ease-out forwards;
          transform: translateY(30px);
          opacity: 0;
        }
        
        .plant-pot {
          position: relative;
          height: 100px;
          margin-bottom: 1rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        
        .soil {
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 20px;
          background: linear-gradient(to bottom, var(--soft-brown), var(--forest-green));
          border-radius: 0 0 50% 50%;
        }
        
        .plant-stem {
          width: 4px;
          height: 40px;
          background: linear-gradient(to bottom, var(--sage-green), var(--forest-green));
          border-radius: 2px;
          position: relative;
          z-index: 2;
        }
        
        .plant-flower {
          position: absolute;
          top: 20px;
          font-size: 2.5rem;
          animation: flowerGrow 0.8s ease-out 0.3s forwards;
          transform: scale(0);
        }
        
        .plant-label {
          text-align: center;
        }
        
        .plant-label h4 {
          font-family: var(--font-display);
          color: var(--terracotta-dark);
          margin-bottom: 0.5rem;
        }
        
        .compatibility-score {
          font-weight: 600;
          color: var(--coral);
          margin-bottom: 0.5rem;
        }
        
        .plant-description {
          font-size: 0.9rem;
          color: var(--sage-green);
          line-height: 1.5;
        }
        
        @keyframes flowerPop {
          0% { transform: scale(0) rotate(0deg); }
          80% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes plotGrow {
          0% { 
            opacity: 0; 
            transform: translateY(30px) rotateX(10deg);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) rotateX(0deg);
          }
        }
        
        @keyframes flowerGrow {
          0% { 
            transform: scale(0) rotateY(-90deg);
            opacity: 0;
          }
          50% { 
            transform: scale(1.1) rotateY(0deg);
            opacity: 1;
          }
          100% { 
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  createCompatibilityFlowers(score) {
    const numFlowers = Math.round(score * 5); // 0-5 flowers based on compatibility
    const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
    let flowerDisplay = '';
    
    for (let i = 0; i < 5; i++) {
      const flower = i < numFlowers ? flowers[i % flowers.length] : '🌑';
      flowerDisplay += `<span class="compatibility-flower" style="animation-delay: ${i * 0.1}s">${flower}</span>`;
    }
    
    return flowerDisplay;
  }

  getPersonalityFlower(key) {
    const flowers = {
      krin: '🌺',      // Pink hibiscus - loving and warm
      nova: '⚡',      // Lightning - high energy  
      sage: '🌸',      // Cherry blossom - creative and thoughtful
      byte: '🤖',      // Robot - tech focused
      luna: '🌟',      // Star - guiding light
      echo: '🎭',      // Theater masks - adaptive
      atlas: '📚',     // Books - knowledge focused
      quantum: '🚀',   // Rocket - future focused
      guardian: '🛡️',   // Shield - protective
      zen: '☯️'       // Yin yang - balanced
    };
    return flowers[key] || '🌼';
  }

  retakeTest() {
    // Reset test state
    this.currentQuestion = 0;
    this.answers = [];
    this.testResults = null;

    // Show test container, hide results with botanical transition
    const testContainer = document.getElementById('testContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (testContainer && resultsContainer) {
      resultsContainer.style.animation = 'fadeOutUp 0.5s ease-in forwards';
      
      setTimeout(() => {
        resultsContainer.style.display = 'none';
        testContainer.style.display = 'block';
        testContainer.style.animation = 'bloomIn 0.6s ease-out forwards';
      }, 500);
    }

    // Reset UI
    this.updateGrowthProgress();
    this.displayCurrentQuestion();

    // Create welcome back petal shower
    this.createPetalShower();

    // Scroll to test
    const testSection = document.getElementById('test');
    if (testSection) {
      testSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  createPetalShower() {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.createFloatingPetal(
          Math.random() * window.innerWidth,
          -20
        );
      }, i * 200);
    }
  }

  async generateCompanion() {
    if (!this.testResults) return;

    const topMatch = this.testResults.topMatch;
    
    // Show loading state with botanical animation
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🌱 Vokser...';
    btn.disabled = true;
    btn.style.animation = 'growthPulse 1s ease-in-out infinite';

    try {
      await this.simulateCompanionGeneration(topMatch);
      this.showBotanicalGenerationSuccess(topMatch);
      
    } catch (error) {
      console.error('Failed to generate companion:', error);
      alert('🌿 Kunne ikke dyrke companionen. Prøv igjen!');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.animation = '';
    }
  }

  async simulateCompanionGeneration(personality) {
    return new Promise(resolve => {
      setTimeout(resolve, 2500);
    });
  }

  showBotanicalGenerationSuccess(personality) {
    const modal = document.createElement('div');
    modal.className = 'botanical-modal';
    modal.innerHTML = `
      <div class="modal-garden">
        <div class="modal-header">
          <h3>🌺 Din AI-Hage Blomstrer!</h3>
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="success-garden">
            <div class="garden-celebration">
              <div class="celebration-flower">${this.getPersonalityFlower(personality.key)}</div>
              <div class="celebration-name">${personality.name}</div>
              <div class="celebration-tagline">"${personality.tagline}"</div>
            </div>
          </div>
          
          <div class="garden-instructions">
            <h5>🌿 Din personlige hage er klar:</h5>
            <ol>
              <li>Last ned og kjør installeren</li>
              <li>Følg oppsett-veiviseren</li>
              <li>Start å dyrke med ${personality.name}!</li>
            </ol>
          </div>
          
          <div class="modal-actions">
            <a href="#install" class="bloom-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
              🌱 Last ned Installer
            </a>
            <button class="garden-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
              Lukk Hage
            </button>
          </div>
        </div>
        <div class="floating-petals">
          <div class="modal-petal"></div>
          <div class="modal-petal"></div>
          <div class="modal-petal"></div>
          <div class="modal-petal"></div>
          <div class="modal-petal"></div>
        </div>
      </div>
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    `;

    // Add modal botanical styles
    if (!document.querySelector('#botanical-modal-styles')) {
      const modalStyles = document.createElement('style');
      modalStyles.id = 'botanical-modal-styles';
      modalStyles.textContent = `
        .botanical-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(196, 137, 107, 0.4);
          backdrop-filter: blur(10px);
        }
        
        .modal-garden {
          background: var(--warm-white);
          border-radius: var(--radius-organic);
          padding: var(--space-2xl);
          max-width: 500px;
          width: 90%;
          position: relative;
          box-shadow: var(--shadow-deep);
          animation: gardenModalBloom 0.6s ease-out;
          overflow: hidden;
        }
        
        .modal-garden::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(232, 180, 160, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 181, 160, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        @keyframes gardenModalBloom {
          0% {
            opacity: 0;
            transform: scale(0.8) rotateY(-15deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) rotateY(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-lg);
          border-bottom: 2px solid rgba(196, 137, 107, 0.1);
          position: relative;
          z-index: 2;
        }
        
        .modal-header h3 {
          font-family: var(--font-display);
          color: var(--terracotta-dark);
          font-size: 1.5rem;
        }
        
        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--sage-green);
          padding: 0;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-gentle);
        }
        
        .close-modal:hover {
          background: var(--peach);
          color: white;
          transform: rotate(90deg);
        }
        
        .success-garden {
          text-align: center;
          margin-bottom: var(--space-lg);
          position: relative;
          z-index: 2;
        }
        
        .garden-celebration {
          padding: var(--space-lg);
        }
        
        .celebration-flower {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
          animation: celebrationBounce 1s ease-in-out infinite;
        }
        
        .celebration-name {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--terracotta-dark);
          margin-bottom: var(--space-sm);
        }
        
        .celebration-tagline {
          color: var(--sage-green);
          font-style: italic;
          margin-bottom: var(--space-lg);
        }
        
        .garden-instructions {
          background: var(--cream);
          border-radius: var(--radius-soft);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
          position: relative;
          z-index: 2;
        }
        
        .garden-instructions h5 {
          margin-bottom: var(--space-md);
          color: var(--terracotta-dark);
        }
        
        .garden-instructions ol {
          margin: 0;
          padding-left: var(--space-lg);
        }
        
        .garden-instructions li {
          margin-bottom: var(--space-sm);
          color: var(--sage-green);
        }
        
        .modal-actions {
          display: flex;
          gap: var(--space-lg);
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        
        .floating-petals {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .modal-petal {
          position: absolute;
          width: 8px;
          height: 6px;
          background: var(--peach);
          border-radius: 50% 40% 60% 35%;
          animation: modalPetalFloat 4s ease-in-out infinite;
        }
        
        .modal-petal:nth-child(1) {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }
        
        .modal-petal:nth-child(2) {
          top: 30%;
          right: 25%;
          animation-delay: -1s;
        }
        
        .modal-petal:nth-child(3) {
          bottom: 40%;
          left: 30%;
          animation-delay: -2s;
        }
        
        .modal-petal:nth-child(4) {
          bottom: 20%;
          right: 15%;
          animation-delay: -3s;
        }
        
        .modal-petal:nth-child(5) {
          top: 50%;
          left: 50%;
          animation-delay: -1.5s;
        }
        
        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          50% { transform: translateY(-10px) rotateZ(5deg); }
        }
        
        @keyframes modalPetalFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 0.7; 
          }
          50% { 
            transform: translateY(-15px) rotate(180deg); 
            opacity: 0.3; 
          }
        }
        
        @keyframes growthPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeOutUp {
          0% { 
            opacity: 1; 
            transform: translateY(0);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-20px);
          }
        }
      `;
      document.head.appendChild(modalStyles);
    }

    document.body.appendChild(modal);
    
    // Create celebration petal shower
    setTimeout(() => {
      this.createPetalShower();
    }, 300);
  }
}

// Global functions for HTML onclick handlers
function startPersonalityTest() {
  const testSection = document.getElementById('test');
  if (testSection) {
    testSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function exploreGarden() {
  const gardenSection = document.getElementById('companions');
  if (gardenSection) {
    gardenSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function previousQuestion() {
  if (window.botanicalApp) {
    window.botanicalApp.previousQuestion();
  }
}

function nextQuestion() {
  if (window.botanicalApp) {
    window.botanicalApp.nextQuestion();
  }
}

function generateCompanion() {
  if (window.botanicalApp) {
    window.botanicalApp.generateCompanion();
  }
}

function retakeTest() {
  if (window.botanicalApp) {
    window.botanicalApp.retakeTest();
  }
}

function copyInstallCommand() {
  const command = "curl -fsSL https://raw.githubusercontent.com/your-repo/ai-companion-generator/main/install.sh | bash";
  navigator.clipboard.writeText(command).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🌱 Kopiert!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

// Initialize botanical app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize botanical companion app
  window.botanicalApp = new BotanicalCompanionApp();
  
  console.log('🌸 Botanisk AI Companion Generator initialisert!');
});