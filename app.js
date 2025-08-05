// app.js
const analyzeBtn = document.getElementById('analyzeBtn');
const codeInput = document.getElementById('codeInput');
const reviewContainer = document.getElementById('reviewContainer');
const loader = document.getElementById('loader');
let currentReviewId = "";

analyzeBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  if (!code) return alert("Please paste your code!");

  loader.style.display = 'block';
  reviewContainer.innerHTML = "";

  try {
    const res = await fetch('http://localhost:8000/generate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    currentReviewId = data.review_id;
    renderReview(data.review);
  } catch (err) {
    alert("Review failed. Check server.");
  } finally {
    loader.style.display = 'none';
  }
});

function renderReview(review) {
  const markdown = marked.parse(review);
  const safeHtml = DOMPurify.sanitize(markdown);
  reviewContainer.innerHTML = safeHtml;
  Prism.highlightAll();
}

// Feedback logic
document.getElementById('acceptBtn').addEventListener('click', async () => {
  if (!currentReviewId) return;
  await sendFeedback('accepted');
  alert("Thanks for your feedback!");
});

document.getElementById('rejectBtn').addEventListener('click', () => {
  document.getElementById('rejectionReason').style.display = 'block';
  document.getElementById('submitRejection').style.display = 'inline-block';
});

document.getElementById('submitRejection').addEventListener('click', async () => {
  const reason = document.getElementById('rejectionReason').value.trim();
  if (!reason) return alert("Please give a reason.");
  await sendFeedback('rejected', reason);
  alert("Thanks! We'll improve.");
});

async function sendFeedback(feedback, reason = null) {
  await fetch('http://localhost:8000/submit-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_id: currentReviewId, feedback, rejection_reason: reason })
  });
}
