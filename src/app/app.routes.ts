import { Routes } from '@angular/router';
import { AtivacaoComponent } from './pages/ativacao/ativacao.component';
import { ConfiguracaoComponent } from './pages/configuracao/configuracao.component';
import { StatusComponent } from './pages/status/status.component';

export const routes: Routes = [
  { path: '', redirectTo: 'ativacao', pathMatch: 'full' },
  { path: 'ativacao', component: AtivacaoComponent },
  { path: 'configuracao', component: ConfiguracaoComponent },
  { path: 'status', component: StatusComponent }
];
