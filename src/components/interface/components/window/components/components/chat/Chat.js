import React from 'react';

import ChatHeader from './components/chatheader/ChatHeader';
import ChatBody from './components/chatbody/ChatBody';
import ChatBar from './components/chatbar/ChatBar';
import Modal from './components/Modal';

const database = require('~/database/database');

const styles = ({
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: '6 1 0',
        topContainer: {
            display: 'flex',
            flexDirection: 'column',
            flex: '8'
        },
        bottomContainer: {
            flex: '1'
        }
    }
});

export default class Chat extends React.Component {
    constructor() {
        super();

        this.state = {
            modal: {
                open: false,
                message: null,
                saving: false
            }
        }
    }

    handleGroupOptions = (option) => {
        const currentGroup = this.props.groups[this.props.tabs.selectedOnTabA - 1].id;

        const message = {
            uid: option.uid,
            mid: option.mid,
            message: option.message
        };

        if (option.action === 'delete') {
            database.deleteMessage(this.props.user, currentGroup, message, (response) => {
                if (!response) {
                    this.props.handleError(true);
                }
            });
        }
        else if (option.action === 'edit') {
            this.setState({
                modal: {
                    ...this.state.modal, message
                }
            }, () => {
                this.handleOpen();
            });
        }
        else if (option.action === 'ban') {
            database.banUser(this.props.user, currentGroup, message.uid, (response) => {
                if (!response) {
                    this.props.handleError(true);
                }
            });
        }
    };

    handleSubmit = (editedMessage) => {
        const currentGroup = this.props.groups[this.props.tabs.selectedOnTabA - 1].id;

        this.setState({
            modal: {
                ...this.state.modal, saving: true
            }
        }, () => {
            let message = this.state.modal.message;
            message['message'] = editedMessage;

            database.editMessage(this.props.user, currentGroup, message, (response) => {
                this.setState({
                    modal: {
                        ...this.state.modal, open: false, message: null, saving: false
                    }
                }, () => {
                    if (!response) {
                        this.props.handleError(true);
                    }
                });
            })
        });
    };

    handleOpen = () => {
        this.setState({
            modal: {
                ...this.state.modal, open: true
            }
        });
    };

    handleClose = () => {
        if (!this.state.modal.saving) {
            this.setState({
                modal: {
                    ...this.state.modal, open: false, message: null, saving: false
                }
            });
        }
    };

    handleTyping = (group, boolean) => {
        database.setTyping(this.props.user, group, boolean, () => {});
    };

    getTyping = () => {
        let members = Object.assign({}, this.props.groups[this.props.tabs.selectedOnTabA - 1].members);
        delete members['counter'];

        let typing = [];

        Object.keys(members).map((member) => {
            const isClient = this.props.user.uid === members[member].user.uid;

            if (members[member].typing && !isClient) {
                typing.push(members[member].user.firstName);
            }
        });

        return typing;
    };

    render() {
        const groups = this.props.groups;
        const index = this.props.tabs.selectedOnTabA - 1;

        const currentGroup = {
            id: groups[index].id,
            title: groups[index].title,
            description: groups[index].description,
            members: groups[index].members,
            admin: groups[index].admin,
            banned: groups[index].banned
        };

        return (
            <div style={styles.chatContainer}>
                <div style={styles.chatContainer.topContainer}>
                    {(this.props.groups !== null) ? <ChatHeader
                        user={this.props.user}
                        group={currentGroup}
                        isAdmin={(this.props.user.uid === currentGroup.admin)}
                        handleLeaveGroup={this.props.handleLeaveGroup}
                        handleDeleteGroup={this.props.handleDeleteGroup}
                        handleError={this.props.handleError}
                    /> : false}
                    {(this.state.modal.open) && <Modal
                        open={this.state.modal.open}
                        message={this.state.modal.message.message}
                        isSaving={this.state.modal.saving}
                        handleCancel={this.handleClose}
                        handleSubmit={this.handleSubmit}
                    />}
                    <ChatBody
                        user={this.props.user}
                        group={currentGroup}
                        messages={this.props.messages}
                        handleMessagesUpdate={this.props.handleMessagesUpdate}
                        handleGroupOptions={this.handleGroupOptions}
                    />
                </div>
                <div style={styles.chatContainer.bottomContainer}>
                    <ChatBar
                        user={this.props.user}
                        group={groups[index]}
                        handleSendMessage={this.props.handleSendMessage}
                        handleTyping={this.handleTyping}
                        typing={this.getTyping()}
                    />
                </div>
            </div>
        );
    }
}