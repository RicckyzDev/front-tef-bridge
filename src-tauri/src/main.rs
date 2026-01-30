#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child, Stdio};
use std::sync::Mutex;
use std::os::windows::process::CommandExt;
use tauri::{Manager, RunEvent, WindowEvent};

const CREATE_NO_WINDOW: u32 = 0x08000000;

struct TefBridgeState {
    java_process: Mutex<Option<Child>>,
}

#[tauri::command]
fn start_tef_bridge(state: tauri::State<TefBridgeState>) -> Result<String, String> {
    let mut process = state.java_process.lock().unwrap();

    if process.is_some() {
        return Ok("TEF Bridge já está rodando".to_string());
    }

    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Não foi possível obter o diretório")?
        .to_path_buf();

    let jar_path = exe_dir.join("resources").join("tef-bridge.jar");
    let jre_path = exe_dir.join("jre").join("bin").join("java.exe");

    let java_cmd = if jre_path.exists() {
        jre_path.to_string_lossy().to_string()
    } else {
        "java".to_string()
    };

    if !jar_path.exists() {
        return Err(format!("JAR não encontrado: {:?}", jar_path));
    }

    let child = Command::new(&java_cmd)
        .args(["-jar", jar_path.to_str().unwrap()])
        .creation_flags(CREATE_NO_WINDOW)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Erro ao iniciar TEF Bridge: {}", e))?;

    *process = Some(child);
    Ok("TEF Bridge iniciado com sucesso".to_string())
}

#[tauri::command]
fn stop_tef_bridge(state: tauri::State<TefBridgeState>) -> Result<String, String> {
    let mut process = state.java_process.lock().unwrap();

    if let Some(mut child) = process.take() {
        child.kill().map_err(|e| e.to_string())?;
        Ok("TEF Bridge parado".to_string())
    } else {
        Ok("TEF Bridge não estava rodando".to_string())
    }
}

#[tauri::command]
fn get_tef_status(state: tauri::State<TefBridgeState>) -> bool {
    let process = state.java_process.lock().unwrap();
    process.is_some()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(TefBridgeState {
            java_process: Mutex::new(None),
        })
        .setup(|app| {
            let state = app.state::<TefBridgeState>();
            let _ = start_backend(&state);
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            start_tef_bridge,
            stop_tef_bridge,
            get_tef_status
        ])
        .build(tauri::generate_context!())
        .expect("erro ao criar app tauri")
        .run(|app_handle, event| {
            if let RunEvent::ExitRequested { .. } = event {
                let state = app_handle.state::<TefBridgeState>();
                let mut process = state.java_process.lock().unwrap();
                if let Some(mut child) = process.take() {
                    let _ = child.kill();
                }
            }
        });
}

fn start_backend(state: &TefBridgeState) -> Result<(), String> {
    let mut process = state.java_process.lock().unwrap();

    if process.is_some() {
        return Ok(());
    }

    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Não foi possível obter o diretório")?
        .to_path_buf();

    let jar_path = exe_dir.join("resources").join("tef-bridge.jar");
    let jre_path = exe_dir.join("jre").join("bin").join("java.exe");

    let java_cmd = if jre_path.exists() {
        jre_path.to_string_lossy().to_string()
    } else {
        "java".to_string()
    };

    if jar_path.exists() {
        let child = Command::new(&java_cmd)
            .args(["-jar", jar_path.to_str().unwrap()])
            .creation_flags(CREATE_NO_WINDOW)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Erro ao iniciar: {}", e))?;
        *process = Some(child);
    }

    Ok(())
}
