import React from 'react';
import { shallow } from 'enzyme';
import Debtor from './debtor';

describe('<Debtor />', () => {
  test('renders', () => {
    const wrapper = shallow(<Debtor />);
    expect(wrapper).toMatchSnapshot();
  });
});
