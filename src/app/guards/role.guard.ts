import { inject } from "@angular/core";
import { CanActivateFn,Router } from "@angular/router";
import { Auth } from "../services/auth";

//guard depending on the role of the user
export function roleGuard(requiredRole: 'citizen' | 'agent'): CanActivateFn {
    return async () => {
        const auth = inject(Auth);
        const router = inject(Router);
      //if not logged in, redirect to login
      const loggedIn = await auth.isLoggedIn();
      if (!loggedIn) {
        router.navigateByUrl('/login');
        return false;
      }
      //if user is not the required role, redirect to the appropriate dashboard
      const user = await auth.getUser();
      if (user?.role !== requiredRole) {
        router.navigateByUrl(user?.role === 'agent' ? '/agent-dashboard' : '/tabs/my-reports');
        return false;
      }
      return true;
    };
}
