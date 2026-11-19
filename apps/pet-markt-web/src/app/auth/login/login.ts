import { Component, inject } from '@angular/core';
import { Auth } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';

  async onSubmit() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async loginWithGoogle() {
    try {
      await this.auth.googleSignIn();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }
}
