import React from 'react';

import Notification from './components/Notification';
import Message from './components/Message';

const database = require('~/database/database');
const moment = require('moment');
const uuid = require('uuid/v1');

const styles = ({
    container: {
        position: 'relative',
        overflowY: 'overlay',
        width: '100%',
        height: '100%',
        messages: {
            position: 'absolute',
            width: '100%',
            overflowY: 'overlay'
        },
        bottom: {
            float: 'left',
            clear: 'both'
        }
    }
});

export default class ChatBody extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.user,
            group: this.props.group,
            messages: (this.props.messages !== null) ? this.props.messages[this.props.group.id] : null,
            fetchingMoreMessages: false,
            fetchedAllMessages : false
        }
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentWillMount() {
        this.setFetchedAllMessages();
    }

    componentWillReceiveProps(nextProps) {
        const prevHeight = this.scroller.scrollHeight;
        const prevTotalMessages = (this.state.messages !== null) ? Object.keys(this.state.messages).length : 0;
        const nextMessages = (nextProps.messages[nextProps.group.id] !== undefined) ? nextProps.messages[nextProps.group.id] : null;
        const hasChangedGroup = (nextProps.group.id !== this.state.group.id);
        const isAtBottom = this.isAtBottom(prevHeight);

        this.setState({
            user: nextProps.user,
            group: nextProps.group,
            messages: nextMessages
        }, () => {
            if (this.state.fetchingMoreMessages) {
                this.setState({
                    fetchingMoreMessages: false
                }, () => {
                    this.scroller.scrollTop = this.scroller.scrollHeight - prevHeight;
                });
            }
            else if (hasChangedGroup && nextMessages === null) {
                this.scrollToBottom();

                this.setState({
                    fetchingMoreMessages: false,
                    fetchedAllMessages: false
                }, () => {
                    this.setFetchedAllMessages();
                });
            }
            else if (nextMessages !== null || hasChangedGroup && nextMessages !== null) {
                const nextMessages = nextProps.messages[nextProps.group.id];
                const isNewMessage = this.isNewMessage(nextMessages, prevTotalMessages);
                const isClientMessage = this.isClientMessage(nextMessages);

                if (isAtBottom || isClientMessage && isNewMessage || hasChangedGroup) {
                    this.scrollToBottom();

                    if (hasChangedGroup) {
                        this.setState({
                            fetchingMoreMessages: false,
                            fetchedAllMessages: false
                        }, () => {
                            this.setFetchedAllMessages();
                        });
                    }
                }
            }
        });
    }

    scrollToBottom = () => {
        this.bottom.scrollIntoView();
    };

    setFetchedAllMessages = () => {
        database.fetchTotalMessages(this.state.user, this.state.group.id, (response) => {
            if (response !== false) {
                const hasFetchedAllMessages = (Object.keys(this.state.messages).length) === response;

                (hasFetchedAllMessages) ? this.setState({
                    fetchedAllMessages: true
                }) : false;

                this.scrollToBottom();
            }
        });
    };

    isAtBottom = (prevHeight) => {
        return ((prevHeight - this.scroller.offsetHeight) - 10) <= this.scroller.scrollTop;
    };

    isNewMessage = (nextMessages, prevMessages) => {
        return (Object.keys(nextMessages).length !== prevMessages);
    };

    isClientMessage = (nextMessages) => {
        const lastMessage = nextMessages[Object.keys(nextMessages)[Object.keys(nextMessages).length - 1]];

        return lastMessage.user.uid === this.state.user.uid;
    };

    handleScroll = () => {
        if (this.scroller && this.scroller.scrollTop < 100 && this.state.messages !== null && !this.state.fetchedAllMessages) {
            const totalCurrentMessages = Object.keys(this.state.messages).length;

            if (!this.state.fetchingMoreMessages) {
                this.setState({
                    fetchingMoreMessages: true
                }, () => {
                    database.fetchTotalMessages(this.state.user, this.state.group.id, (response) => {
                        if (response !== false) {
                            if (totalCurrentMessages < response) {
                                const id = this.state.group.id;
                                const endAt = Object.keys(this.state.messages)[0];

                                database.fetchMoreMessages(this.state.user, id, endAt, (response) => {
                                    if (response !== false) {
                                        delete response.messages[endAt];

                                        this.props.handleMessagesUpdate(this.state.group.id, response.messages, true);
                                    }
                                });
                            }
                            else {
                                this.setState({
                                    fetchingMoreMessages: false,
                                    fetchedAllMessages: true
                                });
                            }
                        }
                        else {
                            this.setState({
                                fetchingMoreMessages: false
                            }, () => {
                                this.scrollToBottom();
                            });
                        }
                    });
                });
            }
        }
    };

    orderMessages(messages) {
        let sortedMessages = {};

        Object.keys(messages).map((message) => {
            const timeStamp = messages[message].timeStamp;
            const key = moment(timeStamp).format('DD-MM-YYYY');

            if (sortedMessages.hasOwnProperty(key)) {
                sortedMessages[key][message] = messages[message];
            }
            else {
                sortedMessages[key] = {};
                sortedMessages[key][message] = messages[message];
            }
        });

        return sortedMessages;
    }

    createMessageBlock(messages) {
        const hasBannedUsers = this.props.group['banned'] !== undefined;
        const today = moment().format('DD-MM-YYYY');
        const yesterday = moment().subtract(1, 'day').format('DD-MM-YYYY');

        let block = [];

        Object.keys(messages).map((date) => {
            block.push(<Notification
                key={uuid()}
                date={true}
                notification={(date === today) ? 'Today' : (date === yesterday) ? 'Yesterday' : date}
            />);

            Object.keys(messages[date]).map((message, index) => {
                message = Object.assign(messages[date][message], {
                    mid: message,
                    admin: (this.props.group.admin === messages[date][message].user.uid)
                });

                const user = message.user;

                if (message.type === 'notification') {
                    block.push(<Notification
                        key={uuid()}
                        date={false}
                        name={(this.state.user.uid === user.uid) ? 'You' : user.fullName}
                        notification={message.message}
                        isLastMessage={(Object.keys(messages[date]).length - 1) === index}
                    />);
                }
                else if (message.type === 'message') {
                    const timeStamp = message.timeStamp;

                    block.push(<Message
                        key={uuid()}
                        avatar={user.firstName.charAt(0).toUpperCase()}
                        name={(this.state.user.uid === user.uid) ? 'You' : user.fullName}
                        message={message}
                        banned={(hasBannedUsers) && this.props.group.banned[user.uid] !== undefined}
                        timeStamp={moment(timeStamp).format('HH:mm')}
                        isClient={this.state.user.uid === user.uid}
                        isAdmin={this.state.user.uid === this.state.group.admin}
                        handleGroupOptions={this.props.handleGroupOptions}
                    />);
                }
            });
        });

        return block;
    }

    render() {
        const messages = this.state.messages;

        let sortedMessages = null;
        let messageBlock = null;

        if (messages !== null) {
            sortedMessages = this.orderMessages(messages);
            messageBlock = this.createMessageBlock(sortedMessages);
        }

        return (
            <div onScroll={this.handleScroll} ref={(scroller) => {this.scroller = scroller}} style={styles.container}>
                <div style={styles.container.messages}>
                    {(messageBlock !== null) ? messageBlock : <Notification key={uuid()} notification='Today' date={true}/>}
                    <div style={styles.container.bottom} ref={(element) => {this.bottom = element}}></div>
                </div>
            </div>
        );
    }
}