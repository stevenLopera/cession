import React from 'react';
import { shallow } from 'enzyme';
import Creditor from './creditor';

describe('<Creditor />', () => {
  test('renders', () => {
    const wrapper = shallow(<Creditor />);
    expect(wrapper).toMatchSnapshot();
  });
});
