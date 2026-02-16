/**
 * QuestionRenderer Component
 * Dynamically renders different question types
 */
class QuestionRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentQuestion = null;
  }

  /**
   * Render a question based on its type
   */
  render(questionData) {
    if (!this.container) {
      console.error('Question container not found');
      return;
    }

    const { question, questionNumber, totalQuestions, progress } = questionData;
    this.currentQuestion = question;

    const html = `
      <div class="question-card" data-question-id="${question.id}">
        <div class="question-header">
          <div class="question-number">Question ${questionNumber} of ~${totalQuestions}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <div class="question-content">
          <h3 class="question-text">${question.text}</h3>
          ${question.helpText ? `<p class="question-help">${question.helpText}</p>` : ''}
          
          <div class="question-input">
            ${this.renderInput(question)}
          </div>
          
          ${question.required ? '<span class="required-indicator">* Required</span>' : ''}
        </div>
        
        <div class="question-error" id="error-${question.id}" style="display: none;"></div>
        
        <div class="question-actions">
          <button class="btn btn-back" data-action="back" ${questionNumber === 1 ? 'disabled' : ''}>
            ← Back
          </button>
          <button class="btn btn-primary btn-submit" data-action="submit" data-question-id="${question.id}" data-question-type="${question.type}">
            ${questionNumber < totalQuestions ? 'Next →' : 'Get My Answer →'}
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Attach event listeners after rendering
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to buttons
   */
  attachEventListeners() {
    // Submit button
    const submitBtn = this.container.querySelector('.btn-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const questionId = e.target.dataset.questionId;
        const questionType = e.target.dataset.questionType;
        this.submitAnswer(questionId, questionType);
      });
    }

    // Back button
    const backBtn = this.container.querySelector('.btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goBack();
      });
    }

    // Yes/No buttons
    const yesNoButtons = this.container.querySelectorAll('.choice-btn');
    yesNoButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const value = e.target.dataset.value;
        this.selectYesNo(e.target, value);
      });
    });
  }

  /**
   * Render input based on question type
   */
  renderInput(question) {
    switch (question.type) {
      case 'yes-no':
        return this.renderYesNo(question);
      case 'select':
        return this.renderSelect(question);
      case 'multi-select':
        return this.renderMultiSelect(question);
      case 'number':
        return this.renderNumber(question);
      case 'text':
        return this.renderText(question);
      default:
        return '<p>Unknown question type</p>';
    }
  }

  /**
   * Render yes/no buttons
   */
  renderYesNo(question) {
    return `
      <div class="yes-no-buttons">
        <button class="choice-btn" data-value="yes" type="button">
          ✓ Yes
        </button>
        <button class="choice-btn" data-value="no" type="button">
          ✗ No
        </button>
      </div>
      <input type="hidden" id="answer-${question.id}" name="${question.id}" ${question.required ? 'required' : ''}>
    `;
  }

  /**
   * Render select dropdown
   */
  renderSelect(question) {
    return `
      <select id="answer-${question.id}" name="${question.id}" class="input" ${question.required ? 'required' : ''}>
        <option value="">-- Select an option --</option>
        ${question.options.map(opt => `
          <option value="${opt.value}">${opt.icon || ''} ${opt.label}</option>
        `).join('')}
      </select>
    `;
  }

  /**
   * Render multi-select checkboxes
   */
  renderMultiSelect(question) {
    return `
      <div class="multi-select">
        ${question.options.map(opt => `
          <label class="checkbox-label">
            <input type="checkbox" name="${question.id}" value="${opt.value}" class="checkbox">
            <span>${opt.icon || ''} ${opt.label}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render number input
   */
  renderNumber(question) {
    return `
      <div class="number-input-group">
        <input 
          type="number" 
          id="answer-${question.id}" 
          name="${question.id}" 
          class="input" 
          placeholder="${question.placeholder || ''}"
          ${question.validation?.min !== undefined ? `min="${question.validation.min}"` : ''}
          ${question.validation?.max !== undefined ? `max="${question.validation.max}"` : ''}
          ${question.required ? 'required' : ''}
        >
        ${question.unit ? `<span class="input-unit">${question.unit}</span>` : ''}
      </div>
    `;
  }

  /**
   * Render text input
   */
  renderText(question) {
    return `
      <input 
        type="text" 
        id="answer-${question.id}" 
        name="${question.id}" 
        class="input" 
        placeholder="${question.placeholder || ''}"
        ${question.required ? 'required' : ''}
      >
    `;
  }

  /**
   * Handle yes/no selection
   */
  selectYesNo(button, value) {
    const container = button.closest('.yes-no-buttons');
    const hiddenInput = container.nextElementSibling;
    const allButtons = container.querySelectorAll('.choice-btn');
    
    // Remove active class from all buttons
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    button.classList.add('active');
    
    // Set hidden input value
    hiddenInput.value = value;
  }

  /**
   * Submit answer
   */
  async submitAnswer(questionId, questionType) {
    const answer = this.getAnswerValue(questionId, questionType);
    
    if (answer === null || answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
      this.showError(questionId, 'This question is required');
      return;
    }

    this.hideError(questionId);
    this.showLoading();

    try {
      const response = await fetch('/api/guided-permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          sessionId: window.guidedSessionId,
          questionId: questionId,
          answer: answer
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showError(questionId, data.error || 'Failed to submit answer');
        this.hideLoading();
        return;
      }

      if (data.hasMore) {
        // Show next question
        this.render(data);
      } else if (data.complete) {
        // Show results
        window.resultDisplay.render(data.result);
      }
      
      this.hideLoading();
    } catch (error) {
      this.showError(questionId, 'Network error. Please try again.');
      this.hideLoading();
      console.error('Submit answer error:', error);
    }
  }

  /**
   * Get answer value based on question type
   */
  getAnswerValue(questionId, questionType) {
    if (questionType === 'multi-select') {
      const checkboxes = this.container.querySelectorAll(`input[name="${questionId}"]:checked`);
      return Array.from(checkboxes).map(cb => cb.value);
    }
    
    const input = document.getElementById(`answer-${questionId}`);
    if (!input) return null;
    
    if (questionType === 'number') {
      return input.value ? parseFloat(input.value) : null;
    }
    
    return input.value;
  }

  /**
   * Go back to previous question
   */
  async goBack() {
    console.log('Back functionality - to be implemented');
    // TODO: Implement back navigation
  }

  /**
   * Show error message
   */
  showError(questionId, message) {
    const errorEl = document.getElementById(`error-${questionId}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      
      // Scroll to error
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Hide error message
   */
  hideError(questionId) {
    const errorEl = document.getElementById(`error-${questionId}`);
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
}

// Make it globally accessible
window.QuestionRenderer = QuestionRenderer;
