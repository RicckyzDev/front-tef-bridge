import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TefBridgeService } from '../../services/tef-bridge.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
        </div>
        <div class="header-title">
          <h1>Status do Sistema</h1>
          <p>Monitore as conexoes</p>
        </div>
      </header>
      <main class="app-content">
        <div class="status-grid">
          <div class="status-item" [class.status-online]="status.sitef" [class.status-offline]="!status.sitef">
            <div class="status-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
            </div>
            <div class="status-info"><span class="status-label">SiTef</span><span class="status-text">{{status.sitef ? 'Online' : 'Offline'}}</span></div>
          </div>
          <div class="status-item" [class.status-online]="status.pinpad" [class.status-offline]="!status.pinpad">
            <div class="status-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <div class="status-info"><span class="status-label">PinPad</span><span class="status-text">{{status.pinpad ? 'Conectado' : 'Desconectado'}}</span></div>
          </div>
          <div class="status-item" [class.status-online]="status.service" [class.status-offline]="!status.service">
            <div class="status-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="status-info"><span class="status-label">Servico TEF</span><span class="status-text">{{status.service ? 'Ativo' : 'Inativo'}}</span></div>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" (click)="atualizar()">Atualizar Status</button>
          <button class="btn btn-outline" (click)="voltar()">Voltar</button>
        </div>
      </main>
      <footer class="license-footer"><p>Ultima verificacao: {{ultimaVerificacao}}</p></footer>
    </div>
  `
})
export class StatusComponent implements OnInit, OnDestroy {
  status = { sitef: false, pinpad: false, service: true };
  ultimaVerificacao = new Date().toLocaleTimeString();
  private interval: any;

  constructor(private tefService: TefBridgeService, private router: Router) {}

  ngOnInit(): void {
    if (!this.tefService.isActivated()) { this.router.navigate(['/ativacao']); return; }
    this.atualizar();
    this.interval = setInterval(() => this.atualizar(), 10000);
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  atualizar(): void {
    this.status.sitef = Math.random() > 0.3;
    this.status.pinpad = Math.random() > 0.5;
    this.status.service = true;
    this.ultimaVerificacao = new Date().toLocaleTimeString();
  }

  voltar(): void { this.router.navigate(['/configuracao']); }
}
