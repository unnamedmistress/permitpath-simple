/**
 * ResultDisplay Component
 * Renders permit determination results
 */
class ResultDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Render complete result
   */
  render(result) {
    if (!this.container) {
      console.error('Result container not found');
      return;
    }

    const html = `
      <div class="result-card">
        ${this.renderHeader(result)}
        ${this.renderMainResult(result)}
        ${this.renderAnswerSummary(result)}
        ${this.renderCostBreakdown(result)}
        ${this.renderTimeline(result)}
        ${this.renderEngineering(result)}
        ${this.renderPortalInfo(result)}
        ${this.renderNextSteps(result)}
        ${this.renderContact(result)}
        ${this.renderActions()}
      </div>
    `;

    this.container.innerHTML = html;
    this.container.style.display = 'block';
    
    // Hide question container
    document.getElementById('question-container')?.style.setProperty('display', 'none');
    
    // Scroll to result
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Render header with permit status
   */
  renderHeader(result) {
    const statusEmoji = result.permitNeeded ? '📋' : '✅';
    const statusClass = result.permitNeeded ? 'permit-required' : 'no-permit';
    const statusText = result.permitNeeded ? 'Permit Required' : 'No Permit Needed';

    return `
      <div class="result-header ${statusClass}">
        <div class="result-status">
          <span class="status-emoji">${statusEmoji}</span>
          <span class="status-text">${statusText}</span>
        </div>
        <h2 class="result-title">${result.projectName}</h2>
        <div class="result-subtitle">${result.permitLevelName}</div>
      </div>
    `;
  }

  /**
   * Render main AI-generated answer
   */
  renderMainResult(result) {
    if (!result.aiAnswer) return '';

    return `
      <div class="result-section">
        <div class="ai-answer">
          ${this.formatMarkdown(result.aiAnswer)}
        </div>
      </div>
    `;
  }

  /**
   * Render answer summary
   */
  renderAnswerSummary(result) {
    return `
      <div class="result-section">
        <h3>📝 Your Answers</h3>
        <div class="answer-summary">
          ${result.answers.map(a => `
            <div class="answer-item">
              <strong>${a.question}</strong>
              <span>${a.answer}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render cost breakdown
   */
  renderCostBreakdown(result) {
    if (!result.cost.total) return '';

    return `
      <div class="result-section">
        <h3>💰 Cost Estimate</h3>
        <div class="cost-breakdown">
          ${result.cost.permit ? `
            <div class="cost-item">
              <span class="cost-label">Permit Fee:</span>
              <span class="cost-value">${result.cost.permit.formatted || this.formatCost(result.cost.permit)}</span>
            </div>
          ` : ''}
          
          ${result.cost.engineering ? `
            <div class="cost-item">
              <span class="cost-label">Engineering:</span>
              <span class="cost-value">${result.cost.engineering.formatted}</span>
            </div>
          ` : ''}
          
          <div class="cost-item cost-total">
            <span class="cost-label">Total Estimated Cost:</span>
            <span class="cost-value">${result.cost.total.formatted}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render timeline
   */
  renderTimeline(result) {
    if (!result.timeline.total) return '';

    return `
      <div class="result-section">
        <h3>⏰ Timeline</h3>
        <div class="timeline-info">
          ${result.timeline.engineering ? `
            <div class="timeline-item">
              <span class="timeline-label">Engineering:</span>
              <span class="timeline-value">${result.timeline.engineering.description || result.timeline.engineering.weeks + ' weeks'}</span>
            </div>
          ` : ''}
          
          ${result.timeline.review ? `
            <div class="timeline-item">
              <span class="timeline-label">Permit Review:</span>
              <span class="timeline-value">${result.timeline.review.target}</span>
            </div>
          ` : ''}
          
          <div class="timeline-item timeline-total">
            <span class="timeline-label">Total Time:</span>
            <span class="timeline-value">${result.timeline.total.formatted}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render engineering requirements
   */
  renderEngineering(result) {
    if (!result.engineering.required) {
      return `
        <div class="result-section engineering-not-required">
          <h3>✅ Engineering Not Required</h3>
          <p>Based on your project details, a licensed engineer is not needed.</p>
        </div>
      `;
    }

    return `
      <div class="result-section engineering-required">
        <h3>🔧 Licensed Engineer Required</h3>
        <div class="engineering-details">
          <p class="engineering-reason"><strong>Why:</strong> ${result.engineering.message}</p>
          
          ${result.engineering.explanation ? `
            <p class="engineering-explanation">${result.engineering.explanation}</p>
          ` : ''}
          
          ${result.engineering.requirements && result.engineering.requirements.length > 0 ? `
            <div class="engineering-requirements">
              <strong>What the engineer will do:</strong>
              <ul>
                ${result.engineering.requirements.map(req => `<li>${req}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${result.engineering.cost ? `
            <div class="engineering-cost">
              <strong>Cost:</strong> ${result.engineering.cost.formatted}
            </div>
          ` : ''}
          
          ${result.engineering.findEngineer ? `
            <a href="${result.engineering.findEngineer.searchUrl}" target="_blank" class="btn btn-secondary">
              🔍 Find Engineers Near You
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render portal information
   */
  renderPortalInfo(result) {
    if (!result.portal.mainUrl) {
      return `
        <div class="result-section">
          <h3>🔗 Find Your Permit Portal</h3>
          <p>${result.portal.note}</p>
          <a href="${result.portal.searchUrl}" target="_blank" class="btn btn-secondary">
            Search for ${result.jurisdiction.name} Permits
          </a>
        </div>
      `;
    }

    return `
      <div class="result-section">
        <h3>🔗 Where to Apply</h3>
        <div class="portal-info">
          <div class="portal-name">${result.portal.name || result.jurisdiction.name}</div>
          <div class="portal-links">
            <a href="${result.portal.mainUrl}" target="_blank" class="btn btn-primary btn-large">
              📝 Apply for Permit Online
            </a>
            ${result.portal.formsUrl ? `
              <a href="${result.portal.formsUrl}" target="_blank" class="btn btn-secondary">
                📄 Forms & Documents
              </a>
            ` : ''}
            ${result.portal.searchUrl ? `
              <a href="${result.portal.searchUrl}" target="_blank" class="btn btn-secondary">
                🔍 Check Application Status
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render next steps
   */
  renderNextSteps(result) {
    if (!result.nextSteps || result.nextSteps.length === 0) return '';

    return `
      <div class="result-section">
        <h3>📝 Your Next Steps</h3>
        <div class="next-steps">
          ${result.nextSteps.map(step => `
            <div class="step-item">
              <div class="step-number">${step.icon || step.step}</div>
              <div class="step-content">
                <div class="step-action">${step.action}</div>
                <div class="step-detail">${step.detail}</div>
                ${step.tip ? `<div class="step-tip">💡 ${step.tip}</div>` : ''}
                ${step.link ? `<a href="${step.link}" target="_blank" class="step-link">Open →</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render contact information
   */
  renderContact(result) {
    if (!result.contact) return '';

    return `
      <div class="result-section">
        <h3>📞 Contact Information</h3>
        <div class="contact-info">
          ${result.contact.phone ? `
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <a href="tel:${result.contact.phone}" class="contact-value">${result.contact.phone}</a>
            </div>
          ` : ''}
          
          ${result.contact.email ? `
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <a href="mailto:${result.contact.email}" class="contact-value">${result.contact.email}</a>
            </div>
          ` : ''}
          
          ${result.contact.inspections ? `
            <div class="contact-item">
              <span class="contact-label">Inspections:</span>
              <a href="tel:${result.contact.inspections}" class="contact-value">${result.contact.inspections}</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render action buttons
   */
  renderActions() {
    return `
      <div class="result-actions">
        <button class="btn" onclick="window.location.reload()">
          🔄 Start Over
        </button>
        <button class="btn btn-secondary" onclick="window.print()">
          🖨️ Print Results
        </button>
      </div>
    `;
  }

  /**
   * Format markdown-style text
   */
  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .split('</p><p>')
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  /**
   * Format cost
   */
  formatCost(cost) {
    if (cost.type === 'fixed' || cost.amount) {
      return `$${(cost.amount || cost.min).toLocaleString()}`;
    }
    return `$${cost.min.toLocaleString()} - $${cost.max.toLocaleString()}`;
  }
}

// Global instance
let resultDisplay;
