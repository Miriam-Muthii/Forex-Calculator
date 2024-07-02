import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'forex-calculator';
  key = 'fca_live_lmXQxnD71uhbKtHehd1Ig0oy96JZXObx6M7yGGi2';
  state = {
    openedDrawer: null as 'base' | 'target' | null,
    currencies: [] as { code: string; name: string }[],
    rates: {} as { [key: string]: { [key: string]: number } },
    filteredCurrencies: [] as { code: string; name: string }[],
    base: 'USD',
    target: 'EUR',
    baseValue: 1,
  };

  exchangeRateDisplay = '';

  ui = {
    controls: null as HTMLElement | null,
    drawer: null as HTMLElement | null,
    dismissBtn: null as HTMLElement | null,
    currencyList: null as HTMLElement | null,
    searchInput: null as HTMLInputElement | null,
    baseBtn: null as HTMLButtonElement | null,
    targetBtn: null as HTMLButtonElement | null,
    exchangeRateDisplayElem: null as HTMLElement | null,
    baseInput: null as HTMLInputElement | null,
    targetInput: null as HTMLInputElement | null,
    swapBtn: null as HTMLButtonElement | null,
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupEventListeners();
      this.initApp();
    }
  }

  setupEventListeners = () => {
    this.ui.controls?.addEventListener('click', this.showDrawer);
    this.ui.dismissBtn?.addEventListener('click', this.hideDrawer);
    this.ui.searchInput?.addEventListener('input', this.filterCurrency);
    this.ui.currencyList?.addEventListener('click', this.selectPair);
    this.ui.baseInput?.addEventListener('input', this.convertInput);
    this.ui.swapBtn?.addEventListener('click', this.switchPair);
  };

  initApp = () => {
    this.fetchCurrencies();
    this.fetchExchangeRate();
  };

  showDrawer = (e: Event) => {
    if ((e.target as HTMLElement).hasAttribute('data-drawer')) {
      this.state.openedDrawer = (e.target as HTMLElement).id as 'base' | 'target';
      this.ui.drawer?.classList.add('show');
      console.log(this.state);
    }
  };

  hideDrawer = () => {
    this.state.openedDrawer = null;
    this.ui.drawer?.classList.remove('show');
    console.log(this.state);
  };

  filterCurrency = (event: Event) => {
    const keyword = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.state.filteredCurrencies = this.state.currencies.filter(
      ({ code, name }) =>
        code.toLowerCase().includes(keyword) ||
        name.toLowerCase().includes(keyword)
    );
    this.displayCurrencies();
  };

  selectPair = (e: Event) => {
    const target = (e.target as HTMLElement).closest('li');
    if (target && target.hasAttribute('data-code')) {
      const { openedDrawer } = this.state;
      if (openedDrawer) {
        this.state[openedDrawer] = target.getAttribute('data-code')!;
        this.loadExchangeRate();
        this.hideDrawer();
      }
    }
  };

  displayConversion = () => {
    this.updateExchangeRate();
    this.updateInputs();
    this.updateButtons();
  };

  updateButtons = () => {
    [this.ui.baseBtn!, this.ui.targetBtn!].forEach((btn) => {
      if (btn) {
        const id = btn.id as keyof typeof this.state;
        const code = this.state[id];
        
        if (typeof code === 'string') {
          btn.textContent = code;
          btn.style.setProperty('--image', `url(${this.getImageURL(code)})`, '');
        }
      }
    });
  };
    updateInputs = () => {
    const { base, baseValue, target, rates } = this.state;
    const result = baseValue * (rates[base]?.[target] ?? 0);
    this.ui.targetInput!.value = result.toFixed(4);
    this.ui.baseInput!.value = baseValue.toString();
  };

  updateExchangeRate = () => {
    const { base, target, rates } = this.state;
    const rate = (rates[base]?.[target] ?? 0).toFixed(4);
    this.exchangeRateDisplay = `1 ${base} = ${rate} ${target}`;
    if (this.ui.exchangeRateDisplayElem) {
      this.ui.exchangeRateDisplayElem.textContent = this.exchangeRateDisplay;
    }
  };

  getAvailableCurrencies = () => {
    return this.state.currencies.filter(({ code }) => {
      return this.state.base !== code && this.state.target !== code;
    });
  };

  convertInput = (event: Event) => {
    this.state.baseValue = parseFloat((event.target as HTMLInputElement).value) || 1;
    this.loadExchangeRate();
  };

  switchPair = () => {
    const { base, target } = this.state;
    this.state.base = target;
    this.state.target = base;
    this.state.baseValue = parseFloat(this.ui.targetInput!.value) || 1;
    this.loadExchangeRate();
  };

  displayCurrencies = () => {
    if (this.ui.currencyList) {
      this.ui.currencyList.innerHTML = this.state.filteredCurrencies
        .map(({ code, name }) => {
          return `
            <li data-code='${code}'>
              <img src="https://placehold.co/48" alt="">
              <div>
                <h4>${code}</h4>
                <p>${name}</p>
              </div>
            </li>
          `;
        })
        .join('');
    }
  };

  getImageURL = (code: string) => {
    const flag = 'https://wise.com/public-resources/assets/flags/rectangle/{code}.png';
    return flag.replace('{code}', code.toLowerCase());
  };

  loadExchangeRate = () => {
    const { base, rates } = this.state;
    if (typeof rates[base] !== 'undefined') {
      this.displayConversion();
    } else {
      this.fetchExchangeRate();
    }
  };

  fetchCurrencies = () => {
    fetch(`https://api.freecurrencyapi.com/v1/currencies?apikey=${this.key}`)
      .then((response) => response.json())
      .then((data) => {
        this.state.currencies = Object.values(data);
        this.state.filteredCurrencies = this.getAvailableCurrencies();
        this.displayCurrencies();
      });
  };

  fetchExchangeRate = () => {
    const { base } = this.state;
    fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${this.key}&base_currency=${base}`)
      .then((response) => response.json())
      .then(({ data }) => {
        this.state.rates[base] = data;
        this.displayConversion();
      })
      .catch(console.error);
  };
}
