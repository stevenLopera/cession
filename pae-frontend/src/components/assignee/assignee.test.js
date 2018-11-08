import React from 'react';
import { shallow } from 'enzyme';
import Assignee from './assignee';

describe('<Assignee />', () => {
  test('renders', () => {
    const wrapper = shallow(<Assignee />);
    expect(wrapper).toMatchSnapshot();
  });
});
