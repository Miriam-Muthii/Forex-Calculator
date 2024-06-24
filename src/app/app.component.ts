import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'forex-calculator';

  state = {
    openedDrawer: null
  };

  ui = {
    controls: null as HTMLElement | null,
    drawer: null as HTMLElement | null,
    dismissBtn: null as HTMLElement | null
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize UI elements
      this.ui.controls = document.getElementById('controls');
      this.ui.drawer = document.getElementById('drawer');
      this.ui.dismissBtn = document.getElementById('dismiss-btn');

      // Setup event listeners
      this.setupEventListeners();
    }
  }

  setupEventListeners = () => {
    this.ui.controls?.addEventListener('click', this.showDrawer);
    this.ui.dismissBtn?.addEventListener('click', this.hideDrawer);
  }

  showDrawer = (e: any) => {
    this.state.openedDrawer = e.target.id;
    this.ui.drawer?.classList.add('show');
  }

  hideDrawer = (e: any) => {
    this.ui.drawer?.classList.remove('show');
  }
}
