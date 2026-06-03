import { render } from '@testing-library/react';

import PortaljsComponents from './portaljs-components';

describe('PortaljsComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortaljsComponents />);
    expect(baseElement).toBeTruthy();
  });
});
