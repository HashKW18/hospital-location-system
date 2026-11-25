/**
 * HealthWay Hospital - Patient Feedback Controller
 * Matches Photo 30 from UI Mockups
 */

let selectedRating = 5;
let myFeedbacks = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupFeedbackForm();
  await loadMyFeedback();
});

function setupFeedbackForm() {
  const user = api.getCurrentUser();
  if (user) {
    const nameInput = document.getElementById('fb-fullname');
    const emailInput = document.getElementById('fb-email');
    if (nameInput) nameInput.value = user.fullName;
    if (emailInput) emailInput.value = user.email;
  }

  // Star rating click handlers
  const stars = document.querySelectorAll('.star-rating-icon');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.val);
      setStarRating(rating);
    });
  });

  const form = document.getElementById('patient-feedback-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFeedbackForm();
    });
  }
}

function setStarRating(rating) {
  selectedRating = rating;
  const stars = document.querySelectorAll('.star-rating-icon');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove('far');
      star.classList.add('fas');
      star.style.color = '#f59e0b';
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
      star.style.color = '#cbd5e1';
    }
  });
}

async function submitFeedbackForm() {
  const user = api.getCurrentUser();
  if (!user) {
    alert('Please log in with your patient account before submitting hospital feedback.');
    window.location.href = 'login.html?redirect=' + encodeURIComponent('feedback.html');
    return;
  }

  const category = document.getElementById('fb-category')?.value || 'DIFFICULTY_FINDING';
  const typeRadio = document.querySelector('input[name="fb-type"]:checked')?.value || 'SUGGESTION';
  const locationId = document.getElementById('fb-department')?.value || null;
  const locationName = document.getElementById('fb-department')?.selectedOptions[0]?.text || 'General Hospital';
  const message = document.getElementById('fb-message')?.value?.trim();
  const consent = document.getElementById('fb-consent')?.checked;

  if (!message) {
    alert('Please write your feedback message.');
    return;
  }

  if (!consent) {
    alert('Please consent to the privacy policy regarding your visit feedback.');
    return;
  }

  const submitBtn = document.getElementById('fb-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  }

  try {
    await api.submitFeedback({
      category,
      feedbackType: typeRadio,
      locationId: locationId ? parseInt(locationId) : null,
      locationName,
      rating: selectedRating,
      message
    });

    showToast('Thank you! Your feedback has been submitted to hospital staff.', 'success');
    document.getElementById('fb-message').value = '';
    await loadMyFeedback();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Feedback';
    }
  }
}

async function loadMyFeedback() {
  const container = document.getElementById('my-feedback-history');
  if (!container) return;

  const user = api.getCurrentUser();
  if (!user) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-muted);">
        <p><a href="login.html" style="font-weight: 700;">Log in</a> to track the status of your past feedback submissions.</p>
      </div>
    `;
    return;
  }

  try {
    myFeedbacks = await api.getMyFeedback();
    if (myFeedbacks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <p>You have not submitted any feedback yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = myFeedbacks.map(fb => {
      let badgeClass = 'badge-yellow';
      if (fb.status === 'RESOLVED') badgeClass = 'badge-green';
      if (fb.status === 'UNDER_REVIEW') badgeClass = 'badge-blue';

      return `
        <div class="card" style="margin-bottom: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <span class="badge ${badgeClass}">${fb.status.replace('_', ' ')}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 10px;">${fb.category.replace('_', ' ')}</span>
            </div>
            <div style="color: #f59e0b; font-size: 0.9rem;">
              ${'★'.repeat(fb.rating || 5)}${'☆'.repeat(5 - (fb.rating || 5))}
            </div>
          </div>
          <p style="color: #334155; font-size: 0.95rem; margin-bottom: 12px; line-height: 1.5;">"${fb.message}"</p>
          
          ${fb.staffResponse ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-top: 10px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #047857; text-transform: uppercase;">Hospital Staff Response</div>
              <p style="color: #065f46; font-size: 0.9rem; margin-top: 4px;">${fb.staffResponse}</p>
            </div>
          ` : `
            <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
              <i class="far fa-clock"></i> Our hospital quality team is reviewing your comments.
            </div>
          `}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger);">Failed to load feedback: ${err.message}</p>`;
  }
}
