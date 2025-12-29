const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwHJtAnljQNiEWOpUmOf2_at2cc6D1UGixxq-va7NDUOx8jUmzeUaCgM8HAPV9nev40HA/exec';

document.getElementById('saveBtn').addEventListener('click', async () => {
  const button = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  try {
    // Get current tab URL and title
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const url = tab.url;
    const title = tab.title;

    // Send to Google Sheets
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        title: title,
        timestamp: new Date().toISOString()
      })
    });

    // Show success message
    status.textContent = '✓ Saved!';
    status.style.color = '#4CAF50';

    // Auto-close after 1 second
    setTimeout(() => {
      window.close();
    }, 1000);

  } catch (error) {
    status.textContent = '✗ Error saving';
    status.style.color = '#f44336';
    console.error('Error:', error);
  }
});
