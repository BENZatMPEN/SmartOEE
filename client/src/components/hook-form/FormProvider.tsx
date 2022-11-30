import { ReactNode } from 'react';
import { FormProvider as Form, UseFormReturn } from 'react-hook-form';

interface FormProviderProps {
  children: ReactNode;
  methods: UseFormReturn<any>;
  onSubmit?: VoidFunction;
}

export default function FormProvider({ children, onSubmit, methods }: FormProviderProps) {
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  );
}
