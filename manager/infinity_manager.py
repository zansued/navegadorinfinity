import os
import sys
import json
import shutil
import subprocess
import re
import tkinter as tk
from tkinter import messagebox, ttk
import base64
import select
import socket
import threading
import http.server
import socketserver
import urllib.parse
import time

def start_log_server():
    class LogHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            msg = query.get("msg", [""])[0]
            if msg:
                log_file = os.path.join(PROJECT_ROOT, "debug_extension.log")
                try:
                    with open(log_file, "a", encoding="utf-8") as f:
                        f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")
                except Exception:
                    pass
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
        def log_message(self, format, *args):
            return
            
    port = 9999
    for _ in range(10):
        try:
            httpd = socketserver.TCPServer(("127.0.0.1", port), LogHandler)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            break
        except Exception:
            port += 1

# Cores do tema escuro neumórfico (Soft UI Slate)
BG_COLOR = "#202225"          # Fundo principal neumórfico
CARD_BG = "#2f3136"           # Fundo dos cards
TEXT_COLOR = "#e2e8f0"        # Texto claro
TEXT_MUTED = "#94a3b8"        # Texto secundário
ACCENT_BLUE = "#5865f2"       # Botão primário / Destaque (Indigo neumórfico)
ACCENT_GREEN = "#3ba55d"      # Sucesso / Abrir
ACCENT_RED = "#ed4245"        # Erro / Excluir
BORDER_COLOR = "#4f545c"      # Bordas neumórficas

DEFAULT_PROXY_HOST = "147.79.87.117"
DEFAULT_PROXY_PORT = "3128"
DEFAULT_PROXY_USER = "infinity"
DEFAULT_PROXY_PASS = "Session2026!"

# Configurações do Supabase para Sincronização Dinâmica de Perfis
SUPABASE_URL = "https://supabase.techstorebrasil.com"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"

def supabase_request(url, method="GET", data=None, extra_headers=None):
    import urllib.request
    import json
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    if extra_headers:
        headers.update(extra_headers)
        
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode("utf-8")
            if res_data:
                return json.loads(res_data), None
            return None, None
    except Exception as e:
        return None, str(e)

def fetch_profiles_from_supabase():
    url = f"{SUPABASE_URL}/rest/v1/profiles?select=*"
    data, err = supabase_request(url, method="GET")
    if err:
        print(f"Erro ao buscar perfis do Supabase: {err}")
        return None
    
    profiles_dict = {}
    if isinstance(data, list):
        for p in data:
            spid = p.get("spid")
            name = p.get("name")
            if name:
                profiles_dict[name] = {
                    "name": name,
                    "url": p.get("url", "https://claude.ai"),
                    "proxy": p.get("proxy", "") if p.get("proxy") is not None else "",
                    "mode": p.get("mode", "proxy"),
                    "spid": spid
                }
    return profiles_dict

def save_profile_to_supabase(spid, name, url, proxy, mode):
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    payload = [{
        "spid": spid,
        "name": name,
        "url": url,
        "proxy": proxy,
        "mode": mode
    }]
    headers = {
        "Prefer": "resolution=merge-duplicates"
    }
    _, err = supabase_request(url, method="POST", data=payload, extra_headers=headers)
    if err:
        print(f"Erro ao salvar perfil no Supabase: {err}")
        return False
    return True

def delete_profile_from_supabase(spid):
    url = f"{SUPABASE_URL}/rest/v1/profiles?spid=eq.{spid}"
    _, err = supabase_request(url, method="DELETE")
    if err:
        print(f"Erro ao deletar perfil do Supabase: {err}")
        return False
    return True

# Determina a raiz real do projeto de forma dinâmica e robusta (congelada pelo PyInstaller)
if getattr(sys, 'frozen', False):
    # Se for executável compilado (.exe) pelo PyInstaller, a raiz é a pasta onde o executável está localizado
    PROJECT_ROOT = os.path.dirname(os.path.abspath(sys.executable))
    CURRENT_DIR = os.path.join(PROJECT_ROOT, "manager")
else:
    # Se for script Python rodando no Dev, a raiz é a pasta pai da pasta do script (manager/)
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

PROFILES_DIR = os.path.join(PROJECT_ROOT, "profiles")
CONFIG_FILE = "profiles_config.json"

def get_auth_header(user, password):
    auth_str = f"{user}:{password}"
    auth_b64 = base64.b64encode(auth_str.encode()).decode()
    return f"Proxy-Authorization: Basic {auth_b64}\r\n"

def handle_client(client_socket, remote_host, remote_port, proxy_user, proxy_pass):
    try:
        request = client_socket.recv(4096)
        if not request:
            client_socket.close()
            return
            
        remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        remote_socket.connect((remote_host, remote_port))
        
        lines = request.split(b"\r\n")
        first_line = lines[0].decode(errors='ignore')
        
        if first_line.startswith("CONNECT"):
            parts = first_line.split(" ")
            target = parts[1]
            connect_req = f"CONNECT {target} HTTP/1.1\r\n"
            connect_req += get_auth_header(proxy_user, proxy_pass)
            connect_req += "\r\n"
            remote_socket.sendall(connect_req.encode())
            
            response = remote_socket.recv(4096)
            if b"200" in response or b"Connection established" in response:
                client_socket.sendall(b"HTTP/1.1 200 Connection established\r\n\r\n")
            else:
                client_socket.sendall(response)
                client_socket.close()
                remote_socket.close()
                return
        else:
            auth_header = get_auth_header(proxy_user, proxy_pass).encode()
            modified_request = request.replace(b"\r\n\r\n", b"\r\n" + auth_header + b"\r\n")
            remote_socket.sendall(modified_request)
            
        sockets = [client_socket, remote_socket]
        while True:
            readable, _, _ = select.select(sockets, [], [], 10)
            if not readable:
                break
            for s in readable:
                other = remote_socket if s is client_socket else client_socket
                data = s.recv(8192)
                if not data:
                    return
                other.sendall(data)
    except Exception:
        pass
    finally:
        try:
            client_socket.close()
        except Exception:
            pass
        try:
            remote_socket.close()
        except Exception:
            pass

def start_local_proxy(port, remote_host, remote_port, proxy_user, proxy_pass):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(("127.0.0.1", port))
        server.listen(100)
    except Exception as e:
        print(f"Erro ao iniciar proxy local na porta {port}: {e}")
        return
        
    while True:
        try:
            client_socket, _ = server.accept()
            t = threading.Thread(
                target=handle_client,
                args=(client_socket, remote_host, remote_port, proxy_user, proxy_pass),
                daemon=True
            )
            t.start()
        except Exception:
            break

def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port

import urllib.request
import zipfile
import io

def ensure_portable_chrome(parent_window=None):
    chrome_bin_dir = os.path.join(PROJECT_ROOT, "chrome-bin-v129")
    portable_chrome_path = os.path.join(chrome_bin_dir, "chrome-win64", "chrome.exe")
    
    if os.path.exists(portable_chrome_path):
        return portable_chrome_path
        
    if parent_window:
        try:
            # Pergunta ou avisa o usuário sobre o download
            msg = "Para garantir a compatibilidade de sincronização de contas com a extensão, precisamos baixar uma versão portátil atualizada do Google Chrome (v129).\n\nO download (aprox. 150MB) iniciará automaticamente agora. Clique em OK para prosseguir."
            messagebox.showinfo("Infinity AI", msg, parent=parent_window)
            
            # Cria janela de progresso
            progress_win = tk.Toplevel(parent_window)
            progress_win.title("Baixando Navegador...")
            progress_win.geometry("350x120")
            progress_win.configure(bg=BG_COLOR)
            progress_win.transient(parent_window)
            progress_win.grab_set()
            
            # Centraliza a janela de progresso
            x = parent_window.winfo_x() + (parent_window.winfo_width() // 2) - 175
            y = parent_window.winfo_y() + (parent_window.winfo_height() // 2) - 60
            progress_win.geometry(f"+{x}+{y}")
            
            label = ttk.Label(progress_win, text="Baixando Google Chrome portátil...", background=BG_COLOR, foreground=TEXT_COLOR, font=("Segoe UI", 10))
            label.pack(pady=20)
            
            progress = ttk.Progressbar(progress_win, mode="indeterminate", length=250)
            progress.pack(pady=5)
            progress.start(10)
            
            download_success = [False]
            download_error = [None]
            
            def download_thread():
                try:
                    os.makedirs(chrome_bin_dir, exist_ok=True)
                    url = "https://storage.googleapis.com/chrome-for-testing-public/129.0.6668.70/win64/chrome-win64.zip"
                    
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as response:
                        zip_data = response.read()
                        
                    with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_ref:
                        zip_ref.extractall(chrome_bin_dir)
                        
                    if os.path.exists(portable_chrome_path):
                        download_success[0] = True
                except Exception as e:
                    download_error[0] = e
                finally:
                    progress_win.after(0, progress_win.destroy)
                    
            t = threading.Thread(target=download_thread, daemon=True)
            t.start()
            
            parent_window.wait_window(progress_win)
            
            if download_success[0]:
                messagebox.showinfo("Sucesso", "Navegador portátil atualizado configurado com sucesso!", parent=parent_window)
                return portable_chrome_path
            else:
                err = download_error[0] or "Erro desconhecido"
                messagebox.showerror("Erro de Download", f"Não foi possível baixar o navegador portátil:\n{err}\n\nO sistema tentará usar o Google Chrome padrão como fallback.", parent=parent_window)
        except Exception as e:
            print(f"Erro no popup do dialog: {e}")
    else:
        # Modo CLI / Sem Janela
        try:
            print("Baixando navegador portátil atualizado (v129)...")
            os.makedirs(chrome_bin_dir, exist_ok=True)
            url = "https://storage.googleapis.com/chrome-for-testing-public/129.0.6668.70/win64/chrome-win64.zip"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                zip_data = response.read()
            with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_ref:
                zip_ref.extractall(chrome_bin_dir)
            if os.path.exists(portable_chrome_path):
                print("Navegador portátil baixado com sucesso!")
                return portable_chrome_path
        except Exception as e:
            print(f"Erro ao baixar navegador portátil: {e}")
            
    return None

def find_chrome(parent_window=None):
    # 1. Verifica se o Chrome portátil já existe
    chrome_bin_dir = os.path.join(PROJECT_ROOT, "chrome-bin-v129")
    portable_chrome_path = os.path.join(chrome_bin_dir, "chrome-win64", "chrome.exe")
    if os.path.exists(portable_chrome_path):
        return portable_chrome_path
        
    # 2. Se não existir, tenta baixar
    downloaded_path = ensure_portable_chrome(parent_window)
    if downloaded_path:
        return downloaded_path
        
    # 3. Fallback: Caminhos comuns do Google Chrome no Windows
    paths = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    for path in paths:
        if os.path.exists(path):
            return path
    return None

def get_extension_source_dir():
    # Retorna o diretório da extensão de forma robusta a partir da raiz do projeto
    return os.path.join(PROJECT_ROOT, "extension")

def copy_extension(src_dir, dest_dir):
    if os.path.exists(dest_dir):
        try:
            shutil.rmtree(dest_dir)
        except Exception as e:
            print(f"Aviso ao remover extensão antiga: {e}")
            
    os.makedirs(dest_dir, exist_ok=True)
    
    files_to_copy = [
        "manifest.json",
        "background.js",
        "serviceWorkerLoader.js",
        "ExtPay.js",
        "analytics.js",
        "content_script.js"
    ]
    dirs_to_copy = [
        "icons",
        "interface",
        "fonts",
        "_locales"
    ]
    
    for f in files_to_copy:
        src_file = os.path.join(src_dir, f)
        if os.path.exists(src_file):
            shutil.copy2(src_file, os.path.join(dest_dir, f))
            
    for d in dirs_to_copy:
        src_path = os.path.join(src_dir, d)
        if os.path.exists(src_path):
            shutil.copytree(src_path, os.path.join(dest_dir, d))

def configure_extension_mode(extension_path, client_mode=True, spid=""):
    # 1. Configura background.js
    bg_path = os.path.join(extension_path, "background.js")
    if os.path.exists(bg_path):
        try:
            with open(bg_path, "r", encoding="utf-8") as file:
                content = file.read()
            
            # Substitui a constante CLIENT_MODE
            val_str = "true" if client_mode else "false"
            content = re.sub(r'const CLIENT_MODE\s*=\s*(true|false);', f'const CLIENT_MODE = {val_str};', content)
            
            # Substitui a constante AUTO_SPID
            content = re.sub(r'const AUTO_SPID\s*=\s*".*";', f'const AUTO_SPID = "{spid}";', content)
            
            with open(bg_path, "w", encoding="utf-8") as file:
                file.write(content)
        except Exception as e:
            print(f"Erro ao configurar background.js: {e}")

    # 2. Configura popup.js
    popup_path = os.path.join(extension_path, "interface", "popup", "popup.js")
    if os.path.exists(popup_path):
        try:
            with open(popup_path, "r", encoding="utf-8") as file:
                content = file.read()
            
            # Substitui a constante CLIENT_MODE
            val_str = "true" if client_mode else "false"
            content = re.sub(r'const CLIENT_MODE\s*=\s*(true|false);', f'const CLIENT_MODE = {val_str};', content)
            
            with open(popup_path, "w", encoding="utf-8") as file:
                file.write(content)
        except Exception as e:
            print(f"Erro ao configurar popup.js: {e}")

    # 3. Configura manifest.json (para forçar o reload da extensão no Chrome portátil v129)
    manifest_path = os.path.join(extension_path, "manifest.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as file:
                manifest = json.load(file)
            
            # Adiciona um timestamp na descrição para invalidar cache
            manifest["description"] = f"Sincronizador de contas Infinity AI - Modo {'Cliente' if client_mode else 'Administrador'} (Ref: {int(time.time())})"
            
            with open(manifest_path, "w", encoding="utf-8") as file:
                json.dump(manifest, file, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Erro ao configurar manifest.json: {e}")

def disable_chrome_password_manager(user_data_path):
    default_dir = os.path.join(user_data_path, "Default")
    os.makedirs(default_dir, exist_ok=True)
    pref_path = os.path.join(default_dir, "Preferences")
    
    prefs = {}
    if os.path.exists(pref_path):
        try:
            with open(pref_path, "r", encoding="utf-8") as file:
                prefs = json.load(file)
        except Exception as e:
            print(f"Erro ao carregar Preferences: {e}")
            prefs = {}
            
    # Assegura a estrutura de chaves
    if "profile" not in prefs:
        prefs["profile"] = {}
        
    prefs["profile"]["password_manager_enabled"] = False
    prefs["credentials_enable_service"] = False
    prefs["credentials_enable_autosignin"] = False
    
    try:
        with open(pref_path, "w", encoding="utf-8") as file:
            json.dump(prefs, file, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao gravar Preferences: {e}")

def clean_profile_cache(user_data_path):
    """Limpa caches e arquivos temporários não essenciais para reduzir o tamanho do perfil."""
    paths_to_clean = [
        # Caches do diretório Default
        os.path.join(user_data_path, "Default", "Cache"),
        os.path.join(user_data_path, "Default", "Code Cache"),
        os.path.join(user_data_path, "Default", "GPUCache"),
        os.path.join(user_data_path, "Default", "File System"),
        os.path.join(user_data_path, "Default", "blob_storage"),
        os.path.join(user_data_path, "Default", "Shared Dictionary"),
        os.path.join(user_data_path, "Default", "Network Action Predictor"),

        
        # Caches e arquivos de IA/Modelos no diretório raiz do user-data
        os.path.join(user_data_path, "optimization_guide_model_store"),
        os.path.join(user_data_path, "OnDeviceHeadSuggestModel"),
        os.path.join(user_data_path, "WasmTtsEngine"),
        
        # Caches de renderização e GPU na raiz do user-data
        os.path.join(user_data_path, "GraphiteDawnCache"),
        os.path.join(user_data_path, "GrShaderCache"),
        os.path.join(user_data_path, "ShaderCache"),
        
        # Dados de segurança e atualizações na raiz do user-data
        os.path.join(user_data_path, "Safe Browsing"),
        os.path.join(user_data_path, "ActorSafetyLists"),
        os.path.join(user_data_path, "component_crx_cache"),
        
        # Relatórios de erro e telemetria
        os.path.join(user_data_path, "Crashpad"),
        os.path.join(user_data_path, "Crash Reports"),
        os.path.join(user_data_path, "reports"),
        os.path.join(user_data_path, "BrowserMetrics"),
    ]
    for path in paths_to_clean:
        if os.path.exists(path):
            try:
                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
            except Exception:
                pass # Ignora se o arquivo estiver bloqueado por estar em uso

def run_profile_headless(key, is_client, no_ext=False, chrome_path=None):
    # Segurança adicional: se não tiver a admin.key, força o modo cliente estrito
    admin_key_path1 = os.path.join(PROJECT_ROOT, "admin.key")
    admin_key_path2 = os.path.join(CURRENT_DIR, "admin.key")
    has_admin_key = os.path.exists(admin_key_path1) or os.path.exists(admin_key_path2)
    if not has_admin_key:
        is_client = True

    # Diagnóstico de execução
    log_path = os.path.join(PROJECT_ROOT, "debug_run.log")
    try:
        with open(log_path, "a", encoding="utf-8") as lf:
            lf.write(f"\n[{time.strftime('%H:%M:%S')}] --- INICIANDO EXECUÇÃO DO PERFIL --- \n")
            lf.write(f"[{time.strftime('%H:%M:%S')}] Chave: {key}, Client Mode: {is_client}, No Ext: {no_ext}, Chrome Path (Arg): {chrome_path}\n")
            lf.write(f"[{time.strftime('%H:%M:%S')}] PROJECT_ROOT: {PROJECT_ROOT}\n")
            lf.write(f"[{time.strftime('%H:%M:%S')}] CURRENT_DIR: {CURRENT_DIR}\n")
    except Exception:
        pass

    # Carrega perfis existentes
    config_path = os.path.join(CURRENT_DIR, CONFIG_FILE)
    profiles = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8-sig") as file:
                profiles = json.load(file)
        except Exception as e:
            try:
                with open(log_path, "a", encoding="utf-8") as lf:
                    lf.write(f"[{time.strftime('%H:%M:%S')}] Erro ao carregar config JSON {config_path}: {e}\n")
            except Exception:
                pass
            print(f"Erro ao carregar config: {e}")
            return
            
    if key not in profiles:
        try:
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"[{time.strftime('%H:%M:%S')}] Erro: Perfil '{key}' não encontrado no JSON keys: {list(profiles.keys())}\n")
        except Exception:
            pass
        print(f"Erro: Perfil '{key}' não encontrado nas configurações.")
        return
        
    profile_data = profiles[key]
    
    # Localiza o Chrome
    if not chrome_path:
        chrome_path = find_chrome()
    if not chrome_path:
        try:
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"[{time.strftime('%H:%M:%S')}] Erro: Google Chrome não localizado no sistema.\n")
        except Exception:
            pass
        print("Erro: O executável do Google Chrome não foi localizado no sistema.")
        return
        
    try:
        with open(log_path, "a", encoding="utf-8") as lf:
            lf.write(f"[{time.strftime('%H:%M:%S')}] Chrome Path Resolvido: {chrome_path}\n")
    except Exception:
        pass
        
    # Define caminhos
    profile_root = os.path.join(PROFILES_DIR, key)
    user_data_path = os.path.join(profile_root, "user-data")
    extension_path = os.path.join(profile_root, "extension")
    
    os.makedirs(user_data_path, exist_ok=True)
    
    # Copia a extensão do Chrome de forma isolada para este perfil
    ext_src = get_extension_source_dir()
    if os.path.exists(ext_src):
        try:
            copy_extension(ext_src, extension_path)
        except Exception as e:
            try:
                with open(log_path, "a", encoding="utf-8") as lf:
                    lf.write(f"[{time.strftime('%H:%M:%S')}] Aviso ao clonar extensão: {e}\n")
            except Exception:
                pass
            print(f"Aviso ao clonar a extensão para o perfil: {e}")
            
    # Configura o modo da extensão (Admin=false, Cliente=true) e o SPID de sincronização da nuvem
    spid = profile_data.get("spid", "")
    if not spid:
        import uuid
        spid = f"inf_{key.lower().replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
    configure_extension_mode(extension_path, client_mode=is_client, spid=spid)
    
    # Se for modo cliente, destrói fisicamente o arquivo de senhas salvas do Chrome
    if is_client:
        default_dir = os.path.join(user_data_path, "Default")
        for filename in ["Login Data", "Login Data-journal"]:
            filepath = os.path.join(default_dir, filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as e:
                    try:
                        with open(log_path, "a", encoding="utf-8") as lf:
                            lf.write(f"[{time.strftime('%H:%M:%S')}] Aviso ao remover Login Data: {e}\n")
                    except Exception:
                        pass
                    print(f"Erro ao remover senhas do Chrome: {e}")
                    
    # Aplica a desativação lógica do gerenciador de senhas do Chrome
    disable_chrome_password_manager(user_data_path)
    
    # Limpa arquivos de cache pesados e modelos de IA locais desnecessários antes do boot
    clean_profile_cache(user_data_path)
    
    # Configura o proxy
    host = DEFAULT_PROXY_HOST
    port = DEFAULT_PROXY_PORT
    user = DEFAULT_PROXY_USER
    password = DEFAULT_PROXY_PASS
    use_proxy = (profile_data.get("mode") == "proxy")
    
    proxy_string = profile_data.get("proxy", "").strip()
    if proxy_string:
        parts = proxy_string.split(":")
        if len(parts) >= 2:
            host = parts[0]
            port = parts[1]
        if len(parts) >= 4:
            user = parts[2]
            password = parts[3]
            
    # Monta comando e executa o Chrome
    cmd = [
        chrome_path,
        f"--user-data-dir={user_data_path}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-save-password-bubble",
        "--password-store=basic",
        "--log-level=3",
        "--no-sandbox",
        "--disable-infobars",
        "--test-type",
        "--disable-features=OptimizationGuideModelDownloading,OptimizationGuide,Translate",
        "--disable-component-update",
        "--disk-cache-size=10485760",
        "--media-cache-size=10485760",
    ]
    
    if not no_ext:
        toolzbuy_ext = os.path.join(extension_path, "Toolzbuy Secure Extension 4.1.0")
        if os.path.exists(toolzbuy_ext) and ("toolzbuy" in target_url.lower() or "toolzbuy" in key.lower()):
            cmd.append(f"--load-extension={extension_path},{toolzbuy_ext}")
        else:
            cmd.append(f"--load-extension={extension_path}")
    
    if use_proxy:
        local_port = find_free_port()
        try:
            real_port = int(port)
            threading.Thread(
                target=start_local_proxy,
                args=(local_port, host, real_port, user, password),
                daemon=True
            ).start()
            cmd.append(f"--proxy-server=127.0.0.1:{local_port}")
        except Exception as e:
            print(f"Erro ao iniciar proxy local: {e}")
            cmd.append(f"--proxy-server={host}:{port}")
        
    target_url = profile_data.get("url", "https://claude.ai")
    if is_client:
        cmd.append(f"--app={target_url}")
    else:
        cmd.append(target_url)
    
    try:
        with open(log_path, "a", encoding="utf-8") as lf:
            lf.write(f"[{time.strftime('%H:%M:%S')}] Comando executado: {cmd}\n")
    except Exception:
        pass
        
    try:
        process = subprocess.Popen(cmd)
        try:
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"[{time.strftime('%H:%M:%S')}] Subprocesso do Chrome iniciado com PID {process.pid}\n")
        except Exception:
            pass
        process.wait()
    except Exception as e:
        try:
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"[{time.strftime('%H:%M:%S')}] ERRO ao iniciar subprocesso do Chrome: {e}\n")
        except Exception:
            pass
        print(f"Falha ao iniciar o Chrome: {e}")
    finally:
        clean_profile_cache(user_data_path)
        try:
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"[{time.strftime('%H:%M:%S')}] Subprocesso do Chrome finalizado.\n")
        except Exception:
            pass

class ProfileManagerApp:
    def __init__(self, root, admin_mode=True):
        self.root = root
        self.admin_mode = admin_mode
        self.editing_key = None  # Guarda a chave do perfil que está sendo editado
        
        if self.admin_mode:
            self.root.title("Infinity AI - Gerenciador de Perfis")
            self.root.geometry("900x550")
        else:
            self.root.title("Infinity AI - Seleção de Perfis")
            self.root.geometry("450x450")
        self.root.configure(bg=BG_COLOR)
        
        # Define caminho do config no mesmo diretório do manager
        self.config_path = os.path.join(CURRENT_DIR, CONFIG_FILE)
        self.profiles = {}
        self.load_config()
        
        # Tenta localizar o Google Chrome de forma assíncrona para o boot
        self.chrome_path = None
        self.root.after(100, self.check_chrome_on_boot)
        
        self.setup_styles()
        self.create_widgets()
        
    def check_chrome_on_boot(self):
        self.chrome_path = find_chrome(self.root)
        if self.chrome_path and self.warning_label:
            self.warning_label.pack_forget()
            self.warning_label = None
        
    def style_neumorphic_button(self, btn, bg_color, hover_bg, fg_color="#ffffff"):
        btn.config(
            bg=bg_color,
            fg=fg_color,
            activebackground=hover_bg,
            activeforeground=fg_color,
            relief="raised",
            bd=2,
            highlightthickness=0,
            cursor="hand2"
        )
        btn.bind("<Enter>", lambda e: btn.config(bg=hover_bg, relief="sunken"))
        btn.bind("<Leave>", lambda e: btn.config(bg=bg_color, relief="raised"))
        
    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(".", background=BG_COLOR, foreground=TEXT_COLOR)
        style.configure("TLabel", background=BG_COLOR, foreground=TEXT_COLOR, font=("Segoe UI", 10))
        style.configure("Header.TLabel", background=BG_COLOR, foreground=ACCENT_BLUE, font=("Segoe UI Semibold", 16))
        style.configure("Sub.TLabel", background=BG_COLOR, foreground=TEXT_MUTED, font=("Segoe UI", 9, "italic"))
        style.configure("TFrame", background=BG_COLOR)
        style.configure("Card.TFrame", background=CARD_BG, relief="groove", borderwidth=2)
        
    def load_config(self):
        # Gera log de diagnóstico para rastrear caminhos no cliente
        try:
            self.debug_file = os.path.join(PROJECT_ROOT, "debug_paths.txt")
            with open(self.debug_file, "w", encoding="utf-8") as df:
                df.write(f"sys.executable: {sys.executable}\n")
                df.write(f"PROJECT_ROOT: {PROJECT_ROOT}\n")
                df.write(f"CURRENT_DIR: {CURRENT_DIR}\n")
                df.write(f"self.config_path: {self.config_path}\n")
                df.write(f"config_path exists: {os.path.exists(self.config_path)}\n")
        except Exception:
            self.debug_file = None

        # 1. Carrega imediatamente o cache local para a interface abrir instantaneamente
        self.load_local_cache()

        # 2. Dispara a busca no Supabase em segundo plano
        threading.Thread(target=self.fetch_supabase_in_background, daemon=True).start()

    def load_local_cache(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8-sig") as file:
                    self.profiles = json.load(file)
                
                # Registra no log se o JSON foi carregado com sucesso
                if self.debug_file:
                    try:
                        with open(self.debug_file, "a", encoding="utf-8") as df:
                            df.write(f"Local JSON Loaded successfully. Keys: {list(self.profiles.keys())}\n")
                    except Exception:
                        pass

                self.ensure_spids()
            except Exception as e:
                print(f"Erro ao carregar {CONFIG_FILE}: {e}")
                if self.debug_file:
                    try:
                        with open(self.debug_file, "a", encoding="utf-8") as df:
                            df.write(f"JSON Load error: {e}\n")
                    except Exception:
                        pass
                self.profiles = {}

    def ensure_spids(self):
        changed = False
        import uuid
        for k, p in self.profiles.items():
            if "spid" not in p or not p["spid"]:
                safe_k = "".join([c for c in k if c.isalpha() or c.isdigit() or c in " _-"]).strip().lower().replace(" ", "_")
                p["spid"] = f"inf_{safe_k}_{uuid.uuid4().hex[:8]}"
                changed = True
        if changed:
            self.save_config()

    def fetch_supabase_in_background(self):
        supabase_profiles = fetch_profiles_from_supabase()
        if supabase_profiles is not None:
            # Agenda a atualização de forma thread-safe na thread principal do Tkinter
            self.root.after(0, self.update_profiles_from_supabase, supabase_profiles)
        else:
            if self.debug_file:
                try:
                    with open(self.debug_file, "a", encoding="utf-8") as df:
                        df.write("Failed to fetch profiles from Supabase. Staying with local cache.\n")
                except Exception:
                    pass

    def update_profiles_from_supabase(self, supabase_profiles):
        self.profiles = supabase_profiles
        self.save_config()
        self.refresh_profile_list()
        if self.debug_file:
            try:
                with open(self.debug_file, "a", encoding="utf-8") as df:
                    df.write(f"Profiles updated from Supabase successfully in background. Keys: {list(self.profiles.keys())}\n")
            except Exception:
                pass
                
    def save_config(self):
        try:
            with open(self.config_path, "w", encoding="utf-8") as file:
                json.dump(self.profiles, file, indent=4, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("Erro", f"Não foi possível salvar as configurações: {e}")

    def create_widgets(self):
        # Top Panel (Cabeçalho)
        top_frame = ttk.Frame(self.root)
        top_frame.pack(fill="x", padx=20, pady=15)
        
        title_txt = "INFINITY AI - GERENCIADOR DE PERFIS" if self.admin_mode else "INFINITY AI - SELEÇÃO DE PERFIS"
        header = ttk.Label(top_frame, text=title_txt, style="Header.TLabel")
        header.pack(anchor="w")
        
        desc_txt = "Crie e gerencie perfis isolados do Chrome com proxies e extensões" if self.admin_mode else "Selecione e inicie o navegador com a conta desejada"
        sub_header = ttk.Label(top_frame, text=desc_txt, style="Sub.TLabel")
        sub_header.pack(anchor="w", pady=(2, 0))
        
        # Alerta se não achar o Chrome
        self.warning_label = None
        if not self.chrome_path:
            self.warning_label = tk.Label(top_frame, text="AVISO: Google Chrome não foi localizado automaticamente no sistema!", bg="#f38ba8", fg="#11111b", font=("Segoe UI Semibold", 9))
            self.warning_label.pack(fill="x", pady=5)

        # Main Layout (Dividido em Formulário na Esquerda e Lista na Direita, ou apenas Lista no Modo Cliente)
        main_pane = ttk.Frame(self.root)
        main_pane.pack(fill="both", expand=True, padx=20, pady=5)
        
        if self.admin_mode:
            # Esquerda: Formulário de Adição/Edição
            form_frame = ttk.Frame(main_pane, style="Card.TFrame", padding=15)
            form_frame.place(relx=0.0, rely=0.0, relwidth=0.45, relheight=0.95)
            
            self.form_title = ttk.Label(form_frame, text="Criar Novo Perfil", font=("Segoe UI Semibold", 12), background=CARD_BG, foreground=ACCENT_BLUE)
            self.form_title.pack(anchor="w", pady=(0, 10))
            
            # Input Nome
            ttk.Label(form_frame, text="Nome do Perfil:", background=CARD_BG).pack(anchor="w", pady=(5, 2))
            self.entry_name = tk.Entry(form_frame, bg=BG_COLOR, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", highlightbackground=BORDER_COLOR, highlightthickness=1)
            self.entry_name.pack(fill="x", pady=(0, 5), ipady=4)
            
            # Input URL Inicial
            ttk.Label(form_frame, text="URL Inicial (Padrão):", background=CARD_BG).pack(anchor="w", pady=(5, 2))
            self.entry_url = tk.Entry(form_frame, bg=BG_COLOR, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", highlightbackground=BORDER_COLOR, highlightthickness=1)
            self.entry_url.insert(0, "https://claude.ai")
            self.entry_url.pack(fill="x", pady=(0, 5), ipady=4)
            
            # Input Proxy
            ttk.Label(form_frame, text="Proxy personalizado (Opcional):", background=CARD_BG).pack(anchor="w", pady=(5, 2))
            self.entry_proxy = tk.Entry(form_frame, bg=BG_COLOR, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", highlightbackground=BORDER_COLOR, highlightthickness=1)
            self.entry_proxy.insert(0, "")
            self.entry_proxy.pack(fill="x", pady=(0, 2), ipady=4)
            
            proxy_hint = ttk.Label(form_frame, text="Formato: Host:Porta:User:Senha\nDeixe em branco para usar o proxy padrão.", font=("Segoe UI", 8), background=CARD_BG, foreground=TEXT_MUTED)
            proxy_hint.pack(anchor="w", pady=(0, 10))
            
            # Tipo de Conexão
            self.proxy_mode = tk.StringVar(value="proxy")
            rb_proxy = tk.Radiobutton(form_frame, text="Usar Proxy", variable=self.proxy_mode, value="proxy", bg=CARD_BG, fg=TEXT_COLOR, selectcolor=BG_COLOR, activebackground=CARD_BG, activeforeground=TEXT_COLOR)
            rb_proxy.pack(anchor="w")
            rb_direct = tk.Radiobutton(form_frame, text="Conexão Direta (Sem Proxy)", variable=self.proxy_mode, value="direct", bg=CARD_BG, fg=TEXT_COLOR, selectcolor=BG_COLOR, activebackground=CARD_BG, activeforeground=TEXT_COLOR)
            rb_direct.pack(anchor="w", pady=(0, 15))
            
            # Botão Salvar
            self.btn_save = tk.Button(form_frame, text="Adicionar Perfil", font=("Segoe UI Semibold", 10), command=self.add_profile)
            self.btn_save.pack(fill="x", ipady=6)
            self.style_neumorphic_button(self.btn_save, ACCENT_BLUE, "#4752c4")
            
            # Botão Cancelar Edição (inicialmente oculto)
            self.btn_cancel_edit = tk.Button(form_frame, text="Cancelar Edição", font=("Segoe UI Semibold", 10), command=self.cancel_edit)
            
            # Espaçador antes do botão de limpar todos os perfis
            ttk.Label(form_frame, text="", background=CARD_BG).pack(pady=5)
            
            # Botão de Limpeza Global de Cache
            self.btn_clean_all = tk.Button(form_frame, text="Limpar Cache de Todos os Perfis", font=("Segoe UI Semibold", 10), command=self.clean_all_profiles)
            self.btn_clean_all.pack(fill="x", ipady=6, side="bottom", pady=(10, 0))
            self.style_neumorphic_button(self.btn_clean_all, "#cbd5e1", "#94a3b8", fg_color="#11111b")

            # Direita: Lista de Perfis
            list_outer_frame = ttk.Frame(main_pane)
            list_outer_frame.place(relx=0.48, rely=0.0, relwidth=0.52, relheight=0.95)
        else:
            # Lista de Perfis ocupa a tela inteira no modo cliente
            list_outer_frame = ttk.Frame(main_pane)
            list_outer_frame.place(relx=0.0, rely=0.0, relwidth=1.0, relheight=0.95)
        
        list_title = ttk.Label(list_outer_frame, text="Perfis Configurados", font=("Segoe UI Semibold", 12), foreground=TEXT_COLOR)
        list_title.pack(anchor="w", pady=(0, 10))
        
        # Container com scrollbar
        self.canvas = tk.Canvas(list_outer_frame, bg=BG_COLOR, highlightthickness=0)
        scrollbar = ttk.Scrollbar(list_outer_frame, orient="vertical", command=self.canvas.yview)
        
        # Vincula a rolagem do mouse para facilitar a navegação em qualquer parte da lista
        self.canvas.bind_all("<MouseWheel>", lambda event: self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units"))
        
        self.scrollable_frame = ttk.Frame(self.canvas)
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Forçar atualização de lista
        self.refresh_profile_list()

    def add_profile(self):
        name = self.entry_name.get().strip()
        url = self.entry_url.get().strip()
        proxy = self.entry_proxy.get().strip()
        mode = self.proxy_mode.get()
        
        # Validação simples
        if not name:
            messagebox.showwarning("Aviso", "Por favor, digite um nome para o perfil.")
            return
            
        # Filtra caracteres inválidos para pasta
        safe_name = "".join([c for c in name if c.isalpha() or c.isdigit() or c in " _-"]).strip()
        if not safe_name:
            messagebox.showwarning("Aviso", "O nome do perfil contém caracteres inválidos.")
            return
 
        if self.editing_key:
            # Modo Edição
            # Mantém o spid existente para o perfil editado
            existing_spid = self.profiles[self.editing_key].get("spid", "")
            if not existing_spid:
                import uuid
                existing_spid = f"inf_{self.editing_key.lower().replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
            self.profiles[self.editing_key] = {
                "name": name,
                "url": url if url else "https://claude.ai",
                "proxy": proxy,
                "mode": mode,
                "spid": existing_spid
            }
            self.save_config()
            
            # Sincroniza com o Supabase se for Administrador
            if self.admin_mode:
                save_profile_to_supabase(existing_spid, name, url if url else "https://claude.ai", proxy, mode)
                
            self.cancel_edit()
            self.refresh_profile_list()
        else:
            # Modo Criação
            if safe_name in self.profiles:
                messagebox.showwarning("Aviso", f"Já existe um perfil com o nome '{safe_name}'.")
                return
                
            import uuid
            generated_spid = f"inf_{safe_name.lower().replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
            self.profiles[safe_name] = {
                "name": name,
                "url": url if url else "https://claude.ai",
                "proxy": proxy,
                "mode": mode,
                "spid": generated_spid
            }
            
            self.save_config()
            
            # Sincroniza com o Supabase se for Administrador
            if self.admin_mode:
                save_profile_to_supabase(generated_spid, name, url if url else "https://claude.ai", proxy, mode)
                
            self.refresh_profile_list()
            
            # Limpa campos
            self.entry_name.delete(0, tk.END)
            self.entry_proxy.delete(0, tk.END)
            
    def edit_profile(self, key):
        self.editing_key = key
        p_data = self.profiles[key]
        
        # Preenche os campos do formulário
        self.entry_name.delete(0, tk.END)
        self.entry_name.insert(0, p_data["name"])
        
        self.entry_url.delete(0, tk.END)
        self.entry_url.insert(0, p_data.get("url", "https://claude.ai"))
        
        self.entry_proxy.delete(0, tk.END)
        self.entry_proxy.insert(0, p_data.get("proxy", ""))
        
        self.proxy_mode.set(p_data.get("mode", "proxy"))
        
        # Desativa a edição do nome (para manter a pasta física íntegra)
        self.entry_name.configure(state="disabled")
        
        # Atualiza botões do formulário
        self.form_title.configure(text="Editar Perfil")
        self.btn_save.configure(text="Salvar Alterações")
        self.style_neumorphic_button(self.btn_save, ACCENT_GREEN, "#2e854b")
        self.btn_cancel_edit.pack(fill="x", pady=(5, 0), ipady=6)
        self.style_neumorphic_button(self.btn_cancel_edit, ACCENT_RED, "#c03538")
        
    def cancel_edit(self):
        self.editing_key = None
        self.entry_name.configure(state="normal")
        self.entry_name.delete(0, tk.END)
        self.entry_proxy.delete(0, tk.END)
        self.entry_url.delete(0, tk.END)
        self.entry_url.insert(0, "https://claude.ai")
        self.proxy_mode.set("proxy")
        
        self.form_title.configure(text="Criar Novo Perfil")
        self.btn_save.configure(text="Adicionar Perfil")
        self.style_neumorphic_button(self.btn_save, ACCENT_BLUE, "#4752c4")
        self.btn_cancel_edit.pack_forget()
        
    def delete_profile(self, key):
        if messagebox.askyesno("Confirmar Exclusão", f"Deseja mesmo excluir o perfil '{key}' e todos os seus arquivos locais?"):
            # Pega o SPID para deletar no Supabase
            spid = self.profiles[key].get("spid") if key in self.profiles else None
            
            # Remove arquivos locais do perfil
            profile_dir = os.path.join(PROFILES_DIR, key)
            if os.path.exists(profile_dir):
                try:
                    shutil.rmtree(profile_dir)
                except Exception as e:
                    print(f"Erro ao deletar pasta física: {e}")
                    
            if key in self.profiles:
                del self.profiles[key]
            self.save_config()
            
            # Sincroniza exclusão com o Supabase se for Administrador
            if self.admin_mode and spid:
                delete_profile_from_supabase(spid)
                
            self.refresh_profile_list()
            
    def clean_all_profiles(self):
        if not self.profiles:
            messagebox.showinfo("Limpar Cache", "Nenhum perfil cadastrado para limpar.")
            return
            
        if not messagebox.askyesno("Limpar Cache", "Deseja mesmo limpar os caches e arquivos temporários de todos os perfis cadastrados?\n\nOs dados de login e cookies NÃO serão apagados."):
            return
            
        success_count = 0
        fail_count = 0
        
        for key in self.profiles.keys():
            profile_root = os.path.join(PROFILES_DIR, key)
            user_data_path = os.path.join(profile_root, "user-data")
            if os.path.exists(user_data_path):
                try:
                    clean_profile_cache(user_data_path)
                    success_count += 1
                except Exception:
                    fail_count += 1
            else:
                success_count += 1
                
        msg = f"Limpeza concluída!\n\nPerfis limpos com sucesso: {success_count}"
        if fail_count > 0:
            msg += f"\nPerfis com arquivos em uso/bloqueados: {fail_count}"
        messagebox.showinfo("Limpar Cache", msg)
            
    def open_profile(self, key, no_ext=False):
        if not self.chrome_path:
            messagebox.showerror("Erro", "O executável do Google Chrome não foi localizado no sistema.")
            return
            
        # Determina o argumento de modo
        mode_flag = "--admin" if self.admin_mode else "--client"
        
        # Monta comando de execução do subprocesso do gerenciador de forma compatível com PyInstaller
        if getattr(sys, 'frozen', False):
            cmd_args = [sys.executable, "--profile", key, mode_flag]
        else:
            cmd_args = [sys.executable, os.path.abspath(__file__), "--profile", key, mode_flag]
            
        if no_ext:
            cmd_args.append("--no-ext")
            
        if self.chrome_path:
            cmd_args.extend(["--chrome-path", self.chrome_path])
            
        # Executa o processo de background do gerenciador dedicado a este perfil de forma invisível
        try:
            subprocess.Popen(cmd_args)
            
            # Se for modo cliente, NÃO fecha a interface do gerenciador para facilitar o acesso
            # if not self.admin_mode:
            #     self.root.destroy()
        except Exception as e:
            messagebox.showerror("Erro", f"Falha ao iniciar o perfil em background: {e}")

    def refresh_profile_list(self):
        # Limpa o frame da lista
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
            
        if not self.profiles:
            empty_lbl = ttk.Label(self.scrollable_frame, text="Nenhum perfil criado ainda.", font=("Segoe UI", 10), foreground=TEXT_MUTED)
            empty_lbl.pack(pady=20, anchor="w")
            return
            
        for key, p_data in self.profiles.items():
            # Card do perfil como Frame Tkinter clássico com relevo esculpido neumórfico
            card = tk.Frame(self.scrollable_frame, bg=CARD_BG, relief="groove", bd=2, highlightthickness=0)
            card.pack(fill="x", expand=True, pady=6, padx=8)
            
            # Info do perfil
            info_frame = tk.Frame(card, bg=CARD_BG)
            info_frame.pack(side="left", fill="both", expand=True, padx=10, pady=8)
            
            lbl_name = tk.Label(info_frame, text=p_data["name"], font=("Segoe UI Semibold", 11), bg=CARD_BG, fg=TEXT_COLOR)
            lbl_name.pack(anchor="w")
            
            proxy_txt = "Sem Proxy"
            if p_data.get("mode") == "proxy":
                proxy_str = p_data.get("proxy", "").strip()
                proxy_txt = f"Proxy: {proxy_str.split(':')[0]}" if proxy_str else "Proxy Padrão"
                
            lbl_info = tk.Label(info_frame, text=f"{p_data['url']} | {proxy_txt}", font=("Segoe UI", 8), bg=CARD_BG, fg=TEXT_MUTED)
            lbl_info.pack(anchor="w", pady=(2, 0))
            
            # Botões de Ação
            btn_frame = tk.Frame(card, bg=CARD_BG)
            btn_frame.pack(side="right", fill="y", padx=10, pady=8)
            
            btn_open = tk.Button(btn_frame, text="Abrir", font=("Segoe UI Semibold", 9), width=8, command=lambda k=key: self.open_profile(k))
            btn_open.pack(side="left", padx=3, ipady=2)
            self.style_neumorphic_button(btn_open, ACCENT_GREEN, "#2e854b")
            
            if self.admin_mode:
                btn_clean = tk.Button(btn_frame, text="Abrir Limpo", font=("Segoe UI Semibold", 9), width=10, command=lambda k=key: self.open_profile(k, no_ext=True))
                btn_clean.pack(side="left", padx=3, ipady=2)
                self.style_neumorphic_button(btn_clean, "#cba6f7", "#b38de3", fg_color="#11111b")
                
                btn_edit = tk.Button(btn_frame, text="Editar", font=("Segoe UI Semibold", 9), width=8, command=lambda k=key: self.edit_profile(k))
                btn_edit.pack(side="left", padx=3, ipady=2)
                self.style_neumorphic_button(btn_edit, "#e2e8f0", "#cbd5e1", fg_color="#11111b")
                
                btn_del = tk.Button(btn_frame, text="Excluir", font=("Segoe UI Semibold", 9), width=8, command=lambda k=key: self.delete_profile(k))
                btn_del.pack(side="left", padx=3, ipady=2)
                self.style_neumorphic_button(btn_del, ACCENT_RED, "#c03538")

if __name__ == "__main__":
    # Inicia o servidor de logs locais
    start_log_server()
    
    # Determina se a chave de desenvolvedor/admin está presente
    admin_key_path1 = os.path.join(PROJECT_ROOT, "admin.key")
    admin_key_path2 = os.path.join(CURRENT_DIR, "admin.key")
    has_admin_key = os.path.exists(admin_key_path1) or os.path.exists(admin_key_path2)
    
    # Tratamento de argumentos de execução em background para perfil headless dedicado (proxy + Chrome)
    if len(sys.argv) > 2 and sys.argv[1] == "--profile":
        key = sys.argv[2]
        is_client = "--client" in sys.argv
        if not has_admin_key:
            is_client = True # Força o modo cliente caso o usuário manipule a linha de comando
        no_ext = "--no-ext" in sys.argv
        
        # Recupera o chrome_path se passado
        chrome_path_arg = None
        if "--chrome-path" in sys.argv:
            try:
                idx = sys.argv.index("--chrome-path")
                if idx + 1 < len(sys.argv):
                    chrome_path_arg = sys.argv[idx + 1]
            except Exception:
                pass
                
        run_profile_headless(key, is_client, no_ext=no_ext, chrome_path=chrome_path_arg)
        sys.exit(0)
        
    # Se tiver a chave de admin, abre a interface gráfica em modo Administrador por padrão
    if has_admin_key:
        root = tk.Tk()
        app = ProfileManagerApp(root, admin_mode=True)
        root.mainloop()
    else:
        # Modo padrão: abre a interface simplificada de seleção para o cliente
        root = tk.Tk()
        app = ProfileManagerApp(root, admin_mode=False)
        root.mainloop()
