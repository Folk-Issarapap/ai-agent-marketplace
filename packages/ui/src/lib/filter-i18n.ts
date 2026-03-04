'use client';

import type { FilterI18nConfig } from '../components/filters';

// Raw English messages
const enMessages = {
  filters: {
    addFilter: 'Add filter',
    addFilterTitle: 'Add filter',
    searchFields: 'Search fields...',
    noFieldsFound: 'No fields found.',
    noResultsFound: 'No results found.',
    select: 'Select...',
    true: 'True',
    false: 'False',
    min: 'Min',
    max: 'Max',
    to: 'to',
    typeAndPressEnter: 'Type and press Enter to add tag',
    selected: 'selected',
    selectedCount: 'selected',
    percent: '%',
    defaultCurrency: '$',
    defaultColor: '#000000',
    operators: {
      is: 'is',
      isNot: 'is not',
      isAnyOf: 'is any of',
      isNotAnyOf: 'is not any of',
      includesAll: 'includes all',
      excludesAll: 'excludes all',
      before: 'before',
      after: 'after',
      between: 'between',
      notBetween: 'not between',
      contains: 'contains',
      notContains: 'does not contain',
      startsWith: 'starts with',
      endsWith: 'ends with',
      isExactly: 'is exactly',
      equals: 'equals',
      notEquals: 'not equals',
      greaterThan: 'greater than',
      lessThan: 'less than',
      overlaps: 'overlaps',
      includes: 'includes',
      excludes: 'excludes',
      includesAllOf: 'includes all of',
      includesAnyOf: 'includes any of',
      empty: 'is empty',
      notEmpty: 'is not empty',
    },
    placeholders: {
      enterField: 'Enter {fieldType}...',
      selectField: 'Select...',
      searchField: 'Search {fieldName}...',
      enterKey: 'Enter key...',
      enterValue: 'Enter value...',
    },
    validation: {
      invalidEmail: 'Invalid email format',
      invalidUrl: 'Invalid URL format',
      invalidTel: 'Invalid phone format',
      invalid: 'Invalid input format',
    },
  },
};

// Raw Thai messages
const thMessages = {
  filters: {
    addFilter: 'เพิ่มตัวกรอง',
    addFilterTitle: 'เพิ่มตัวกรอง',
    searchFields: 'ค้นหาฟิลด์...',
    noFieldsFound: 'ไม่พบฟิลด์',
    noResultsFound: 'ไม่พบผลลัพธ์',
    select: 'เลือก...',
    true: 'จริง',
    false: 'เท็จ',
    min: 'ต่ำสุด',
    max: 'สูงสุด',
    to: 'ถึง',
    typeAndPressEnter: 'พิมพ์และกด Enter เพื่อเพิ่มแท็ก',
    selected: 'เลือกแล้ว',
    selectedCount: 'รายการที่เลือก',
    percent: '%',
    defaultCurrency: '฿',
    defaultColor: '#000000',
    operators: {
      is: 'คือ',
      isNot: 'ไม่ใช่',
      isAnyOf: 'เป็นหนึ่งใน',
      isNotAnyOf: 'ไม่เป็นหนึ่งใน',
      includesAll: 'รวมทั้งหมด',
      excludesAll: 'ยกเว้นทั้งหมด',
      before: 'ก่อน',
      after: 'หลัง',
      between: 'ระหว่าง',
      notBetween: 'ไม่ระหว่าง',
      contains: 'ประกอบด้วย',
      notContains: 'ไม่ประกอบด้วย',
      startsWith: 'ขึ้นต้นด้วย',
      endsWith: 'ลงท้ายด้วย',
      isExactly: 'ตรงกับ',
      equals: 'เท่ากับ',
      notEquals: 'ไม่เท่ากับ',
      greaterThan: 'มากกว่า',
      lessThan: 'น้อยกว่า',
      overlaps: 'ทับซ้อน',
      includes: 'รวม',
      excludes: 'ยกเว้น',
      includesAllOf: 'รวมทั้งหมดของ',
      includesAnyOf: 'รวมหนึ่งใน',
      empty: 'ว่างเปล่า',
      notEmpty: 'ไม่ว่างเปล่า',
    },
    placeholders: {
      enterField: 'กรอก{fieldType}...',
      selectField: 'เลือก...',
      searchField: 'ค้นหา{fieldName}...',
      enterKey: 'กรอกคีย์...',
      enterValue: 'กรอกค่า...',
    },
    validation: {
      invalidEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
      invalidUrl: 'รูปแบบ URL ไม่ถูกต้อง',
      invalidTel: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
      invalid: 'รูปแบบข้อมูลไม่ถูกต้อง',
    },
  },
};

/**
 * Creates a FilterI18nConfig from raw message objects
 * Supports 'en' and 'th' locales, defaults to 'en' if locale not found
 *
 * @param locale - Locale code ('en' or 'th')
 * @returns FilterI18nConfig object with all filter-related translations
 */
export function createFilterI18n(locale: 'en' | 'th' = 'en'): FilterI18nConfig {
  const messages = locale === 'th' ? thMessages : enMessages;
  const m = messages.filters;

  return {
    // UI Labels
    addFilter: m.addFilter,
    searchFields: m.searchFields,
    noFieldsFound: m.noFieldsFound,
    noResultsFound: m.noResultsFound,
    select: m.select,
    true: m.true,
    false: m.false,
    min: m.min,
    max: m.max,
    to: m.to,
    typeAndPressEnter: m.typeAndPressEnter,
    selected: m.selected,
    selectedCount: m.selectedCount,
    percent: m.percent,
    defaultCurrency: m.defaultCurrency,
    defaultColor: m.defaultColor,
    addFilterTitle: m.addFilterTitle,

    // Operators
    operators: {
      is: m.operators.is,
      isNot: m.operators.isNot,
      isAnyOf: m.operators.isAnyOf,
      isNotAnyOf: m.operators.isNotAnyOf,
      includesAll: m.operators.includesAll,
      excludesAll: m.operators.excludesAll,
      before: m.operators.before,
      after: m.operators.after,
      between: m.operators.between,
      notBetween: m.operators.notBetween,
      contains: m.operators.contains,
      notContains: m.operators.notContains,
      startsWith: m.operators.startsWith,
      endsWith: m.operators.endsWith,
      isExactly: m.operators.isExactly,
      equals: m.operators.equals,
      notEquals: m.operators.notEquals,
      greaterThan: m.operators.greaterThan,
      lessThan: m.operators.lessThan,
      overlaps: m.operators.overlaps,
      includes: m.operators.includes,
      excludes: m.operators.excludes,
      includesAllOf: m.operators.includesAllOf,
      includesAnyOf: m.operators.includesAnyOf,
      empty: m.operators.empty,
      notEmpty: m.operators.notEmpty,
    },

    // Placeholders
    placeholders: {
      enterField: (fieldType: string) =>
        m.placeholders.enterField.replace('{fieldType}', fieldType),
      selectField: m.placeholders.selectField,
      searchField: (fieldName: string) =>
        m.placeholders.searchField.replace('{fieldName}', fieldName),
      enterKey: m.placeholders.enterKey,
      enterValue: m.placeholders.enterValue,
    },

    // Helper functions
    helpers: {
      formatOperator: (operator: string) => operator.replace(/_/g, ' '),
    },

    // Validation
    validation: {
      invalidEmail: m.validation.invalidEmail,
      invalidUrl: m.validation.invalidUrl,
      invalidTel: m.validation.invalidTel,
      invalid: m.validation.invalid,
    },
  };
}
