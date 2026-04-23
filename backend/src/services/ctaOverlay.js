/**
 * Builds a self-contained HTML page that loads the destination URL in a full-screen
 * iframe and overlays a branded CTA bar on top.
 *
 * Handles X-Frame-Options blocking gracefully with a fallback screen.
 */
function buildOverlayHTML({ original, cta }) {
  const positions = {
    'bottom-left':   'left:20px;bottom:20px;',
    'bottom-right':  'right:20px;bottom:20px;',
    'bottom-center': 'left:50%;bottom:20px;transform:translateX(-50%);',
  };
  const posStyle = positions[cta.position] || positions['bottom-left'];

  const escapedMessage   = escapeHtml(cta.message);
  const escapedBtnText   = escapeHtml(cta.button_text || 'Visit Us');
  const escapedBtnUrl    = escapeHtml(cta.button_url  || '#');
  const bgColor          = escapeHtml(cta.bg_color    || '#1a1a26');
  const textColor        = escapeHtml(cta.text_color  || '#e8e8f0');
  const btnColor         = escapeHtml(cta.btn_color   || '#00e5ff');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting…</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; overflow: hidden; background: #08080f; }

    /* Full-screen iframe */
    #content-frame {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      border: none; z-index: 1;
    }

    /* CTA bar */
    #cta-bar {
      position: fixed; z-index: 9999;
      ${posStyle}
      background: ${bgColor};
      color: ${textColor};
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 14px 18px;
      display: flex; align-items: center; gap: 14px;
      max-width: 360px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px; line-height: 1.5;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes slideUp {
      from { opacity:0; transform: translateY(20px) ${cta.position === 'bottom-center' ? 'translateX(-50%)' : ''}; }
      to   { opacity:1; transform: translateY(0)    ${cta.position === 'bottom-center' ? 'translateX(-50%)' : ''}; }
    }
    #cta-message { flex: 1; }
    #cta-btn {
      background: ${btnColor}; color: #000;
      border: none; border-radius: 8px;
      padding: 8px 14px; font-size: 12px; font-weight: 700;
      cursor: pointer; white-space: nowrap; text-decoration: none;
      transition: opacity 0.15s;
    }
    #cta-btn:hover { opacity: 0.85; }
    #cta-close {
      background: none; border: none; color: ${textColor};
      cursor: pointer; opacity: 0.5; font-size: 16px; padding: 0 4px;
      flex-shrink: 0;
    }
    #cta-close:hover { opacity: 1; }

    /* Fallback screen (shown if iframe blocked) */
    #fallback {
      display: none;
      position: fixed; inset: 0; z-index: 2;
      background: #08080f; color: #e8e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      flex-direction: column; align-items: center; justify-content: center; gap: 16px;
    }
    #fallback h2 { font-size: 20px; font-weight: 700; }
    #fallback p  { color: #6a6a8a; font-size: 14px; }
    #fallback a  { background: ${btnColor}; color: #000; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; }

    @media (max-width: 480px) {
      #cta-bar { left: 12px !important; right: 12px !important; bottom: 12px !important;
                 transform: none !important; max-width: 100%; }
    }
  </style>
</head>
<body>
  <iframe
    id="content-frame"
    src="${escapeHtml(original)}"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
  ></iframe>

  <div id="cta-bar">
    <span id="cta-message">${escapedMessage}</span>
    <a id="cta-btn" href="${escapedBtnUrl}" target="_top">${escapedBtnText}</a>
    <button id="cta-close" title="Close">✕</button>
  </div>

  <div id="fallback">
    <h2>🔗 You're being redirected</h2>
    <p>This site can't be previewed in a frame.</p>
    <a href="${escapeHtml(original)}" target="_top">Continue to destination →</a>
  </div>

  <script>
    // Close button
    document.getElementById('cta-close').addEventListener('click', function() {
      document.getElementById('cta-bar').style.display = 'none';
    });

    // Detect iframe block via load timeout
    var frame = document.getElementById('content-frame');
    var fallbackTimer = setTimeout(function() {
      showFallback();
    }, 8000);

    frame.addEventListener('load', function() {
      clearTimeout(fallbackTimer);
      // Try accessing frame content — cross-origin will throw
      try {
        // If same-origin: fine
        var _ = frame.contentDocument;
      } catch(e) {
        // cross-origin: that's normal, don't show fallback
        clearTimeout(fallbackTimer);
      }
    });

    frame.addEventListener('error', function() {
      clearTimeout(fallbackTimer);
      showFallback();
    });

    function showFallback() {
      document.getElementById('content-frame').style.display = 'none';
      document.getElementById('cta-bar').style.display = 'none';
      document.getElementById('fallback').style.display = 'flex';
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { buildOverlayHTML };
