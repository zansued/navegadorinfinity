# Como Remover o Alerta do Windows Defender (SmartScreen) via Microsoft

Para que o seu executável `Abrir Navegador.exe` seja considerado confiável na internet inteira para qualquer cliente **sem que eles precisem instalar certificados locais manualmente**, você pode enviá-lo diretamente para análise no portal da Microsoft. 

Este processo é **gratuito**, seguro e a Microsoft costuma liberar o arquivo em **24h a 48h**.

---

### Passo a Passo para Submeter o Executável:

1. Acesse o portal oficial da Microsoft para analistas de malware/desenvolvedores:
   👉 **[Microsoft Defender Security Intelligence - File Submission](https://www.microsoft.com/en-us/wdsi/filesubmission)**

2. Faça login com a sua conta da Microsoft (Outlook, Hotmail, ou conta corporativa).

3. Preencha as informações do formulário:
   * **Are you a software developer or home customer?**
     Selecione: **Software developer** (Desenvolvedor de software).
   * **Company name:**
     Digite o nome do seu projeto, ex: `Infinity AI`.
   * **What is the product name?**
     Digite: `Navegador Infinity AI`.
   * **File(s) to submit:**
     Suba o arquivo **`Abrir Navegador.exe`** (pode compactá-lo em um `.zip` se preferir).
   * **Do you believe the detection is incorrect? (Falso Positivo):**
     Selecione: **Yes, this is a false positive** (Sim, esta detecção é um falso positivo).
   * **Detection name (se houver):**
     Se o Windows Defender já deu algum alerta com nome específico (ex: *Trojan:Win32/Fruity* ou *Wacatac*), digite esse nome. Caso seja apenas o aviso azul do SmartScreen, deixe em branco ou digite `SmartScreen Unknown Publisher`.
   * **Comment / Rationale (Explicação para o analista):**
     Escreva uma breve justificativa em inglês. 
     *Exemplo:*
     > "This is a custom Chromium profile manager application named Infinity AI. It was built using Python and PyInstaller. It does not contain any malware or virus. It is being blocked by Windows SmartScreen as an unknown publisher. Please whitelist this application."

4. Envie o formulário.

---

### O que Acontece Depois?
* Você receberá um e-mail de confirmação com um ID de acompanhamento (Submission ID).
* Um analista humano ou sistema automatizado de sandbox da Microsoft analisará o arquivo.
* Dentro de 24h a 48h, você receberá um e-mail final dizendo que a análise foi concluída e o arquivo foi classificado como **"Clean"** (Limpo).
* A partir deste momento, qualquer computador conectado à internet com o Windows Defender atualizado executará o seu arquivo `Abrir Navegador.exe` diretamente, sem qualquer tela azul ou bloqueio.
