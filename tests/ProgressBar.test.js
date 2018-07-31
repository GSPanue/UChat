import React from 'react';
import expect from 'expect';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
});

import ProgressBar from '../src/components/interface/components/progressBar/ProgressBar';

describe('Component: ProgressBar', () => {
    const wrapper = shallow(<ProgressBar/>);

    it('should render a single ProgressBar component', () => {
        expect(wrapper.length).toEqual(1);
    });

    it('should contain a LinearProgress component', () => {
        expect(wrapper.find('LinearProgress').length).toEqual(1);
    });

    it('should have a color of rgb(91, 134, 229)', () => {
        expect(wrapper.props().color).toEqual('rgb(91, 134, 229)');
    });
});