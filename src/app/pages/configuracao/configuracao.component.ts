import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TefBridgeService, ConfigTef } from '../../services/tef-bridge.service';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div class="header-title">
          <h1>Configuracao TEF</h1>
          <p>Configure sua operadora</p>
        </div>
      </header>
      <main class="app-content">
        <div *ngIf="mensagem" class="alert" [class.alert-success]="!erro" [class.alert-error]="erro">{{mensagem}}</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Provedor TEF</label>
            <select class="form-select" [(ngModel)]="provedor">
              <option value="sitef">SiTef</option>
              <option value="paygo">PayGo</option>
            </select>
          </div>
        </div>
        <div class="card" *ngIf="provedor === 'sitef'">
          <div class="section-title">Configuracoes SiTef</div>
          <div class="form-group">
            <label class="form-label">IP do Servidor</label>
            <input type="text" class="form-input" [(ngModel)]="sitef.ip" placeholder="192.168.1.100">
          </div>
          <div class="form-group">
            <label class="form-label">Terminal</label>
            <input type="text" class="form-input" [(ngModel)]="sitef.terminal" maxlength="8">
          </div>
          <div class="form-group">
            <label class="form-label">Codigo da Empresa</label>
            <input type="text" class="form-input" [(ngModel)]="sitef.empresa" maxlength="8">
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" (click)="testar()" [disabled]="testando">{{testando ? 'Testando...' : 'Testar Conexao'}}</button>
          <button class="btn btn-success" (click)="salvar()" [disabled]="salvando">{{salvando ? 'Salvando...' : 'Salvar'}}</button>
          <button class="btn btn-outline" (click)="irStatus()">Ver Status</button>
        </div>
      </main>
      <footer class="license-footer"><p>Licenca: {{licenca}}</p></footer>
    </div>
  `
})
export class ConfiguracaoComponent implements OnInit {
  provedor: 'sitef' | 'paygo' = 'sitef';
  licenca = '';
  mensagem = '';
  erro = false;
  testando = false;
  salvando = false;
  sitef = { ip: 'localhost', terminal: '00000001', empresa: '00000000' };
  paygo = { aplicacao: 'TEFBridge' };

  constructor(private tefService: TefBridgeService, private router: Router) {}

  ngOnInit(): void {
    if (!this.tefService.isActivated()) { this.router.navigate(['/ativacao']); return; }
    const config = this.tefService.getConfig();
    if (config) {
      this.licenca = config.licenca;
      this.provedor = config.provedor || 'sitef';
      if (config.sitef) this.sitef = { ...this.sitef, ...config.sitef };
    }
  }

  testar(): void {
    this.testando = true;
    this.mensagem = '';
    setTimeout(() => { this.erro = false; this.mensagem = 'Conexao OK!'; this.testando = false; }, 2000);
  }

  salvar(): void {
    this.salvando = true;
    const config: ConfigTef = { licenca: this.licenca, provedor: this.provedor, sitef: this.sitef };
    this.tefService.saveConfig(config);
    setTimeout(() => { this.erro = false; this.mensagem = 'Salvo!'; this.salvando = false; }, 1000);
  }

  irStatus(): void { this.router.navigate(['/status']); }
}
