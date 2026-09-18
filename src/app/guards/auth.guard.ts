import { inject } from "@angular/core";
import { CanActivateFn,Router } from "@angular/router";
import { Auth } from "../services/auth";

// Guard to protect routes that require authentication
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const loggedIn = await auth.isLoggedIn();
  // Redirect to login if not logged in
  if (loggedIn) {
    return true;
  }
  router.navigateByUrl('/login');
  return false;
}
