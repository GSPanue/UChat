import React from 'react';
import expect from 'expect';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
});

import Loading from '../src/components/interface/components/sidebar/components/loading/Loading';

describe('Component: Loading', () => {
    const wrapper = shallow(<Loading subHeading='Loading...'/>);

    it('should render a single Loading component', () => {
        expect(wrapper.length).toEqual(1);
    });

    it('should have props for subheading', () => {
        expect(wrapper.instance().props.subHeading).toEqual('Loading...');
    });

    it('should contain a logo', () => {
        expect(wrapper.find('img').props().src).toEqual('./img/logo.png');
    });

    it('should contain a heading', () => {
        expect(wrapper.find('span').get(0).props.children).toEqual('UChat');
    });

    it('should contain a subheading', () => {
        expect(wrapper.find('span').get(1).props.children).toEqual('Loading...');
    });
});