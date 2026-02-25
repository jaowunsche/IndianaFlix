'use strict';

var DB = {
  videos: [
    { id: 1, title: "Telefone Distante - Trailer", year: 2024, rating: "8.7", youtube: "EA6FguG3x_Y" },
    { id: 2, title: "Distintivo Sangrento", year: 2024, rating: "7.9", youtube: "zqX0gP1CfgM" },
    { id: 3, title: "Telefone Distante", year: 2024, rating: "8.2", youtube: "1UffwrKBDXs&t" }
  ]
};

function createCard(item) {
  return '<div class="content-card" onclick="playContent(' + item.id + ')">' +
    '<div class="card-thumb">' +
      '<img src="https://img.youtube.com/vi/' + item.youtube + '/hqdefault.jpg" alt="' + item.title + '"/>' +
      '<div class="card-thumb__overlay">' +
        '<button class="play-btn"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>' +
      '</div>' +
    '</div>' +
    '<div class="content-card__body">' +
      '<p class="content-card__title">' + item.title + '</p>' +
      '<div class="content-card__meta"><span>' + item.year + '</span><span class="content-card__rating">★ ' + item.rating + '</span></div>' +
    '</div>' +
  '</div>';
}

function renderCards(containerId, items) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!items || !items.length) {
    el.innerHTML = '<p style="color:var(--muted);padding:2rem 0;font-size:0.85rem;">Nenhum resultado encontrado.</p>';
    return;
  }
  el.innerHTML = items.map(createCard).join('');
}

function playContent(id) {
  var item = null;
  for (var i = 0; i < DB.videos.length; i++) {
    if (DB.videos[i].id === id) { item = DB.videos[i]; break; }
  }
  if (!item) return;

  var overlay = document.getElementById('video-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'video-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;padding:1rem;';

    overlay.innerHTML =
      '<div style="background:#111;border:1px solid #2a2a2a;border-radius:4px;width:100%;max-width:900px;overflow:hidden;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.4rem;border-bottom:1px solid #2a2a2a;">' +
          '<span id="modal-title" style="font-family:\'Playfair Display\',serif;font-size:1.2rem;font-weight:600;color:#f0ede8;letter-spacing:0.5px;"></span>' +
          '<button id="modal-close" style="background:none;border:none;color:#6e6e6e;font-size:1.3rem;cursor:pointer;line-height:1;transition:color 0.2s;">✕</button>' +
        '</div>' +
        '<div id="modal-player" style="position:relative;padding-bottom:56.25%;height:0;background:#0a0a0a;">' +
          '<iframe id="modal-iframe" src="" frameborder="0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" style="position:absolute;inset:0;width:100%;height:100%;"></iframe>' +
        '</div>' +
        '<div id="modal-fallback" style="display:none;padding:2.5rem;text-align:center;">' +
          '<p style="color:#6e6e6e;font-size:0.85rem;margin-bottom:1rem;font-weight:300;">Este vídeo não permite reprodução incorporada.</p>' +
          '<a id="modal-yt-link" href="#" target="_blank" style="display:inline-flex;align-items:center;gap:0.5rem;background:#c9a84c;color:#0a0a0a;padding:0.7rem 1.6rem;border-radius:4px;font-size:0.75rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Assistir no YouTube</a>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    document.getElementById('modal-close').addEventListener('click', closeVideoModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeVideoModal(); });

    document.getElementById('modal-iframe').addEventListener('error', function() {
      showFallback(document.getElementById('modal-iframe').dataset.ytid);
    });
  }

  var iframe = document.getElementById('modal-iframe');
  var fallback = document.getElementById('modal-fallback');
  var player = document.getElementById('modal-player');

  fallback.style.display = 'none';
  player.style.display = 'block';
  iframe.style.display = 'block';

  document.getElementById('modal-title').textContent = item.title;
  iframe.dataset.ytid = item.youtube;
  iframe.src = 'https://www.youtube.com/embed/' + item.youtube + '?autoplay=1&origin=' + location.origin;

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  clearTimeout(window._embedTimer);
  window._embedTimer = setTimeout(function() {
    checkEmbedError(item.youtube);
  }, 3000);
}

function checkEmbedError(ytid) {
  var iframe = document.getElementById('modal-iframe');
  if (!iframe) return;
  try {
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc || doc.body.innerHTML === '') showFallback(ytid);
  } catch(e) {
    // cross-origin bloqueado = embed funcionando normalmente, não faz nada
  }
}

function showFallback(ytid) {
  document.getElementById('modal-player').style.display = 'none';
  var fallback = document.getElementById('modal-fallback');
  fallback.style.display = 'block';
  document.getElementById('modal-yt-link').href = 'https://www.youtube.com/watch?v=' + ytid;
}

function closeVideoModal() {
  var overlay = document.getElementById('video-modal');
  if (!overlay) return;
  clearTimeout(window._embedTimer);
  overlay.style.display = 'none';
  document.getElementById('modal-iframe').src = '';
  document.getElementById('modal-fallback').style.display = 'none';
  document.getElementById('modal-player').style.display = 'block';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeVideoModal();
});

document.addEventListener('DOMContentLoaded', function() {
  var nav = document.querySelector('.navbar');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.style.background = window.scrollY > 20 ? 'rgba(10,10,10,0.98)' : 'rgba(10,10,10,0.96)';
    });
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
});
