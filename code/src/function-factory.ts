import sprint_summary_function from './functions/sprint_summary_function';

export const functionFactory = {
  // Add your functions here
  sprint_summary_function,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
