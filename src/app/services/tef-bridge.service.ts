import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ConfigTef {
  provedor: 'sitef' | 'paygo';
  licenca: string;
  sitef?: {
    ip: string;
    terminal: string;
    empresa: string;
  };
  paygo?: {
    aplicacao: string;
  };
}

export interface StatusResponse {
  online: boolean;
  versao: string;
  provedor: string;
  licenca: string;
  ultimaTransacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TefBridgeService {
  private baseUrl = 'http://localhost:3333';
  private configSubject = new BehaviorSubject<ConfigTef | null>(null);

  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private loadConfig(): void {
    const saved = localStorage.getItem('tef_config');
    if (saved) {
      this.configSubject.next(JSON.parse(saved));
    }
  }

  saveConfig(config: ConfigTef): void {
    localStorage.setItem('tef_config', JSON.stringify(config));
    this.configSubject.next(config);
  }

  getConfig(): ConfigTef | null {
    return this.configSubject.value;
  }

  isActivated(): boolean {
    const config = this.getConfig();
    return !!config?.licenca;
  }

  activate(licenca: string): void {
    const config: ConfigTef = this.getConfig() || { provedor: 'sitef', licenca: '' };
    config.licenca = licenca;
    this.saveConfig(config);
  }

  validarLicenca(codigo: string): Observable<{ valido: boolean; mensagem: string }> {
    return this.http.post<{ valido: boolean; mensagem: string }>(
      `${this.baseUrl}/licenca/validar`,
      { codigo }
    );
  }

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.baseUrl}/status`);
  }

  testarConexao(): Observable<{ sucesso: boolean; mensagem: string }> {
    return this.http.get<{ sucesso: boolean; mensagem: string }>(`${this.baseUrl}/health`);
  }

  salvarConfiguracao(config: Partial<ConfigTef>): Observable<{ sucesso: boolean }> {
    return this.http.post<{ sucesso: boolean }>(`${this.baseUrl}/configuracao`, config);
  }
}
