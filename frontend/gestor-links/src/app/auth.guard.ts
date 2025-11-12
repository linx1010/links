import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Função auxiliar para verificar expiração do JWT
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // decodifica o payload
    const exp = payload.exp; // campo exp em segundos
    const now = Math.floor(Date.now() / 1000); // tempo atual em segundos
    return exp && exp > now; // válido se exp > agora
  } catch (e) {
    return false; // se não conseguir decodificar, considera inválido
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token && isTokenValid(token)) {
    // ✅ Token existe e não expirou
    return true;
  } else {
    // ❌ Token ausente ou expirado → redireciona para login
    router.navigate(['/login']);
    return false;
  }
};
