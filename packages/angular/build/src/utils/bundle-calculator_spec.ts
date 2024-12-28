/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { BudgetEntry, BudgetType, ThresholdSeverity, checkBudgets, kB } from './bundle-calculator';

describe('bundle-calculator', () => {
  describe('checkBudgets()', () => {
    it('yields maximum budgets exceeded', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.Any,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [],
        assets: [
          {
            name: 'foo.js',
            size: 1.5 * kB,
          },
          {
            name: 'bar.js',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'foo.js',
        message: jasmine.stringMatching('foo.js exceeded maximum budget.'),
      });
    });

    it('yields minimum budgets exceeded', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.Any,
          minimumError: '1kb',
        },
      ];
      const stats = {
        chunks: [],
        assets: [
          {
            name: 'foo.js',
            size: 1.5 * kB,
          },
          {
            name: 'bar.js',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'bar.js',
        message: jasmine.stringMatching('bar.js failed to meet minimum budget.'),
      });
    });

    it('yields exceeded bundle budgets', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.Bundle,
          name: 'foo',
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            names: ['foo'],
            files: ['foo.js', 'bar.js'],
          },
        ],
        assets: [
          {
            name: 'foo.js',
            size: 0.75 * kB,
          },
          {
            name: 'bar.js',
            size: 0.75 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'foo',
        message: jasmine.stringMatching('foo exceeded maximum budget.'),
      });
    });

    it('yields exceeded initial budget', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.Initial,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.js', 'bar.js'],
          },
        ],
        assets: [
          {
            name: 'foo.js',
            size: 0.5 * kB,
          },
          {
            name: 'bar.js',
            size: 0.75 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'bundle initial',
        message: jasmine.stringMatching('initial exceeded maximum budget.'),
      });
    });

    it('yields exceeded total scripts budget', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.AllScript,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.js', 'bar.js'],
          },
        ],
        assets: [
          {
            name: 'foo.js',
            size: 0.75 * kB,
          },
          {
            name: 'bar.js',
            size: 0.75 * kB,
          },
          {
            name: 'baz.css',
            size: 1.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'total scripts',
        message: jasmine.stringMatching('total scripts exceeded maximum budget.'),
      });
    });

    it('yields exceeded total budget', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.All,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.js', 'bar.css'],
          },
        ],
        assets: [
          {
            name: 'foo.js',
            size: 0.75 * kB,
          },
          {
            name: 'bar.css',
            size: 0.75 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'total',
        message: jasmine.stringMatching('total exceeded maximum budget.'),
      });
    });

    it('skips component style budgets', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.AnyComponentStyle,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.css', 'bar.js'],
          },
        ],
        assets: [
          {
            name: 'foo.css',
            size: 1.5 * kB,
          },
          {
            name: 'bar.js',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(0);
    });

    it('yields exceeded individual script budget', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.AnyScript,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.js', 'bar.js'],
          },
        ],
        assets: [
          {
            name: 'foo.js',
            size: 1.5 * kB,
          },
          {
            name: 'bar.js',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'foo.js',
        message: jasmine.stringMatching('foo.js exceeded maximum budget.'),
      });
    });

    it('yields exceeded individual file budget', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.Any,
          maximumError: '1kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['foo'],
            files: ['foo.ext', 'bar.ext'],
          },
        ],
        assets: [
          {
            name: 'foo.ext',
            size: 1.5 * kB,
          },
          {
            name: 'bar.ext',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(1);
      expect(failures).toContain({
        severity: ThresholdSeverity.Error,
        label: 'foo.ext',
        message: jasmine.stringMatching('foo.ext exceeded maximum budget.'),
      });
    });

    it('yields exceeded individual file budget - 29040', () => {
      const budgets: BudgetEntry[] = [
        {
          type: BudgetType.bundle,
          maximumError: '1000kb',
        },
      ];
      const stats = {
        chunks: [
          {
            id: 0,
            initial: true,
            names: ['main'],
            files: ['main.ext', 'bar.ext'],
          },
        ],
        assets: [
          {
            name: 'main.ext',
            size: 1 * kB,
          },
          {
            name: 'bar.ext',
            size: 0.5 * kB,
          },
        ],
      };

      const failures = Array.from(checkBudgets(budgets, stats));

      expect(failures.length).toBe(0);
    });
  });
});
