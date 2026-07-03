// Content script para bloquear atalhos de depuração e clique direito no modo Cliente
(function() {
  chrome.storage.local.get(["client_mode"], function(data) {
    if (data && data.client_mode === true) {
      // 1. Bloqueia o menu de contexto (clique direito)
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      // 2. Bloqueia atalhos de teclado comuns de desenvolvedor
      document.addEventListener('keydown', function(e) {
        // F12 (123)
        // Ctrl+Shift+I (73)
        // Ctrl+Shift+J (74)
        // Ctrl+Shift+C (67)
        // Ctrl+U (85) - Exibir código-fonte
        // Ctrl+S (83) - Salvar página
        if (
          e.keyCode === 123 ||
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
          (e.ctrlKey && e.keyCode === 85) ||
          (e.ctrlKey && e.keyCode === 83)
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
    }
  });
})();
