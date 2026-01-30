import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TefBridgeService } from '../../services/tef-bridge.service';

@Component({
  selector: 'app-ativacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
        </div>
        <div class="header-title">
          <h1>TEF Bridge</h1>
          <p>Ative sua licenca</p>
        </div>
      </header>
      <main class="app-content">
        <div *ngIf="mensagem" class="alert" [class.alert-success]="!erro" [class.alert-error]="erro">{{mensagem}}</div>
        <div class="card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p class="card-text">Insira sua chave de licenca para ativar o sistema TEF Bridge.</p>
          <div class="form-group">
            <label class="form-label">Chave de Licenca</label>
            <input type="text" class="form-input" [(ngModel)]="licenca" placeholder="XXXX-XXXX-XXXX-XXXX" (keydown.enter)="ativar()">
          </div>
          <button class="btn btn-primary btn-block" (click)="ativar()" [disabled]="!licenca || ativando">{{ativando ? 'Ativando...' : 'Ativar Licenca'}}</button>
        </div>
      </main>
      <footer class="license-footer"><p>Versao 1.0.0</p></footer>
    </div>
  `
})
export class AtivacaoComponent {
  licenca = '';
  mensagem = '';
  erro = false;
  ativando = false;

  constructor(private tefService: TefBridgeService, private router: Router) {}

  ngOnInit(): void {
    if (this.tefService.isActivated()) this.router.navigate(['/configuracao']);
  }

  ativar(): void {
    if (!this.licenca) return;
    this.ativando = true;
    this.mensagem = '';
    setTimeout(() => {
      this.tefService.activate(this.licenca);
      this.router.navigate(['/configuracao']);
      this.ativando = false;
    }, 1500);
  }
}
