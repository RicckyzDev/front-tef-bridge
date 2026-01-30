use std::process::{Command, Stdio};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
struct JavaProcess(Mutex<Option<std::process::Child>>);
fn get_resource_path(app: &tauri::AppHandle) -> PathBuf {
    app.path().resource_dir().unwrap_or_else(|_| PathBuf::from("."))
}
fn start_java_server(app: &tauri::AppHandle) -> Result<std::process::Child, String> {
    let resource_dir = get_resource_path(app);
    let jre_path = resource_dir.join("jre").join("bin").join("java.exe");
    let jar_path = resource_dir.join("tef-bridge.jar");
    println!("Resource dir: {:?}", resource_dir);
    println!("JRE path: {:?}", jre_path);
    println!("JAR path: {:?}", jar_path);
    if !jre_path.exists() {
        return Err(format!("JRE not found at: {:?}", jre_path));
    }
    if !jar_path.exists() {
        return Err(format!("JAR not found at: {:?}", jar_path));
    }
    #[cfg(windows)]
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let mut cmd = Command::new(&jre_path);
    cmd.arg("-jar")
       .arg(&jar_path)
       .current_dir(&resource_dir)
       .stdout(Stdio::null())
       .stderr(Stdio::null());
    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);
    let child = cmd.spawn()
        .map_err(|e| format!("Failed to start Java: {}", e))?;
    println!("Java server started with PID: {}", child.id());
    Ok(child)
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(JavaProcess(Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(500));
                match start_java_server(&handle) {
                    Ok(child) => {
                        if let Some(state) = handle.try_state::<JavaProcess>() {
                            *state.0.lock().unwrap() = Some(child);
                        }
                        println!("TEF Bridge server started successfully!");
                    }
                    Err(e) => {
                        eprintln!("Failed to start TEF Bridge server: {}", e);
                    }
                }
            });
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Some(state) = window.app_handle().try_state::<JavaProcess>() {
                    if let Some(mut child) = state.0.lock().unwrap().take() {
                        let _ = child.kill();
                        println!("Java server stopped");
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}