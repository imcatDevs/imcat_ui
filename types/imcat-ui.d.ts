/**
 * IMCAT UI Framework - TypeScript 정의 파일
 * @version 1.0.0
 */

// ===== Core Types =====

declare interface DOMElement {
  /** 요소 개수 */
  length: number;
  /** 실제 DOM 요소 배열 */
  elements: HTMLElement[];

  // 순회
  each(callback: (el: HTMLElement, index: number) => void): DOMElement;
  
  // 클래스 조작
  addClass(className: string): DOMElement;
  removeClass(className: string): DOMElement;
  toggleClass(className: string): DOMElement;
  hasClass(className: string): boolean;

  // 속성 조작
  attr(name: string): string;
  attr(name: string, value: string | number | boolean): DOMElement;
  removeAttr(name: string): DOMElement;
  data(key: string): any;
  data(key: string, value: any): DOMElement;

  // 콘텐츠 조작
  text(): string;
  text(value: string): DOMElement;
  html(): string;
  html(value: string): DOMElement;
  val(): string;
  val(value: string | number): DOMElement;

  // 스타일
  css(property: string): string;
  css(property: string, value: string | number): DOMElement;
  css(properties: Record<string, string | number>): DOMElement;

  // 이벤트
  on(event: string, handler: EventListener): DOMElement;
  on(event: string, selector: string, handler: EventListener): DOMElement;
  off(event: string, handler?: EventListener): DOMElement;
  trigger(event: string, data?: any): DOMElement;

  // 표시/숨김
  show(): DOMElement;
  hide(): DOMElement;
  toggle(): DOMElement;

  // DOM 조작
  append(content: string | HTMLElement | DOMElement): DOMElement;
  prepend(content: string | HTMLElement | DOMElement): DOMElement;
  before(content: string | HTMLElement | DOMElement): DOMElement;
  after(content: string | HTMLElement | DOMElement): DOMElement;
  remove(): DOMElement;
  empty(): DOMElement;
  clone(deep?: boolean): DOMElement;

  // 탐색
  find(selector: string): DOMElement;
  parent(): DOMElement;
  parents(selector?: string): DOMElement;
  closest(selector: string): DOMElement;
  children(selector?: string): DOMElement;
  siblings(selector?: string): DOMElement;
  first(): DOMElement;
  last(): DOMElement;
  eq(index: number): DOMElement;

  // 위치/크기
  offset(): { top: number; left: number };
  position(): { top: number; left: number };
  width(): number;
  height(): number;
}

// ===== Config Types =====

declare interface ConfigOptions {
  animation?: boolean;
  animationDuration?: number;
  autoLoadModuleCSS?: boolean;
  backdrop?: boolean;
  backdropClose?: boolean;
  escapeClose?: boolean;
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  currency?: string;
  zIndex?: {
    dropdown?: number;
    modal?: number;
    drawer?: number;
    popover?: number;
    tooltip?: number;
    loading?: number;
    toast?: number;
    notification?: number;
  };
  toast?: {
    duration?: number;
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    maxCount?: number;
  };
  notification?: {
    duration?: number;
    position?: string;
    closable?: boolean;
  };
  modal?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
    closeButton?: boolean;
    animation?: 'fade' | 'zoom' | 'slide';
  };
  drawer?: {
    position?: 'left' | 'right' | 'top' | 'bottom';
    width?: string;
    closeButton?: boolean;
  };
  dropdown?: {
    position?: string;
    align?: string;
    offset?: number;
    closeOnClick?: boolean;
    closeOnOutside?: boolean;
  };
  tooltip?: {
    position?: string;
    delay?: number;
    offset?: number;
  };
  api?: {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
  };
  form?: {
    validateOnBlur?: boolean;
    validateOnInput?: boolean;
    showErrorMessage?: boolean;
  };
  dateFormat?: {
    date?: Intl.DateTimeFormatOptions;
    time?: Intl.DateTimeFormatOptions;
    datetime?: Intl.DateTimeFormatOptions;
  };
  debug?: boolean;
}

declare interface Config {
  set(options: Partial<ConfigOptions>): ConfigOptions;
  set(key: string, value: any): ConfigOptions;
  get(): ConfigOptions;
  get<K extends keyof ConfigOptions>(key: K): ConfigOptions[K];
  get(key: string, defaultValue?: any): any;
  getFor(component: string, options?: object): object;
  reset(key?: string): void;
  onChange(callback: (changes: object, settings: ConfigOptions) => void): () => void;
  extend(defaults: object): void;
  clearListeners(): void;
  destroy(): void;
}

// ===== Modal Types =====

declare interface ModalButton {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  action?: (modal: Modal) => void;
  close?: boolean;
}

declare interface ModalOptions {
  title?: string;
  content?: string | HTMLElement;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  buttons?: ModalButton[];
  closeButton?: boolean;
  backdrop?: boolean;
  backdropClose?: boolean;
  escapeClose?: boolean;
  animation?: boolean;
  animationDuration?: number;
  onShow?: () => void;
  onHide?: () => void;
  onDestroy?: () => void;
}

declare interface Modal {
  show(): void;
  hide(): void;
  destroy(): void;
  setContent(content: string | HTMLElement): void;
  setTitle(title: string): void;
}

// ===== Drawer Types =====

declare interface DrawerOptions {
  title?: string;
  content?: string | HTMLElement;
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  height?: string;
  closeButton?: boolean;
  backdrop?: boolean;
  backdropClose?: boolean;
  escapeClose?: boolean;
  animation?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

declare interface Drawer {
  show(): void;
  hide(): void;
  destroy(): void;
}

// ===== Dropdown Types =====

declare interface DropdownItem {
  text?: string;
  icon?: string;
  value?: any;
  disabled?: boolean;
  divider?: boolean;
  onClick?: (item: DropdownItem) => void;
}

declare interface DropdownOptions {
  items?: DropdownItem[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  closeOnClick?: boolean;
  closeOnOutside?: boolean;
  openOnHover?: boolean;
  hoverDelay?: number;
  keyboard?: boolean;
  animation?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  onSelect?: (item: DropdownItem) => void;
}

declare interface Dropdown {
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
  setItems(items: DropdownItem[]): void;
}

// ===== Tooltip Types =====

declare interface TooltipOptions {
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  offset?: number;
  trigger?: 'hover' | 'click' | 'focus';
  animation?: boolean;
}

declare interface Tooltip {
  show(): void;
  hide(): void;
  destroy(): void;
  setContent(content: string): void;
}

// ===== Toast Types =====

declare interface ToastAPI {
  show(message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number): Promise<HTMLElement>;
  success(message: string, duration?: number): Promise<HTMLElement>;
  error(message: string, duration?: number): Promise<HTMLElement>;
  warning(message: string, duration?: number): Promise<HTMLElement>;
  info(message: string, duration?: number): Promise<HTMLElement>;
  clear(): void;
}

// ===== Notification Types =====

declare interface NotificationAction {
  text: string;
  onClick?: () => void;
}

declare interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  closable?: boolean;
  icon?: string;
  actions?: NotificationAction[];
  onClose?: () => void;
}

declare interface NotifyAPI {
  show(options: NotificationOptions): Promise<HTMLElement>;
  success(options: NotificationOptions | string): Promise<HTMLElement>;
  error(options: NotificationOptions | string): Promise<HTMLElement>;
  warning(options: NotificationOptions | string): Promise<HTMLElement>;
  info(options: NotificationOptions | string): Promise<HTMLElement>;
  clear(): void;
}

// ===== Confirm/Alert/Prompt Types =====

declare interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

declare interface AlertOptions {
  title?: string;
  buttonText?: string;
}

declare interface PromptOptions {
  title?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  confirmText?: string;
  cancelText?: string;
}

// ===== Formatters Types =====

declare interface Formatters {
  number(value: number, locale?: string): string;
  currency(value: number, currency?: string, locale?: string): string;
  percent(value: number, decimals?: number, isRatio?: boolean): string;
  date(value: Date | string | number, options?: Intl.DateTimeFormatOptions | string): string;
  time(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string;
  datetime(value: Date | string | number): string;
  relative(value: Date | string | number): string;
  bytes(bytes: number, decimals?: number): string;
  truncate(str: string, maxLength: number, suffix?: string): string;
  phone(value: string): string;
  bizNo(value: string): string;
  ssn(value: string): string;
  cardNo(value: string): string;
  zipCode(value: string): string;
  capitalize(str: string): string;
  titleCase(str: string): string;
  slug(str: string): string;
  maskEmail(email: string): string;
  maskName(name: string): string;
}

// ===== Storage Types =====

declare interface StorageOptions {
  expires?: number; // 만료 시간 (초)
  storage?: 'local' | 'session';
}

declare interface Storage {
  get<T = any>(key: string, defaultValue?: T): T;
  set(key: string, value: any, options?: StorageOptions): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
}

// ===== State Types =====

declare interface StateProxy<T extends object> {
  readonly state: T;
  watch<K extends keyof T>(key: K, callback: (newValue: T[K], oldValue: T[K]) => void): () => void;
  unwatch(key?: keyof T): void;
  reset(): void;
  destroy(): void;
}

declare interface StateManager {
  create<T extends object>(initialState: T): StateProxy<T> & T;
}

declare interface GlobalState {
  use<T extends object>(name: string, initialState?: T): StateProxy<T> & T;
  get<T extends object>(name: string): (StateProxy<T> & T) | undefined;
  remove(name: string): void;
  list(): string[];
}

// ===== Router Types =====

declare interface ViewRouter {
  navigate(path: string, options?: { replace?: boolean; data?: any }): Promise<void>;
  setContainer(selector: string): void;
  beforeLoad(handler: (path: string) => boolean | void): void;
  afterLoad(handler: (path: string) => void): void;
  registerInstance(instance: { destroy?: () => void }): void;
  params(): Record<string, string>;
  getCurrentPath(): string;
  destroy(): void;
}

// ===== API Types =====

declare interface APIResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  error: any;
  timestamp: number;
}

declare interface APIRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  signal?: AbortSignal;
}

declare interface APIUtil {
  get<T = any>(url: string, config?: APIRequestConfig): Promise<APIResponse<T>>;
  post<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<APIResponse<T>>;
  put<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<APIResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<APIResponse<T>>;
  delete<T = any>(url: string, config?: APIRequestConfig): Promise<APIResponse<T>>;
  
  interceptors: {
    request: {
      use(onFulfilled: (config: any) => any, onRejected?: (error: any) => any): number;
      eject(id: number): void;
      clear(): void;
    };
    response: {
      use(onFulfilled: (response: any) => any, onRejected?: (error: any) => any): number;
      eject(id: number): void;
      clear(): void;
    };
    clear(): void;
  };

  success<T>(data: T, message?: string, statusCode?: number): APIResponse<T>;
  error(message: string, statusCode?: number, error?: any): APIResponse<null>;
}

// ===== Template Types =====

declare interface Template {
  render(template: string, data: object): string;
  renderRaw(template: string, data: object): string;
  if(condition: boolean, html: string): string;
  each<T>(array: T[], template: string | ((item: T, index: number) => string)): string;
}

// ===== Animation Types =====

declare interface AnimationChain {
  fadeIn(duration?: number): Promise<void>;
  fadeOut(duration?: number): Promise<void>;
  slideDown(duration?: number): Promise<void>;
  slideUp(duration?: number): Promise<void>;
  slideLeft(duration?: number): Promise<void>;
  slideRight(duration?: number): Promise<void>;
  scaleIn(duration?: number): Promise<void>;
  scaleOut(duration?: number): Promise<void>;
  bounceIn(duration?: number): Promise<void>;
  bounceOut(duration?: number): Promise<void>;
  rotateIn(duration?: number): Promise<void>;
  rotateOut(duration?: number): Promise<void>;
  flipIn(duration?: number): Promise<void>;
  flipOut(duration?: number): Promise<void>;
  shake(duration?: number): Promise<void>;
  pulse(duration?: number): Promise<void>;
  flash(duration?: number): Promise<void>;
  swing(duration?: number): Promise<void>;
  wobble(duration?: number): Promise<void>;
  tada(duration?: number): Promise<void>;
  heartBeat(duration?: number): Promise<void>;
}

declare interface AnimationUtil {
  animate(selector: string | HTMLElement): AnimationChain;
}

// ===== Form Validator Types =====

declare interface ValidationRule {
  required?: boolean | string;
  minLength?: number | [number, string];
  maxLength?: number | [number, string];
  min?: number | [number, string];
  max?: number | [number, string];
  pattern?: RegExp | [RegExp, string];
  email?: boolean | string;
  url?: boolean | string;
  match?: string | [string, string];
  custom?: (value: any, formData: object) => boolean | string;
}

declare interface FormValidatorOptions {
  rules: Record<string, ValidationRule>;
  messages?: Record<string, Record<string, string>>;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
  showErrorMessage?: boolean;
  onValid?: (field: string) => void;
  onInvalid?: (field: string, errors: string[]) => void;
  onSubmit?: (data: object) => void;
}

declare interface FormValidator {
  new (selector: string | HTMLFormElement, options: FormValidatorOptions): FormValidatorInstance;
}

declare interface FormValidatorInstance {
  validate(): boolean;
  validateField(fieldName: string): boolean;
  getErrors(): Record<string, string[]>;
  reset(): void;
  destroy(): void;
}

// ===== Loading Types =====

declare interface Loading {
  show(message?: string): void;
  hide(): void;
  isVisible(): boolean;
}

// ===== AutoInit Types =====

declare interface AutoInit {
  init(imcat: IMCAT): void;
  register(name: string, initializer: (el: HTMLElement, options: object, imcat: IMCAT) => Promise<any>): void;
  unregister(name: string): void;
  refresh(scope?: string | HTMLElement): void;
  getInstance(el: HTMLElement): any;
  destroy(): void;
}

// ===== Main IMCAT Interface =====

declare interface IMCAT {
  // Version
  readonly version: string;

  // DOM Selection
  (selector: string | HTMLElement): DOMElement;
  $(selector: string | HTMLElement): DOMElement;
  create(tagName: string, attributes?: Record<string, any>): DOMElement;
  ready(callback: () => void): void;

  // Module Loading
  use<T = any>(...moduleNames: string[]): Promise<T>;
  loader: {
    preload(...moduleNames: string[]): Promise<void>;
  };

  // Event Bus
  on(event: string, handler: (...args: any[]) => void): void;
  once(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;

  // Config
  config: Config;

  // Router
  view: ViewRouter;

  // State Management
  state: StateManager;
  globalState: GlobalState;

  // Storage
  storage: Storage;

  // API
  api: APIUtil;

  // Template
  template: Template;

  // Animation
  animation: AnimationUtil;
  animate(selector: string | HTMLElement): AnimationChain;

  // Loading
  loading: Loading;

  // Formatters
  format: Formatters;

  // Shortcuts - Dialogs
  modal(options: ModalOptions): Promise<Modal>;
  drawer(options: DrawerOptions): Promise<Drawer>;
  confirm(message: string): Promise<boolean>;
  confirm(options: ConfirmOptions): Promise<boolean>;
  alert(message: string, options?: AlertOptions): Promise<void>;
  prompt(message: string, options?: PromptOptions): Promise<string | null>;

  // Shortcuts - Components
  dropdown(trigger: string | HTMLElement, options: DropdownOptions): Promise<Dropdown>;
  tooltip(element: string | HTMLElement, content: string): Promise<Tooltip>;
  tooltip(element: string | HTMLElement, options: TooltipOptions): Promise<Tooltip>;
  popover(element: string | HTMLElement, content: string): Promise<any>;
  popover(element: string | HTMLElement, options: any): Promise<any>;

  // Shortcuts - Navigation
  tabs(element: string | HTMLElement, options?: any): Promise<any>;
  accordion(element: string | HTMLElement, options?: any): Promise<any>;
  carousel(element: string | HTMLElement, options?: any): Promise<any>;
  stepper(element: string | HTMLElement, options?: any): Promise<any>;

  // Shortcuts - Overlays
  lightbox(images: string[] | Array<{ src: string; title?: string }>, options?: any): Promise<any>;

  // Shortcuts - Pickers
  datePicker(element: string | HTMLElement, options?: any): Promise<any>;
  timePicker(element: string | HTMLElement, options?: any): Promise<any>;
  colorPicker(element: string | HTMLElement, options?: any): Promise<any>;
  countdown(element: string | HTMLElement, targetDate: Date | string | number, options?: any): Promise<any>;

  // Shortcuts - Selectors
  autocomplete(element: string | HTMLElement, options: any): Promise<any>;
  multiSelect(element: string | HTMLElement, options?: any): Promise<any>;
  rangeSlider(element: string | HTMLElement, options?: any): Promise<any>;

  // Shortcuts - Forms
  rating(element: string | HTMLElement, options?: any): Promise<any>;
  fileUpload(element: string | HTMLElement, options?: any): Promise<any>;

  // Shortcuts - Data Visualization
  dataTable(element: string | HTMLElement, options: any): Promise<any>;
  chart(element: string | HTMLElement, options: any): Promise<any>;
  kanban(element: string | HTMLElement, options: any): Promise<any>;
  gantt(element: string | HTMLElement, options: any): Promise<any>;

  // Shortcuts - Advanced UI
  qrCode(element: string | HTMLElement, data: string, options?: any): Promise<any>;
  imageList(element: string | HTMLElement, options: any): Promise<any>;
  imageCompare(element: string | HTMLElement, options: any): Promise<any>;

  // Shortcuts - Scroll & Pagination
  infiniteScroll(element: string | HTMLElement, options: any): Promise<any>;
  pagination(element: string | HTMLElement, options: any): Promise<any>;

  // Shortcuts - Feedback Components
  progress(options: any): Promise<any>;
  skeleton(element: string | HTMLElement, options?: any): Promise<any>;

  // Shortcuts - Feedback
  toast: ToastAPI;
  notify: NotifyAPI;

  // Theme API (전환 효과 포함)
  theme: {
    /** 사용 가능한 전환 효과 타입 */
    TRANSITIONS: {
      NONE: 'none';
      FADE: 'fade';
      SLIDE: 'slide';
      CIRCLE: 'circle';
      CIRCLE_TOP_LEFT: 'circle-top-left';
      CIRCLE_TOP_RIGHT: 'circle-top-right';
      CIRCLE_BOTTOM_LEFT: 'circle-bottom-left';
      CIRCLE_BOTTOM_RIGHT: 'circle-bottom-right';
      CIRCLE_CENTER: 'circle-center';
    };
    init(options?: { 
      transition?: 'none' | 'fade' | 'slide' | 'circle' | 'circle-top-left' | 'circle-top-right' | 'circle-bottom-left' | 'circle-bottom-right' | 'circle-center';
      transitionDuration?: number;
    }): Promise<any>;
    toggle(animate?: boolean): Promise<void>;
    toggleWithEvent(event: MouseEvent, theme?: 'light' | 'dark'): Promise<void>;
    set(theme: 'light' | 'dark' | 'system', animate?: boolean): Promise<void>;
    get(): Promise<'light' | 'dark'>;
    isDark(): Promise<boolean>;
    isLight(): Promise<boolean>;
  };

  // Helpers - Form
  formData(selector: string | HTMLFormElement): Record<string, any>;
  fillForm(selector: string | HTMLFormElement, data: Record<string, any>): void;
  resetForm(selector: string | HTMLFormElement): void;
  form: FormValidator;

  // Helpers - Clipboard
  copy(text: string): Promise<boolean>;

  // Helpers - Download
  download(content: Blob | string, filename: string): void;
  downloadJSON(data: any, filename: string): void;
  downloadCSV(rows: object[], filename: string): void;

  // Helpers - Table
  tableData(selector: string | HTMLTableElement): object[];

  // Helpers - Scroll
  scrollTo(target: string | HTMLElement | number, options?: { offset?: number; behavior?: ScrollBehavior; smooth?: boolean }): void;
  scrollTop(smooth?: boolean): void;
  isInViewport(selector: string | HTMLElement): boolean;

  // Helpers - URL
  parseQuery(url?: string): Record<string, string | string[]>;
  buildQuery(params: Record<string, any>): string;

  // Helpers - Storage
  getStorage<T = any>(key: string, defaultValue?: T): T;
  setStorage(key: string, value: any): boolean;

  // Security
  escape(str: string): string;
  sanitize(html: string): string;
  validatePath(path: string): boolean;

  // Utils
  isString(value: any): value is string;
  isNumber(value: any): value is number;
  isArray(value: any): value is any[];
  isObject(value: any): value is object;
  isFunction(value: any): value is Function;
  extend<T extends object>(target: T, ...sources: object[]): T;
  clone<T>(obj: T): T;
  debounce<T extends (...args: any[]) => any>(fn: T, wait: number): T;
  throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T;
  randomId(prefix?: string): string;

  // Auto Init
  autoInit: AutoInit;

  // Cleanup
  destroy(): void;
}

// ===== Global Declaration =====

declare const IMCAT: IMCAT;

// ===== Module Exports =====

declare module 'imcat-ui' {
  export default IMCAT;
  export { IMCAT };
}

// ===== Window Extension =====

declare global {
  interface Window {
    IMCAT: IMCAT;
  }
}
