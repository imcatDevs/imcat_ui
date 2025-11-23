/**
 * Utils Module 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { Utils } from '../../src/core/utils.js';

describe('Utils Module', () => {
  describe('타입 체크', () => {
    describe('isString()', () => {
      it('문자열은 true를 반환해야 함', () => {
        expect(Utils.isString('hello')).toBe(true);
        expect(Utils.isString('')).toBe(true);
      });

      it('문자열이 아니면 false를 반환해야 함', () => {
        expect(Utils.isString(123)).toBe(false);
        expect(Utils.isString(null)).toBe(false);
        expect(Utils.isString(undefined)).toBe(false);
      });
    });

    describe('isNumber()', () => {
      it('숫자는 true를 반환해야 함', () => {
        expect(Utils.isNumber(123)).toBe(true);
        expect(Utils.isNumber(0)).toBe(true);
        expect(Utils.isNumber(-5.5)).toBe(true);
      });

      it('NaN은 false를 반환해야 함', () => {
        expect(Utils.isNumber(NaN)).toBe(false);
      });

      it('숫자가 아니면 false를 반환해야 함', () => {
        expect(Utils.isNumber('123')).toBe(false);
        expect(Utils.isNumber(null)).toBe(false);
      });
    });

    describe('isBoolean()', () => {
      it('불리언은 true를 반환해야 함', () => {
        expect(Utils.isBoolean(true)).toBe(true);
        expect(Utils.isBoolean(false)).toBe(true);
      });

      it('불리언이 아니면 false를 반환해야 함', () => {
        expect(Utils.isBoolean(1)).toBe(false);
        expect(Utils.isBoolean('true')).toBe(false);
      });
    });

    describe('isObject()', () => {
      it('객체는 true를 반환해야 함', () => {
        expect(Utils.isObject({})).toBe(true);
        expect(Utils.isObject({ a: 1 })).toBe(true);
      });

      it('배열은 false를 반환해야 함', () => {
        expect(Utils.isObject([])).toBe(false);
      });

      it('null은 false를 반환해야 함', () => {
        expect(Utils.isObject(null)).toBe(false);
      });
    });

    describe('isArray()', () => {
      it('배열은 true를 반환해야 함', () => {
        expect(Utils.isArray([])).toBe(true);
        expect(Utils.isArray([1, 2, 3])).toBe(true);
      });

      it('배열이 아니면 false를 반환해야 함', () => {
        expect(Utils.isArray({})).toBe(false);
        expect(Utils.isArray('array')).toBe(false);
      });
    });

    describe('isFunction()', () => {
      it('함수는 true를 반환해야 함', () => {
        expect(Utils.isFunction(() => {})).toBe(true);
        expect(Utils.isFunction(function() {})).toBe(true);
      });

      it('함수가 아니면 false를 반환해야 함', () => {
        expect(Utils.isFunction({})).toBe(false);
        expect(Utils.isFunction('function')).toBe(false);
      });
    });

    describe('isNull()', () => {
      it('null은 true를 반환해야 함', () => {
        expect(Utils.isNull(null)).toBe(true);
      });

      it('null이 아니면 false를 반환해야 함', () => {
        expect(Utils.isNull(undefined)).toBe(false);
        expect(Utils.isNull(0)).toBe(false);
        expect(Utils.isNull('')).toBe(false);
      });
    });

    describe('isUndefined()', () => {
      it('undefined는 true를 반환해야 함', () => {
        expect(Utils.isUndefined(undefined)).toBe(true);
      });

      it('undefined가 아니면 false를 반환해야 함', () => {
        expect(Utils.isUndefined(null)).toBe(false);
        expect(Utils.isUndefined(0)).toBe(false);
      });
    });

    describe('isNullOrUndefined()', () => {
      it('null 또는 undefined는 true를 반환해야 함', () => {
        expect(Utils.isNullOrUndefined(null)).toBe(true);
        expect(Utils.isNullOrUndefined(undefined)).toBe(true);
      });

      it('null도 undefined도 아니면 false를 반환해야 함', () => {
        expect(Utils.isNullOrUndefined(0)).toBe(false);
        expect(Utils.isNullOrUndefined('')).toBe(false);
      });
    });
  });

  describe('객체 조작', () => {
    describe('extend()', () => {
      it('객체를 병합해야 함', () => {
        const result = Utils.extend({}, { a: 1 }, { b: 2 });
        expect(result).toEqual({ a: 1, b: 2 });
      });

      it('깊은 병합을 수행해야 함', () => {
        const result = Utils.extend(
          {},
          { a: { b: 1 } },
          { a: { c: 2 } }
        );
        expect(result).toEqual({ a: { b: 1, c: 2 } });
      });

      it('대상 객체를 수정해야 함', () => {
        const target = { a: 1 };
        Utils.extend(target, { b: 2 });
        expect(target).toEqual({ a: 1, b: 2 });
      });
    });

    describe('clone()', () => {
      it('객체를 깊은 복사해야 함', () => {
        const original = { a: { b: 1 } };
        const cloned = Utils.clone(original);
        cloned.a.b = 2;
        expect(original.a.b).toBe(1);
      });

      it('배열을 깊은 복사해야 함', () => {
        const original = [1, [2, 3]];
        const cloned = Utils.clone(original);
        cloned[1][0] = 99;
        expect(original[1][0]).toBe(2);
      });

      it('null과 undefined를 그대로 반환해야 함', () => {
        expect(Utils.clone(null)).toBe(null);
        expect(Utils.clone(undefined)).toBe(undefined);
      });

      it('원시 타입은 그대로 반환해야 함', () => {
        expect(Utils.clone(123)).toBe(123);
        expect(Utils.clone('hello')).toBe('hello');
      });
    });

    describe('pick()', () => {
      it('특정 키만 선택해야 함', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = Utils.pick(obj, ['a', 'c']);
        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('존재하지 않는 키는 무시해야 함', () => {
        const obj = { a: 1, b: 2 };
        const result = Utils.pick(obj, ['a', 'z']);
        expect(result).toEqual({ a: 1 });
      });
    });

    describe('omit()', () => {
      it('특정 키를 제거해야 함', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = Utils.omit(obj, ['b']);
        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('원본 객체를 수정하지 않아야 함', () => {
        const obj = { a: 1, b: 2 };
        Utils.omit(obj, ['b']);
        expect(obj).toEqual({ a: 1, b: 2 });
      });
    });
  });

  describe('배열 조작', () => {
    describe('unique()', () => {
      it('중복을 제거해야 함', () => {
        expect(Utils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      });

      it('빈 배열은 빈 배열을 반환해야 함', () => {
        expect(Utils.unique([])).toEqual([]);
      });
    });

    describe('flatten()', () => {
      it('중첩 배열을 평탄화해야 함', () => {
        expect(Utils.flatten([1, [2, [3, 4]]])).toEqual([1, 2, 3, 4]);
      });

      it('이미 평탄한 배열은 그대로 반환해야 함', () => {
        expect(Utils.flatten([1, 2, 3])).toEqual([1, 2, 3]);
      });
    });

    describe('chunk()', () => {
      it('배열을 청크로 분할해야 함', () => {
        expect(Utils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      });

      it('크기가 배열 길이보다 크면 전체를 하나의 청크로', () => {
        expect(Utils.chunk([1, 2], 5)).toEqual([[1, 2]]);
      });
    });

    describe('range()', () => {
      it('범위 배열을 생성해야 함', () => {
        expect(Utils.range(1, 5)).toEqual([1, 2, 3, 4, 5]);
      });

      it('step을 지정할 수 있어야 함', () => {
        expect(Utils.range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
      });

      it('음수 범위도 지원해야 함', () => {
        expect(Utils.range(-2, 2)).toEqual([-2, -1, 0, 1, 2]);
      });
    });
  });

  describe('함수 유틸리티', () => {
    describe('debounce()', () => {
      it('디바운스된 함수를 생성해야 함', async () => {
        const fn = vi.fn();
        const debounced = Utils.debounce(fn, 100);

        debounced();
        debounced();
        debounced();

        expect(fn).not.toHaveBeenCalled();

        await Utils.sleep(150);
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe('throttle()', () => {
      it('스로틀된 함수를 생성해야 함', async () => {
        const fn = vi.fn();
        const throttled = Utils.throttle(fn, 100);

        throttled();
        throttled();
        throttled();

        expect(fn).toHaveBeenCalledTimes(1);

        await Utils.sleep(150);
        throttled();
        expect(fn).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('랜덤 유틸리티', () => {
    describe('randomId()', () => {
      it('랜덤 ID를 생성해야 함', () => {
        const id = Utils.randomId();
        expect(id).toMatch(/^id-[a-z0-9]+$/);
      });

      it('접두사를 지정할 수 있어야 함', () => {
        const id = Utils.randomId('user');
        expect(id).toMatch(/^user-[a-z0-9]+$/);
      });

      it('매번 다른 ID를 생성해야 함', () => {
        const id1 = Utils.randomId();
        const id2 = Utils.randomId();
        expect(id1).not.toBe(id2);
      });
    });

    describe('randomInt()', () => {
      it('범위 내의 정수를 생성해야 함', () => {
        const num = Utils.randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
      });

      it('최소값과 최대값이 같으면 그 값을 반환해야 함', () => {
        expect(Utils.randomInt(5, 5)).toBe(5);
      });
    });
  });

  describe('문자열 유틸리티', () => {
    describe('truncate()', () => {
      it('긴 문자열을 자르고 말줄임표를 추가해야 함', () => {
        expect(Utils.truncate('Hello World', 8)).toBe('Hello...');
      });

      it('짧은 문자열은 그대로 반환해야 함', () => {
        expect(Utils.truncate('Hello', 10)).toBe('Hello');
      });

      it('커스텀 접미사를 사용할 수 있어야 함', () => {
        expect(Utils.truncate('Hello World', 8, '→')).toBe('Hello W→');
      });
    });

    describe('camelCase()', () => {
      it('케밥케이스를 카멜케이스로 변환해야 함', () => {
        expect(Utils.camelCase('hello-world')).toBe('helloWorld');
      });

      it('스네이크케이스를 카멜케이스로 변환해야 함', () => {
        expect(Utils.camelCase('hello_world')).toBe('helloWorld');
      });
    });

    describe('kebabCase()', () => {
      it('카멜케이스를 케밥케이스로 변환해야 함', () => {
        expect(Utils.kebabCase('helloWorld')).toBe('hello-world');
      });

      it('파스칼케이스를 케밥케이스로 변환해야 함', () => {
        expect(Utils.kebabCase('HelloWorld')).toBe('hello-world');
      });
    });

    describe('capitalize()', () => {
      it('첫 글자를 대문자로 변환해야 함', () => {
        expect(Utils.capitalize('hello')).toBe('Hello');
      });

      it('이미 대문자인 경우 그대로 반환해야 함', () => {
        expect(Utils.capitalize('Hello')).toBe('Hello');
      });

      it('빈 문자열은 그대로 반환해야 함', () => {
        expect(Utils.capitalize('')).toBe('');
      });
    });
  });

  describe('비동기 유틸리티', () => {
    describe('sleep()', () => {
      it('지정된 시간만큼 대기해야 함', async () => {
        const start = Date.now();
        await Utils.sleep(100);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(90);
      });
    });
  });
});
