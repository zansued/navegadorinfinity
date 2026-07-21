/**
 * Snippet de Integração para hub.infinityclaude.pro
 * Permite abrir perfis nativos do Infinity AI diretamente pelo site sem cliques extras.
 */

(function () {
  const LOCAL_AGENT_URL = "http://127.0.0.1:19999";

  /**
   * Verifica se o agente local do Infinity AI está em execução na máquina do usuário.
   * @returns {Promise<boolean>}
   */
  async function checkLocalAgent() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const response = await fetch(`${LOCAL_AGENT_URL}/status`, {
        method: "GET",
        mode: "cors",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data && data.status === "ok";
      }
    } catch (_) {
      // Agente HTTP local não respondeu
    }
    return false;
  }

  /**
   * Abre o perfil especificado. Tenta 1-click via HTTP API Local silencioso.
   * Se o agente local não estiver em execução, faz fallback para o protocolo infinity://
   * 
   * @param {string} spid - O SPID do perfil (ex: "inf_ninja_hub_496c7bbd") ou Nome do perfil
   * @param {string} [name] - Nome do perfil alternativo (opcional)
   */
  async function openProfileOnline(spid, name) {
    const targetId = spid || name;
    if (!targetId) {
      console.error("[Infinity AI] SPID ou Nome do perfil não fornecido.");
      return;
    }

    // 1. Tenta acionar a API HTTP silenciosa (Sem popups do navegador)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${LOCAL_AGENT_URL}/open?spid=${encodeURIComponent(targetId)}`, {
        method: "GET",
        mode: "cors",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          console.log(`[Infinity AI] Perfil '${targetId}' aberto com sucesso via Agente HTTP Local.`);
          return;
        }
      }
    } catch (err) {
      console.warn("[Infinity AI] Agente HTTP local indisponível, acionando protocolo nativo infinity://...");
    }

    // 2. Fallback: Protocolo Nativo URL (infinity://open?spid=...)
    window.location.href = `infinity://open?spid=${encodeURIComponent(targetId)}`;
  }

  // Exporta a função globalmente para ser chamada nos botões "Abrir" do site
  window.openProfileOnline = openProfileOnline;
  window.checkLocalAgent = checkLocalAgent;
})();
