import React from 'react';
import expect from 'expect';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
});

import Message from '../src/components/interface/components/window/components/components/chat/components/chatbody/components/Message';

describe('Component: Message', () => {
    const props = {
        name: 'You',
        avatar: 'Y',
        timeStamp: '17:17',
        message: {
            admin: true,
            deleted: false,
            message: 'My Message',
        },
        banned: false,
        isAdmin: true,
        isClient: true
    };

    /**
     * |
     * |
     * | General tests
     * |
     * |
     */

    it('should render a single Message component', () => {
        const wrapper = shallow(<Message {...props}/>);

        expect(wrapper.length).toEqual(1);
    });

    it('should display the message sent', () => {
        const wrapper = shallow(<Message {...props}/>);
        const message = wrapper.find('div[children=\'' + props.message.message + '\']').get(0).props.children;

        expect(message).toEqual('My Message');
    });

    /**
     * |
     * |
     * | Tests for a message sent by the client
     * |
     * |
     */

    it('should have \'Y\' in the center of the message\'s avatar', () => {
        const wrapper = shallow(<Message {...props}/>);
        const avatarText = wrapper.find('Avatar').get(0).props.children;

        expect(avatarText).toEqual('Y');
    });

    it('should have \'You (Admin)\' as the client\'s name if the client is an administrator', () => {
        const wrapper = shallow(<Message {...props}/>);
        const name = wrapper.find('div').get(5).props.children;

        expect(name[0]).toEqual('You');
        expect(name[2]).toEqual(' (Admin)');
    });

    it('should have \'You\' as the client\'s name if the client is not an administrator', () => {
        const wrapper = shallow(<Message {...props} message={{...props.message, ...{admin: false}}} isAdmin={false}/>);
        const name = wrapper.find('div').get(5).props.children;

        expect(name[0]).toEqual('You');
        expect(name[2]).toEqual(false);
    });

    it('should have a blue avatar and name', () => {
        const wrapper = shallow(<Message {...props}/>);
        const nameColour = wrapper.find('div').get(5).props.style.color;
        const avatarColour = wrapper.find('Avatar').get(0).props.style.background;

        expect(nameColour).toEqual('rgb(91, 134, 229)');
        expect(avatarColour).toEqual('rgb(91, 134, 229)');
    });

    /**
     * |
     * |
     * | Tests for a message not sent by the client
     * |
     * |
     */

    it('should have \'J\' in the center of the message\'s avatar', () => {
        const wrapper = shallow(<Message {...props} name='John Doe' avatar='J' isClient={false}/>);
        const avatarText = wrapper.find('Avatar').get(0).props.children;

        expect(avatarText).toEqual('J');
    });

    it('should have \'John Doe (Admin)\' as the sender\'s name if the sender is an administrator', () => {
        const wrapper = shallow(<Message {...props} name='John Doe' avatar='J' isClient={false}/>);
        const name = wrapper.find('div').get(5).props.children;

        expect(name[0]).toEqual('John Doe');
        expect(name[2]).toEqual(' (Admin)');
    });

    it('should have \'John Doe\' as the sender\'s name if the sender is not an administrator', () => {
        const wrapper = shallow(<Message {...props} message={{...props.message, ...{admin: false}}} name='John Doe' avatar='J' isClient={false}/>);
        const name = wrapper.find('div').get(5).props.children;

        expect(name[0]).toEqual('John Doe');
        expect(name[2]).toEqual(false);
    });

    it('should have a grey avatar and name', () => {
        const wrapper = shallow(<Message {...props} message={{...props.message, ...{admin: false}}} name='John Doe' avatar='J' isClient={false}/>);
        const nameColour = wrapper.find('div').get(5).props.style.color;
        const avatarColour = wrapper.find('Avatar').get(0).props.style.background;

        expect(nameColour).toEqual('#424242');
        expect(avatarColour).toEqual('#424242');
    });
});