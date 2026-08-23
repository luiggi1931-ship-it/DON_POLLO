/* ============================================================
   login.js — Lógica interactiva de la pantalla de login
   ============================================================ */

/**
 * Anima un contador numérico desde 0 hasta el valor objetivo.
 * @param {HTMLElement} el       - Elemento donde se mostrará el número
 * @param {number}      target   - Valor final del contador
 * @param {number}      duration - Duración en ms (por defecto 1800)
 */
function animarContador(el, target, duration = 1800) {
  let inicio = 0;
  const paso = target / (duration / 16);

  const timer = setInterval(() => {
    inicio += paso;
    if (inicio >= target) {
      el.textContent = target;
      clearInterval(timer);
      return;
    }
    el.textContent = Math.floor(inicio);
  }, 16);
}

/**
 * Activa el estado de carga en el botón de submit
 * para evitar doble envío y dar feedback visual.
 */
function activarEstadoCarga() {
  const btn = document.getElementById('btn-login');
  if (!btn) return;

  btn.disabled = true;
  btn.querySelector('.btn-text').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5"
         style="animation: spin-login 0.8s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Verificando...
  `;
}

/* ---- Inicialización al cargar el DOM ---- */
document.addEventListener('DOMContentLoaded', () => {

  /* Contador animado del panel izquierdo (lotes activos) */
  const contadorLotes = document.getElementById('counter-lotes');
  if (contadorLotes) {
    /* Pequeño delay para que se vea tras la animación slideUp */
    setTimeout(() => animarContador(contadorLotes, 12), 600);
  }

  /* Estado de carga al enviar el formulario */
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', activarEstadoCarga);
  }

});
