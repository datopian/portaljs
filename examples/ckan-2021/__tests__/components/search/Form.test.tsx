import React from 'react';
import { render } from '@testing-library/react';
import Form from '../../../components/search/Form';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');

test('📸 of Form component with empty', () => {
  useRouter.mockImplementationOnce(() => ({
    query: { search: '', sort: '' },
  }));

  const { container } = render(<Form />);
  expect(container).toMatchSnapshot();
});

test('📸 of Form component with query', () => {
  useRouter.mockImplementationOnce(() => ({
    query: { search: 'gdp', sort: '' },
  }));

  const { container } = render(<Form />);
  expect(container).toMatchSnapshot();
});
