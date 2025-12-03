/**
 * IMCAT 포맷터
 * @module core/formatters
 * @description 자주 사용하는 형식 변환 함수를 제공합니다.
 */

/**
 * 포맷터 함수 모음
 * @class
 */
export const Formatters = {
  /**
   * 숫자 포맷 (천 단위 구분)
   * @param {number} value - 숫자
   * @param {string} [locale='ko-KR'] - 로케일
   * @returns {string}
   *
   * @example
   * IMCAT.format.number(1234567); // '1,234,567'
   */
  number(value, locale = 'ko-KR') {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat(locale).format(value);
  },

  /**
   * 통화 포맷
   * @param {number} value - 금액
   * @param {string} [currency='KRW'] - 통화 코드
   * @param {string} [locale='ko-KR'] - 로케일
   * @returns {string}
   *
   * @example
   * IMCAT.format.currency(50000); // '₩50,000'
   * IMCAT.format.currency(100, 'USD', 'en-US'); // '$100.00'
   */
  currency(value, currency = 'KRW', locale = 'ko-KR') {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'KRW' ? 0 : 2
    }).format(value);
  },

  /**
   * 퍼센트 포맷
   * @param {number} value - 값 (0~1 또는 0~100)
   * @param {number} [decimals=0] - 소수점 자리수
   * @param {boolean} [isRatio=false] - true면 0~1, false면 0~100
   * @returns {string}
   *
   * @example
   * IMCAT.format.percent(0.75, 1, true); // '75.0%'
   * IMCAT.format.percent(75); // '75%'
   */
  percent(value, decimals = 0, isRatio = false) {
    if (value === null || value === undefined || isNaN(value)) return '';
    const percent = isRatio ? value * 100 : value;
    return `${percent.toFixed(decimals)}%`;
  },

  /**
   * 날짜 포맷
   * @param {Date|string|number} value - 날짜
   * @param {Object|string} [options] - Intl 옵션 또는 포맷 문자열
   * @returns {string}
   *
   * @example
   * IMCAT.format.date(new Date()); // '2025. 12. 3.'
   * IMCAT.format.date(new Date(), 'short'); // '25. 12. 3.'
   */
  date(value, options = {}) {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    // 프리셋 옵션
    const presets = {
      short: { year: '2-digit', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      iso: null // ISO 포맷은 별도 처리
    };

    if (options === 'iso') {
      return date.toISOString().split('T')[0];
    }

    const finalOptions = typeof options === 'string'
      ? presets[options] || { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: '2-digit', day: '2-digit', ...options };

    return new Intl.DateTimeFormat('ko-KR', finalOptions).format(date);
  },

  /**
   * 시간 포맷
   * @param {Date|string|number} value - 날짜/시간
   * @param {Object} [options] - Intl 옵션
   * @returns {string}
   *
   * @example
   * IMCAT.format.time(new Date()); // '오후 3:30'
   */
  time(value, options = {}) {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    const finalOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return new Intl.DateTimeFormat('ko-KR', finalOptions).format(date);
  },

  /**
   * 날짜+시간 포맷
   * @param {Date|string|number} value - 날짜/시간
   * @returns {string}
   *
   * @example
   * IMCAT.format.datetime(new Date()); // '2025. 12. 3. 오후 3:30'
   */
  datetime(value) {
    if (!value) return '';
    return `${this.date(value)} ${this.time(value)}`;
  },

  /**
   * 상대 시간 포맷
   * @param {Date|string|number} value - 날짜/시간
   * @returns {string}
   *
   * @example
   * IMCAT.format.relative(new Date(Date.now() - 60000)); // '1분 전'
   * IMCAT.format.relative(new Date(Date.now() + 86400000)); // '내일'
   */
  relative(value) {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    const rtf = new Intl.RelativeTimeFormat('ko-KR', { numeric: 'auto' });
    const diff = (date.getTime() - Date.now()) / 1000; // 초 단위

    // 적절한 단위 선택
    const units = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 }
    ];

    for (const { unit, seconds } of units) {
      if (Math.abs(diff) >= seconds || unit === 'second') {
        return rtf.format(Math.round(diff / seconds), unit);
      }
    }

    return '';
  },

  /**
   * 바이트 크기 포맷
   * @param {number} bytes - 바이트 수
   * @param {number} [decimals=2] - 소수점 자리수
   * @returns {string}
   *
   * @example
   * IMCAT.format.bytes(1024); // '1 KB'
   * IMCAT.format.bytes(1536, 1); // '1.5 KB'
   */
  bytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return '';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  },

  /**
   * 문자열 자르기 (말줄임표)
   * @param {string} str - 문자열
   * @param {number} maxLength - 최대 길이
   * @param {string} [suffix='...'] - 접미사
   * @returns {string}
   *
   * @example
   * IMCAT.format.truncate('Hello World', 8); // 'Hello...'
   */
  truncate(str, maxLength, suffix = '...') {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 전화번호 포맷
   * @param {string} value - 전화번호
   * @returns {string}
   *
   * @example
   * IMCAT.format.phone('01012345678'); // '010-1234-5678'
   * IMCAT.format.phone('0212345678'); // '02-1234-5678'
   */
  phone(value) {
    if (!value) return '';

    const cleaned = String(value).replace(/\D/g, '');

    // 휴대폰 (010, 011, 016, 017, 018, 019)
    if (/^01[016789]/.test(cleaned) && cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // 서울 (02)
    if (cleaned.startsWith('02')) {
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
      }
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
      }
    }

    // 일반 지역번호 (3자리)
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    return value;
  },

  /**
   * 사업자등록번호 포맷
   * @param {string} value - 사업자등록번호
   * @returns {string}
   *
   * @example
   * IMCAT.format.bizNo('1234567890'); // '123-45-67890'
   */
  bizNo(value) {
    if (!value) return '';
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length !== 10) return value;
    return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
  },

  /**
   * 주민등록번호 마스킹
   * @param {string} value - 주민등록번호
   * @returns {string}
   *
   * @example
   * IMCAT.format.ssn('9001011234567'); // '900101-1******'
   */
  ssn(value) {
    if (!value) return '';
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length !== 13) return value;
    return cleaned.substring(0, 6) + '-' + cleaned.charAt(6) + '******';
  },

  /**
   * 카드번호 마스킹
   * @param {string} value - 카드번호
   * @returns {string}
   *
   * @example
   * IMCAT.format.cardNo('1234567890123456'); // '1234-****-****-3456'
   */
  cardNo(value) {
    if (!value) return '';
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length < 13) return value;
    return cleaned.substring(0, 4) + '-****-****-' + cleaned.substring(cleaned.length - 4);
  },

  /**
   * 우편번호 포맷
   * @param {string} value - 우편번호
   * @returns {string}
   *
   * @example
   * IMCAT.format.zipCode('12345'); // '12345'
   * IMCAT.format.zipCode('123456'); // '123-456' (구 우편번호)
   */
  zipCode(value) {
    if (!value) return '';
    const cleaned = String(value).replace(/\D/g, '');

    // 신 우편번호 (5자리)
    if (cleaned.length === 5) {
      return cleaned;
    }

    // 구 우편번호 (6자리)
    if (cleaned.length === 6) {
      return cleaned.replace(/(\d{3})(\d{3})/, '$1-$2');
    }

    return value;
  },

  /**
   * 첫 글자 대문자
   * @param {string} str - 문자열
   * @returns {string}
   *
   * @example
   * IMCAT.format.capitalize('hello'); // 'Hello'
   */
  capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 제목 케이스 (각 단어 첫 글자 대문자)
   * @param {string} str - 문자열
   * @returns {string}
   *
   * @example
   * IMCAT.format.titleCase('hello world'); // 'Hello World'
   */
  titleCase(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
  },

  /**
   * 슬러그 생성
   * @param {string} str - 문자열
   * @returns {string}
   *
   * @example
   * IMCAT.format.slug('Hello World!'); // 'hello-world'
   */
  slug(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  /**
   * 이메일 마스킹
   * @param {string} email - 이메일
   * @returns {string}
   *
   * @example
   * IMCAT.format.maskEmail('user@example.com'); // 'us**@example.com'
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const visibleChars = Math.min(2, local.length);
    const maskedLocal = local.substring(0, visibleChars) + '*'.repeat(Math.max(0, local.length - visibleChars));
    return `${maskedLocal}@${domain}`;
  },

  /**
   * 이름 마스킹
   * @param {string} name - 이름
   * @returns {string}
   *
   * @example
   * IMCAT.format.maskName('홍길동'); // '홍*동'
   * IMCAT.format.maskName('John Doe'); // 'J*** D**'
   */
  maskName(name) {
    if (!name) return '';

    // 한글 이름 (2~4자)
    if (/^[가-힣]{2,4}$/.test(name)) {
      if (name.length === 2) {
        return name.charAt(0) + '*';
      }
      return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    }

    // 영문 이름
    return name.split(' ').map(part => {
      if (part.length <= 1) return part;
      return part.charAt(0) + '*'.repeat(part.length - 1);
    }).join(' ');
  }
};

export default Formatters;
