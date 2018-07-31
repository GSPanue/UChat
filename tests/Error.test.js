import React from 'react';
import expect from 'expect';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
});

import Error from '../src/components/interface/components/error/Error';

describe('Component: Error', () => {
    const props = {
        error: false
    };

    it('should render a single Error component', () => {
        const wrapper = shallow(<Error {...props}/>);

        expect(wrapper.length).toEqual(1);
    });

    it('should contain a Snackbar component', () => {
        const wrapper = shallow(<Error {...props}/>);

        expect(wrapper.find('Snackbar').length).toEqual(1);
    });

    it('should have props for error', () => {
        const wrapper = shallow(<Error {...props}/>);

        expect(wrapper.instance().props.error).toEqual(false);
    });

    it('should open the snackbar when the error prop is equal to true', () => {
        const wrapper = shallow(<Error {...props}/>);

        expect(wrapper.props().children.props.open).toEqual(false);

        wrapper.setProps({
            error: true
        });

        expect(wrapper.props().children.props.open).toEqual(true);
    });
});