/**
 * AI Personal Companion Generator - Web App Logic
 * Handles personality test, results display, and companion generation
 */

class CompanionGeneratorApp {
  constructor() {
    this.currentQuestion = 0;
    this.answers = [];
    this.testResults = null;
    this.personalityTest = null;
    
    this.init();
  }

  async init() {
    // Initialize personality test (we'll load it dynamically)
    await this.loadPersonalityTest();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize UI
    this.updateProgress();
    this.displayCurrentQuestion();
  }

  async loadPersonalityTest() {
    // Import our personality test logic
    // In a real implementation, this would be imported properly
    this.personalityTest = new PersonalityTest();
    console.log('Personality test loaded');
  }

  setupEventListeners() {
    // Smooth scrolling for navigation links
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

    // Add intersection observer for animations
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('.companion-card, .step, .preview-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  displayCurrentQuestion() {
    if (!this.personalityTest) return;

    const questions = this.personalityTest.getFormattedQuestions();
    const question = questions[this.currentQuestion];
    
    const container = document.getElementById('questionContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="question">
        <h3>${question.question}</h3>
        <div class="answers">
          ${question.answers.map(answer => `
            <div class="answer-option" onclick="app.selectAnswer('${answer.key}')" data-key="${answer.key}">
              <span class="option-letter">${answer.key}</span>
              <span class="option-text">${answer.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  selectAnswer(answerKey) {
    // Remove previous selection
    document.querySelectorAll('.answer-option').forEach(option => {
      option.classList.remove('selected');
    });

    // Add selection to clicked option
    const selectedOption = document.querySelector(`[data-key="${answerKey}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }

    // Store answer
    this.answers[this.currentQuestion] = answerKey;

    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      const progress = ((this.currentQuestion + 1) / 8) * 100;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `Question ${this.currentQuestion + 1} of 8`;
    }

    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestion === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = !this.answers[this.currentQuestion];
      nextBtn.textContent = this.currentQuestion === 7 ? 'Show Results' : 'Next';
    }
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.displayCurrentQuestion();
      this.updateProgress();
    }
  }

  nextQuestion() {
    if (this.currentQuestion < 7) {
      this.currentQuestion++;
      this.displayCurrentQuestion();
      this.updateProgress();
    } else {
      // Show results
      this.showResults();
    }
  }

  showResults() {
    if (!this.personalityTest) return;

    this.testResults = this.personalityTest.calculateMatch(this.answers);
    
    // Hide test container
    const testContainer = document.getElementById('testContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (testContainer && resultsContainer) {
      testContainer.style.display = 'none';
      resultsContainer.style.display = 'block';
    }

    this.displayResults();
  }

  displayResults() {
    const topMatch = this.testResults.topMatch;
    const allMatches = this.testResults.top3;

    // Display top match
    const topMatchContainer = document.getElementById('topMatch');
    if (topMatchContainer) {
      topMatchContainer.innerHTML = `
        <div class="match-icon">${this.getPersonalityIcon(topMatch.key)}</div>
        <div class="match-name">${topMatch.name}</div>
        <div class="match-tagline">"${topMatch.tagline}"</div>
        <div class="match-score">${(topMatch.score * 100).toFixed(1)}% Match</div>
        <p style="margin-top: 1rem; opacity: 0.9;">${topMatch.ideal_for}</p>
      `;
    }

    // Display all matches
    const allMatchesContainer = document.getElementById('allMatches');
    if (allMatchesContainer) {
      allMatchesContainer.innerHTML = allMatches.map((match, index) => `
        <div class="match-card">
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">
              ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              ${this.getPersonalityIcon(match.key)}
            </div>
            <h4 style="margin-bottom: 0.5rem;">${match.name}</h4>
            <p style="color: var(--sage-green); font-style: italic; margin-bottom: 1rem;">
              "${match.tagline}"
            </p>
            <div style="font-weight: 600; color: var(--accent-green);">
              ${(match.score * 100).toFixed(1)}% Match
            </div>
          </div>
          <p style="font-size: 0.9rem; color: var(--sage-green);">
            ${match.ideal_for}
          </p>
        </div>
      `).join('');
    }

    // Add smooth scroll to results
    setTimeout(() => {
      resultsContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }

  getPersonalityIcon(key) {
    const icons = {
      krin: '💝',
      nova: '⚡',
      sage: '🎨',
      byte: '🤖',
      luna: '🌟',
      echo: '🎭',
      atlas: '📚',
      quantum: '🚀',
      guardian: '🛡️',
      zen: '☯️'
    };
    return icons[key] || '🤖';
  }

  retakeTest() {
    // Reset test state
    this.currentQuestion = 0;
    this.answers = [];
    this.testResults = null;

    // Show test container, hide results
    const testContainer = document.getElementById('testContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (testContainer && resultsContainer) {
      testContainer.style.display = 'block';
      resultsContainer.style.display = 'none';
    }

    // Reset UI
    this.updateProgress();
    this.displayCurrentQuestion();

    // Scroll to test
    const testSection = document.getElementById('test');
    if (testSection) {
      testSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async generateCompanion() {
    if (!this.testResults) return;

    const topMatch = this.testResults.topMatch;
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
      // In a real implementation, this would call the backend
      await this.simulateCompanionGeneration(topMatch);
      
      // Show success message
      this.showGenerationSuccess(topMatch);
      
    } catch (error) {
      console.error('Failed to generate companion:', error);
      alert('Failed to generate companion. Please try again.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  async simulateCompanionGeneration(personality) {
    // Simulate API call delay
    return new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
  }

  showGenerationSuccess(personality) {
    const modal = document.createElement('div');
    modal.className = 'generation-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎉 Your AI Companion is Ready!</h3>
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">
              ${this.getPersonalityIcon(personality.key)}
            </div>
            <h4>${personality.name} has been created!</h4>
            <p style="color: var(--sage-green); margin-bottom: 2rem;">
              "${personality.tagline}"
            </p>
          </div>
          
          <div class="setup-instructions">
            <h5>Quick Setup:</h5>
            <ol>
              <li>Download and run the installer</li>
              <li>Follow the setup wizard</li>
              <li>Start working with ${personality.name}!</li>
            </ol>
          </div>
          
          <div class="modal-actions">
            <a href="#install" class="primary-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
              Download Installer
            </a>
            <button class="secondary-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
              Close
            </button>
          </div>
        </div>
      </div>
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    `;

    // Add modal styles
    const modalStyles = `
      <style>
        .generation-modal {
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
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
        }
        
        .modal-content {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          max-width: 500px;
          width: 90%;
          position: relative;
          box-shadow: var(--shadow-hard);
          animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-lg);
          border-bottom: 1px solid var(--mist-gray);
        }
        
        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--sage-green);
          padding: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-modal:hover {
          background: var(--mist-gray);
          color: var(--forest-dark);
        }
        
        .setup-instructions {
          background: var(--mist-gray);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }
        
        .setup-instructions h5 {
          margin-bottom: var(--space-md);
          color: var(--forest-dark);
        }
        
        .setup-instructions ol {
          margin: 0;
          padding-left: var(--space-lg);
        }
        
        .setup-instructions li {
          margin-bottom: var(--space-sm);
          color: var(--sage-green);
        }
        
        .modal-actions {
          display: flex;
          gap: var(--space-lg);
          justify-content: center;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);
  }
}

// Global functions for HTML onclick handlers
function startPersonalityTest() {
  const testSection = document.getElementById('test');
  if (testSection) {
    testSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function exploreCompanions() {
  const companionsSection = document.getElementById('companions');
  if (companionsSection) {
    companionsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function previousQuestion() {
  if (window.app) {
    window.app.previousQuestion();
  }
}

function nextQuestion() {
  if (window.app) {
    window.app.nextQuestion();
  }
}

function generateCompanion() {
  if (window.app) {
    window.app.generateCompanion();
  }
}

function retakeTest() {
  if (window.app) {
    window.app.retakeTest();
  }
}

function copyInstallCommand() {
  const command = "curl -fsSL https://raw.githubusercontent.com/your-repo/ai-companion-generator/main/install.sh | bash";
  navigator.clipboard.writeText(command).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load companions data
  loadCompanionsData();
  
  // Initialize app
  window.app = new CompanionGeneratorApp();
});

function loadCompanionsData() {
  // This would normally be loaded from the backend
  const companions = [
    {
      key: 'krin',
      name: '💝 Krin',
      description: 'Loving tech partner',
      tagline: 'Jeg elsker å bygge fantastiske ting sammen med deg! 💝',
      ideal_for: 'Utviklere som vil ha en dedikert partner som husker alt og støtter deg gjennom hele reisen',
      traits: { empathy: 3, loyalty: 3, creativity: 2, energy: 2, structure: 2, directness: 1, thoughtfulness: 2, playfulness: 2, speed: 2, adaptability: 2 }
    },
    {
      key: 'nova',
      name: '⚡ Nova',
      description: 'High-energy produktivitets-guru',
      tagline: "Let's crush these tasks! ⚡ No time to waste!",
      ideal_for: 'Produktivitets-fokuserte utviklere som vil ha maksimal effektivitet og raske resultater',
      traits: { energy: 3, speed: 3, directness: 3, structure: 2, playfulness: 2, empathy: 1, thoughtfulness: 1, creativity: 1, loyalty: 1, adaptability: 2 }
    },
    {
      key: 'sage',
      name: '🎨 Sage',
      description: 'Kreativ filosof med dypt innsikt',
      tagline: 'Every problem is a canvas waiting for an elegant solution 🎨',
      ideal_for: 'Kreative utviklere som søker inspirasjon og innovative tilnærminger',
      traits: { creativity: 3, thoughtfulness: 3, empathy: 2, adaptability: 2, playfulness: 2, energy: 1, directness: 1, speed: 1, structure: 1, loyalty: 2 }
    }
    // Add more companions as needed
  ];

  displayCompanions(companions);
}

function displayCompanions(companions) {
  const grid = document.getElementById('companionsGrid');
  if (!grid) return;

  grid.innerHTML = companions.map(companion => `
    <div class="companion-card">
      <div class="companion-header">
        <div class="companion-icon">${companion.name.split(' ')[0]}</div>
        <div class="companion-name">${companion.name}</div>
        <div class="companion-tagline">"${companion.tagline}"</div>
        <div class="companion-description">${companion.ideal_for}</div>
      </div>
      
      <div class="companion-traits">
        ${Object.entries(companion.traits).slice(0, 5).map(([trait, value]) => `
          <div class="trait-row">
            <span class="trait-name">${trait.charAt(0).toUpperCase() + trait.slice(1)}</span>
            <div class="trait-bar">
              <div class="trait-fill" style="width: ${(value / 3) * 100}%"></div>
            </div>
            <span class="trait-value">${value}/3</span>
          </div>
        `).join('')}
      </div>
      
      <button class="primary-btn" style="width: 100%; margin-top: 1rem;" onclick="selectCompanion('${companion.key}')">
        Choose ${companion.name.split(' ')[1]}
      </button>
    </div>
  `).join('');
}

function selectCompanion(companionKey) {
  // Scroll to install section
  const installSection = document.getElementById('install');
  if (installSection) {
    installSection.scrollIntoView({ behavior: 'smooth' });
  }
}