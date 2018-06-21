import React from 'react';
import expect from 'expect';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
});

import CreateGroup from '../src/components/interface/components/window/components/components/options/components/CreateGroup';

describe('Component: CreateGroup', () => {
    it('should not enable the submit button when the title and description is empty', () => {
        const wrapper = shallow(<CreateGroup/>);
        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(true);
    });

    it('should not enable the submit button when the title is empty', () => {
        const wrapper = shallow(<CreateGroup/>);

        wrapper.setState({
            description: 'description'
        });

        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(true);
    });

    it('should not enable the submit button when the description is empty', () => {
        const wrapper = shallow(<CreateGroup/>);

        wrapper.setState({
            title: 'title'
        });

        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(true);
    });

    it('should not enable the submit button when the title is greater than 44 characters', () => {
        const wrapper = shallow(<CreateGroup/>);

        wrapper.setState({
            title: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrs',
            description: 'description'
        });

        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(true);
    });

    it('should not enable the submit button when isProcessing is true', () => {
        const wrapper = shallow(<CreateGroup/>);

        wrapper.setState({
            title: 'title',
            description: 'description',
            isProcessing: true
        });

        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(true);
    });

    it('should enable the submit button when the title and description is not empty and isProcessing is false', () => {
        const wrapper = shallow(<CreateGroup/>);

        wrapper.setState({
            title: 'title',
            description: 'description'
        });

        const submitButton = wrapper.find('IconButton').get(0);

        expect(submitButton.props.disabled).toEqual(false);
    });
});